/* SOMENTE DESENVOLVIMENTO: simula o Supabase e a Netlify Function no localStorage,
   com três candidaturas fictícias. Não entra no build de produção. PIN de teste: 2026. */
import { calcularMedia, CRITERIOS_AVALIACAO, LIMITE_OBSERVACAO, sanitizar, STATUS_LISTA, type Avaliacoes, type Status } from "../shared";
import { ErroApi } from "./utils";
import type { Candidatura, NovaCandidatura } from "../types";

const KEY = "bl-med-demo-candidaturas";
const confirmado = { disponibilidade_na_data: true, compromisso_com_briefing: true, autorizacao_de_contato: true, consentimento_de_dados: true, ciencia_sobre_escolha: true };
const base = { linkedin: null, informacao_adicional: null, possivel_duplicidade: false, observacao_interna: null, avaliacoes: {}, media_avaliacao: null, ...confirmado };

function exemplos(): Candidatura[] {
  return [
    { ...base, id: "demo-1", codigo_candidatura: "BL-2026-K7Q2", nome: "Ana Exemplo Ribeiro (fictícia)", email: "ana@exemplo.invalid", whatsapp: "(27) 99999-0001", organizacao: "Organização Exemplo A", cargo_ou_area: "Gerente de Comunicação", cidade: "Vitória", edicao_de_ingresso: "3ª Edição", organizacao_parceira: "Parceira Exemplo 1", atividades_ultimos_12_meses: ["Encontros da Comunidade", "Mentoria"], motivo_para_mediar: "Quero contribuir com a Comunidade usando minha experiência em conduzir conversas com clareza.", tema_que_mais_mobiliza: "Comunicação como responsabilidade da liderança", experiencia_em_mediacao: "Sim, algumas vezes", descricao_da_experiencia: "Mediei dois painéis internos sobre cultura organizacional.", status: "Em análise", criado_em: "2026-10-08T17:20:00Z", atualizado_em: "2026-10-08T17:20:00Z" },
    { ...base, id: "demo-2", codigo_candidatura: "BL-2026-P3MZ", nome: "Bruno Exemplo Costa (fictício)", email: "bruno@exemplo.invalid", whatsapp: "(27) 99999-0002", organizacao: "Organização Exemplo B", cargo_ou_area: "Coordenador de Inovação", cidade: "Serra", edicao_de_ingresso: "5ª Edição", organizacao_parceira: "Parceira Exemplo 2", atividades_ultimos_12_meses: ["Trilha de Formação", "Imersão Conectando Lideranças"], motivo_para_mediar: "Gostaria de aproximar o tema de tecnologia das pessoas da Comunidade.", tema_que_mais_mobiliza: "Tecnologia, inteligência artificial e capital humano", experiencia_em_mediacao: "Já conduzi conversas ou reuniões, mas não painéis", descricao_da_experiencia: "Conduzo reuniões mensais de inovação com diferentes áreas.", status: "Recebida", criado_em: "2026-10-11T12:05:00Z", atualizado_em: "2026-10-11T12:05:00Z" },
    { ...base, id: "demo-3", codigo_candidatura: "BL-2026-W8HN", nome: "Carla Exemplo Nunes (fictícia)", email: "carla@exemplo.invalid", whatsapp: "(27) 99999-0003", organizacao: "Organização Exemplo C", cargo_ou_area: "Diretora de Pessoas", cidade: "Vila Velha", edicao_de_ingresso: "1ª Edição", organizacao_parceira: "Parceira Exemplo 3", atividades_ultimos_12_meses: ["Encontros da Comunidade", "Eventos do Espírito Santo em Ação"], motivo_para_mediar: "Desejo me colocar à disposição para uma conversa que conecta gerações de liderança.", tema_que_mais_mobiliza: "Liderar diferentes gerações e linguagens", experiencia_em_mediacao: "Sim, com frequência", descricao_da_experiencia: "Medeio rodas de conversa trimestrais sobre liderança.", status: "Pré-selecionada", criado_em: "2026-10-14T21:40:00Z", atualizado_em: "2026-10-14T21:40:00Z" },
  ];
}
function ler(): Candidatura[] {
  try { const v = localStorage.getItem(KEY); if (v) return JSON.parse(v) as Candidatura[]; } catch { /* vazio */ }
  const l = exemplos(); salvar(l); return l;
}
function salvar(l: Candidatura[]) { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* vazio */ } }
const ordenar = (l: Candidatura[]) => [...l].sort((a, b) => b.criado_em.localeCompare(a.criado_em));
const espera = () => new Promise((r) => setTimeout(r, 250));

export const demo = {
  async emailJaCadastrado(email: string) { await espera(); return ler().some((c) => c.email === email.trim().toLowerCase()); },
  async inserir(linha: NovaCandidatura) {
    await espera();
    const l = ler(); const agora = new Date().toISOString();
    l.push({ ...linha, id: crypto.randomUUID(), informacao_adicional: null, status: "Recebida", possivel_duplicidade: l.some((c) => c.email === linha.email), observacao_interna: null, avaliacoes: {}, media_avaliacao: null, criado_em: agora, atualizado_em: agora });
    salvar(l);
  },
  async comite(acao: string, pin: string, extra: Record<string, unknown>) {
    await espera();
    if (pin !== "2026") throw new ErroApi("PIN incorreto. Confira com a coordenação do Comitê.", 401);
    let l = ler();
    const id = String(extra.id ?? "");
    const alvo = l.find((c) => c.id === id);
    const tocar = (c: Candidatura, m: Partial<Candidatura>) => Object.assign(c, m, { atualizado_em: new Date().toISOString() });
    if (acao === "status") {
      const st = extra.status as Status;
      if (!alvo || !STATUS_LISTA.includes(st)) throw new ErroApi("Dados inválidos.", 400);
      if (st === "Selecionada") l.filter((c) => c.status === "Selecionada" && c.id !== id).forEach((c) => tocar(c, { status: "Pré-selecionada" }));
      tocar(alvo, { status: st });
    } else if (acao === "avaliar") {
      if (!alvo) throw new ErroApi("Dados inválidos.", 400);
      const av: Avaliacoes = {};
      const rec = (extra.avaliacoes ?? {}) as Record<string, unknown>;
      CRITERIOS_AVALIACAO.forEach(({ id: k }) => { const n = Number(rec[k]); if (Number.isInteger(n) && n >= 1 && n <= 5) av[k] = n; });
      tocar(alvo, { avaliacoes: av, media_avaliacao: calcularMedia(av) });
    } else if (acao === "observar") {
      if (!alvo) throw new ErroApi("Dados inválidos.", 400);
      tocar(alvo, { observacao_interna: sanitizar(extra.texto, LIMITE_OBSERVACAO) || null });
    }
    salvar(l);
    l = ordenar(l);
    return { ok: true, candidaturas: l };
  },
};
