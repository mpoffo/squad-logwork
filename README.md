# ⏱ Squad Logwork

Ferramenta interna para apontamento de horas e acompanhamento de produtividade do time no Jira Senior (on-premise).

<<<<<<< HEAD
**Versão atual:** v1.4.0
=======
**Versão atual:** v1.3.1
>>>>>>> 2553ac0a3f094f6005e17867266f1380f186ff53

---

## Funcionalidades

### Aba — Apontar Horas
- Busca issues elegíveis do projeto **HCMDOF** (status: To Do, In Progress, Code Review, To Do Review, Review) e issues da **sprint corrente**
- Busca issues administrativas do projeto **HADM** (`summary ~ HCM`)
- Calcula automaticamente o dia útil anterior como data de referência (considera feriados nacionais brasileiros)
- Exibe quanto você já apontou na data de referência e calcula o saldo restante (8h30 − já apontado)
- Distribui as horas restantes igualmente entre as issues ativas
- Slider por issue: ao ajustar uma, as demais se redistribuem proporcionalmente
- Checkbox para incluir/excluir issues da distribuição
- Issues do tipo **Feature** e **Epic** começam desmarcadas por padrão
- Issues com mais de **27h** acumuladas são destacadas com alerta visual (⚠) e começam desmarcadas
- Filtro por assignee acima das listas (client-side, sem chamadas adicionais ao Jira)
- Key de cada issue é um link clicável que abre a issue no Jira
- Progresso de carregamento com etapas nomeadas e contador em tempo real
- Lançamento individual por issue ou tudo de uma vez

### Aba — Horas do Time
- Acompanhamento mensal de horas apontadas por membro do time
- Gráfico de barras por semana com linha de meta esperada (8h30 × dias úteis)
- Navegação por semana com visão diária agrupada (barras por pessoa dentro de cada dia)
- Seleção de dia específico para visão detalhada
- Tabela resumo com esperado, apontado, %, barra de progresso e diferença
- Expansão por membro para ver os apontamentos por issue em ordem cronológica, com link para cada issue no Jira
- Filtro por membro para recarregar dados individualmente (mais rápido)
- Progresso de carregamento com etapas nomeadas e contador em tempo real
- Cache local (localStorage) para manter os dados após F5, com indicação de quando foi atualizado
- Dados carregados automaticamente ao abrir a página se as credenciais já estiverem salvas

### Aba — 🔎 Dedo Duro
- Dashboard de indicadores de qualidade e processo baseado em queries JQL configuráveis
- Indicadores exibidos como cards com contador grande: verde (0), amarelo (1–3), vermelho (4+)
- Clique no card expande uma tabela com as issues retornadas: Tipo, Key, Status, Epic Link, Resumo, Assignee, Lead Time e Time Spent
- **Atualização automática a cada 3 horas** — roda silenciosamente em background
- Indicador no toolbar mostra o tempo restante para a próxima atualização
- **Notificação nativa do browser** quando algum indicador sobe em relação à rodada anterior — aparece mesmo com a aba em segundo plano, com o detalhamento de quais indicadores subiram e o delta
- Reordenação dos cards por drag & drop — a ordem é salva no `localStorage`
- Suporte a múltiplos arquivos de definição (um por contexto/projeto)
- O arquivo selecionado é lembrado entre sessões e recarregado automaticamente

---

## Estrutura do projeto

```
squad-logwork/
├── proxy.js            # Servidor Node.js local (proxy para o Jira)
├── squad-logwork.html  # Interface web completa
├── README.md
├── .gitignore
└── dedoduro/           # Definições dos indicadores Dedo Duro
    └── HCMDOF.json     # Indicadores do projeto HCMDOF
```

---

## Requisitos

- **Node.js** >= 18 (usa `fetch` nativo)
- **VPN** conectada com acesso ao `jira.senior.com.br`
- Sem dependências npm — usa apenas módulos nativos do Node

---

## Como usar

### 1. Subir o proxy

```cmd
node proxy.js
```

O proxy ficará rodando em `http://localhost:3000` e servirá o HTML automaticamente.

> ⚠️ **Importante:** a aba Dedo Duro requer acesso via `http://localhost:3000`. Abrir o HTML diretamente como `file:///` bloqueia os requests ao proxy por política de CORS do browser.

#### Automatizar com agendador de tarefas (opcional)

Para subir o proxy automaticamente em um horário fixo, crie um `.bat`:

```bat
@echo off
start "" /B node "C:\GIT-personal\JiraProdutividade\proxy.js"
timeout /t 3 /nobreak > nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" "http://localhost:3000"
```

E agende com o Task Scheduler (sem privilégios elevados):

```cmd
schtasks /create /tn "Squad Logwork" /tr "\"C:\caminho\seu-arquivo.bat\"" /sc DAILY /st 08:00 /ru "%USERNAME%" /f
```

