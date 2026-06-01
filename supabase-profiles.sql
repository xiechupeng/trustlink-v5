-- TrustLink profiles table
create table if not exists trustlink_profiles (
  id          uuid default gen_random_uuid() primary key,
  category    text not null,
  name        text not null,
  wechat      text not null,
  email       text,
  teaser      text,          -- 公开预览文字（1句话）
  data        jsonb,         -- 完整表单数据（付费解锁）
  approved    boolean default false,
  created_at  timestamptz default now()
);

-- Public read: only approved profiles, only teaser fields
create or replace view trustlink_profiles_public as
  select id, category, name, teaser, created_at
  from trustlink_profiles
  where approved = true;

-- Enable RLS
alter table trustlink_profiles enable row level security;

-- Service role can do everything
create policy "service_all" on trustlink_profiles
  for all using (true) with check (true);
