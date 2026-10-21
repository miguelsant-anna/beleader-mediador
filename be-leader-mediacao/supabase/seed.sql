-- =====================================================================
-- DADOS FICTÍCIOS — SOMENTE PARA DESENVOLVIMENTO E TESTES
-- Não execute no projeto que vai receber candidaturas reais.
-- Para remover depois:  delete from public.candidaturas where email like '%@exemplo.invalid';
-- =====================================================================

insert into public.candidaturas (
  codigo_candidatura, nome, email, whatsapp, organizacao, cargo_ou_area, cidade, edicao_de_ingresso,
  organizacao_parceira, linkedin, atividades_ultimos_12_meses, motivo_para_mediar, tema_que_mais_mobiliza,
  experiencia_em_mediacao, descricao_da_experiencia, disponibilidade_na_data, compromisso_com_briefing,
  autorizacao_de_contato, consentimento_de_dados, ciencia_sobre_escolha
) values
  ('BL-2026-K7Q2', 'Ana Exemplo Ribeiro (fictícia)', 'ana@exemplo.invalid', '(27) 99999-0001', 'Organização Exemplo A',
   'Gerente de Comunicação', 'Vitória', '3ª Edição', 'Parceira Exemplo 1', null,
   array['Encontros da Comunidade', 'Mentoria'],
   'Quero contribuir com a Comunidade usando minha experiência em conduzir conversas com clareza.',
   'Comunicação como responsabilidade da liderança', 'Sim, algumas vezes',
   'Mediei dois painéis internos sobre cultura organizacional.', true, true, true, true, true),
  ('BL-2026-P3MZ', 'Bruno Exemplo Costa (fictício)', 'bruno@exemplo.invalid', '(27) 99999-0002', 'Organização Exemplo B',
   'Coordenador de Inovação', 'Serra', '5ª Edição', 'Parceira Exemplo 2', 'linkedin.com/in/exemplo-bruno',
   array['Trilha de Formação', 'Imersão Conectando Lideranças'],
   'Gostaria de aproximar o tema de tecnologia das pessoas da Comunidade.',
   'Tecnologia, inteligência artificial e capital humano', 'Já conduzi conversas ou reuniões, mas não painéis',
   'Conduzo reuniões mensais de inovação com diferentes áreas.', true, true, true, true, true),
  ('BL-2026-W8HN', 'Carla Exemplo Nunes (fictícia)', 'carla@exemplo.invalid', '(27) 99999-0003', 'Organização Exemplo C',
   'Diretora de Pessoas', 'Vila Velha', '1ª Edição', 'Parceira Exemplo 3', null,
   array['Encontros da Comunidade', 'Eventos do Espírito Santo em Ação'],
   'Desejo me colocar à disposição para uma conversa que conecta gerações de liderança.',
   'Liderar diferentes gerações e linguagens', 'Sim, com frequência',
   'Medeio rodas de conversa trimestrais sobre liderança.', true, true, true, true, true)
on conflict (codigo_candidatura) do nothing;

update public.candidaturas set status = 'Em análise'      where codigo_candidatura = 'BL-2026-K7Q2';
update public.candidaturas set status = 'Pré-selecionada' where codigo_candidatura = 'BL-2026-W8HN';
