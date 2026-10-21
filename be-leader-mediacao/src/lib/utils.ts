import { CONFIG } from "../config";
import { CONFIRMACOES, EMPTY, EXPERIENCIAS, LIMITES } from "../data";
import { sanitizar } from "../shared";
import type { Candidatura, FormData, NovaCandidatura } from "../types";

export class ErroApi extends Error {
  constructor(message: string, public status = 0) { super(message); }
}

export const precisaRelato = (d: FormData) => EXPERIENCIAS.slice(0, 3).includes(d.experiencia);
export const normEmail = (e: string) => e.trim().toLowerCase();
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function maskPhone(v: string): string {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 2) return n ? `(${n}` : "";
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}

export type Erros = Partial<Record<keyof FormData, string>>;

export function validate(step: number, d: FormData): Erros {
  const e: Erros = {};
  const req = (k: keyof FormData) => { if (!String(d[k] ?? "").trim()) e[k] = "Preencha este campo para continuar."; };
  if (step === 0) {
    (["nome", "organizacao", "cargo", "cidade", "orgParceira"] as const).forEach(req);
    if (!EMAIL_RE.test(d.email.trim())) e.email = "Informe um e-mail válido, como nome@organizacao.org.br.";
    const tel = d.whatsapp.replace(/\D/g, "").length;
    if (tel < 10 || tel > 11) e.whatsapp = "Informe o número com DDD, como (27) 99999-0000.";
    if (!d.edicao) e.edicao = "Escolha a edição pela qual você ingressou.";
  }
  if (step === 1 && !d.atividades.length) e.atividades = "Marque ao menos uma opção.";
  if (step === 2) { req("motivacao"); if (!d.tema) e.tema = "Escolha um dos quatro temas."; }
  if (step === 3) {
    if (!d.experiencia) e.experiencia = "Escolha uma opção.";
    if (precisaRelato(d)) req("experienciaRelato");
  }
  if (step === 4 && CONFIRMACOES.some((c) => !d.confirmacoes[c.id])) e.confirmacoes = "Para seguir, confirme todos os itens.";
  return e;
}

export function validarTudo(d: FormData): boolean {
  return [0, 1, 2, 3, 4].every((s) => !Object.keys(validate(s, d)).length);
}

export function gerarCodigo(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = new Uint32Array(4);
  crypto.getRandomValues(rnd);
  return `BL-${CONFIG.anoCodigo}-` + Array.from(rnd, (n) => chars[n % chars.length]).join("");
}

/** Converte o formulário em uma linha sanitizada para o Supabase. */
export function paraLinha(d: FormData, codigo: string): NovaCandidatura {
  return {
    codigo_candidatura: codigo,
    nome: sanitizar(d.nome, LIMITES.nome),
    email: normEmail(sanitizar(d.email, LIMITES.email)),
    whatsapp: sanitizar(d.whatsapp, 20),
    organizacao: sanitizar(d.organizacao, LIMITES.texto),
    cargo_ou_area: sanitizar(d.cargo, LIMITES.texto),
    cidade: sanitizar(d.cidade, LIMITES.cidade),
    edicao_de_ingresso: sanitizar(d.edicao, 40),
    organizacao_parceira: sanitizar(d.orgParceira, LIMITES.texto),
    linkedin: sanitizar(d.linkedin, LIMITES.linkedin) || null,
    atividades_ultimos_12_meses: d.atividades.map((a) => sanitizar(a, 80)).slice(0, 7),
    motivo_para_mediar: sanitizar(d.motivacao, LIMITES.motivacao),
    tema_que_mais_mobiliza: sanitizar(d.tema, 200),
    experiencia_em_mediacao: sanitizar(d.experiencia, 200),
    descricao_da_experiencia: precisaRelato(d) ? sanitizar(d.experienciaRelato, LIMITES.relato) || null : null,
    disponibilidade_na_data: d.confirmacoes.disponibilidade_na_data,
    compromisso_com_briefing: d.confirmacoes.compromisso_com_briefing,
    autorizacao_de_contato: d.confirmacoes.autorizacao_de_contato,
    consentimento_de_dados: d.confirmacoes.consentimento_de_dados,
    ciencia_sobre_escolha: d.confirmacoes.ciencia_sobre_escolha,
  };
}

/** Converte uma linha do banco no formato do formulário, para reaproveitar o resumo de respostas. */
export function paraForm(c: Candidatura): FormData {
  return {
    ...EMPTY,
    nome: c.nome, email: c.email, whatsapp: c.whatsapp, organizacao: c.organizacao, cargo: c.cargo_ou_area,
    cidade: c.cidade, edicao: c.edicao_de_ingresso, orgParceira: c.organizacao_parceira, linkedin: c.linkedin ?? "",
    atividades: c.atividades_ultimos_12_meses ?? [], motivacao: c.motivo_para_mediar, tema: c.tema_que_mais_mobiliza,
    experiencia: c.experiencia_em_mediacao, experienciaRelato: c.descricao_da_experiencia ?? "",
    confirmacoes: {
      disponibilidade_na_data: c.disponibilidade_na_data, compromisso_com_briefing: c.compromisso_com_briefing,
      autorizacao_de_contato: c.autorizacao_de_contato, consentimento_de_dados: c.consentimento_de_dados,
      ciencia_sobre_escolha: c.ciencia_sobre_escolha,
    },
  };
}

export function fmtValor(k: keyof FormData, v: FormData[keyof FormData]): string {
  if (k === "confirmacoes") {
    const conf = v as FormData["confirmacoes"];
    const n = CONFIRMACOES.filter((c) => conf && conf[c.id]).length;
    return `${n} de ${CONFIRMACOES.length} itens confirmados`;
  }
  if (Array.isArray(v)) return v.length ? v.join(" · ") : "—";
  if (k === "linkedin" && !v) return "Não informado";
  return (v as string) || "—";
}

export const fmtData = (iso?: string) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }); } catch { return "—"; }
};
export const fmtMedia = (m: number | null) => (m == null ? "—" : m.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

export const store = {
  get<T>(k: string, f: T, area: "local" | "session" = "local"): T {
    try { const s = area === "local" ? localStorage : sessionStorage; const v = s.getItem(k); return v ? (JSON.parse(v) as T) : f; } catch { return f; }
  },
  set(k: string, v: unknown, area: "local" | "session" = "local") {
    try { (area === "local" ? localStorage : sessionStorage).setItem(k, JSON.stringify(v)); } catch { /* armazenamento indisponível */ }
  },
  del(k: string, area: "local" | "session" = "local") {
    try { (area === "local" ? localStorage : sessionStorage).removeItem(k); } catch { /* armazenamento indisponível */ }
  },
};
