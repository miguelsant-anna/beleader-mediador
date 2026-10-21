import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ChevronDown, Cloud, HardDrive, Inbox, Lock, RefreshCw, Save, TriangleAlert, X } from "lucide-react";
import { FILTROS, STATUS_COR, STATUS_LISTA } from "../data";
import { comite, modo } from "../lib/api";
import { ErroApi, fmtData, fmtMedia, paraForm, store } from "../lib/utils";
import { calcularMedia, CRITERIOS_AVALIACAO, LIMITE_OBSERVACAO, type Avaliacoes } from "../shared";
import type { Candidatura, Status } from "../types";
import { Respostas } from "../components/Respostas";
import { Area, btnPrim, btnSec, Campo, card, Dialogo, inputCls, Selo, Texto, Toast } from "../components/ui";

const PIN_KEY = "bl-comite-pin";

/* O PIN é conferido pela Netlify Function (variável ADMIN_PIN). Ele não fica no código do navegador.
   Para uma versão com login individual, substitua esta tela por Supabase Auth (link mágico por e-mail)
   ou Microsoft Entra ID e valide o token na função "comite". */
export function Painel({ onHome }: { onHome: () => void }) {
  const [pin, setPin] = useState<string>(() => store.get(PIN_KEY, "", "session"));
  const [digitado, setDigitado] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (entrando) return;
    setEntrando(true); setErro("");
    try { await comite.entrar(digitado); store.set(PIN_KEY, digitado, "session"); setPin(digitado); }
    catch (x) { setErro(x instanceof ErroApi && x.status === 401 ? "PIN incorreto. Confira com a coordenação do Comitê." : (x as Error).message); }
    finally { setEntrando(false); }
  }
  const sair = useCallback(() => { store.del(PIN_KEY, "session"); setPin(""); }, []);

  if (!pin) return (
    <div className="fade wrap max-w-md py-16">
      <button onClick={onHome} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-roxo"><ArrowLeft size={16} />Início</button>
      <form className={card + " mt-6 flex flex-col gap-5 p-6 sm:p-8"} onSubmit={entrar}>
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-navy text-white"><Lock size={20} /></span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-navy">Área do Comitê</h1>
          <p className="mt-1 text-sm leading-relaxed text-muted">Acesso restrito ao Comitê de Formação de Lideranças.</p>
        </div>
        <Campo id="pin" label="PIN de acesso" error={erro}>
          <Texto id="pin" type="password" inputMode="numeric" autoComplete="off" value={digitado} onChange={(v) => { setDigitado(v); setErro(""); }} error={erro} />
        </Campo>
        <button className={btnPrim} type="submit" disabled={entrando || !digitado}>{entrando ? "Entrando…" : "Entrar"}</button>
      </form>
    </div>
  );
  return <Lista pin={pin} onHome={onHome} onSair={sair} />;
}

function StatusSelect({ c, onChange }: { c: Candidatura; onChange: (s: Status) => void }) {
  return (
    <span className="relative inline-flex w-fit" onClick={(e) => e.stopPropagation()}>
      <select aria-label={"Status de " + c.nome} value={c.status} onChange={(e) => onChange(e.target.value as Status)}
        className={"cursor-pointer appearance-none rounded-full border-0 py-1.5 pl-3 pr-7 text-xs font-semibold outline-none focus-visible:ring-4 focus-visible:ring-roxo/25 " + STATUS_COR[c.status]}>
        {STATUS_LISTA.map((s) => <option key={s}>{s}</option>)}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-70" />
    </span>
  );
}

function Selos({ c }: { c: Candidatura }) {
  if (!c.possivel_duplicidade) return null;
  return <span className="mt-1 flex flex-wrap gap-1"><Selo tom="amber">Possível duplicidade</Selo></span>;
}

