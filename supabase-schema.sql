-- Colle ce SQL dans Supabase > SQL Editor > New query > Run

create table if not exists knowledge_entries (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('qa', 'article', 'post', 'text')),
  topic       text not null,
  title       text,
  question    text,
  content     text not null,
  tags        text[] default '{}',
  char_count  int default 0,
  created_at  timestamptz default now()
);

-- Index pour les recherches par topic
create index if not exists knowledge_entries_topic_idx on knowledge_entries(topic);

-- Index pour les recherches par type
create index if not exists knowledge_entries_type_idx on knowledge_entries(type);

-- Désactiver Row Level Security pour l'instant (on l'active plus tard avec l'auth utilisateurs)
alter table knowledge_entries disable row level security;
