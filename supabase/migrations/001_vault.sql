-- Run once in the Supabase SQL editor. No browser/anon access is allowed.
create extension if not exists pgcrypto with schema extensions;
create table public.xkey_admin (
 id int primary key default 1 check (id = 1), username text not null,
 password_hash text not null, must_change boolean not null default true
);
insert into public.xkey_admin (username, password_hash)
values ('admin', extensions.crypt('admin', extensions.gen_salt('bf'))) on conflict do nothing;
create table public.xkey_accounts (
 id uuid primary key default gen_random_uuid(), category text not null, name text not null,
 url text not null default '', username text not null default '', secret text not null,
 kind text not null check (kind in ('password','api_key')), public boolean not null default true,
 memo text not null default '', updated_at timestamptz not null default now()
);
create table public.xkey_codes (
 id uuid primary key default gen_random_uuid(), label text not null, code_hash text not null unique,
 scope text not null check (scope in ('public','all')),
 created_at timestamptz not null default now(), expires_at timestamptz not null default now() + interval '7 days',
 last_used_at timestamptz, uses int not null default 0
);
create table public.xkey_sessions (
 token_hash text primary key, role text not null check (role in ('admin','viewer')),
 code_id uuid references public.xkey_codes(id) on delete cascade, expires_at timestamptz not null
);
create table public.xkey_attempts (bucket text primary key, started_at timestamptz not null default now(), attempts int not null default 1);
alter table public.xkey_admin enable row level security;
alter table public.xkey_accounts enable row level security;
alter table public.xkey_codes enable row level security;
alter table public.xkey_sessions enable row level security;
alter table public.xkey_attempts enable row level security;
revoke all on public.xkey_admin, public.xkey_accounts, public.xkey_codes, public.xkey_sessions, public.xkey_attempts from anon, authenticated;
grant all on public.xkey_admin, public.xkey_accounts, public.xkey_codes, public.xkey_sessions, public.xkey_attempts to service_role;
create function public.xkey_verify_admin(u text, p text) returns boolean language sql security invoker set search_path = '' as $$
 select exists(select 1 from public.xkey_admin where username=u and password_hash=extensions.crypt(p,password_hash));
$$;
create function public.xkey_change_admin(u text, p text) returns void language sql security invoker set search_path = '' as $$
 update public.xkey_admin set username=u, password_hash=extensions.crypt(p,extensions.gen_salt('bf')), must_change=false where id=1;
$$;
create function public.xkey_record_use(code uuid) returns void language sql security invoker set search_path = '' as $$
 update public.xkey_codes set uses=uses+1,last_used_at=now() where id=code;
$$;
create function public.xkey_throttle(b text) returns boolean language plpgsql security invoker set search_path = '' as $$
declare n int;
begin
 insert into public.xkey_attempts as a(bucket) values(b) on conflict(bucket) do update
 set attempts=case when a.started_at < now()-interval '15 minutes' then 1 else a.attempts+1 end,
 started_at=case when a.started_at < now()-interval '15 minutes' then now() else a.started_at end returning attempts into n;
 return n<=10;
end;
$$;
revoke all on function public.xkey_verify_admin(text,text), public.xkey_change_admin(text,text), public.xkey_record_use(uuid), public.xkey_throttle(text) from public, anon, authenticated;
grant execute on function public.xkey_verify_admin(text,text), public.xkey_change_admin(text,text), public.xkey_record_use(uuid), public.xkey_throttle(text) to service_role;
