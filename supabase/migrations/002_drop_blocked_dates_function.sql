-- ══════════════════════════════════════════════════════════
-- Migration 002 — supprime la fonction exposée à anon
-- À coller dans Supabase → SQL Editor → New query → Run (après déploiement).
-- Les dates bloquées sont désormais lues côté serveur (service-role key)
-- dans la page produit. Plus aucune fonction/vue accessible au rôle anon.
-- ══════════════════════════════════════════════════════════

drop function if exists public.maison_r_blocked_dates(uuid);
drop view if exists public.maison_r_blocked_dates;
