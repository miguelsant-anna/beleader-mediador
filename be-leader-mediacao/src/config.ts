/* ============ CONFIG: edite aqui as informações do Encontro ============ */
export const CONFIG = {
  data: "1º de dezembro de 2026",
  diaSemana: "terça-feira",
  horario: "13h30 às 17h",
  local: "Sede da Rede Gazeta",
  endereco: "Rua Carlos Fernando Lindenberg Filho, 90 · Monte Belo · Vitória/ES",
  mapa: "https://www.google.com/maps/search/?api=1&query=Rua%20Carlos%20Fernando%20Lindenberg%20Filho%2C%2090%2C%20Monte%20Belo%2C%20Vit%C3%B3ria%20-%20ES",

  /** Texto exibido e momento exato em que o formulário fecha (horário de Brasília). */
  prazo: "22 de novembro de 2026, às 23h59",
  prazoISO: "2026-11-22T23:59:59-03:00",
  anuncio: "25 de novembro de 2026",

  tempoPreenchimento: "5 minutos",
  anoCodigo: "2026",
  edicoes: ["1ª Edição", "2ª Edição", "3ª Edição", "4ª Edição", "5ª Edição"],

  convidados: [
    { nome: "Café Lindenberg", cargo: "Presidente da Rede Gazeta" },
    { nome: "Dudu Lindenberg", cargo: "Diretor de Novos Negócios da Rede Gazeta" },
    { nome: "Geraldo Nascimento", cargo: "Editor-chefe de A Gazeta e CBN" },
    { nome: "Mariana Lindenberg", cargo: "Gerente de Planejamento Comercial da Rede Gazeta" },
  ],

  contato: {
    nome: "Miguel Sant'Anna",
    whatsapp: "(27) 99708-1182",
    whatsappLink: "https://wa.me/5527997081182",
    email: "miguel@es-acao.org.br",
  },
};
/* O PIN do Comitê NÃO fica aqui: ele é a variável ADMIN_PIN, configurada na Netlify. */

/** Verdadeiro depois do prazo de candidaturas. */
export const candidaturasEncerradas = () => Date.now() > new Date(CONFIG.prazoISO).getTime();
