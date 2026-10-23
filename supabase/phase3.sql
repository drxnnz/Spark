-- ============ HELPERS ============
create or replace function public.blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a));
$$;

-- ============ DISCOVER: filtered candidates (no lat/lng leaked) ============
create or replace function public.discover_candidates(lim int default 20)
returns table (id uuid, name text, bio text, birthday date, interests text[], photos text[], distance_km int)
language sql stable security definer set search_path = public as $$
  with me as (select * from profiles where id = auth.uid()),
  c as (
    select p.*,
      case when me.lat is null or p.lat is null then null else
        6371 * 2 * asin(sqrt(
          power(sin(radians(p.lat - me.lat) / 2), 2) +
          cos(radians(me.lat)) * cos(radians(p.lat)) * power(sin(radians(p.lng - me.lng) / 2), 2)
        )) end as dist
    from profiles p, me
    where p.id <> me.id and p.onboarded and p.birthday is not null
      and p.gender = any (me.pref_gender) and me.gender = any (p.pref_gender)
      and date_part('year', age(p.birthday)) between me.pref_age_min and me.pref_age_max
      and not exists (select 1 from swipes s where s.swiper = me.id and s.target = p.id)
      and not blocked_between(me.id, p.id)
  )
  select id, name, bio, birthday, interests, photos, round(dist)::int
  from c, me
  where dist is null or dist <= me.pref_distance_km
  order by random() limit lim;
$$;

-- ============ MATCH LIST: last message + unread ============
create or replace function public.my_matches()
returns table (match_id uuid, other_id uuid, name text, photo text, last_body text,
               last_sender uuid, last_at timestamptz, unread int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.id, o.id, o.name, o.photos[1], lm.body, lm.sender, lm.created_at,
    (select count(*)::int from messages x where x.match_id = m.id and x.sender <> auth.uid() and x.seen_at is null),
    m.created_at
  from matches m
  join profiles o on o.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
  left join lateral (select body, sender, created_at from messages where match_id = m.id order by created_at desc limit 1) lm on true
  where auth.uid() in (m.user_a, m.user_b) and not blocked_between(auth.uid(), o.id)
  order by coalesce(lm.created_at, m.created_at) desc;
$$;

-- ============ CHAT HARDENING ============
drop policy if exists "chat send" on messages;
create policy "chat send" on messages for insert to authenticated with check (
  sender = auth.uid() and exists (
    select 1 from matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)
      and not blocked_between(m.user_a, m.user_b)));

-- Only seen_at may change, and only by the recipient
create or replace function public.messages_guard() returns trigger language plpgsql as $$
begin
  if new.body is distinct from old.body or new.sender is distinct from old.sender
     or new.match_id is distinct from old.match_id or new.reply_to is distinct from old.reply_to
     or new.created_at is distinct from old.created_at then
    raise exception 'messages are immutable';
  end if;
  if new.seen_at is distinct from old.seen_at then
    if auth.uid() = old.sender then raise exception 'sender cannot mark seen'; end if;
    new.seen_at := coalesce(old.seen_at, now());
  end if;
  return new;
end $$;
drop trigger if exists messages_guard on messages;
create trigger messages_guard before update on messages for each row execute function messages_guard();

-- Reactions: only participants of the chat
drop policy if exists "react" on reactions;
drop policy if exists "react read" on reactions;
create policy "react read" on reactions for select to authenticated using (
  exists (select 1 from messages m join matches t on t.id = m.match_id
          where m.id = message_id and auth.uid() in (t.user_a, t.user_b)));
create policy "react write" on reactions for all to authenticated
  using (user_id = auth.uid() and exists (select 1 from messages m join matches t on t.id = m.match_id
          where m.id = message_id and auth.uid() in (t.user_a, t.user_b)))
  with check (user_id = auth.uid() and exists (select 1 from messages m join matches t on t.id = m.match_id
          where m.id = message_id and auth.uid() in (t.user_a, t.user_b)));
