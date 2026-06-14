-- ══════════════════════════════════════════════════════════
-- Migration 003 — supprime la policy d'insertion publique inutile
-- À coller dans Supabase → SQL Editor → New query → Run.
-- Les réservations sont créées uniquement par /api/reservations avec la
-- service-role key (contourne la RLS). Aucun client anon n'insère en direct,
-- donc la policy "with check (true)" ne sert à rien et est signalée par
-- l'advisor. On la retire ; seul l'admin garde un accès via RLS.
-- ══════════════════════════════════════════════════════════

drop policy if exists "maison_r_res_public_insert" on public.maison_r_reservations;
