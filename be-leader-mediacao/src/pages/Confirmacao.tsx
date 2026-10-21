import { useRef, useState } from "react";
import { Check, CircleCheck, Copy, House } from "lucide-react";
import { modo } from "../lib/api";
import { btnSec, card } from "../components/ui";

export function Confirmacao({ codigo, onHome }: { codigo: string; onHome: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const codRef = useRef<HTMLSpanElement>(null);
  function copiar() {
    navigator.clipboard?.writeText(codigo).then(() => setCopiado(true)).catch(() => {
      if (!codRef.current) return;
      const r = document.createRange(); r.selectNodeContents(codRef.current);
      const s = getSelection(); s?.removeAllRanges(); s?.addRange(r);
    });
  }
  return (
    <div className="fade wrap max-w-xl py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-roxoSoft text-roxo"><CircleCheck size={32} /></span>
      <h1 className="mt-6 font-display text-4xl font-semibold text-navy">Candidatura recebida!</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">Obrigado por se colocar à disposição para conduzir essa conversa. Sua candidatura será analisada pelo Comitê de Formação de Lideranças.</p>
      <p className="mt-6 rounded-2xl bg-magentaSoft px-5 py-4 font-semibold text-navy">Sua disponibilidade para contribuir já fortalece a Comunidade.</p>
      <div className={card + " mt-6 flex flex-col items-center gap-2 p-6"}>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Código da candidatura</span>
        <span ref={codRef} className="tnum select-all font-display text-3xl font-bold tracking-wide text-navy">{codigo}</span>
        <button onClick={copiar} className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-roxo">{copiado ? <Check size={15} /> : <Copy size={15} />}{copiado ? "Copiado" : "Copiar código"}</button>
      </div>
      {modo === "demonstracao" && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Modo demonstração: esta candidatura ficou salva somente neste navegador.</p>}
      <button className={btnSec + " mt-8"} onClick={onHome}><House size={17} />Voltar à página inicial</button>
    </div>
  );
}
