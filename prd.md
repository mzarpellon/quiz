# PRD — Quiz Claude Code (Verdadeiro ou Falso)

## 1. Visão Geral

Aplicação web de quiz no formato **Verdadeiro ou Falso** sobre **Claude Code** (CLI, Claude Agent SDK e conceitos relacionados da Anthropic). O projeto é uma peça de **portfólio pessoal**, demonstrando domínio de front-end moderno (Next.js/TypeScript/Tailwind) e integração com backend-as-a-service (Supabase: Auth + Postgres).

As perguntas variam de conceitos de **negócio** (o que é, para que serve, benefícios) até tópicos **técnicos avançados** (subagentes, Skills, Hooks, MCP, SDK). O usuário joga uma partida com um subconjunto sorteado de perguntas, recebe explicações após cada resposta e um resultado final. Jogadores autenticados têm histórico pessoal salvo; um administrador gerencia o banco de perguntas por um painel, sem precisar de redeploy.

## 2. Objetivos

- **Negócio:** servir como projeto de portfólio que demonstre capacidade de entregar um produto completo (front-end, auth, banco de dados, design) e conhecimento aplicado sobre Claude Code.
- **Produto:** oferecer uma experiência de quiz leve, rápida e visualmente alinhada à identidade da Anthropic, que educe o jogador sobre Claude Code através de perguntas e explicações.
- **Técnico:** manter uma arquitetura simples de operar (poucas peças móveis), com conteúdo (perguntas) editável sem precisar mexer em código/deploy.

### Fora de escopo (MVP)

Registrar aqui evita ambiguidade durante a implementação — os itens abaixo são explicitamente **V2/futuro**:

- Leaderboard/ranking público entre jogadores.
- Timer/cronômetro por pergunta.
- Compartilhamento social do resultado (imagem/link).
- Suporte multi-idioma (i18n) — MVP é 100% PT-BR.
- Modo adaptativo de dificuldade.
- Categoria "SDK e integrações" (cotada no brainstorm, mas não selecionada para o MVP).

## 3. Público-alvo / Personas

- **Jogador casual:** alguém curioso sobre Claude Code (dev, analista de dados, gestor) que quer testar/ampliar conhecimento de forma rápida e gamificada.
- **Jogador cadastrado:** mesmo perfil acima, mas que cria conta para acompanhar sua evolução (histórico de partidas/scores).
- **Admin (o autor do projeto):** único usuário com permissão para criar, editar e remover perguntas via painel interno.

## 4. Escopo Funcional (MVP)

### 4.1 Fluxo do jogador anônimo
1. Acessa a home, vê uma breve descrição do quiz e um botão "Jogar".
2. Sistema sorteia um subconjunto de **10 a 15 perguntas** do banco total (~20-30 perguntas), embaralhando também a ordem.
3. Para cada pergunta: exibe o enunciado, a categoria/nível de dificuldade, e dois botões (Verdadeiro / Falso).
4. Ao responder, mostra imediatamente se acertou ou errou + **explicação** do porquê (texto curto, pode citar comportamento real do Claude Code).
5. Ao final, tela de **resultado**: pontuação total (X/N), quebra por categoria e por nível de dificuldade, e opção de "Jogar novamente" (novo sorteio).
6. Jogador anônimo pode jogar livremente, mas **resultado não é salvo** — apenas exibido na sessão atual.

### 4.2 Autenticação (Supabase Auth)
- Cadastro/login (e-mail + senha, ou magic link — decidir na implementação; magic link reduz fricção e é mais simples de implementar com Supabase).
- Jogador autenticado tem seus resultados de partida gravados automaticamente.
- Tela de **"Meu histórico"**: lista de partidas anteriores (data, score, categorias jogadas), acessível apenas logado.
- Não há conta "convidado" formal — jogar sem login é simplesmente não persistir dados.

