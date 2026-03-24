# ⏱ Squad Logwork

Ferramenta interna para apontamento de horas e acompanhamento de produtividade do time no Jira Senior (on-premise).

**Versão atual:** v1.2.2

---

## Funcionalidades

### Aba — Apontar Horas
- Busca issues elegíveis do projeto **HCMDOF** (status: To Do, In Progress, Code Review, To Do Review, Review) e issues da **sprint corrente**
- Busca issues administrativas do projeto **HADM** (`summary ~ HCM`)
- Calcula automaticamente o dia útil anterior como data de referência (considera feriados nacionais brasileiros)
- Exibe quanto você já apontou na data de referência e calcula o saldo restante (8h30 - já apontado)
- Distribui as horas restantes igualmente entre as issues ativas
- Slider por issue: ao ajustar uma, as demais se redistribuem proporcionalmente
- Checkbox para incluir/excluir issues da distribuição
- Issues do tipo **Feature** e **Epic** começam desmarcadas por padrão
- Issues com mais de **27h** acumuladas são destacadas com alerta visual e começam desmarcadas
- Alerta quando o total de horas ultrapassar 25h
- Lançamento individual por issue ou tudo de uma vez

### Aba — Horas do Time
- Acompanhamento mensal de horas apontadas por membro do time
- Gráfico de barras por semana com linha de meta esperada (8h30 × dias úteis)
- Navegação por semana com visão diária agrupada (barras por pessoa dentro de cada dia)
- Seleção de dia específico para visão detalhada
- Tabela resumo com esperado, apontado, %, barra de progresso e diferença
- Expansão por membro para ver os apontamentos por issue em ordem cronológica
- Filtro por membro para recarregar dados individualmente (mais rápido)
- Cache local (localStorage) para manter os dados após F5, com indicação de quando foi atualizado

---

## Estrutura do projeto

```
squad-logwork/
├── proxy.js            # Servidor Node.js local (proxy para o Jira)
├── squad-logwork.html  # Interface web completa
├── README.md
└── .gitignore
```

---

## Requisitos

- **Node.js** >= 18 (usa `fetch` nativo)
- **VPN** conectada com acesso ao `jira.senior.com.br`
- Sem dependências npm — usa apenas módulos nativos do Node

---

## Como usar

### 1. Instalar como serviço do Windows (recomendado)

Abra o **Prompt de Comando como Administrador** e execute:

```cmd
sc create JiraProdutividadeServer binPath= "\"C:\Program Files\nodejs\node.exe\" \"C:\caminho\completo\proxy.js\"" start= auto DisplayName= "Jira Produtividade Server"
sc start JiraProdutividadeServer
```

Para descobrir o caminho do `node.exe`:
```cmd
where node
```

O serviço iniciará automaticamente com o Windows.

### 2. Ou rodar manualmente

```cmd
node proxy.js
```

### 3. Acessar a interface

Abra o browser (com VPN ativa) em:
```
http://localhost:3000
```

### 4. Configurar credenciais

Clique em **⚙ Config** e informe:
- **URL base:** `https://jira.senior.com.br`
- **Usuário:** seu login do Jira
- **Senha / Token:** sua senha do Jira

As credenciais são salvas no `localStorage` do browser.

---

## Membros do time monitorados

| Usuário | — |
|---|---|
| mauro.ramos | Squad Leader |
| fernando.zimmermann | Dev |
| diegof.silva | Dev |
| leonardo.correa | Dev |
| douglas.scardueli | Dev |
| marcio.poffo | Dev |

Para adicionar ou remover membros, edite o array `TEAM` no início do `<script>` em `squad-logwork.html`.

---

## Compatibilidade

Testado com **Jira Server 7.7.0** (2018). A busca de worklogs é feita via `worklogDate` por autor individual (sem `IN` — não suportado nessa versão) com filtro de período via campo `started` no JavaScript.

---

## Gerenciar o serviço Windows

```cmd
# Verificar status
sc query JiraProdutividadeServer

# Parar
net stop JiraProdutividadeServer

# Iniciar
net start JiraProdutividadeServer

# Remover
sc stop JiraProdutividadeServer
sc delete JiraProdutividadeServer
```

---

## Histórico de versões

| Versão | Descrição |
|--------|-----------|
| v1.2.2 | Visão semanal com barras agrupadas por dia e pessoa |
| v1.2.1 | Correção da legenda no gráfico de semana/dia |
| v1.2.0 | Visão diária no gráfico — sub-tabs por dia útil da semana |
| v1.1.4 | Destaque neon para issues com alerta de horas |
| v1.1.3 | Alerta e desmarcação padrão para issues com mais de 27h |
| v1.1.2 | Correção de bug de fuso horário no cálculo de semana ISO |
| v1.1.1 | Log detalhado para diagnóstico de worklogs |
| v1.1.0 | Correção crítica no proxy (URL truncada) + invalidação de cache por versão |
| v1.0.0 | Versão inicial com controle de versão |