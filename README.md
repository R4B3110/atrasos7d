# ClickUp Automação + n8n MCP Integration

Projeto completo para automação de tarefas do ClickUp com duas abordagens poderosas:

1. **🚀 n8n Local + MCP**: Crie automações diretamente via API usando IA (RECOMENDADO)
2. **☁️ n8n Cloud**: Importe workflows prontos (alternativa simples)

## ⭐ Destaques

### 🤖 Automação via n8n Local + MCP (NOVO!)

Crie automações do ClickUp **diretamente via comandos de IA** no Cursor:

- ✨ **Criação programática**: IA cria workflows pra você
- 🎯 **Validação automática**: Garante que está correto antes de criar
- 🔧 **Modificação fácil**: Peça à IA para alterar qualquer coisa
- 💰 **Gratuito**: Roda localmente no seu computador
- 🔒 **Controle total**: Seus dados ficam no seu ambiente

**Setup rápido:**
```bash
# 1. Subir n8n local
docker-compose -f docker-compose.n8n.yml up -d

# 2. Reiniciar Cursor (para carregar o MCP)

# 3. Pedir à IA:
"Crie a automação de alertas de tarefas atrasadas usando o MCP"
```

📖 **[Guia completo: N8N-LOCAL-SETUP.md](N8N-LOCAL-SETUP.md)**

---

## Funcionalidades

- ✅ Gerenciamento completo de tarefas (criar, listar, atualizar)
- ✅ Navegação em espaços e listas
- ✅ Rastreamento de tempo (timers e logs)
- ✅ Busca em documentos e comentários
- ✅ Autenticação OAuth 2.1 com PKCE
- ✅ Integração nativa com Cursor IDE
- 🤖 **Automação de alertas via n8n (Cloud OU Local)**
- 🚀 **n8n-mcp integrado**: Crie workflows via IA

## Requisitos

- Node.js >= 18.x
- TypeScript >= 5.x
- Conta ClickUp com acesso API
- Cursor IDE (opcional, para integração MCP)

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

## Configuração

### 1. Obter Credenciais OAuth do ClickUp

1. Acesse [ClickUp API Settings](https://app.clickup.com/settings/apps)
2. Crie uma nova aplicação OAuth
3. Configure a Redirect URI (ex: `http://localhost:3000/callback`)
4. Copie o `Client ID` e `Client Secret`

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
CLICKUP_CLIENT_ID=seu_client_id_aqui
CLICKUP_CLIENT_SECRET=seu_client_secret_aqui
CLICKUP_REDIRECT_URI=http://localhost:3000/callback
CLICKUP_WORKSPACE_ID=seu_workspace_id
CLICKUP_SPACE_ID=seu_space_id
```

### 3. Configurar Cursor IDE (Opcional)

Para usar o MCP diretamente no Cursor, configure o arquivo `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-clickup"],
      "env": {
        "CLICKUP_WORKSPACE_ID": "seu_workspace_id",
        "CLICKUP_SPACE_ID": "seu_space_id"
      }
    }
  }
}
```

## Uso

### Build e Execução

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build
npm start
```

### Exemplos de Código

Veja a pasta `src/examples/` para exemplos completos de uso.

## Estrutura do Projeto

```
src/
├── index.ts              # Entry point
├── mcp-client.ts         # Cliente MCP
├── services/
│   ├── task-service.ts   # Operações de tarefas
│   ├── space-service.ts  # Operações de espaços
│   ├── time-tracking.ts  # Rastreamento de tempo
│   └── list-service.ts   # Gerenciamento de listas
├── types/
│   └── clickup.ts        # Tipos TypeScript
├── utils/
│   ├── oauth.ts          # Fluxo OAuth 2.1 PKCE
│   └── logger.ts         # Utilitários de logging
└── examples/
    └── usage.ts          # Exemplos de uso
```

## Autenticação

Este projeto usa OAuth 2.1 com PKCE para autenticação segura. O fluxo é:

1. Geração de `code_verifier` e `code_challenge`
2. Redirecionamento para autorização do ClickUp
3. Troca do código por access token
4. Refresh automático de tokens

**Nota**: O ClickUp MCP **não suporta** API keys - apenas OAuth.

## Rate Limits