### 4.3 Painel Admin
- Acesso restrito: apenas usuários com flag `is_admin = true` na tabela `profiles` enxergam a rota `/admin`.
- CRUD completo de perguntas: criar, editar, excluir, listar (com filtro por categoria/nível).
- Campos editáveis por pergunta: enunciado, resposta correta (V/F), explicação, categoria, nível de dificuldade, status (ativa/inativa — permite desativar sem excluir).
- Alterações refletem imediatamente no jogo (sem redeploy), pois as perguntas vêm do Supabase.

### 4.4 Categorias e Níveis
Toda pergunta tem duas dimensões:
- **Categoria:** `negocio` | `cli_basico` | `avancado`
- **Nível de dificuldade (exibido ao jogador):** `básico` | `intermediário` | `avançado`

As perguntas aparecem **misturadas aleatoriamente** (não em fases sequenciais); cada card exibe um badge com o nível, para contextualizar o jogador.

Exemplos de cobertura por categoria:
- **Negócio:** o que é Claude Code, para quem serve, diferenças vs. ChatGPT/outros assistentes, casos de uso, modelo de distribuição (CLI/IDE/app).
- **CLI/uso básico:** instalação, comandos básicos, fluxo de trabalho no terminal, arquivos de configuração (`CLAUDE.md`), permissões básicas.
- **Avançado:** subagentes, Skills, Hooks, MCP (Model Context Protocol), plan mode, memória, Claude Agent SDK (nível conceitual).

### 4.5 Pontuação
- 1 ponto por resposta correta, 0 por incorreta. Sem penalidade extra, sem timer.
- Resultado final mostra: score bruto, percentual de acerto, e detalhamento por categoria/nível (ex: "Negócio: 4/5 · CLI: 3/5 · Avançado: 2/5").

## 5. Requisitos Não-Funcionais

- **Responsividade:** mobile-first; deve funcionar bem em telas de smartphone e desktop.
- **Performance:** carregamento inicial rápido (Next.js App Router, poucas dependências pesadas).
- **Acessibilidade:** contraste adequado, foco visível em botões, textos alternativos onde aplicável.
- **Segurança:** Row Level Security (RLS) no Supabase — jogador só lê/escreve seus próprios registros de histórico; apenas admin escreve na tabela de perguntas; leitura de perguntas ativas é pública (para o jogo funcionar sem login).
- **Idioma:** conteúdo e interface 100% em Português (PT-BR).

## 6. Arquitetura Técnica

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | SSR/CSR híbrido conforme necessidade |
| Estilo | **Tailwind CSS** | Tema customizado com paleta inspirada na Anthropic |
| Backend | **Supabase** (Postgres + Auth) | Auth para jogadores e admin; banco de perguntas e resultados |
| Hospedagem | **Vercel** | Decisão atualizada: o plano inicial cogitava um site 100% estático (GitHub Pages/Netlify), mas a necessidade de Auth + leitura/escrita dinâmica no Supabase torna o Vercel a opção mais natural para um app Next.js com essas integrações. GitHub Pages permaneceria viável apenas com Supabase client-side puro e sem rotas server-side — não recomendado aqui pela fricção extra sem ganho real. |
| Persistência local | Nenhuma dependência de `localStorage` para dados críticos — tudo que precisa persistir vai para o Supabase. `localStorage` pode ser usado só para conveniências de UI (ex: lembrar se já viu um tutorial). |

### 6.1 Modelo de dados (Supabase / Postgres)

**`profiles`**
| coluna | tipo | descrição |
|---|---|---|
| id | uuid (PK, = auth.users.id) | vínculo com Supabase Auth |
| email | text | |
| is_admin | boolean, default false | controla acesso ao painel `/admin` |
| created_at | timestamptz | |

