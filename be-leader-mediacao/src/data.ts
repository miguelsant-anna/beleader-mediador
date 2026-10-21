import {
  BookOpen, CalendarCheck, Cpu, Layers, ListChecks, Megaphone, Mic, PenLine, Presentation, Repeat, Timer, Users,
  type LucideIcon,
} from "lucide-react";
import { CONFIG } from "./config";
import { STATUS_LISTA, type Status } from "./shared";
import type { ConfirmacaoId, FormData } from "./types";

export const TEMAS: { titulo: string; icon: LucideIcon }[] = [
  { titulo: "Liderar transformações sem perder a identidade", icon: Repeat },
  { titulo: "Comunicação como responsabilidade da liderança", icon: Megaphone },
  { titulo: "Liderar diferentes gerações e linguagens", icon: Users },
  { titulo: "Tecnologia, inteligência artificial e capital humano", icon: Cpu },
];

export const PAPEL: [LucideIcon, string][] = [
  [BookOpen, "Estudar o briefing e o perfil dos convidados"],
  [CalendarCheck, "Participar de uma reunião preparatória"],
  [PenLine, "Colaborar com a construção das perguntas"],
  [Presentation, "Apresentar o contexto e os convidados"],
  [Layers, "Conduzir toda a conversa, passando pelos quatro temas"],
  [Timer, "Equilibrar o tempo de fala"],
  [Mic, "Incorporar perguntas da plateia"],
  [ListChecks, "Realizar uma síntese no encerramento"],
];

export const CRITERIOS_HOME = ["Capacidade de comunicação", "Escuta atenta", "Formulação de perguntas", "Engajamento com a Comunidade", "Disponibilidade para preparação"];

export const ATIVIDADES = ["Encontros da Comunidade", "Trilha de Formação", "Mentoria", "Imersão Conectando Lideranças", "Eventos do Espírito Santo em Ação", "Outra"];
export const NAO_PARTICIPEI = "Ainda não participei nesse período";
export const EXPERIENCIAS = ["Sim, com frequência", "Sim, algumas vezes", "Já conduzi conversas ou reuniões, mas não painéis", "Ainda não tive essa experiência"];

export const CONFIRMACOES: { id: ConfirmacaoId; label: string }[] = [
  { id: "disponibilidade_na_data", label: `Tenho disponibilidade na data e no horário do Encontro (${CONFIG.data}, ${CONFIG.horario}).` },
  { id: "compromisso_com_briefing", label: "Comprometo-me a estudar previamente o briefing e o perfil dos convidados." },
  { id: "autorizacao_de_contato", label: "Autorizo o contato por e-mail e WhatsApp sobre esta candidatura." },
  { id: "consentimento_de_dados", label: "Consinto com a análise dos meus dados pelo Comitê de Formação de Lideranças." },
  { id: "ciencia_sobre_escolha", label: "Estou ciente de que a candidatura não garante a escolha." },
];

export const STEPS = ["Identificação", "Participação", "Interesse", "Experiência", "Compromissos"];

export const STATUS_COR: Record<Status, string> = {
  "Recebida": "bg-slate-100 text-slate-700",
  "Em análise": "bg-roxoSoft text-roxo",
  "Pré-selecionada": "bg-indigo-50 text-navy2",
  "Selecionada": "bg-magentaSoft text-magenta",
  "Banco de oportunidades": "bg-teal-50 text-teal-800",
};
export { STATUS_LISTA };

export const FILTROS: [string, Status | null][] = [
  ["Todas", null], ["Recebidas", "Recebida"], ["Em análise", "Em análise"], ["Pré-selecionadas", "Pré-selecionada"],
  ["Selecionada", "Selecionada"], ["Banco de oportunidades", "Banco de oportunidades"],
];

export const LIMITES = { nome: 120, email: 160, texto: 160, cidade: 100, linkedin: 200, motivacao: 700, relato: 500 };

export const PRIVACIDADE = "Seus dados serão utilizados exclusivamente pelo Espírito Santo em Ação para organizar e analisar as candidaturas para a mediação do próximo Encontro da Comunidade Be Leader.";

export const EMPTY: FormData = {
  nome: "", email: "", whatsapp: "", organizacao: "", cargo: "", cidade: "", edicao: "", orgParceira: "", linkedin: "",
  atividades: [], motivacao: "", tema: "", experiencia: "", experienciaRelato: "",
  confirmacoes: { disponibilidade_na_data: false, compromisso_com_briefing: false, autorizacao_de_contato: false, consentimento_de_dados: false, ciencia_sobre_escolha: false },
};

type Campo = [string, keyof FormData];
export const RESUMO: { titulo: string; step: number; campos: Campo[] }[] = [
  { titulo: "Identificação", step: 0, campos: [["Nome completo", "nome"], ["E-mail", "email"], ["WhatsApp", "whatsapp"], ["Organização", "organizacao"], ["Cargo ou área de atuação", "cargo"], ["Cidade", "cidade"], ["Edição de ingresso", "edicao"], ["Organização parceira pela qual foi indicado", "orgParceira"], ["LinkedIn", "linkedin"]] },
  { titulo: "Participação na Comunidade", step: 1, campos: [["Atividades nos últimos 12 meses", "atividades"]] },
  { titulo: "Interesse", step: 2, campos: [["Por que gostaria de mediar esta conversa", "motivacao"], ["Tema que mais mobiliza", "tema"]] },
  { titulo: "Experiência em mediação", step: 3, campos: [["Experiência em mediação", "experiencia"], ["Experiência de condução ou mediação", "experienciaRelato"]] },
  { titulo: "Disponibilidade e compromissos", step: 4, campos: [["Confirmações", "confirmacoes"]] },
];
