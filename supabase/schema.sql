-- ══════════════════════════════════════════════════════════
-- Maison R : schéma indépendant (tables préfixées maison_r_*)
-- À exécuter dans le SQL Editor du projet Supabase.
-- ══════════════════════════════════════════════════════════

-- Admins : lié à Supabase Auth. Seuls les users listés ici peuvent modifier.
create table if not exists maison_r_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz default now()
);

-- Paramètres du site (une seule ligne, id = 'default').
-- Modifiables par l'admin depuis l'interface /admin/parametres.
create table if not exists maison_r_site_settings (
  id text primary key default 'default',
  site_name text not null default 'Maison R',
  logo_url text default '',
  primary_color text default '#111111',
  accent_color text default '#b8935a',
  background_color text default '#f7f5f1',
  text_color text default '#111111',
  owner_whatsapp text default '',          -- E.164, ex: +33612345678
  contact_email text default '',
  contact_phone text default '',
  contact_address text default '',
  contact_instagram text default '',
  hero_title text default 'Location de pièces d''exception',
  hero_subtitle text default 'Offrez-vous le luxe, le temps d''une occasion.',
  updated_at timestamptz default now()
);

insert into maison_r_site_settings (id) values ('default')
  on conflict (id) do nothing;

-- Produits
create table if not exists maison_r_products (
  id uuid primary key default gen_random_uuid(),
  sku text,                     -- clé de sync depuis la Google Sheet
  name text not null,
  description text default '',
  brand text not null default '',
  category text not null,       -- slug : vetements | chaussures | accessoires
  subcategory text default '',  -- slug : sneakers, vestes, etc.
  size text default '',
  color text default '',
  daily_price numeric(10,2) not null,
  deposit numeric(10,2) not null default 0,
  images text[] default '{}',
  available boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table maison_r_products add column if not exists sku text;
alter table maison_r_products add column if not exists updated_at timestamptz default now();
create unique index if not exists idx_maison_r_products_sku
  on maison_r_products(sku) where sku is not null;
create index if not exists idx_maison_r_products_category on maison_r_products(category);
create index if not exists idx_maison_r_products_subcategory on maison_r_products(subcategory);
create index if not exists idx_maison_r_products_available on maison_r_products(available);

-- Réservations : pas besoin d'auth côté client (l'utilisateur saisit ses infos).
-- Cycle de vie :
--   pending  → soumis par le client, en attente du propriétaire
--   accepted → propriétaire OK, en attente du paiement client (PayPlug)
--   paid     → client a payé, location confirmée
--   refused  → propriétaire a refusé, pas de paiement
--   returned → article retourné OK
--   cancelled → annulée (par client ou admin)
create table if not exists maison_r_reservations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references maison_r_products(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  start_date date not null,
  end_date date not null,
  total_price numeric(10,2) not null,
  deposit numeric(10,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'paid', 'refused', 'returned', 'cancelled')),
  action_token text not null,  -- token secret utilisé dans le lien WhatsApp
  payplug_payment_id text,     -- id du paiement PayPlug (pay_xxx)
  paid_at timestamptz,
  created_at timestamptz default now(),
  constraint valid_dates check (end_date >= start_date)
);

-- Migrations idempotentes (safe à ré-exécuter)
alter table maison_r_reservations add column if not exists payplug_payment_id text;
alter table maison_r_reservations add column if not exists paid_at timestamptz;
alter table maison_r_reservations drop constraint if exists maison_r_reservations_status_check;
alter table maison_r_reservations add constraint maison_r_reservations_status_check
  check (status in ('pending', 'accepted', 'paid', 'refused', 'returned', 'cancelled'));

create index if not exists idx_maison_r_res_product on maison_r_reservations(product_id);
create index if not exists idx_maison_r_res_status on maison_r_reservations(status);
create index if not exists idx_maison_r_res_dates on maison_r_reservations(start_date, end_date);
create index if not exists idx_maison_r_res_payment on maison_r_reservations(payplug_payment_id);

-- ══════════════════════════════════════════════════════════
-- RLS
-- ══════════════════════════════════════════════════════════

alter table maison_r_admins enable row level security;
alter table maison_r_site_settings enable row level security;
alter table maison_r_products enable row level security;
alter table maison_r_reservations enable row level security;

-- Helper : l'utilisateur courant est-il admin ?
-- Placé dans un schéma PRIVÉ (non exposé par l'API REST), donc non appelable
-- via /rest/v1/rpc. SECURITY DEFINER + search_path verrouillé : indispensable,
-- sinon la lecture de maison_r_admins déclenche la policy de cette même table
-- (qui appelle la fonction) → récursion infinie. Le definer contourne la RLS
-- pour ce seul check ; search_path = '' protège contre l'injection de schéma.
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.maison_r_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.maison_r_admins where user_id = auth.uid()
  );
$$;

grant execute on function private.maison_r_is_admin() to anon, authenticated, service_role;

-- Retire l'ancienne version exposée dans public (signalée par l'advisor).
drop function if exists public.maison_r_is_admin();

-- maison_r_admins : seul un admin peut lire/écrire la liste.
drop policy if exists "maison_r_admins_admin_all" on maison_r_admins;
create policy "maison_r_admins_admin_all" on maison_r_admins
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

-- maison_r_site_settings : lecture publique, écriture admin.
drop policy if exists "maison_r_settings_public_read" on maison_r_site_settings;
create policy "maison_r_settings_public_read" on maison_r_site_settings
  for select using (true);
drop policy if exists "maison_r_settings_admin_write" on maison_r_site_settings;
create policy "maison_r_settings_admin_write" on maison_r_site_settings
  for update using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

-- maison_r_products : lecture publique, écriture admin.
drop policy if exists "maison_r_products_public_read" on maison_r_products;
create policy "maison_r_products_public_read" on maison_r_products
  for select using (true);
drop policy if exists "maison_r_products_admin_write" on maison_r_products;
create policy "maison_r_products_admin_write" on maison_r_products
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

-- maison_r_reservations : AUCUNE policy publique. Les réservations sont créées
-- exclusivement par la route serveur /api/reservations avec la service-role
-- key (qui contourne la RLS) — le navigateur ne fait qu'un POST, jamais
-- d'insert direct. On retire donc l'ancienne policy "public insert"
-- (with check true), inutile et signalée par l'advisor. Seul l'admin a accès.
drop policy if exists "maison_r_res_public_insert" on maison_r_reservations;
drop policy if exists "maison_r_res_admin_all" on maison_r_reservations;
create policy "maison_r_res_admin_all" on maison_r_reservations
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

-- Dates bloquées du calendrier : lues CÔTÉ SERVEUR par la page produit via la
-- service-role key (cf. src/app/produit/[id]/page.tsx), en ne sélectionnant
-- que start_date/end_date. Le rôle anon n'a donc AUCUN accès — direct ou via
-- fonction — à la table des réservations. Rien à exposer ici.
drop view if exists public.maison_r_blocked_dates;
drop function if exists public.maison_r_blocked_dates(uuid);

-- ══════════════════════════════════════════════════════════
-- Storage : bucket "maison-r-photos" pour les images produits.
-- À créer manuellement dans Supabase Storage (public read, admin write).
-- ══════════════════════════════════════════════════════════