**`questions`**
| coluna | tipo | descrição |
|---|---|---|
| id | uuid (PK) | |
| statement | text | enunciado da pergunta |
| correct_answer | boolean | true = Verdadeiro, false = Falso |
| explanation | text | explicação exibida após resposta |
| category | text (`negocio`\|`cli_basico`\|`avancado`) | |
| level | text (`basico`\|`intermediario`\|`avancado`) | nível exibido ao jogador |
| is_active | boolean, default true | permite desativar sem excluir |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**`quiz_attempts`**
| coluna | tipo | descrição |
|---|---|---|
| id | uuid (PK) | |
| user_id | uuid (FK → profiles.id) | dono da partida |
| score | int | acertos |
| total_questions | int | total de perguntas na partida |
| breakdown | jsonb | acertos por categoria/nível, ex: `{"negocio": {"correct":4,"total":5}, ...}` |
| started_at | timestamptz | |
| finished_at | timestamptz | |

**`quiz_attempt_answers`** (opcional, granularidade fina — útil para futura análise/leaderboard)
| coluna | tipo | descrição |
|---|---|---|
| id | uuid (PK) | |
| attempt_id | uuid (FK → quiz_attempts.id) | |
| question_id | uuid (FK → questions.id) | |
| user_answer | boolean | |
| is_correct | boolean | |

### 6.2 Regras de RLS (alto nível)
- `questions`: SELECT liberado a `anon` + `authenticated` apenas onde `is_active = true`; INSERT/UPDATE/DELETE restrito a usuários com `is_admin = true`.
- `quiz_attempts` / `quiz_attempt_answers`: INSERT/SELECT restrito ao próprio `user_id = auth.uid()`.
- `profiles`: usuário só lê/edita a própria linha; `is_admin` só é alterável manualmente (via SQL/dashboard do Supabase), nunca pela aplicação.

## 7. Design e Identidade Visual

- Paleta inspirada na Anthropic/Claude: tons terracota/laranja queimado (`#CC785C` como referência), creme/bege de fundo, texto em cinza-escuro/preto suave. Evitar dark mode puro — priorizar o visual claro e acolhedor do claude.ai.
- Tipografia limpa e legível (ex: Inter ou similar), boa hierarquia entre enunciado da pergunta, badges de categoria/nível e botões de resposta.
- Componentes principais: Card de pergunta, badges de categoria/nível, botões grandes "Verdadeiro"/"Falso" com feedback visual imediato (verde/vermelho + ícone) após clique, tela de resultado com barra/gráfico simples de acerto por categoria.

## 8. Fluxo de Telas

1. **Home** (`/`) — descrição curta do quiz + CTA "Jogar" + link discreto para login/cadastro.
2. **Login/Cadastro** (`/login`) — via Supabase Auth (definir email+senha ou magic link na implementação).
3. **Jogo** (`/jogar`) — uma pergunta por vez, com progresso (ex: "Pergunta 3 de 12"), feedback + explicação após resposta, botão "Próxima".
4. **Resultado** (`/resultado`) — score final, breakdown por categoria/nível, botões "Jogar novamente" e "Ver meu histórico" (se logado).
5. **Meu Histórico** (`/historico`) — lista de partidas passadas (somente logado).
6. **Admin** (`/admin`) — CRUD de perguntas (somente `is_admin = true`); redirect/erro 403 para os demais.

## 9. Critérios de Aceite (Definition of Done do MVP)

- [ ] Jogador anônimo consegue jogar uma partida completa (10-15 perguntas sorteadas) do início ao resultado, sem erros.
- [ ] Cada resposta mostra feedback correto/incorreto + explicação.
- [ ] Resultado final exibe score total e breakdown por categoria/nível.
- [ ] Jogador consegue se cadastrar/logar via Supabase Auth.
- [ ] Partidas de jogador logado são salvas e aparecem em "Meu histórico".
- [ ] Admin logado consegue criar, editar, desativar e excluir perguntas, refletindo no jogo sem redeploy.
- [ ] Usuário não-admin não consegue acessar `/admin` (nem via API, validado por RLS).
- [ ] Banco inicial populado com pelo menos 20 perguntas ativas, cobrindo as 3 categorias e os 3 níveis.
- [ ] Interface responsiva (mobile e desktop) e com a identidade visual definida.
- [ ] Deploy funcional na Vercel.

