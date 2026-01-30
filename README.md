# ClickUp MCP Integration

Projeto TypeScript para integração com o servidor MCP (Model Context Protocol) oficial do ClickUp.

## Funcionalidades

- ✅ Gerenciamento completo de tarefas (criar, listar, atualizar)
- ✅ Navegação em espaços e listas
- ✅ Rastreamento de tempo (timers e logs)
- ✅ Busca em documentos e comentários
- ✅ Autenticação OAuth 2.1 com PKCE
- ✅ Integração nativa com Cursor IDE
- 🤖 **Automação de alertas para tarefas atrasadas via n8n**

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

## 🤖 Automação: Alertas de Tarefas Atrasadas (n8n)

Este projeto inclui uma automação completa para monitorar tarefas atrasadas no ClickUp e enviar alertas via Telegram.

### ✨ Funcionalidades da Automação

- 🕐 **Verificação automática** 2x por dia (9h e 17h)
- 📋 **Monitora listas específicas** do ClickUp
- 🏷️ **Filtra por tag** "semana anterior"
- ⏰ **Detecta atrasos** maiores que 7 dias
- 📱 **Envia alertas** formatados no Telegram
- ☁️ **Roda 24/7** na nuvem (n8n Cloud gratuito)
- 🎯 **Zero código** - tudo visual no n8n

### 📦 Arquivos da Automação

```
workflows/
├── clickup-alertas-n8n.json    # Workflow n8n pronto para importar
└── test-n8n-logic.js            # Testes de validação da lógica

N8N-SETUP.md                      # Guia completo passo a passo
```

### 🚀 Como Usar

1. **Crie uma conta gratuita no n8n Cloud**
   - Acesse: https://n8n.io
   - Plano gratuito: 5.000 execuções/mês (mais que suficiente!)

2. **Importe o workflow**
   - Baixe o arquivo `workflows/clickup-alertas-n8n.json`
   - No n8n: Workflows → Import from File

3. **Configure as credenciais**
   - **ClickUp**: Adicione seu API Token (obtenha em https://app.clickup.com/settings/apps)
   - **Telegram**: Adicione seu Bot Token (crie com @BotFather)

4. **Ative o workflow**
   - Teste manualmente primeiro
   - Depois ative para rodar automaticamente

### 📖 Documentação Completa

Consulte o **[N8N-SETUP.md](N8N-SETUP.md)** para:
- Guia passo a passo com screenshots
- Como obter API tokens e Bot tokens
- Configuração de credenciais
- Testes e troubleshooting
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
