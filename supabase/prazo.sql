-- =====================================================================
-- OPCIONAL · Encerra as candidaturas também no banco de dados.
-- O site já fecha o formulário sozinho no prazo; este script garante que
-- nenhum envio seja aceito depois de 22/11/2026 às 23h59 (horário de Brasília),
-- mesmo que alguém esteja com a página aberta. Execute no SQL Editor do Supabase.
-- Para mudar o prazo, altere a data abaixo e execute de novo.
-- =====================================================================

drop policy if exists "Inserção pública de candidaturas" on public.candidaturas;
create policy "Inserção pública de candidaturas"
  on public.candidaturas for insert to anon
  with check (status = 'Recebida' and now() <= timestamptz '2026-11-22 23:59:59-03');
