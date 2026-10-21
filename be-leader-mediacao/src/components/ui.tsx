import { useEffect, type InputHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, CircleAlert, CircleCheck, ShieldCheck } from "lucide-react";
import { PRIVACIDADE, STATUS_COR } from "../data";
import type { Status } from "../types";

export const btnPrim = "inline-flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 font-semibold text-white shadow-card transition hover:bg-navy2 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50";
export const btnSec = "inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-3.5 font-semibold text-navy transition hover:border-roxo/50 hover:text-roxo disabled:cursor-not-allowed disabled:opacity-50";
export const card = "rounded-3xl border border-line/70 bg-white shadow-card";
export const inputCls = (err?: string | boolean) =>
  "w-full rounded-xl border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-muted/60 outline-none transition focus:border-roxo focus:ring-4 focus:ring-roxo/15 " +
  (err ? "border-magenta" : "border-line");

export function Erro({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="flex items-center gap-1.5 text-sm font-medium text-magenta"><CircleAlert size={15} className="shrink-0" />{msg}</p>;
}

export function Campo({ id, label, error, opcional, children, hint }: { id: string; label: string; error?: string; opcional?: boolean; children: ReactNode; hint?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}{opcional && <span className="font-normal text-muted"> (opcional)</span>}
      </label>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      {children}
      <Erro id={id + "-err"} msg={error} />
    </div>
  );
}

type TextoProps = { id: string; value: string; onChange: (v: string) => void; error?: string } & Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">;
export function Texto({ id, value, onChange, error, ...rest }: TextoProps) {
  return <input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? id + "-err" : undefined} className={inputCls(error)} {...rest} />;
}

export function Area({ id, value, onChange, max, error, rows = 4 }: { id: string; value: string; onChange: (v: string) => void; max: number; error?: string; rows?: number }) {
  return (
    <div className="relative">
      <textarea id={id} value={value} maxLength={max} rows={rows} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error}
        aria-describedby={error ? id + "-err" : undefined} className={inputCls(error) + " resize-y pb-8 leading-relaxed"} />
      <span className={"tnum pointer-events-none absolute bottom-2.5 right-3 text-xs " + (value.length >= max ? "text-magenta" : "text-muted")}>{value.length}/{max}</span>
    </div>
  );
}

export function Grupo({ legend, error, hint, children, id }: { legend: string; error?: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <fieldset id={id} className="flex min-w-0 flex-col gap-2" aria-invalid={!!error} tabIndex={error ? -1 : undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-navy">{legend}</legend>
      {hint && <p className="-mt-1 mb-1 text-sm text-muted">{hint}</p>}
      {children}
      <Erro id={id + "-err"} msg={error} />
    </fieldset>
  );
}

export function Opcao({ type = "checkbox", name, checked, onChange, disabled, children }: { type?: "checkbox" | "radio"; name?: string; checked: boolean; onChange: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-roxo/20 ${checked ? "border-roxo bg-roxoSoft" : "border-line bg-white hover:border-roxo/40"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border ${type === "radio" ? "rounded-full" : "rounded-md"} ${checked ? "border-roxo bg-roxo text-white" : "border-slate-300 bg-white"}`}>
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className="text-[15px] leading-snug text-ink">{children}</span>
    </label>
  );
}

export function StatusPill({ s }: { s: Status }) {
  return <span className={"inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold " + (STATUS_COR[s] ?? STATUS_COR["Recebida"])}>{s}</span>;
}

export function Selo({ children, tom = "slate" }: { children: ReactNode; tom?: "slate" | "amber" }) {
  const cls = tom === "amber" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-600";
  return <span className={"rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide " + cls}>{children}</span>;
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy font-display text-[15px] font-bold text-white">BL<span className="text-magenta">.</span></span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold text-navy">Comunidade Be Leader</span>
        <span className="block text-xs text-muted">Espírito Santo em Ação</span>
      </span>
    </div>
  );
}

export function Privacidade({ className = "" }: { className?: string }) {
  return <p className={"flex items-start gap-2 text-sm leading-relaxed text-muted " + className}><ShieldCheck size={17} className="mt-0.5 shrink-0 text-roxo" />{PRIVACIDADE}</p>;
}

export function Dialogo({ titulo, children, onClose, acoes }: { titulo: string; children: ReactNode; onClose: () => void; acoes: ReactNode }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[60] grid place-items-center bg-navy/40 p-4" onClick={onClose}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-titulo" onClick={(e) => e.stopPropagation()} className={card + " fade w-full max-w-md p-6"}>
        <h2 id="dlg-titulo" className="font-display text-xl font-semibold text-navy">{titulo}</h2>
        <div className="mt-2 leading-relaxed text-muted">{children}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{acoes}</div>
      </div>
    </div>,
    document.body,
  );
}

export function Toast({ texto }: { texto: string }) {
  return createPortal(
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
      {texto && <span className="fade inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-card"><CircleCheck size={16} className="shrink-0" />{texto}</span>}
    </div>,
    document.body,
  );
}