O servidor MCP do ClickUp respeita os mesmos rate limits da API oficial do ClickUp. Consulte a [documentação de rate limits](https://developer.clickup.com/docs/rate-limits).

## 🤖 Automação: Alertas de Tarefas Atrasadas

Este projeto oferece **duas abordagens** para criar a automação de alertas:

### Comparação Rápida

| Aspecto | n8n Local + MCP | n8n Cloud |
|---------|-----------------|-----------|
| **Setup** | Docker + Reiniciar Cursor | Conta online + Importar JSON |
| **Criação** | IA cria pra você via comandos | Importar workflow pronto |
| **Custo** | $0 (roda localmente) | $0 (plano gratuito 5k exec/mês) |
| **Modificações** | Peça à IA para alterar | Interface visual ou código |
| **Controle** | Total (seus dados, seu ambiente) | Limitado (cloud externo) |
| **Disponibilidade** | 24/7 se Docker ativo | 24/7 garantido |
| **Manutenção** | Você gerencia | n8n gerencia |

### Qual Escolher?

**Use n8n Local + MCP se:**
- ✅ Tem Docker instalado
- ✅ Quer controle total
- ✅ Prefere criar via comandos de IA
- ✅ Quer dados locais
- ✅ Vai fazer modificações frequentes

**Use n8n Cloud se:**
- ✅ Quer algo rápido e sem setup
- ✅ Não quer gerenciar infraestrutura
- ✅ Prefere interface visual
- ✅ Já usa n8n Cloud

---

## 🚀 Opção 1: n8n Local + MCP (Recomendado)

Este projeto inclui uma automação completa para monitorar tarefas atrasadas no ClickUp e enviar alertas via Telegram.

### ✨ Funcionalidades da Automação

- 🕐 **Verificação automática** 2x por dia (9h e 17h)
- 📋 **Monitora listas específicas** do ClickUp
- 🏷️ **Filtra por tag** "semana anterior"
- ⏰ **Detecta atrasos** maiores que 7 dias
- 📱 **Envia alertas** formatados no Telegram
- 🤖 **Criação via IA** - peça ao Cursor para criar
- 🔧 **Modificação via IA** - peça ao Cursor para alterar

### 📦 Arquivos do Projeto

```
# Setup n8n Local + MCP
docker-compose.n8n.yml           # Docker Compose para n8n local
mcp-server/                      # n8n-mcp integrado (clonado)
.cursor/mcp.json                 # Configuração MCP no Cursor
N8N-LOCAL-SETUP.md               # Guia completo de setup

# Alternativa: n8n Cloud
workflows/
├── clickup-alertas-n8n.json    # Workflow n8n pronto para importar
└── test-n8n-logic.js            # Testes de validação da lógica
N8N-SETUP.md                     # Guia n8n Cloud
```

### 🚀 Como Usar (n8n Local + MCP)

1. **Subir n8n local via Docker**
```bash
docker-compose -f docker-compose.n8n.yml up -d
```

2. **Criar conta e API Key no n8n**
   - Acesse: http://localhost:5678
   - Crie conta de admin
   - Settings → API → Create API Key

3. **Configurar API Key**
   - Edite `mcp-server/.env` com sua API key
   - Edite `.cursor/mcp.json` com a mesma key
   - Reinicie o Cursor

4. **Criar automação via IA**
   - No Cursor, peça: "Crie a automação de alertas do ClickUp usando o MCP"
   - A IA vai criar o workflow diretamente no seu n8n!

5. **Configurar credenciais no n8n**
   - ClickUp API Token
   - Telegram Bot Token (já configurado)

6. **Ativar workflow**
   - No n8n, ative o toggle verde
   - Teste manualmente

### 📖 Documentação Completa

**n8n Local + MCP:** Consulte o **[N8N-LOCAL-SETUP.md](N8N-LOCAL-SETUP.md)** para:
- Setup completo Docker + MCP
- Como gerar API Key do n8n
- Configuração do MCP no Cursor
- Como usar IA para criar workflows
- Troubleshooting detalhado

---

## ☁️ Opção 2: n8n Cloud (Alternativa)

Prefere não usar Docker? Use o n8n Cloud!

### 🚀 Como Usar (n8n Cloud)

1. **Criar conta no n8n Cloud**
   - Acesse: https://n8n.io
   - Plano gratuito: 5.000 execuções/mês

2. **Importar workflow**
   - Baixe `workflows/clickup-alertas-n8n.json`
   - No n8n: Workflows → Import from File

3. **Configurar credenciais**
   - ClickUp API Token
   - Telegram Bot Token

4. **Ativar**
   - Toggle verde → Save

### 📖 Documentação

Consulte o **[N8N-SETUP.md](N8N-SETUP.md)** para:
- Guia passo a passo
- Como obter API tokens
- Personalização de horários e filtros

### 🎯 Critérios de Alerta

Uma tarefa é considerada atrasada quando:
- ✅ Tem a tag `"semana anterior"`
- ✅ O `due_date` foi definido há **mais de 7 dias**
- ✅ Está em um dos status ativos:
  - `STAND BY`
  - `PENDENTE`
  - `PRONTO PARA FAZER`
  - `EM PROGRESSO`
  - `EM VALIDAÇÃO`
  - `EM ALTERAÇÃO`

### 💰 Custo

**$0/mês** - O plano gratuito do n8n Cloud é suficiente:
- 5.000 execuções/mês
- Você usa ~60 execuções/mês (2 por dia)
- Equivale a apenas 1,2% do limite

### 🔧 Personalização

Você pode facilmente modificar no n8n (interface visual):
- ⏰ Horários de verificação (cron expressions)
- 📋 Listas monitoradas (IDs das listas)
- 🏷️ Tags filtradas
- 📊 Status considerados
- 🕐 Threshold de dias (padrão: 7)

### 🧪 Testes

Para validar a lógica localmente antes de importar:

```bash
node workflows/test-n8n-logic.js
```

Isso executa testes automatizados com dados mock para verificar:
- ✅ Filtro de tarefas atrasadas
- ✅ Formatação da mensagem Telegram
- ✅ Validação de todos os critérios

---

## Recursos

- [Documentação oficial ClickUp MCP](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [MCP Tools disponíveis](https://developer.clickup.com/docs/mcp-tools)
- [ClickUp API Reference](https://developer.clickup.com/reference)
- [OAuth ClickUp](https://developer.clickup.com/docs/oauth)
- [n8n Documentation](https://docs.n8n.io)
- [n8n ClickUp Integration](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.clickup)

## Licença

MIT
