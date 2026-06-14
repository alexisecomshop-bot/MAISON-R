-- ══════════════════════════════════════════════════════════
-- Migration 004 — déplace maison_r_is_admin() hors de l'API REST
-- À coller dans Supabase → SQL Editor → New query → Run (bloc entier d'un coup).
-- La fonction reste utilisée par les policies, mais dans un schéma privé non
-- exposé par PostgREST → plus appelable via /rest/v1/rpc. Aucun impact app.
-- Idempotent.
-- ══════════════════════════════════════════════════════════

-- 1) Schéma privé + fonction (definer, search_path verrouillé)
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

-- 2) Repointe toutes les policies vers la version privée
drop policy if exists "maison_r_admins_admin_all" on public.maison_r_admins;
create policy "maison_r_admins_admin_all" on public.maison_r_admins
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

drop policy if exists "maison_r_settings_admin_write" on public.maison_r_site_settings;
create policy "maison_r_settings_admin_write" on public.maison_r_site_settings
  for update using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

drop policy if exists "maison_r_products_admin_write" on public.maison_r_products;
create policy "maison_r_products_admin_write" on public.maison_r_products
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

drop policy if exists "maison_r_res_admin_all" on public.maison_r_reservations;
create policy "maison_r_res_admin_all" on public.maison_r_reservations
  for all using (private.maison_r_is_admin()) with check (private.maison_r_is_admin());

-- 3) Supprime la version exposée dans public (signalée par l'advisor)
drop function if exists public.maison_r_is_admin();
