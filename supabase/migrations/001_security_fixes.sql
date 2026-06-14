-- ══════════════════════════════════════════════════════════
-- Migration 001 — corrections de sécurité
-- À coller dans Supabase → SQL Editor → New query → Run.
-- Idempotent : ré-exécutable sans risque.
-- ══════════════════════════════════════════════════════════

-- 1) maison_r_is_admin : SECURITY DEFINER pour casser la récursion de policy
--    (la policy de maison_r_admins appelle cette fonction qui lit
--    maison_r_admins → récursion infinie sans definer).
create or replace function public.maison_r_is_admin()
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

-- 2) Remplace la VUE security-definer (signalée CRITICAL) par une FONCTION
--    qui n'expose que les dates, jamais de PII client.
drop view if exists public.maison_r_blocked_dates;

create or replace function public.maison_r_blocked_dates(p_product_id uuid)
returns table (start_date date, end_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select start_date, end_date
  from public.maison_r_reservations
  where product_id = p_product_id
    and status in ('pending', 'accepted', 'paid', 'returned');
$$;

grant execute on function public.maison_r_blocked_dates(uuid) to anon, authenticated;
