import { useEffect, useState } from "react";
import { EMPTY } from "./data";
import { enviarCandidatura } from "./lib/api";
import { gerarCodigo, store } from "./lib/utils";
import type { FormData } from "./types";
import { Home } from "./pages/Home";
import { Formulario } from "./pages/Formulario";
import { Revisao } from "./pages/Revisao";
import { Confirmacao } from "./pages/Confirmacao";
import { Painel } from "./pages/Painel";

type View = "home" | "form" | "review" | "done" | "admin";
const DRAFT = "bl-med-rascunho-v2";
type Rascunho = { data: Partial<FormData>; step: number } | null;

function carregarRascunho(): { d: FormData; step: number; existe: boolean } {
  const r = store.get<Rascunho>(DRAFT, null);
  if (!r) return { d: EMPTY, step: 0, existe: false };
  // aproveita apenas os campos atuais do formulário
  const d = { ...EMPTY } as FormData;
  (Object.keys(EMPTY) as (keyof FormData)[]).forEach((k) => {
    if (r.data && r.data[k] !== undefined) (d as unknown as Record<string, unknown>)[k] = r.data[k];
  });
  d.confirmacoes = { ...EMPTY.confirmacoes, ...(r.data?.confirmacoes ?? {}) };
  return { d, step: Math.min(Math.max(r.step || 0, 0), 4), existe: true };
}

export default function App() {
  const inicial = carregarRascunho();
  const [view, setViewState] = useState<View>(() => (location.pathname.replace(/\/$/, "") === "/comite" ? "admin" : "home"));
  const [step, setStep] = useState(inicial.step);
  const [d, setD] = useState<FormData>(inicial.d);
  const [temRascunho, setTemRascunho] = useState(inicial.existe);
  const [codigo, setCodigo] = useState("");

  function setView(v: View) {
    setViewState(v);
    const path = v === "admin" ? "/comite" : "/";
    if (location.pathname !== path) history.pushState(null, "", path);
  }
  useEffect(() => {
    const f = () => setViewState(location.pathname.replace(/\/$/, "") === "/comite" ? "admin" : "home");
    window.addEventListener("popstate", f); return () => window.removeEventListener("popstate", f);
  }, []);
  useEffect(() => { if (view === "form" || view === "review") { store.set(DRAFT, { data: d, step }); setTemRascunho(true); } }, [d, step, view]);
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setD((x) => ({ ...x, [k]: v }));

  async function enviar(spam: boolean) {
    // Honeypot preenchido: simula sucesso sem gravar nada.
    const cod = spam ? gerarCodigo() : await enviarCandidatura(d);
    store.del(DRAFT); setD(EMPTY); setStep(0); setTemRascunho(false); setCodigo(cod); setView("done");
  }

  if (view === "form") return <Formulario step={step} setStep={setStep} d={d} set={set} onHome={() => setView("home")} onReview={() => setView("review")} />;
  if (view === "review") return <Revisao d={d} onBack={() => setView("form")} onEdit={(s) => { setStep(s); setView("form"); }} onSend={enviar} />;
  if (view === "done") return <Confirmacao codigo={codigo} onHome={() => setView("home")} />;
  if (view === "admin") return <Painel onHome={() => setView("home")} />;
  return <Home temRascunho={temRascunho} onStart={() => setView("form")} onAdmin={() => setView("admin")} />;
}
