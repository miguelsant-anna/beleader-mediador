/* Camada de dados.
   - Modo compartilhado: Supabase (inserção anônima) + Netlify Function "comite" (painel).
   - Modo demonstração: só em `npm run dev` sem variáveis do Supabase; usa localStorage (dados fictícios).
     Esse modo é removido do build de produção. */
import { supabase, supabaseConfigurado } from "./supabase";
import { ErroApi, gerarCodigo, paraLinha } from "./utils";
import type { Avaliacoes, Candidatura, FormData, Status } from "../types";

export type Modo = "compartilhado" | "demonstracao" | "nao-configurado";
export const modo: Modo = supabaseConfigurado ? "compartilhado" : import.meta.env.DEV ? "demonstracao" : "nao-configurado";

const demo = () => import("./demo").then((m) => m.demo);

/* ---------- área pública ---------- */
export async function emailJaCadastrado(email: string): Promise<boolean> {
  if (import.meta.env.DEV && modo === "demonstracao") return (await demo()).emailJaCadastrado(email);
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("email_ja_cadastrado", { p_email: email });
  if (error) return false; // a verificação nunca impede o envio
  return data === true;
}

export async function enviarCandidatura(d: FormData): Promise<string> {
  for (let tentativa = 0; tentativa < 3; tentativa++) {
    const codigo = gerarCodigo();
    const linha = paraLinha(d, codigo);
    if (import.meta.env.DEV && modo === "demonstracao") { await (await demo()).inserir(linha); return codigo; }
    if (!supabase) throw new ErroApi("O envio ainda não está configurado.");
    const { error } = await supabase.from("candidaturas").insert(linha);
    if (!error) return codigo;
    if (error.code !== "23505") throw new ErroApi(error.message); // 23505 = código repetido: tenta outro
  }
  throw new ErroApi("Não foi possível gerar o código da candidatura.");
}

/* ---------- área do Comitê ---------- */
type Resposta = { ok?: boolean; candidaturas?: Candidatura[]; erro?: string };

async function chamar(acao: string, pin: string, extra: Record<string, unknown> = {}): Promise<Resposta> {
  if (import.meta.env.DEV && modo === "demonstracao") return (await demo()).comite(acao, pin, extra);
  let r: Response;
  try {
    r = await fetch("/.netlify/functions/comite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ acao, pin, ...extra }),
    });
  } catch {
    throw new ErroApi("Sem conexão com o servidor. Tente novamente.");
  }
  const j = (await r.json().catch(() => ({}))) as Resposta;
  if (!r.ok) throw new ErroApi(j.erro || "Não foi possível concluir a operação.", r.status);
  return j;
}
const lista = (r: Resposta) => r.candidaturas ?? [];

export const comite = {
  entrar: (pin: string) => chamar("entrar", pin).then(() => undefined),
  listar: (pin: string) => chamar("listar", pin).then(lista),
  status: (pin: string, id: string, status: Status) => chamar("status", pin, { id, status }).then(lista),
  avaliar: (pin: string, id: string, avaliacoes: Avaliacoes) => chamar("avaliar", pin, { id, avaliacoes }).then(lista),
  observar: (pin: string, id: string, texto: string) => chamar("observar", pin, { id, texto }).then(lista),
};
