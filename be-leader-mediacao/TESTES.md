# Roteiro de testes antes de compartilhar

Use o endereço publicado na Netlify. Faça os testes em um projeto Supabase com `seed.sql` (dados fictícios) ou envie candidaturas de teste e apague-as no final.

Marque cada item:

## A. Candidatura anônima

1. [ ] Abra o site em uma **janela anônima** (Chrome: Ctrl+Shift+N). Ele abre sem pedir login, conta ou PIN.
2. [ ] Clique em **Conhecer a tarefa**. A página rola até "A tarefa" e mostra os 3 convidados, os 4 temas e a observação "Os quatro temas integram uma única conversa…".
3. [ ] Clique em **Quero me candidatar** e depois em **Avançar** sem preencher nada. Os campos obrigatórios ficam destacados com mensagem.
4. [ ] Digite um e-mail inválido (ex.: `maria@`) e um WhatsApp curto. As mensagens de correção aparecem.
5. [ ] Preencha a etapa 1 com dados de teste. Use um e-mail novo, ex.: `teste1@exemplo.invalid`.
6. [ ] Conclua as etapas 2 a 5. Confira que:
   - a etapa 2 tem só as atividades, sem "Grupos de trabalho";
   - a etapa 3 tem a motivação e o tema, com o texto de apoio;
   - a etapa 4 tem a experiência, e o relato só aparece nas três primeiras opções;
   - a etapa 5 tem 5 confirmações.

## B. Rascunho

7. [ ] Na etapa 3, **recarregue a página** (F5). O botão da página inicial muda para **Continuar minha candidatura** e volta à mesma etapa com as respostas mantidas.

## C. Envio e confirmação

8. [ ] Em **Revise sua candidatura**, clique em **Editar** de uma seção, altere algo e volte.
9. [ ] Clique em **Enviar minha candidatura** duas vezes seguidas, rapidamente. Só uma candidatura deve ser criada (confira no item 13).
10. [ ] A tela mostra **Candidatura recebida!** e um código no formato `BL-2026-XXXX`. **Copiar código** funciona.
11. [ ] No Supabase, abra **Table Editor › candidaturas**. A nova linha aparece com status **Recebida**.

## D. Área do Comitê

12. [ ] Em outra janela (ou outro dispositivo), clique em **Área do Comitê** no rodapé. Um PIN errado mostra "PIN incorreto", e `2026` dá acesso.
13. [ ] Confira que:
    - o selo **Modo compartilhado** aparece;
    - a candidatura do item 10 está na lista;
    - o resumo mostra o total certo.
14. [ ] Mude o status pela lista (ex.: **Em análise**). Aparece **Status atualizado com sucesso.**
15. [ ] Abra a candidatura e:
    - em **Status da candidatura**, escolha outro status e clique em **Salvar alteração**;
    - dê notas na **Ficha de avaliação** e confira se a média muda;
    - clique em **Salvar avaliação**;
    - escreva uma **Observação interna** e clique em **Salvar observação**.
16. [ ] **Recarregue a página.** Status, notas, média e observação continuam salvos. Abra o painel em outro dispositivo e confira os mesmos dados.
17. [ ] Use os filtros (**Recebidas**, **Em análise**, **Pré-selecionadas**, **Selecionada**, **Banco de oportunidades**) e confira as contagens.

## E. Possível duplicidade

18. [ ] Na janela anônima, envie outra candidatura com o **mesmo e-mail** do item 5. Aparece "Já encontramos uma candidatura associada a este e-mail…" com os botões:
    - **Revisar meu e-mail**: volta para a etapa 1 com o campo de e-mail selecionado;
    - **Continuar mesmo assim**: envia a candidatura.

    Clique em **Continuar mesmo assim**.
19. [ ] A tela de confirmação **não** menciona duplicidade.
20. [ ] No painel, a nova candidatura mostra o selo **Possível duplicidade**.

## F. Pessoa selecionada (uma única)

21. [ ] Marque uma candidatura como **Selecionada** e confirme.
22. [ ] Marque uma segunda candidatura como **Selecionada**. Aparece "Já existe uma pessoa selecionada para esta tarefa. Deseja substituir a seleção atual?". Confirme.
23. [ ] A anterior volta para **Pré-selecionada**, a nova fica **Selecionada**, e o resumo mostra **Selecionada: 1**. Recarregue e confira.

## G. Segurança

24. [ ] Na janela anônima, abra `https://SEU-PROJETO.supabase.co/rest/v1/candidaturas?select=*&apikey=SUA_CHAVE_ANON`. O resultado deve ser um **erro de permissão** (`permission denied`), nunca dados.
25. [ ] No site publicado, abra as ferramentas do navegador (F12) › **Sources** e procure nos arquivos `.js` por `service_role` e `ADMIN_PIN`. Nenhum dos dois deve aparecer.

## H. Celular

26. [ ] Repita os itens 1 a 10 no celular. Confira que nada fica cortado, que não há rolagem para os lados e que os botões são fáceis de tocar.
27. [ ] Abra o painel no celular e confira a lista, a ficha de avaliação e a troca de status.

## Limpeza

28. [ ] Apague as candidaturas de teste no Supabase (**Table Editor**: selecione as linhas › **Delete**, ou rode `delete from public.candidaturas where email like '%@exemplo.invalid';`).
