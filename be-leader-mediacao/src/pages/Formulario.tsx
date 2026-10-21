import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { CONFIG } from "../config";
import { ATIVIDADES, CONFIRMACOES, EXPERIENCIAS, LIMITES, NAO_PARTICIPEI, STEPS, TEMAS } from "../data";
import { maskPhone, precisaRelato, validate, type Erros } from "../lib/utils";
import type { FormData } from "../types";
import { Area, btnPrim, btnSec, Campo, card, Grupo, inputCls, Opcao, Texto } from "../components/ui";

type SetCampo = <K extends keyof FormData>(k: K, v: FormData[K]) => void;

function Etapa({ step, d, set, err }: { step: number; d: FormData; set: SetCampo; err: Erros }) {
  if (step === 0) return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2"><Campo id="nome" label="Nome completo" error={err.nome}><Texto id="nome" value={d.nome} maxLength={LIMITES.nome} onChange={(v) => set("nome", v)} error={err.nome} autoComplete="name" /></Campo></div>
      <Campo id="email" label="E-mail" error={err.email}><Texto id="email" type="email" value={d.email} maxLength={LIMITES.email} onChange={(v) => set("email", v)} error={err.email} autoComplete="email" placeholder="nome@organizacao.org.br" /></Campo>
      <Campo id="whatsapp" label="WhatsApp" error={err.whatsapp}><Texto id="whatsapp" inputMode="tel" value={d.whatsapp} onChange={(v) => set("whatsapp", maskPhone(v))} error={err.whatsapp} autoComplete="tel" placeholder="(27) 99999-0000" /></Campo>
      <Campo id="organizacao" label="Organização" error={err.organizacao}><Texto id="organizacao" value={d.organizacao} maxLength={LIMITES.texto} onChange={(v) => set("organizacao", v)} error={err.organizacao} autoComplete="organization" /></Campo>
      <Campo id="cargo" label="Cargo ou área de atuação" error={err.cargo}><Texto id="cargo" value={d.cargo} maxLength={LIMITES.texto} onChange={(v) => set("cargo", v)} error={err.cargo} /></Campo>
      <Campo id="cidade" label="Cidade" error={err.cidade}><Texto id="cidade" value={d.cidade} maxLength={LIMITES.cidade} onChange={(v) => set("cidade", v)} error={err.cidade} /></Campo>
      <Campo id="edicao" label="Edição de ingresso na Comunidade" error={err.edicao}>
        <select id="edicao" value={d.edicao} onChange={(e) => set("edicao", e.target.value)} aria-invalid={!!err.edicao} className={inputCls(err.edicao)}>
          <option value="">Selecione</option>
          {CONFIG.edicoes.map((x) => <option key={x}>{x}</option>)}
        </select>
      </Campo>
      <div className="sm:col-span-2"><Campo id="orgParceira" label="Organização parceira pela qual foi indicado" error={err.orgParceira}><Texto id="orgParceira" value={d.orgParceira} maxLength={LIMITES.texto} onChange={(v) => set("orgParceira", v)} error={err.orgParceira} /></Campo></div>
      <div className="sm:col-span-2"><Campo id="linkedin" label="LinkedIn" opcional><Texto id="linkedin" value={d.linkedin} maxLength={LIMITES.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/seu-perfil" /></Campo></div>
    </div>
  );
  if (step === 1) {
    const nenhuma = d.atividades.includes(NAO_PARTICIPEI);
    const toggle = (a: string) => set("atividades", d.atividades.includes(a) ? d.atividades.filter((x) => x !== a) : [...d.atividades, a]);
    return (
      <Grupo id="atividades" legend="De quais atividades da Comunidade Be Leader você participou nos últimos 12 meses?" hint="Marque todas as que se aplicam." error={err.atividades}>
        <div className="grid gap-2 sm:grid-cols-2">
          {ATIVIDADES.map((a) => <Opcao key={a} checked={d.atividades.includes(a)} disabled={nenhuma} onChange={() => toggle(a)}>{a}</Opcao>)}
          <Opcao checked={nenhuma} onChange={() => set("atividades", nenhuma ? [] : [NAO_PARTICIPEI])}>{NAO_PARTICIPEI}</Opcao>
        </div>
      </Grupo>
    );
  }
  if (step === 2) return (
    <div className="grid gap-7">
      <Campo id="motivacao" label="Por que você gostaria de mediar esta conversa?" error={err.motivacao}>
        <Area id="motivacao" value={d.motivacao} onChange={(v) => set("motivacao", v)} max={LIMITES.motivacao} rows={5} error={err.motivacao} />
      </Campo>
      <Grupo id="tema" legend="Entre os quatro temas que serão abordados no bate-papo, qual mais mobiliza você?" hint="Uma única pessoa será selecionada para mediar toda a conversa. Sua escolha abaixo apenas nos ajuda a conhecer melhor seus interesses e seu repertório." error={err.tema}>
        <div className="grid gap-2 sm:grid-cols-2">
          {TEMAS.map((t) => <Opcao key={t.titulo} type="radio" name="tema" checked={d.tema === t.titulo} onChange={() => set("tema", t.titulo)}>{t.titulo}</Opcao>)}
        </div>
      </Grupo>
    </div>
  );
  if (step === 3) return (
    <div className="grid gap-7">
      <Grupo id="experiencia" legend="Você já mediou painéis, rodas de conversa, entrevistas ou reuniões?" error={err.experiencia}>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXPERIENCIAS.map((x) => <Opcao key={x} type="radio" name="experiencia" checked={d.experiencia === x} onChange={() => set("experiencia", x)}>{x}</Opcao>)}
        </div>
      </Grupo>
      {precisaRelato(d) && (
        <div className="fade"><Campo id="experienciaRelato" label="Conte brevemente uma experiência de condução ou mediação." error={err.experienciaRelato}>
          <Area id="experienciaRelato" value={d.experienciaRelato} onChange={(v) => set("experienciaRelato", v)} max={LIMITES.relato} rows={3} error={err.experienciaRelato} />
        </Campo></div>
      )}
    </div>
  );
  return (
    <Grupo id="confirmacoes" legend="Antes de revisar, confirme os itens abaixo:" error={err.confirmacoes}>
      <div className="grid gap-2">
        {CONFIRMACOES.map((c) => (
          <Opcao key={c.id} checked={d.confirmacoes[c.id]} onChange={() => set("confirmacoes", { ...d.confirmacoes, [c.id]: !d.confirmacoes[c.id] })}>{c.label}</Opcao>
        ))}
      </div>
    </Grupo>
  );
}