function Lista({ pin, onHome, onSair }: { pin: string; onHome: () => void; onSair: () => void }) {
  const [lista, setLista] = useState<Candidatura[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [filtro, setFiltro] = useState<Status | null>(null);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [confirma, setConfirma] = useState<{ c: Candidatura; atual: Candidatura | null } | null>(null);
  const [toast, setToast] = useState("");
  const toastT = useRef<ReturnType<typeof setTimeout>>();

  const aberta = lista.find((c) => c.id === abertaId) ?? null;
  const vis = filtro ? lista.filter((c) => c.status === filtro) : lista;
  const cont = (s: Status) => lista.filter((c) => c.status === s).length;

  function avisar(t: string) { setToast(t); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 2800); }
  function tratarErro(x: unknown) {
    if (x instanceof ErroApi && x.status === 401) { onSair(); return; }
    avisar((x as Error).message || "Não foi possível salvar. Tente novamente.");
  }

  const carregar = useCallback(async () => {
    setCarregando(true); setErroLista("");
    try { setLista(await comite.listar(pin)); }
    catch (x) { if (x instanceof ErroApi && x.status === 401) onSair(); else setErroLista((x as Error).message); }
    finally { setCarregando(false); }
  }, [pin, onSair]);
  useEffect(() => { carregar(); }, [carregar]);
  useEffect(() => { document.body.style.overflow = aberta ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [!!aberta]);

  async function aplicarStatus(c: Candidatura, status: Status) {
    try { setLista(await comite.status(pin, c.id, status)); avisar("Status atualizado com sucesso."); } catch (x) { tratarErro(x); }
  }
  function pedirStatus(c: Candidatura, status: Status) {
    if (status === c.status) return;
    if (status === "Selecionada") { setConfirma({ c, atual: lista.find((x) => x.status === "Selecionada" && x.id !== c.id) ?? null }); return; }
    aplicarStatus(c, status);
  }
  async function salvarAvaliacao(c: Candidatura, av: Avaliacoes) {
    try { setLista(await comite.avaliar(pin, c.id, av)); avisar("Avaliação salva com sucesso."); } catch (x) { tratarErro(x); }
  }
  async function salvarObservacao(c: Candidatura, texto: string) {
    try { setLista(await comite.observar(pin, c.id, texto)); avisar("Observação salva com sucesso."); } catch (x) { tratarErro(x); }
  }

  const resumo: [string, number][] = [["Total", lista.length], ["Recebidas", cont("Recebida")], ["Em análise", cont("Em análise")], ["Pré-selecionadas", cont("Pré-selecionada")], ["Selecionada", cont("Selecionada")]];
  const cols = "lg:grid-cols-[1.5fr_1.1fr_.7fr_1.6fr_1.2fr_.8fr_1.25fr]";

  return (
    <div className="fade wrap pb-16 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onHome} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-roxo"><ArrowLeft size={16} />Início</button>
        <div className="flex items-center gap-2">
          {modo === "compartilhado"
            ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><Cloud size={13} />Modo compartilhado</span>
            : <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"><HardDrive size={13} />Modo demonstração</span>}
          <button onClick={onSair} className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted hover:bg-white hover:text-roxo">Sair</button>
        </div>
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-navy sm:text-4xl">Candidaturas para a mediação</h1>
      <p className="mt-1 text-muted">Comitê de Formação de Lideranças · uma única pessoa será escolhida para mediar todo o bate-papo</p>
      {modo !== "compartilhado" && (
        <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-relaxed text-amber-900"><TriangleAlert size={16} className="mt-0.5 shrink-0" />Modo demonstração: as candidaturas estão armazenadas somente neste navegador e não serão compartilhadas entre diferentes dispositivos.</p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {resumo.map(([k, v], i) => (
          <div key={k} className={"rounded-2xl border border-line/70 bg-white px-4 py-3 " + (i === 0 ? "col-span-2 sm:col-span-1" : "")}>
            <p className="text-xs font-semibold text-muted">{k}</p>
            <p className="tnum font-display text-2xl font-semibold text-navy">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {FILTROS.map(([rot, s]) => (
          <button key={rot} onClick={() => setFiltro(s)} aria-pressed={filtro === s}
            className={"tnum inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition " + (filtro === s ? "border-navy bg-navy text-white" : "border-line bg-white text-navy hover:border-roxo/50")}>
            {rot}<span className={filtro === s ? "text-white/70" : "text-muted"}>{s ? cont(s) : lista.length}</span>
          </button>
        ))}
      </div>

      <div className={card + " mt-5 overflow-hidden"}>
        <div className={"hidden gap-4 border-b border-line bg-bg/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted lg:grid " + cols}>
          <span>Nome</span><span>Organização</span><span>Edição</span><span>Tema que mais mobiliza</span><span>Experiência</span><span>Envio</span><span>Status</span>
        </div>
        {carregando && !lista.length && <p className="p-6 text-muted">Carregando candidaturas…</p>}
        {erroLista && (
          <div className="flex flex-col items-start gap-3 p-6">
            <p className="text-sm text-magenta">{erroLista}</p>
            <button className={btnSec + " !py-2.5"} onClick={carregar}><RefreshCw size={16} />Tentar novamente</button>
          </div>
        )}
        {!carregando && !erroLista && !vis.length && (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Inbox size={28} className="text-muted" />
            <p className="font-semibold text-navy">{lista.length ? "Nenhuma candidatura com este status." : "Ainda não há candidaturas."}</p>
            <p className="text-sm text-muted">As candidaturas enviadas pelo formulário aparecem aqui.</p>
          </div>
        )}
        <ul>
          {vis.map((c) => (
            <li key={c.id} onClick={() => setAbertaId(c.id)} className={"grid cursor-pointer gap-1.5 border-b border-line/70 px-5 py-4 transition last:border-0 hover:bg-bg/70 lg:items-center lg:gap-4 " + cols}>
              <span className="min-w-0">
                <button onClick={(e) => { e.stopPropagation(); setAbertaId(c.id); }} className="max-w-full truncate text-left font-semibold text-navy hover:text-roxo">{c.nome}</button>
                <Selos c={c} />
              </span>
              <span className="min-w-0 truncate text-sm text-muted lg:text-ink">{c.organizacao}<span className="lg:hidden"> · {c.edicao_de_ingresso}</span></span>
              <span className="hidden text-sm lg:block">{c.edicao_de_ingresso}</span>
              <span className="min-w-0 text-sm text-ink lg:line-clamp-2">{c.tema_que_mais_mobiliza}</span>
              <span className="hidden text-sm text-muted lg:block">{c.experiencia_em_mediacao}</span>
              <span className="tnum text-xs text-muted lg:text-sm">{fmtData(c.criado_em)}</span>
              <span className="pt-1 lg:pt-0"><StatusSelect c={c} onChange={(s) => pedirStatus(c, s)} /></span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted"><Lock size={12} />Proteção por PIN provisória, adequada apenas a esta primeira versão.</p>

      {aberta && (
        <Detalhe c={aberta} onFechar={() => setAbertaId(null)} onStatus={(s) => pedirStatus(aberta, s)}
          onAvaliar={(av) => salvarAvaliacao(aberta, av)} onObservar={(t) => salvarObservacao(aberta, t)} />
      )}

      {confirma && (
        <Dialogo titulo={confirma.atual ? "Substituir a pessoa selecionada?" : "Confirmar pessoa selecionada"} onClose={() => setConfirma(null)} acoes={<>
          <button className={btnSec} onClick={() => setConfirma(null)}>Cancelar</button>
          <button className={btnPrim} autoFocus onClick={() => { const x = confirma; setConfirma(null); aplicarStatus(x.c, "Selecionada"); }}>{confirma.atual ? "Substituir seleção" : "Confirmar"}</button>
        </>}>
          {confirma.atual ? (
            <>Já existe uma pessoa selecionada para esta tarefa. Deseja substituir a seleção atual?
              <span className="mt-2 block text-sm">{confirma.atual.nome} voltará para “Pré-selecionada” e {confirma.c.nome} passará a ser a pessoa escolhida para a tarefa.</span></>
          ) : (
            <>Marcar {confirma.c.nome} como a pessoa escolhida para a tarefa de mediação? Apenas uma candidatura pode ficar com o status “Selecionada”.</>
          )}
        </Dialogo>
      )}
      <Toast texto={toast} />
    </div>
  );
}

function Detalhe({ c, onFechar, onStatus, onAvaliar, onObservar }: {
  c: Candidatura; onFechar: () => void; onStatus: (s: Status) => void; onAvaliar: (av: Avaliacoes) => Promise<void>; onObservar: (t: string) => Promise<void>;
}) {
  const [novoStatus, setNovoStatus] = useState<Status>(c.status);
  const [av, setAv] = useState<Avaliacoes>(c.avaliacoes ?? {});
  const [obs, setObs] = useState(c.observacao_interna ?? "");
  const [salvando, setSalvando] = useState<"" | "av" | "obs">("");
  useEffect(() => { setNovoStatus(c.status); }, [c.id, c.status]);
  useEffect(() => { setAv(c.avaliacoes ?? {}); setObs(c.observacao_interna ?? ""); }, [c.id, c.atualizado_em]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onFechar(); };
    window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f);
  }, [onFechar]);

  const mediaAtual = calcularMedia(av);
  const avMudou = CRITERIOS_AVALIACAO.some(({ id }) => (av[id] ?? null) !== (c.avaliacoes?.[id] ?? null));
  const obsMudou = obs.trim() !== (c.observacao_interna ?? "").trim();
  async function salvar(tipo: "av" | "obs") {
    setSalvando(tipo);
    try { if (tipo === "av") await onAvaliar(av); else await onObservar(obs); } finally { setSalvando(""); }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/30" onClick={onFechar}>
      <aside role="dialog" aria-modal="true" aria-label={"Candidatura de " + c.nome} onClick={(e) => e.stopPropagation()}
        className="drawer flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-bg" style={{ paddingTop: "env(safe-area-inset-top,0px)", paddingBottom: "env(safe-area-inset-bottom,0px)", paddingRight: "env(safe-area-inset-right,0px)" }}>
        <div className="sticky top-0 z-10 border-b border-line bg-white px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="tnum text-xs font-semibold text-muted">{c.codigo_candidatura} · enviada em {fmtData(c.criado_em)}</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-navy">{c.nome}</h2>
              <p className="text-sm text-muted">{c.cargo_ou_area} · {c.organizacao}</p>
              <Selos c={c} />
            </div>
            <button onClick={onFechar} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-bg" aria-label="Fechar"><X size={20} /></button>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <label htmlFor="status-detalhe" className="text-sm font-semibold text-navy">Status da candidatura</label>
              <select id="status-detalhe" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value as Status)} className={inputCls() + " !py-2.5"}>
                {STATUS_LISTA.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button className={btnPrim + " !py-3"} disabled={novoStatus === c.status} onClick={() => onStatus(novoStatus)}><Save size={17} />Salvar alteração</button>
          </div>
        </div>

        <div className="flex flex-col gap-4 p-5 sm:p-7">
          <section className={card + " p-5 sm:p-6"}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-semibold text-navy">Ficha de avaliação</h3>
              <p className="tnum text-sm text-muted">Média: <strong className="text-navy">{fmtMedia(mediaAtual)}</strong></p>
            </div>
            <p className="mt-1 text-sm text-muted">Notas de 1 a 5. A média é apenas um apoio à decisão do Comitê.</p>
            <div className="mt-4 grid gap-3">
              {CRITERIOS_AVALIACAO.map(({ id, label }) => (
                <div key={id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span id={"crit-" + id} className="text-[15px] text-ink">{label}</span>
                  <div role="radiogroup" aria-labelledby={"crit-" + id} className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" role="radio" aria-checked={av[id] === n} aria-label={`${label}: nota ${n}`}
                        onClick={() => setAv((a) => ({ ...a, [id]: a[id] === n ? undefined : n }))}
                        className={"tnum h-9 w-9 rounded-lg border text-sm font-semibold transition " + (av[id] === n ? "border-roxo bg-roxo text-white" : "border-line bg-white text-navy hover:border-roxo/50")}>{n}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button className={btnSec + " !py-2.5"} disabled={!avMudou || salvando === "av"} onClick={() => salvar("av")}><Save size={16} />{salvando === "av" ? "Salvando…" : "Salvar avaliação"}</button>
            </div>
          </section>

          <section className={card + " p-5 sm:p-6"}>
            <Campo id="obs" label="Observação interna" hint="Visível somente para o Comitê.">
              <Area id="obs" value={obs} onChange={setObs} max={LIMITE_OBSERVACAO} rows={4} />
            </Campo>
            <div className="mt-4 flex justify-end">
              <button className={btnSec + " !py-2.5"} disabled={!obsMudou || salvando === "obs"} onClick={() => salvar("obs")}><Save size={16} />{salvando === "obs" ? "Salvando…" : "Salvar observação"}</button>
            </div>
          </section>

          <Respostas d={paraForm(c)} />
          {c.informacao_adicional && (
            <section className={card + " p-5 sm:p-6"}>
              <h3 className="font-display text-lg font-semibold text-navy">Informação adicional</h3>
              <p className="mt-2 whitespace-pre-line text-[15px] text-ink">{c.informacao_adicional}</p>
            </section>
          )}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
