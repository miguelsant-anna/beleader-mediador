import { useRef, useState } from "react";
import { ArrowLeft, CircleAlert, Info, Send } from "lucide-react";
import { emailJaCadastrado, modo } from "../lib/api";
import type { FormData } from "../types";
import { Respostas } from "../components/Respostas";
import { btnPrim, btnSec, Dialogo, Privacidade } from "../components/ui";

export function Revisao({ d, onEdit, onBack, onSend }: { d: FormData; onEdit: (s: number) => void; onBack: () => void; onSend: (spam: boolean) => Promise<void> }) {
  const [enviando, setEnviando] = useState(false);
  const [duplicado, setDuplicado] = useState(false);
  const [falha, setFalha] = useState("");
  const travado = useRef(false); // evita duplo clique
  const honeypot = useRef<HTMLInputElement>(null);

  async function concluir() {
    try { await onSend(!!honeypot.current?.value); }
    catch { setFalha("Não foi possível enviar agora. Suas respostas continuam salvas neste navegador. Tente novamente em alguns minutos ou fale com a equipe Be Leader."); travado.current = false; setEnviando(false); }
  }
  async function enviar() {
    if (travado.current) return;
    travado.current = true; setEnviando(true); setFalha("");
    if (await emailJaCadastrado(d.email)) { setDuplicado(true); setEnviando(false); travado.current = false; return; }
    await concluir();
  }
  async function continuar() {
    if (travado.current) return;
    setDuplicado(false); travado.current = true; setEnviando(true);
    await concluir();
  }
  function revisarEmail() {
    setDuplicado(false); onEdit(0);
    setTimeout(() => { const el = document.getElementById("email") as HTMLInputElement | null; if (el) { el.focus(); el.select(); } }, 120);
  }

  return (
    <div className="fade wrap max-w-3xl pb-16 pt-5">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-roxo"><ArrowLeft size={16} />Voltar ao formulário</button>
      <h1 className="mt-6 font-display text-3xl font-semibold text-navy sm:text-4xl">Revise sua candidatura</h1>
      <p className="mt-1 text-muted">Confira as respostas. Você pode editar qualquer etapa antes de enviar.</p>
      <div className="mt-6"><Respostas d={d} onEdit={onEdit} /></div>
      {modo === "demonstracao" && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"><Info size={16} className="mt-0.5 shrink-0" />Modo demonstração: esta candidatura será salva somente neste navegador e não chegará à equipe Be Leader.</p>
      )}
      {modo === "nao-configurado" && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900"><Info size={16} className="mt-0.5 shrink-0" />O envio de candidaturas ainda não foi configurado. Fale com a equipe Be Leader.</p>
      )}
      <Privacidade className="mt-6" />
      {/* Campo-armadilha para robôs: invisível para pessoas e ignorado por leitores de tela. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Não preencha este campo</label>
        <input ref={honeypot} id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {falha && <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl border border-magenta/30 bg-magentaSoft px-4 py-3 text-sm leading-relaxed text-navy"><CircleAlert size={16} className="mt-0.5 shrink-0 text-magenta" />{falha}</p>}
      <div className="mt-6 flex justify-end">
        <button className={btnPrim + " w-full sm:w-auto"} onClick={enviar} disabled={enviando || modo === "nao-configurado"}>
          {enviando ? "Enviando…" : "Enviar minha candidatura"}<Send size={17} />
        </button>
      </div>
      {duplicado && (
        <Dialogo titulo="Candidatura já registrada" onClose={() => setDuplicado(false)} acoes={<>
          <button className={btnSec} onClick={continuar}>Continuar mesmo assim</button>
          <button className={btnPrim} autoFocus onClick={revisarEmail}>Revisar meu e-mail</button>
        </>}>
          Já encontramos uma candidatura associada a este e-mail. Se você deseja corrigir ou atualizar alguma informação, entre em contato com a equipe Be Leader.
        </Dialogo>
      )}
    </div>
  );
}
