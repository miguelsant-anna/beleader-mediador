-- =====================================================================
-- Comunidade Be Leader · Candidaturas para a mediação
-- Script completo do Supabase. Execute no SQL Editor (pode rodar de novo
-- sem perder dados: ele só cria o que ainda não existe e atualiza regras).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Tabela
-- ---------------------------------------------------------------------
create table if not exists public.candidaturas (
  id                           uuid primary key default gen_random_uuid(),
  codigo_candidatura           text not null unique
                               check (codigo_candidatura ~ '^BL-[0-9]{4}-[A-Z0-9]{4}$'),

  -- Identificação
  nome                         text not null check (char_length(nome) between 2 and 120),
  email                        text not null check (char_length(email) <= 160 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  whatsapp                     text not null check (char_length(regexp_replace(whatsapp, '\D', '', 'g')) between 10 and 11),
  organizacao                  text not null check (char_length(organizacao) between 1 and 160),
  cargo_ou_area                text not null check (char_length(cargo_ou_area) between 1 and 160),
  cidade                       text not null check (char_length(cidade) between 1 and 100),
  edicao_de_ingresso           text not null check (char_length(edicao_de_ingresso) between 1 and 40),
  organizacao_parceira         text not null check (char_length(organizacao_parceira) between 1 and 160),
  linkedin                     text check (linkedin is null or char_length(linkedin) <= 200),

  -- Participação, interesse e experiência
  atividades_ultimos_12_meses  text[] not null check (cardinality(atividades_ultimos_12_meses) between 1 and 7),
  motivo_para_mediar           text not null check (char_length(motivo_para_mediar) between 1 and 700),
  tema_que_mais_mobiliza       text not null check (char_length(tema_que_mais_mobiliza) between 1 and 200),
  experiencia_em_mediacao      text not null check (char_length(experiencia_em_mediacao) between 1 and 200),
  descricao_da_experiencia     text check (descricao_da_experiencia is null or char_length(descricao_da_experiencia) <= 500),

  -- Compromissos (todos obrigatórios)
  disponibilidade_na_data      boolean not null check (disponibilidade_na_data),
  compromisso_com_briefing     boolean not null check (compromisso_com_briefing),
  autorizacao_de_contato       boolean not null check (autorizacao_de_contato),
  consentimento_de_dados       boolean not null check (consentimento_de_dados),
  ciencia_sobre_escolha        boolean not null check (ciencia_sobre_escolha),

  -- Reservado para uso futuro (não há campo no formulário nesta versão)
  informacao_adicional         text check (informacao_adicional is null or char_length(informacao_adicional) <= 1000),

  -- Gestão do Comitê
  status                       text not null default 'Recebida'
                               check (status in ('Recebida', 'Em análise', 'Pré-selecionada', 'Selecionada', 'Banco de oportunidades')),
  possivel_duplicidade         boolean not null default false,
  observacao_interna           text check (observacao_interna is null or char_length(observacao_interna) <= 2000),
  avaliacoes                   jsonb not null default '{}'::jsonb check (jsonb_typeof(avaliacoes) = 'object'),
  media_avaliacao              numeric(3,2) check (media_avaliacao is null or media_avaliacao between 1 and 5),

  criado_em                    timestamptz not null default now(),
  atualizado_em                timestamptz not null default now()
);

comment on table  public.candidaturas is 'Candidaturas para mediar o bate-papo do Encontro da Comunidade Be Leader.';
comment on column public.candidaturas.avaliacoes is 'Notas de 1 a 5: motivacao, aderencia, experiencia, engajamento, disponibilidade, geral.';
comment on column public.candidaturas.informacao_adicional is 'Reservado. Não há campo correspondente no formulário nesta versão.';

-- ---------------------------------------------------------------------
-- 2. Índices
-- ---------------------------------------------------------------------
create index if not exists candidaturas_email_idx     on public.candidaturas (lower(email));
create index if not exists candidaturas_status_idx    on public.candidaturas (status);
create index if not exists candidaturas_criado_em_idx on public.candidaturas (criado_em desc);
-- Garante, no próprio banco, que só uma candidatura pode estar "Selecionada".
create unique index if not exists candidaturas_uma_selecionada on public.candidaturas (status) where status = 'Selecionada';

-- ---------------------------------------------------------------------
-- 3. Gatilhos: valores controlados pelo banco e datas
-- ---------------------------------------------------------------------
create or replace function public.candidaturas_antes_de_inserir()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.email                := lower(trim(new.email));
  new.status               := 'Recebida';
  new.observacao_interna   := null;
  new.avaliacoes           := '{}'::jsonb;
  new.media_avaliacao      := null;
  new.criado_em            := now();
  new.atualizado_em        := now();
  -- Marca possível duplicidade quando o e-mail já existe (calculado aqui, não pelo navegador).
  new.possivel_duplicidade := exists (select 1 from public.candidaturas c where lower(c.email) = new.email);
  return new;
end $$;

create or replace function public.candidaturas_antes_de_atualizar()
returns trigger language plpgsql set search_path = public as $$
begin
  new.atualizado_em := now();
  new.criado_em     := old.criado_em;
  return new;
end $$;

drop trigger if exists candidaturas_inserir on public.candidaturas;
create trigger candidaturas_inserir before insert on public.candidaturas
  for each row execute function public.candidaturas_antes_de_inserir();

drop trigger if exists candidaturas_atualizar on public.candidaturas;
create trigger candidaturas_atualizar before update on public.candidaturas
  for each row execute function public.candidaturas_antes_de_atualizar();

-- ---------------------------------------------------------------------
-- 4. Funções auxiliares
-- ---------------------------------------------------------------------
-- Área pública: responde apenas verdadeiro/falso. Não lista nem devolve dados.
create or replace function public.email_ja_cadastrado(p_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.candidaturas where lower(email) = lower(trim(p_email)));
$$;

-- Comitê (somente service_role, via Netlify Function): seleção única e atômica.
create or replace function public.selecionar_candidatura(p_id uuid)
returns void language plpgsql set search_path = public as $$
begin
  if not exists (select 1 from public.candidaturas where id = p_id) then
    raise exception 'Candidatura não encontrada';
  end if;
  update public.candidaturas set status = 'Pré-selecionada' where status = 'Selecionada' and id <> p_id;
  update public.candidaturas set status = 'Selecionada' where id = p_id;
end $$;

revoke all on function public.candidaturas_antes_de_inserir()    from public, anon, authenticated;
revoke all on function public.candidaturas_antes_de_atualizar()  from public, anon, authenticated;
revoke all on function public.email_ja_cadastrado(text)          from public, anon, authenticated;
revoke all on function public.selecionar_candidatura(uuid)       from public, anon, authenticated;
grant execute on function public.email_ja_cadastrado(text)       to anon, authenticated;
grant execute on function public.selecionar_candidatura(uuid)    to service_role;

-- ---------------------------------------------------------------------
-- 5. Segurança (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.candidaturas enable row level security;

-- A área pública (chave anon) só pode INSERIR, e apenas as colunas do formulário.
revoke all on table public.candidaturas from anon, authenticated;
grant insert (
  codigo_candidatura, nome, email, whatsapp, organizacao, cargo_ou_area, cidade,
  edicao_de_ingresso, organizacao_parceira, linkedin, atividades_ultimos_12_meses,
  motivo_para_mediar, tema_que_mais_mobiliza, experiencia_em_mediacao, descricao_da_experiencia,
  disponibilidade_na_data, compromisso_com_briefing, autorizacao_de_contato,
  consentimento_de_dados, ciencia_sobre_escolha
) on public.candidaturas to anon;

drop policy if exists "Inserção pública de candidaturas" on public.candidaturas;
create policy "Inserção pública de candidaturas"
  on public.candidaturas for insert to anon
  with check (status = 'Recebida');

-- Nenhuma política de SELECT, UPDATE ou DELETE para anon/authenticated:
-- a área pública não lê, não altera e não exclui candidaturas.
-- O painel do Comitê usa a service_role pela Netlify Function (ignora RLS, fica só no servidor).
grant all on table public.candidaturas to service_role;