## 10. Conteúdo — Exemplos de Perguntas (seed inicial)

Estes exemplos ilustram o formato e tom esperado; o banco completo (~20-30 perguntas) deve ser criado durante a implementação seguindo o mesmo padrão, distribuído entre as 3 categorias e 3 níveis.

| Categoria | Nível | Enunciado | Resposta | Explicação |
|---|---|---|---|---|
| negocio | basico | Claude Code é uma ferramenta de linha de comando (CLI) da Anthropic para tarefas de engenharia de software. | Verdadeiro | Claude Code é oferecido como CLI (e também IDE extensions/app) para ajudar em tarefas de codificação diretamente no terminal do desenvolvedor. |
| negocio | basico | Claude Code só pode ser usado por quem já paga por uma assinatura separada do Claude.ai. | Falso | O acesso ao Claude Code depende do plano/API contratado, mas não exige necessariamente uma assinatura separada do produto de chat claude.ai. |
| cli_basico | intermediario | O arquivo `CLAUDE.md` na raiz de um projeto é usado para fornecer contexto/instruções persistentes ao Claude Code sobre aquele repositório. | Verdadeiro | `CLAUDE.md` é lido como contexto do projeto, permitindo documentar convenções, comandos e preferências específicas do repositório. |
| cli_basico | intermediario | Por padrão, o Claude Code executa qualquer comando de terminal sem pedir confirmação ao usuário. | Falso | Por padrão há modos de permissão que pedem confirmação para ações potencialmente arriscadas, a menos que o usuário configure um modo mais permissivo. |
| avancado | avancado | "Subagentes" no Claude Code permitem delegar tarefas específicas a instâncias especializadas, isolando contexto do agente principal. | Verdadeiro | Subagentes rodam com seu próprio contexto e conjunto de ferramentas, retornando um resultado consolidado ao fluxo principal. |
| avancado | avancado | O MCP (Model Context Protocol) serve exclusivamente para conectar o Claude Code a modelos de linguagem alternativos, substituindo o modelo Claude. | Falso | MCP é um protocolo para conectar o agente a ferramentas e fontes de dados externas (ex: bancos de dados, APIs), não para trocar o modelo de linguagem em si. |
| avancado | intermediario | "Skills" no Claude Code são pacotes de instruções reutilizáveis que o agente pode carregar para tarefas específicas (ex: um checklist de revisão). | Verdadeiro | Skills empacotam instruções e podem ser invocadas quando a tarefa corresponde ao que a skill cobre, evitando reescrever o mesmo contexto toda vez. |

## 11. Métricas de Sucesso (pós-lançamento, informal — projeto de portfólio)

- Número de partidas jogadas (via contagem de `quiz_attempts` + estimativa de anônimos por analytics simples, se adicionado no futuro).
- Taxa de conclusão (partidas iniciadas vs. finalizadas).
- Qualidade percebida: feedback qualitativo (ex: comentários ao compartilhar o link).

## 12. Roadmap Futuro (V2+)

- Leaderboard público (ranking por nome de usuário).
- Timer por pergunta / modo "contra o relógio".
- Compartilhamento de resultado (imagem gerada ou link com preview).
- Categoria "SDK e integrações" e expansão do banco de perguntas.
- Suporte multi-idioma (EN).
- Analytics de uso (ex: Plausible/Vercel Analytics) para métricas reais de engajamento.
- Modo de dificuldade adaptativa.

## 13. Riscos e Considerações

- **Conteúdo desatualizado:** Claude Code evolui rápido; perguntas técnicas avançadas podem ficar desatualizadas — o painel admin existe justamente para permitir correções rápidas sem redeploy.
- **Custo/limites do Supabase:** projeto de portfólio deve caber tranquilamente no free tier do Supabase; monitorar se o uso crescer muito.
- **Escopo do admin único:** não há gestão de múltiplos admins/papéis no MVP — suficiente por ora, mas listado aqui para não ser esquecido caso o projeto cresça.
