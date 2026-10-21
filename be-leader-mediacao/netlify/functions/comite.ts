/* Netlify Function da Área do Comitê.
   Roda no servidor da Netlify: é o único lugar que usa a SUPABASE_SERVICE_ROLE_KEY.
   Toda chamada precisa do PIN correto (variável ADMIN_PIN). Endereço: /.netlify/functions/comite
   Fala com o Supabase pela API REST (fetch), sem a biblioteca supabase-js, para funcionar em qualquer versão do Node. */
import { timingSafeEqual } from "node:crypto";
import { calcularMedia, CRITERIOS_AVALIACAO, LIMITE_OBSERVACAO, sanitizar, STATUS_LISTA, type Avaliacoes, type Status } from "../../src/shared";
 
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 
const json = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
 
function pinConfere(recebido: string, esperado: string): boolean {
  const a = Buffer.from(recebido); const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}
 
/** Cliente mínimo da API REST do Supabase (PostgREST) com a chave de serviço. */
function supabaseRest(urlBase: string, chave: string) {
  const base = urlBase.trim().replace(/\/+$/, "").replace(/\/rest\/v1$/, "");
  const headers: Record<string, string> = { apikey: chave, "content-type": "application/json" };
  if (chave.startsWith("eyJ")) headers.authorization = `Bearer ${chave}`; // chave service_role antiga (JWT)
  async function req(caminho: string, init: RequestInit = {}) {
    const r = await fetch(`${base}/rest/v1/${caminho}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
    const texto = await r.text();
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${texto.slice(0, 300)}`);
    return texto ? JSON.parse(texto) : null;
  }
  return {
    listar: () => req("candidaturas?select=*&order=criado_em.desc&limit=1000"),
    atualizar: (id: string, dados: Record<string, unknown>) =>
      req(`candidaturas?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(dados), headers: { prefer: "return=minimal" } }),
    rpc: (funcao: string, args: Record<string, unknown>) =>
      req(`rpc/${funcao}`, { method: "POST", body: JSON.stringify(args) }),
  };
}
 
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") return json({ erro: "Método não permitido." }, 405);
 
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const pinEsperado = process.env.ADMIN_PIN;
    if (!url || !chave || !pinEsperado) return json({ erro: "O servidor ainda não foi configurado. Confira as variáveis de ambiente na Netlify." }, 500);
 
    const texto = await req.text();
    if (texto.length > 20_000) return json({ erro: "Requisição muito grande." }, 413);
    let corpo: Record<string, unknown>;
    try { corpo = JSON.parse(texto) as Record<string, unknown>; } catch { return json({ erro: "Requisição inválida." }, 400); }
 
    if (!pinConfere(String(corpo.pin ?? ""), pinEsperado.trim())) {
      await new Promise((r) => setTimeout(r, 800)); // desacelera tentativas de adivinhar o PIN
      return json({ erro: "PIN incorreto." }, 401);
    }
 
    const sb = supabaseRest(url, chave.trim());
    const listar = async () => json({ ok: true, candidaturas: await sb.listar() });
    const id = String(corpo.id ?? "");
 
    switch (corpo.acao) {
      case "entrar":
        return json({ ok: true });
 
      case "listar":
        return await listar();
 
      case "status": {
        const status = corpo.status as Status;
        if (!UUID.test(id) || !STATUS_LISTA.includes(status)) return json({ erro: "Dados inválidos." }, 400);
        // "Selecionada" usa uma função no banco que, na mesma transação, devolve a seleção anterior para "Pré-selecionada".
        if (status === "Selecionada") await sb.rpc("selecionar_candidatura", { p_id: id });
        else await sb.atualizar(id, { status });
        return await listar();
      }
 
      case "avaliar": {
        if (!UUID.test(id)) return json({ erro: "Dados inválidos." }, 400);
        const recebidas = (corpo.avaliacoes ?? {}) as Record<string, unknown>;
        const avaliacoes: Avaliacoes = {};
        for (const { id: criterio } of CRITERIOS_AVALIACAO) {
          const n = Number(recebidas[criterio]);
          if (Number.isInteger(n) && n >= 1 && n <= 5) avaliacoes[criterio] = n;
        }
        await sb.atualizar(id, { avaliacoes, media_avaliacao: calcularMedia(avaliacoes) });
        return await listar();
      }
 
      case "observar": {
        if (!UUID.test(id)) return json({ erro: "Dados inválidos." }, 400);
        await sb.atualizar(id, { observacao_interna: sanitizar(corpo.texto, LIMITE_OBSERVACAO) || null });
        return await listar();
      }
 
      default:
        return json({ erro: "Ação desconhecida." }, 400);
    }
  } catch (e) {
    console.error("comite:", e);
    return json({ erro: "Não foi possível acessar as candidaturas agora. Confira as variáveis do Supabase na Netlify e tente novamente." }, 500);
  }
};
 
