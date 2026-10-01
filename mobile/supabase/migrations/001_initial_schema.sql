-- SUPERADO pela EMENDA-002 (docs/EMENDA-002-AUTENTICACAO-PROPRIA.md):
-- autenticação deixou de ser Supabase Auth, referências a auth.users(id)
-- abaixo não se aplicam mais. O schema real e atual é
-- api/prisma/schema.prisma. Mantido aqui só como referência histórica do
-- desenho de dados original, não rodar isso num banco novo.
--
-- ROOV MVP schema (Supabase / Postgres)
-- Run in Supabase SQL Editor after creating your project

create extension if not exists "uuid-ossp";

create type place_category as enum ('gastro', 'natureza', 'passeios', 'noturna');
create type content_status as enum ('pending', 'published', 'removed');
create type user_level as enum ('Explorer', 'Local Expert', 'Ambassador', 'Legend');
create type save_collection as enum ('favs', 'quero', 'noite', 'trips', 'gems');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  email text,
  avatar_url text,
  bio text,
  level user_level default 'Explorer',
  xp int default 0,
  eula_accepted_at timestamptz,
  created_at timestamptz default now()
);

create table public.places (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category place_category not null,
  lat double precision not null,
  lng double precision not null,
  address text,
  city text not null,
  price_range int check (price_range between 1 and 4),
  best_time text,
  description text,
  created_by uuid references public.users(id),
  rating_avg numeric(3,2) default 0,
  reviews_count int default 0,
  saves_count int default 0,
  popularity_score numeric default 0,
  status content_status default 'pending',
  created_at timestamptz default now()
);

create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid references public.users(id) not null,
  place_id uuid references public.places(id) not null,
  media_url text not null,
  media_type text check (media_type in ('image', 'video')) not null,
  caption text,
  likes_count int default 0,
  comments_count int default 0,
  status content_status default 'pending',
  created_at timestamptz default now()
);

create table public.post_vibes (
  post_id uuid references public.posts(id) on delete cascade,
  vibe text not null,
  primary key (post_id, vibe)
);

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  place_id uuid references public.places(id) not null,
  author_id uuid references public.users(id) not null,
  rating int check (rating between 1 and 5) not null,
  text text,
  status content_status default 'pending',
  created_at timestamptz default now()
);

create table public.saves (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) not null,
  target_type text check (target_type in ('place', 'post')) not null,
  target_id uuid not null,
  collection save_collection default 'favs',
  created_at timestamptz default now()
);

create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references public.users(id) not null,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text default 'open',
  action_taken text,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table public.blocks (
  blocker_id uuid references public.users(id) not null,
  blocked_id uuid references public.users(id) not null,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

-- RLS (enable after policies are defined)
alter table public.users enable row level security;
alter table public.places enable row level security;
alter table public.posts enable row level security;
