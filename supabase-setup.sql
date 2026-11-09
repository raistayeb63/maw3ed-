-- نفّذ هذا الملف مرة واحدة في Supabase: SQL Editor > New query > Run.
create table if not exists public.appointments (
  id uuid primary key,
  doctor_id text not null check (doctor_id in ('d1','d2','d3','d4','d5','d6')),
  specialty text not null,
  patient_first text not null,
  patient_last text not null,
  patient_phone text not null,
  patient_key uuid not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  appointment_time time,
  created_at timestamptz not null default now()
);

create table if not exists public.doctor_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  doctor_id text not null unique check (doctor_id in ('d1','d2','d3','d4','d5','d6'))
);

alter table public.appointments enable row level security;
alter table public.doctor_accounts enable row level security;

revoke all on public.appointments from anon, authenticated;
grant insert (id, doctor_id, specialty, patient_first, patient_last, patient_phone, patient_key)
  on public.appointments to anon;
grant select on public.appointments to authenticated;
grant update (status, appointment_time) on public.appointments to authenticated;

revoke all on public.doctor_accounts from anon, authenticated;
grant select on public.doctor_accounts to authenticated;

drop policy if exists "Patients can submit appointment requests" on public.appointments;
create policy "Patients can submit appointment requests"
on public.appointments for insert to anon
with check (status = 'pending' and appointment_time is null and patient_key is not null);

drop policy if exists "Doctors can view their appointments" on public.appointments;
create policy "Doctors can view their appointments"
on public.appointments for select to authenticated
using (exists (
  select 1 from public.doctor_accounts da
  where da.user_id = (select auth.uid()) and da.doctor_id = appointments.doctor_id
));

drop policy if exists "Doctors can update their appointments" on public.appointments;
create policy "Doctors can update their appointments"
on public.appointments for update to authenticated
using (exists (
  select 1 from public.doctor_accounts da
  where da.user_id = (select auth.uid()) and da.doctor_id = appointments.doctor_id
))
with check (exists (
  select 1 from public.doctor_accounts da
  where da.user_id = (select auth.uid()) and da.doctor_id = appointments.doctor_id
));

drop policy if exists "Doctors can read their account mapping" on public.doctor_accounts;
create policy "Doctors can read their account mapping"
on public.doctor_accounts for select to authenticated
using (user_id = (select auth.uid()));

create or replace function public.get_patient_appointment(p_patient_key uuid)
returns table (
  id uuid,
  doctor_id text,
  status text,
  appointment_time time,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select a.id, a.doctor_id, a.status, a.appointment_time, a.created_at
  from public.appointments as a
  where a.patient_key = p_patient_key;
$$;
revoke all on function public.get_patient_appointment(uuid) from public;
grant execute on function public.get_patient_appointment(uuid) to anon, authenticated;
-- فعّل بث أحداث الطلبات الجديدة والتعديلات.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end
$$;