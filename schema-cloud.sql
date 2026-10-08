-- Eseguire una sola volta in Supabase SQL Editor.
-- Lo schema lifeos e le policy delle altre tabelle restano invariati.
create table if not exists lifeos.state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now()
);
alter table lifeos.state enable row level security;
create policy "Own state only" on lifeos.state for all to authenticated
 using ((select auth.uid()) = user_id)
 with check ((select auth.uid()) = user_id);
grant usage on schema lifeos to authenticated;
grant select,insert,update,delete on lifeos.state to authenticated;
revoke all on lifeos.state from anon;