### 2. Acessar a interface

Via proxy (obrigatório para o Dedo Duro):
```
http://localhost:3000
```

### 3. Configurar credenciais

Clique em **⚙ Config** e informe:
- **URL base:** `https://jira.senior.com.br`
- **Usuário:** seu login do Jira
- **Senha / Token:** sua senha do Jira

As credenciais são salvas no `localStorage` do browser. Na próxima abertura, os dados são carregados automaticamente.

---

## Configuração avançada

Clique em **⚙ Config** para acessar as três abas de configuração:

### Aba Jira
- URL base, usuário e senha

### Aba Time

| Campo | Descrição | Padrão |
|-------|-----------|--------|
| Membros | Um usuário por linha | 6 membros do squad |
| Horas diárias | Meta diária por pessoa | 8.5h |
| Limite de horas acumuladas para alerta (⚠) | Issues acima desse valor ficam desmarcadas e destacadas | 27h |

### Aba Queries

Três JQLs configuráveis. Se uma query customizada falhar (erro de sintaxe), o app exibe o erro e usa a query padrão automaticamente.

| Query | Descrição |
|-------|-----------|
| Principal | Issues elegíveis para apontamento |
| Sprint corrente | Issues da sprint ativa (inclui To Do/Backlog) |
| Administrativa | Issues do projeto HADM |

---

## Dedo Duro — definições de indicadores

Os indicadores são definidos em arquivos `.json` dentro da pasta `dedoduro/`, na raiz do projeto.

### Formato do arquivo

```json
[
  {
    "name": "Nome do indicador",
    "query": "project = HCMDOF AND status not in (Done, Closed)"
  }
]
```

Cada arquivo representa um conjunto de indicadores (ex: um por projeto ou contexto). O app lista automaticamente todos os arquivos da pasta e permite trocar entre eles no toolbar da aba.

### Adicionando novos indicadores

1. Edite o arquivo `.json` correspondente (ou crie um novo em `dedoduro/`)
2. Clique em **↻ Atualizar** na aba Dedo Duro — o arquivo é relido a cada rodada

### Notificações

Na primeira vez que a aba Dedo Duro é aberta, o browser solicita permissão para enviar notificações. Conceda a permissão para receber alertas quando algum indicador subir.

As notificações aparecem no sistema operacional mesmo com o Squad Logwork em segundo plano. Clicar na notificação abre a janela e navega diretamente para a aba Dedo Duro.

---

## Time padrão

| Usuário | Papel |
|---------|-------|
| mauro.ramos | Squad Leader |
| fernando.zimmermann | Dev |
| diegof.silva | Dev |
| leonardo.correa | Dev |
| douglas.scardueli | Dev |
| marcio.poffo | Dev |

Para adicionar ou remover membros, use a aba **Time** em ⚙ Config — não é necessário editar o código.

---

## Compatibilidade

Testado com **Jira Server 7.7.0** (2018). A busca de worklogs é feita via `worklogDate` por autor individual (sem `IN` — não suportado nessa versão) com filtro de período via campo `started` no JavaScript.

---

## Histórico de versões

| Versão | Descrição |
|--------|-----------|
<<<<<<< HEAD
| v1.4.0 | Aba Dedo Duro: dashboard de indicadores JQL com auto-refresh (3h), notificação nativa do browser e drag & drop |
| v1.3.1 | Avatares de assignee com badge de iniciais e filtro client-side por assignee |
| v1.3.0 | Badge de assignee nas issues da aba Apontar Horas |
=======
| v1.3.1 | Incluído filtro por assign |
| v1.3.0 | Visão semanal com barras agrupadas por dia e filtragem por membro |
>>>>>>> 2553ac0a3f094f6005e17867266f1380f186ff53
| v1.2.7 | Barra de progresso com etapas nomeadas e contadores em tempo real |
| v1.2.6 | Remoção do controle de "alerta de total diário" inexistente |
| v1.2.5 | Links clicáveis nas keys das issues (aba Log e detalhamento do Time) |
| v1.2.4 | Auto-load ao abrir a página + correção de bug no cfg duplicado |
| v1.2.3 | Configuração avançada: time, queries JQL e limites via UI |
| v1.2.2 | Visão semanal com barras agrupadas por dia e pessoa |
| v1.2.1 | Correção da legenda no gráfico de semana/dia |
| v1.2.0 | Visão diária no gráfico — sub-tabs por dia útil da semana |
| v1.1.4 | Destaque neon para issues com alerta de horas |
| v1.1.3 | Alerta e desmarcação padrão para issues com mais de 27h |
| v1.1.2 | Correção de bug de fuso horário no cálculo de semana ISO |
| v1.1.1 | Log detalhado para diagnóstico de worklogs |
| v1.1.0 | Correção crítica no proxy (URL truncada) + invalidação de cache por versão |
| v1.0.0 | Versão inicial com controle de versão |
