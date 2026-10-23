-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  bio text not null default '',
  birthday date,
  gender text check (gender in ('man','woman','nonbinary')),
  interests text[] not null default '{}',
  photos text[] not null default '{}',
  lat double precision, lng double precision,
  pref_gender text[] not null default '{man,woman,nonbinary}',
  pref_age_min int not null default 18,
  pref_age_max int not null default 99,
  pref_distance_km int not null default 50,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============ SWIPES / MATCHES ============
create table public.swipes (
  swiper uuid references profiles on delete cascade,
  target uuid references profiles on delete cascade,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (swiper, target)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid references profiles on delete cascade,
  user_b uuid references profiles on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_a, user_b)
);

-- ============ CHAT ============
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches on delete cascade,
  sender uuid references profiles on delete cascade,
  body text not null,
  reply_to uuid references messages on delete set null,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reactions (
  message_id uuid references messages on delete cascade,
  user_id uuid references profiles on delete cascade,
  emoji text not null,
  primary key (message_id, user_id)
);

-- ============ SAFETY ============
create table public.blocks (
  blocker uuid references profiles on delete cascade,
  blocked uuid references profiles on delete cascade,
  primary key (blocker, blocked)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter uuid references profiles on delete cascade,
  reported uuid references profiles on delete cascade,
  reason text not null,
  created_at timestamptz not null default now()
);

-- ============ MUTUAL-LIKE TRIGGER ============
create or replace function public.create_match_on_mutual_like() returns trigger
language plpgsql security definer as $$
begin
  if new.liked and exists (
    select 1 from swipes where swiper = new.target and target = new.swiper and liked
  ) then
    insert into matches (user_a, user_b)
    values (least(new.swiper, new.target), greatest(new.swiper, new.target))
    on conflict do nothing;
  end if;
  return new;
end $$;

create trigger on_swipe after insert on swipes
for each row execute function create_match_on_mutual_like();

-- ============ NEW USER -> EMPTY PROFILE ============
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer as $$
begin
  insert into profiles (id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function handle_new_user();

-- ============ RLS ============
alter table profiles  enable row level security;
alter table swipes    enable row level security;
alter table matches   enable row level security;
alter table messages  enable row level security;
alter table reactions enable row level security;
alter table blocks    enable row level security;
alter table reports   enable row level security;

create policy "profiles readable by signed-in" on profiles for select to authenticated using (true);
create policy "own profile update" on profiles for update to authenticated using (auth.uid() = id);
create policy "own swipes" on swipes for all to authenticated using (auth.uid() = swiper) with check (auth.uid() = swiper);
create policy "own matches" on matches for select to authenticated using (auth.uid() in (user_a, user_b));
create policy "chat read" on messages for select to authenticated using (
  exists (select 1 from matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)));
create policy "chat send" on messages for insert to authenticated with check (
  sender = auth.uid() and exists (select 1 from matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)));
create policy "chat mark seen" on messages for update to authenticated using (
  exists (select 1 from matches m where m.id = match_id and auth.uid() in (m.user_a, m.user_b)));
create policy "react" on reactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "react read" on reactions for select to authenticated using (true);
create policy "own blocks" on blocks for all to authenticated using (auth.uid() = blocker) with check (auth.uid() = blocker);
create policy "file report" on reports for insert to authenticated with check (auth.uid() = reporter);

-- ============ REALTIME + STORAGE ============
alter publication supabase_realtime add table messages, reactions, matches;
insert into storage.buckets (id, name, public) values ('photos','photos',true) on conflict do nothing;
create policy "photo read" on storage.objects for select using (bucket_id = 'photos');
create policy "photo write own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "photo delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
