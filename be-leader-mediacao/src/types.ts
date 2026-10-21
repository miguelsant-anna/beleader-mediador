import type { Avaliacoes, Status } from "./shared";
export type { Avaliacoes, CriterioId, Status } from "./shared";

export type ConfirmacaoId =
  | "disponibilidade_na_data"
  | "compromisso_com_briefing"
  | "autorizacao_de_contato"
  | "consentimento_de_dados"
  | "ciencia_sobre_escolha";

/** Estado do formulário (rascunho salvo no localStorage). */
export interface FormData {
  nome: string;
  email: string;
  whatsapp: string;
  organizacao: string;
  cargo: string;
  cidade: string;
  edicao: string;
  orgParceira: string;
  linkedin: string;
  atividades: string[];
  motivacao: string;
  tema: string;
  experiencia: string;
  experienciaRelato: string;
  confirmacoes: Record<ConfirmacaoId, boolean>;
}

/** Linha da tabela public.candidaturas no Supabase. */
export interface Candidatura {
  id: string;
  codigo_candidatura: string;
  nome: string;
  email: string;
  whatsapp: string;
  organizacao: string;
  cargo_ou_area: string;
  cidade: string;
  edicao_de_ingresso: string;
  organizacao_parceira: string;
  linkedin: string | null;
  atividades_ultimos_12_meses: string[];
  motivo_para_mediar: string;
  tema_que_mais_mobiliza: string;
  experiencia_em_mediacao: string;
  descricao_da_experiencia: string | null;
  disponibilidade_na_data: boolean;
  compromisso_com_briefing: boolean;
  autorizacao_de_contato: boolean;
  consentimento_de_dados: boolean;
  ciencia_sobre_escolha: boolean;
  informacao_adicional: string | null;
  status: Status;
  possivel_duplicidade: boolean;
  observacao_interna: string | null;
  avaliacoes: Avaliacoes;
  media_avaliacao: number | null;
  criado_em: string;
  atualizado_em: string;
}

/** Colunas que a área pública pode inserir (as demais são definidas pelo banco). */
export type NovaCandidatura = Pick<
  Candidatura,
  | "codigo_candidatura" | "nome" | "email" | "whatsapp" | "organizacao" | "cargo_ou_area" | "cidade"
  | "edicao_de_ingresso" | "organizacao_parceira" | "linkedin" | "atividades_ultimos_12_meses"
  | "motivo_para_mediar" | "tema_que_mais_mobiliza" | "experiencia_em_mediacao" | "descricao_da_experiencia"
  | ConfirmacaoId
>;
