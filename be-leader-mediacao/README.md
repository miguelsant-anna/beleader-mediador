# Mediação Be Leader

Aplicação para receber candidaturas de integrantes da Comunidade Be Leader interessados em mediar o bate-papo do próximo Encontro da Comunidade, na Rede Gazeta.

- **Área pública:** aberta a qualquer pessoa com o link, sem login, sem conta e sem PIN.
- **Área do Comitê:** acessada pelo link discreto "Área do Comitê", no rodapé (ou pelo endereço `/comite`), com PIN.

## Arquitetura

```
Navegador (React + TypeScript + Tailwind, hospedado na Netlify)
 ├─ Rascunho do formulário ─────────────► localStorage (só no navegador da pessoa)
 ├─ Enviar candidatura ─── chave anon ──► Supabase · tabela candidaturas (somente INSERT)
 ├─ "Este e-mail já existe?" ─ chave anon ► Supabase · função email_ja_cadastrado (responde só sim/não)
 └─ Área do Comitê ── PIN ──► Netlify Function /.netlify/functions/comite
                                └─ service_role (fica só no servidor) ─► Supabase (ler e atualizar)
```

| Parte | O que faz | Onde fica |
|---|---|---|
| `src/` | Interface (páginas, formulário, painel) | Navegador |
| `src/config.ts` | Data, horário, prazo, local, convidados e edições | Edite aqui |
| `netlify/functions/comite.ts` | Confere o PIN, lista e atualiza candidaturas | Servidor da Netlify |
| `supabase/schema.sql` | Tabela, índices, gatilhos, funções e regras de acesso | Supabase |
| `supabase/seed.sql` | 3 candidaturas fictícias, **só para testes** | Supabase (opcional) |
| `TESTES.md` | Roteiro de testes antes de compartilhar | — |

## 1. Supabase

