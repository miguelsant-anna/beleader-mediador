import { CalendarX, House } from "lucide-react";
import { CONFIG } from "../config";
import { btnSec, Contato } from "../components/ui";

export function Encerrado({ onHome }: { onHome: () => void }) {
  return (
    <div className="fade wrap max-w-xl py-16 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-roxoSoft text-roxo"><CalendarX size={30} /></span>
      <h1 className="mt-6 font-display text-4xl font-semibold text-navy">Candidaturas encerradas</h1>
      <p className="mt-3 text-lg leading-relaxed text-muted">O prazo para se candidatar terminou em {CONFIG.prazo}. A pessoa escolhida para a tarefa será anunciada em {CONFIG.anuncio}.</p>
      <Contato className="mt-8 items-center text-center [&>div]:justify-center" />
      <button className={btnSec + " mt-8"} onClick={onHome}><House size={17} />Voltar à página inicial</button>
    </div>
  );
}
