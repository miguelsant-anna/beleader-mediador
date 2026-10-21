/* Constantes e regras usadas tanto pelo navegador quanto pela Netlify Function. Sem dependências de React. */

export const STATUS_LISTA = ["Recebida", "Em análise", "Pré-selecionada", "Selecionada", "Banco de oportunidades"] as const;
export type Status = (typeof STATUS_LISTA)[number];

export const CRITERIOS_AVALIACAO = [
  { id: "motivacao", label: "Clareza da motivação para mediar" },
  { id: "aderencia", label: "Aderência do perfil à tarefa" },
  { id: "experiencia", label: "Experiência de condução ou mediação" },
  { id: "engajamento", label: "Engajamento com a Comunidade" },
  { id: "disponibilidade", label: "Disponibilidade e compromisso" },
  { id: "geral", label: "Avaliação geral do Comitê" },
] as const;
export type CriterioId = (typeof CRITERIOS_AVALIACAO)[number]["id"];
export type Avaliacoes = Partial<Record<CriterioId, number>>;

export const LIMITE_OBSERVACAO = 2000;

/** Média apenas dos critérios preenchidos (1 a 5), com duas casas. */
export function calcularMedia(av: Avaliacoes): number | null {
  const notas = CRITERIOS_AVALIACAO.map((c) => av[c.id]).filter((n): n is number => typeof n === "number");
  if (!notas.length) return null;
  return Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100;
}

/** Remove caracteres de controle e sinais de marcação, apara espaços e aplica limite. */
export function sanitizar(valor: unknown, max: number): string {
  return String(valor ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
}