1. **Crie uma conta gratuita:** acesse [supabase.com](https://supabase.com), clique em **Start your project** e entre com GitHub ou e-mail.
2. **Crie o projeto:** clique em **New project** e preencha:
   - **Name:** `be-leader-mediacao`;
   - **Database Password:** uma senha forte (guarde-a);
   - **Region:** **South America (São Paulo)**.

   Depois clique em **Create new project** e aguarde cerca de 2 minutos.
3. **Execute o SQL:** no menu lateral, abra **SQL Editor** › **New query**. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. A mensagem esperada é "Success. No rows returned".
   - (Opcional, só em um projeto de testes) Execute também `supabase/seed.sql` para ter 3 candidaturas fictícias.
4. **Copie a URL do projeto:** **Project Settings** (engrenagem) › **API** (ou **Data API**) › **Project URL**. Exemplo: `https://abcdxyz.supabase.co`.
5. **Copie a chave anon:** na mesma tela, em **Project API keys**, copie a chave **anon / public**.
6. **Localize a service_role key:** na mesma tela, a chave **service_role / secret** fica oculta. Clique em **Reveal** para copiar.
7. **Por que a service_role nunca pode ir para o navegador:** essa chave ignora todas as regras de segurança (RLS). Com ela, qualquer pessoa leria, alteraria e apagaria todas as candidaturas. Tudo o que vai para o navegador pode ser visto por quem abre o site. Por isso ela fica só nas variáveis de ambiente da Netlify e é usada apenas pela função do Comitê.

> Em projetos novos, o Supabase pode mostrar as chaves como **Publishable key** (equivale à anon) e **Secret key** (equivale à service_role). As duas funcionam neste projeto.

### O que o SQL garante

- A área pública (chave anon) só consegue **inserir**, e apenas as colunas do formulário. Ela não lê, não altera e não exclui candidaturas.
- Status, observação, avaliações, média, duplicidade e datas são definidos pelo banco. Quem envia não consegue alterá-los.
- A verificação de e-mail repetido responde apenas "sim" ou "não", sem devolver dados.
- O próprio banco impede duas candidaturas com status **Selecionada**. Ao escolher uma nova pessoa, a anterior volta para **Pré-selecionada** na mesma operação.
- `atualizado_em` muda automaticamente a cada alteração.

## 2. GitHub

1. Crie uma conta em [github.com](https://github.com), se ainda não tiver.
2. Clique em **New repository**, use o nome `be-leader-mediacao`, deixe o repositório como **Private** e clique em **Create repository**.
3. Envie os arquivos. Escolha uma das opções:
   - **Sem terminal:** na página do repositório, clique em **uploading an existing file** e arraste o conteúdo da pasta descompactada (não a pasta em si). Clique em **Commit changes**. Não envie o arquivo `.env`.
   - **Com terminal:**
     ```bash
     cd be-leader-mediacao
     git init && git add . && git commit -m "Primeira versão"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/be-leader-mediacao.git
     git push -u origin main
     ```

## 3. Netlify

1. Crie uma conta gratuita em [netlify.com](https://www.netlify.com) entrando com o GitHub.
2. Clique em **Add new site** › **Import an existing project** › **GitHub** e escolha `be-leader-mediacao`.
3. Confira as configurações (já vêm do `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Functions directory:** `netlify/functions`
4. Antes de publicar, clique em **Add environment variables** (ou, depois, em **Site configuration** › **Environment variables**) e cadastre as 4 variáveis abaixo.
5. Clique em **Deploy**. Ao final, a Netlify mostra o endereço do site, por exemplo `https://be-leader-mediacao.netlify.app`. Para mudar o nome, use **Site configuration** › **Change site name**.
6. **Sempre que mudar uma variável,** vá em **Deploys** › **Trigger deploy** › **Deploy site** para aplicar.

### Variáveis de ambiente

| Variável | Valor | Vai para o navegador? |
|---|---|---|
| `VITE_SUPABASE_URL` | Project URL do Supabase | Sim (é pública) |
| `VITE_SUPABASE_ANON_KEY` | Chave anon / publishable | Sim (é pública e só permite inserir) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service_role / secret | **Não.** Só na função. Marque como **Secret** na Netlify. |
| `ADMIN_PIN` | `2026` | **Não.** Só na função. |

Variáveis que começam com `VITE_` entram no código do site. Por isso a service_role e o PIN **não** podem ter esse prefixo.

## 4. Desenvolvimento local (opcional)

```bash
npm install
npm run dev        # http://localhost:5173
```

- **Sem arquivo `.env`:** o app abre em **Modo demonstração**, com 3 candidaturas fictícias salvas no navegador. O PIN de teste é `2026`. Esse modo existe só em desenvolvimento e não entra no site publicado.
- **Com Supabase:** copie `.env.example` para `.env`, preencha as variáveis e rode `npx netlify-cli dev`. Assim a função do Comitê também funciona localmente.

## 5. Editar informações do Encontro

Abra `src/config.ts` e altere data, horário, prazo, local, convidados e edições. Faça o commit no GitHub e a Netlify publica sozinha em cerca de 1 minuto.

## 6. Ajustes desta versão

- **Perguntas removidas** do formulário, do banco, dos tipos, das validações, da revisão e do painel:
  - contribuição com a Comunidade;
  - por que o tema mobiliza;
  - pergunta aos convidados;
  - estilo de condução;
  - situação de controle do tempo;
  - opção "Grupos de trabalho ou ações voluntárias";
  - confirmação de reunião preparatória.

  A reunião preparatória continua citada na descrição da tarefa.
- **Nomes de colunas ajustados:**

  | Nome sugerido | Nome adotado | Motivo |
  |---|---|---|
  | `iniciativa_de_ingresso` | `organizacao_parceira` | É o campo "Organização parceira pela qual foi indicado" |
  | `ano_de_ingresso` | `edicao_de_ingresso` | A edição (1ª a 5ª) já indica o período de ingresso |

- **`informacao_adicional`:** existe no banco como coluna reservada, sem campo no formulário. O painel só a exibe se for preenchida.
- **Ficha de avaliação:** 6 critérios de 1 a 5:
  - clareza da motivação;
  - aderência à tarefa;
  - experiência de condução;
  - engajamento;
  - disponibilidade e compromisso;
  - avaliação geral.

  A média considera só os critérios preenchidos.

## 7. Segurança e limitações aceitas nesta primeira versão

- **PIN compartilhado:** o PIN `2026` é conferido na função da Netlify e não aparece no código do site. Mesmo assim:
  - é um único PIN para todo o Comitê, sem registro de quem alterou o quê;
  - um PIN de 4 dígitos pode ser descoberto por tentativas. A função atrasa cada tentativa errada, mas não bloqueia.

  Troque por um PIN mais longo em `ADMIN_PIN` se quiser mais proteção.
- **Sessão do Comitê:** o PIN fica guardado na aba aberta (sessionStorage) até ela ser fechada ou até clicar em **Sair**.
- **Verificação de e-mail:** a área pública consegue perguntar se um e-mail específico já se candidatou (resposta sim/não). Ela não consegue listar e-mails.
- **Spam:** a proteção é um campo-armadilha invisível, sem CAPTCHA. Ataques automatizados direcionados ainda podem enviar candidaturas.
- **Escala:** o painel carrega até 1.000 candidaturas de uma vez, o que é suficiente para o uso previsto.
- **Plano gratuito do Supabase:** projetos sem uso por 7 dias são pausados. Reative em **Project** › **Restore** antes do período de candidaturas.

### Caminho para autenticação real (próxima versão)

1. Ative **Supabase Auth** com **Magic Link** (link enviado por e-mail) ou com o provedor **Azure (Microsoft Entra ID)**.
2. Crie uma tabela `comite` com os e-mails autorizados.
3. Na função `comite.ts`, troque a conferência do PIN pela validação do token da pessoa logada e por uma consulta à tabela `comite`.
4. Registre quem fez cada alteração (coluna `alterado_por`).
