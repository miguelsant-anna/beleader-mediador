import { Fragment } from "react";
import { Pencil } from "lucide-react";
import { RESUMO } from "../data";
import { fmtValor } from "../lib/utils";
import type { FormData } from "../types";
import { card } from "./ui";

export function Respostas({ d, onEdit }: { d: FormData; onEdit?: (step: number) => void }) {
  return (
    <div className="grid gap-4">
      {RESUMO.map((sec) => (
        <section key={sec.titulo} className={card + " p-5 sm:p-6"}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg font-semibold text-navy">{sec.titulo}</h3>
            {onEdit && (
              <button onClick={() => onEdit(sec.step)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-roxo hover:bg-roxoSoft">
                <Pencil size={14} />Editar
              </button>
            )}
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(0,14rem)_1fr]">
            {sec.campos.filter(([, k]) => k !== "experienciaRelato" || d[k]).map(([label, k]) => (
              <Fragment key={k}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="-mt-2 min-w-0 whitespace-pre-line break-words text-[15px] text-ink sm:mt-0">{fmtValor(k, d[k])}</dd>
              </Fragment>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
