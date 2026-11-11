-- Apply after 001_vault.sql. Existing accounts default to no 2FA indicator.
alter table public.xkey_accounts
 add column if not exists has_2fa boolean not null default false;
notify pgrst, 'reload schema';