export function Formulario({ step, setStep, d, set, onHome, onReview }: { step: number; setStep: (s: number) => void; d: FormData; set: SetCampo; onHome: () => void; onReview: () => void }) {
  const [err, setErr] = useState<Erros>({});
  const topo = useRef<HTMLDivElement>(null);
  useEffect(() => { setErr({}); }, [step]);
  function avancar() {
    const e = validate(step, d);
    setErr(e);
    if (Object.keys(e).length) {
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (el) { el.scrollIntoView({ block: "center" }); el.focus({ preventScroll: true }); }
      }, 30);
      return;
    }
    if (step < STEPS.length - 1) { setStep(step + 1); topo.current?.scrollIntoView(); } else onReview();
  }
  const setLimpo: SetCampo = (k, v) => {
    set(k, v);
    if (err[k]) setErr((x) => { const n = { ...x }; delete n[k]; return n; });
  };
  return (
    <div className="fade wrap max-w-3xl pb-16 pt-5" ref={topo}>
      <div className="flex items-center justify-between gap-4">
        <button onClick={onHome} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-roxo"><ArrowLeft size={16} />Início</button>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted"><Save size={14} className="text-roxo" />Rascunho salvo neste navegador</span>
      </div>
      <h1 className="mt-6 font-display text-3xl font-semibold text-navy sm:text-4xl">Candidatura para mediação</h1>
      <p className="mt-1 text-muted">Etapa {step + 1} de {STEPS.length} · {STEPS[step]}</p>
      <div className="mt-5 grid grid-cols-5 gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Progresso da candidatura">
        {STEPS.map((s, i) => (
          <div key={s} className="flex min-w-0 flex-col gap-2">
            <span className={"h-1.5 rounded-full transition-colors " + (i <= step ? "bg-roxo" : "bg-line")} />
            <span className={"hidden truncate text-xs font-medium sm:block " + (i === step ? "text-navy" : "text-muted")}>{s}</span>
          </div>
        ))}
      </div>
      <div key={step} className={card + " fade mt-6 p-5 sm:p-8"}>
        <Etapa step={step} d={d} set={setLimpo} err={err} />
      </div>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button className={btnSec} onClick={() => (step ? setStep(step - 1) : onHome())}><ArrowLeft size={18} />Voltar</button>
        <button className={btnPrim} onClick={avancar}>{step < STEPS.length - 1 ? "Avançar" : "Revisar respostas"}<ArrowRight size={18} /></button>
      </div>
    </div>
  );
}
