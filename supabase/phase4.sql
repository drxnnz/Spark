-- ============ REPORTS: note, valid reasons, one report per pair ============
alter table reports add column if not exists note text;
alter table reports drop constraint if exists reports_reason_check;
alter table reports add constraint reports_reason_check check (reason in ('spam','inappropriate','fake','harassment','other'));
alter table reports drop constraint if exists reports_note_len;
alter table reports add constraint reports_note_len check (note is null or char_length(note) <= 300);
alter table reports drop constraint if exists reports_not_self;
alter table reports add constraint reports_not_self check (reporter <> reported);
create unique index if not exists reports_once on reports (reporter, reported);

alter table blocks drop constraint if exists blocks_not_self;
alter table blocks add constraint blocks_not_self check (blocker <> blocked);

-- ============ BLOCK = chat becomes inaccessible (either direction) ============
-- Messages and reactions policies read through `matches`, so they are hidden too.
-- Unblocking restores everything.
drop policy if exists "own matches" on matches;
create policy "own matches" on matches for select to authenticated
  using (auth.uid() in (user_a, user_b) and not blocked_between(user_a, user_b));
