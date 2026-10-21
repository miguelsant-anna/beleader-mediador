import { ArrowRight, CalendarDays, Check, Clock, Hourglass, Lock, MapPin, Mic, Quote, Sparkles, Timer, UserRound } from "lucide-react";
import { CONFIG } from "../config";
import { CRITERIOS_HOME, PAPEL, TEMAS } from "../data";
import { btnPrim, btnSec, card, Logo, Privacidade } from "../components/ui";

export function Home({ onStart, temRascunho, onAdmin }: { onStart: () => void; temRascunho: boolean; onAdmin: () => void }) {
  const info = [
    [MapPin, "Local", CONFIG.local], [CalendarDays, "Data", CONFIG.data], [Clock, "Horário", CONFIG.horario],
    [Hourglass, "Candidaturas até", CONFIG.prazo], [Timer, "Preenchimento", `cerca de ${CONFIG.tempoPreenchimento}`],
  ] as const;
  const cta = temRascunho ? "Continuar minha candidatura" : "Quero me candidatar";
  return (
    <div className="fade">
      <header className="wrap flex items-center justify-between gap-4 py-5">
        <Logo />
        <span className="hidden items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-navy sm:inline-flex">
          <Lock size={13} className="text-magenta" /> Exclusivo para integrantes da Comunidade
        </span>
      </header>

      <section className="wrap grid items-start gap-10 pb-16 pt-6 lg:grid-cols-[1.15fr_.85fr] lg:pt-12">
        <div className="flex min-w-0 flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-roxoSoft px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-roxo">
            <Mic size={14} /> Mediação · Encontro da Comunidade
          </span>
          <h1 className="font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight text-navy sm:text-6xl lg:text-[4.2rem]">
            Você pode <span className="relative whitespace-nowrap text-roxo">conduzir<span className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-magenta/80" /></span> essa conversa.
          </h1>
          <p className="max-w-[34rem] text-lg leading-relaxed text-muted">
            A Comunidade Be Leader procura uma de suas lideranças para mediar o bate-papo do próximo Encontro, na Rede Gazeta.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className={btnPrim} onClick={onStart}>{cta}<ArrowRight size={18} /></button>
            <button className={btnSec} onClick={() => document.getElementById("tarefa")?.scrollIntoView()}>Conhecer a tarefa</button>
          </div>
          <p className="flex items-center gap-2 text-sm text-muted sm:hidden"><Lock size={14} className="text-magenta" />Exclusivo para integrantes da Comunidade</p>
        </div>

        <aside className={card + " min-w-0 p-6 sm:p-8"}>
          <p className="text-xs font-semibold uppercase tracking-wider text-magenta">Tema do Encontro</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight text-navy">Passado, presente e futuro da comunicação</h2>
          <p className="mt-2 leading-relaxed text-muted">Transformações e aprendizados de liderança a partir da trajetória da Rede Gazeta</p>
          <dl className="mt-6 grid gap-3 border-t border-line pt-5">
            {info.map(([Ic, k, v]) => (
              <div key={k} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-bg text-roxo"><Ic size={17} /></span>
                <div className="min-w-0"><dt className="text-xs text-muted">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      <section className="border-y border-line/70 bg-white">
        <div className="wrap grid gap-12 py-16 lg:grid-cols-[.8fr_1.2fr]">
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="font-display text-3xl font-semibold text-navy">Quem estará na conversa</h2>
            <div className="grid gap-3">
              {CONFIG.convidados.map((c, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-line p-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-roxoSoft text-roxo"><UserRound size={22} /></span>
                  <div><p className="font-semibold text-navy">{c.nome}</p><p className="text-sm text-muted">{c.cargo}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <h2 className="font-display text-3xl font-semibold text-navy">Temas orientadores</h2>
            <p className="-mt-2 text-sm text-muted">Os quatro temas integram uma única conversa, conduzida por uma única pessoa mediadora.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {TEMAS.map((t, i) => (
                <div key={t.titulo} className="flex flex-col gap-3 rounded-2xl bg-bg p-5">
                  <div className="flex items-center justify-between text-roxo"><t.icon size={22} /><span className="tnum font-display text-sm font-semibold text-muted">Tema {i + 1}</span></div>
                  <p className="font-semibold leading-snug text-navy">{t.titulo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="tarefa" className="wrap scroll-mt-4 py-16">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-magenta">A tarefa</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-navy sm:text-4xl">O papel da pessoa mediadora</h2>
          <p className="mt-3 text-lg leading-relaxed text-muted">Uma contribuição com o Encontro e com a Comunidade. Uma única pessoa será escolhida para a tarefa de mediação e vai conduzir todo o bate-papo. Ela vai:</p>
        </div>
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAPEL.map(([Ic, t]) => (
            <li key={t} className={card + " flex flex-col gap-3 p-5"}>
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-roxoSoft text-roxo"><Ic size={19} /></span>
              <span className="font-medium leading-snug text-navy">{t}</span>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-start gap-4 rounded-2xl border border-magenta/25 bg-magentaSoft p-5 sm:p-6">
          <Sparkles size={22} className="mt-0.5 shrink-0 text-magenta" />
          <p className="leading-relaxed text-navy"><strong>Você não precisa ser jornalista nem ter experiência profissional como apresentador.</strong> Experiência em mediação é bem-vinda, mas não obrigatória.</p>
        </div>
      </section>

      <section className="wrap pb-16">
        <div className="grid gap-8 rounded-3xl bg-navy p-7 text-white sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div className="flex min-w-0 flex-col gap-5">
            <Quote size={30} className="text-magenta" />
            <p className="font-display text-2xl font-medium leading-snug sm:text-[1.75rem]">Não buscamos alguém que tenha todas as respostas. Buscamos uma pessoa capaz de fazer boas perguntas, ouvir com atenção e ajudar a conversa a avançar.</p>
            <button className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-navy transition hover:bg-roxoSoft" onClick={onStart}>
              {cta}<ArrowRight size={18} />
            </button>
          </div>
          <div className="min-w-0 rounded-2xl bg-white/[.07] p-6">
            <p className="text-sm font-semibold text-white/80">O Comitê de Formação de Lideranças buscará o perfil mais aderente à tarefa considerando:</p>
            <ul className="mt-4 grid gap-2.5">
              {CRITERIOS_HOME.map((c) => <li key={c} className="flex items-center gap-2.5"><Check size={16} className="shrink-0 text-magenta" strokeWidth={3} />{c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t border-line/70 bg-white">
        <div className="wrap flex flex-col gap-5 py-8 sm:flex-row sm:items-end sm:justify-between">
          <Privacidade className="max-w-2xl" />
          <button onClick={onAdmin} className="inline-flex w-fit items-center gap-1.5 text-xs text-muted/80 hover:text-roxo"><Lock size={12} />Área do Comitê</button>
        </div>
      </footer>
    </div>
  );
}
