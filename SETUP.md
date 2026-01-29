# Guia de Configuração - ClickUp MCP Integration

Este guia fornece instruções passo a passo para configurar e usar a integração com o ClickUp MCP.

## 📋 Pré-requisitos

- Node.js >= 18.x
- npm ou yarn
- Conta ClickUp com acesso à API
- Cursor IDE (opcional, para integração MCP nativa)

## 🚀 Instalação Rápida

### 1. Clone e Instale Dependências

```bash
cd /Users/richardrabello/Documents/Cursor/ClickUp
npm install
```

### 2. Configure Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas credenciais
nano .env
```

### 3. Obtenha Credenciais do ClickUp

#### A. Criar Aplicação OAuth

1. Acesse: https://app.clickup.com/settings/apps
2. Clique em "Create an App"
3. Preencha as informações:
   - **App Name**: ClickUp MCP Integration
   - **Redirect URI**: `http://localhost:3000/callback` (desenvolvimento)
4. Copie o **Client ID** e **Client Secret**

#### B. Encontrar IDs do Workspace e Space

Após autenticar pela primeira vez:

```typescript
// Execute este código para obter seus IDs
import { createClickUpIntegration } from './dist/index.js';

const clickup = createClickUpIntegration({
  workspaceId: 'temporary',
  clientId: 'seu_client_id',
  clientSecret: 'seu_client_secret',
  redirectUri: 'http://localhost:3000/callback'
});

// Após completar OAuth, obtenha os IDs:
const teams = await clickup.client.getWorkspaceTeams();
console.log('Workspace/Team IDs:', teams);
```

### 4. Build do Projeto

```bash
npm run build
```

## 🔐 Processo de Autenticação OAuth

### Opção 1: Usando o Código de Exemplo

```typescript
import { createClickUpIntegration } from './dist/index';

const clickup = createClickUpIntegration({
  workspaceId: process.env.CLICKUP_WORKSPACE_ID!,
  clientId: process.env.CLICKUP_CLIENT_ID!,
  clientSecret: process.env.CLICKUP_CLIENT_SECRET!,
  redirectUri: process.env.CLICKUP_REDIRECT_URI!,
});

// 1. Imprima a URL de autorização
console.log('Visite esta URL:', clickup.oauth.authorizationUrl);

// 2. Após autorização, o ClickUp redireciona para:
// http://localhost:3000/callback?code=AUTHORIZATION_CODE

// 3. Complete o fluxo OAuth
const authCode = 'CODIGO_DA_URL_DE_REDIRECT';
const tokens = await clickup.oauth.completeFlow(authCode);

console.log('Autenticado com sucesso!');
```

### Opção 2: Implementar Servidor de Callback

```typescript
import express from 'express';

const app = express();
const clickup = createClickUpIntegration(/* config */);

// Rota inicial - redireciona para autorização
app.get('/auth', (req, res) => {
  res.redirect(clickup.oauth.authorizationUrl);
});

// Rota de callback - recebe código de autorização
app.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await clickup.oauth.completeFlow(code as string);
    
    // Salve os tokens de forma segura
    // (em produção, use um banco de dados)
    
    res.send('Autenticação bem-sucedida!');
  } catch (error) {
    res.status(500).send('Erro na autenticação');
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
  console.log('Acesse http://localhost:3000/auth para iniciar');
});
```

## 📚 Exemplos de Uso

### Gerenciamento de Tarefas

```typescript
const { tasks } = clickup.services;

// Listar tarefas
const tasksResult = await tasks.listTasks('list_id', {
  statuses: ['in progress', 'open'],
  order_by: 'due_date',
});

// Criar tarefa
await tasks.createTask('list_id', {
  name: 'Nova tarefa',
  description: 'Descrição detalhada',
  priority: 1, // Urgente
  due_date: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dias
  assignees: [123456],
  tags: ['feature', 'backend'],
});

// Atualizar tarefa
await tasks.updateTask('task_id', {
  status: 'in progress',
  priority: 2,
});

// Adicionar comentário
await tasks.addTaskComment('task_id', 'Progresso atualizado!');
```

### Rastreamento de Tempo

```typescript
const { timeTracking } = clickup.services;

// Iniciar timer
await timeTracking.startTimer('task_id', 'Trabalhando na implementação');

// Verificar timer em execução
const timer = await timeTracking.getRunningTimer('workspace_id');
if (timer.success && timer.data) {
  console.log('Timer ativo:', timer.data.task.name);
}

// Parar timer
await timeTracking.stopTimer('workspace_id');

// Registrar tempo manualmente
await timeTracking.logTimeInHours('task_id', 2.5, 'Desenvolvimento concluído');

// Ver entradas de tempo
const entries = await timeTracking.getTaskTimeEntries('task_id');
```

### Gerenciamento de Espaços e Listas

```typescript
const { spaces, lists } = clickup.services;

// Listar espaços
const spacesResult = await spaces.listSpaces('workspace_id');

// Criar lista
await lists.createListInSpace('space_id', {
  name: 'Sprint 1',
  content: 'Tarefas do primeiro sprint',
});

// Listar listas
const listsResult = await lists.getListsInSpace('space_id');
```

## 🎯 Integração com Cursor IDE

### Configuração MCP Nativa

1. **Edite o arquivo `.cursor/mcp.json`**:

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

2. **Reinicie o Cursor IDE**

3. **Use comandos em linguagem natural**:
   - "List all tasks in my current space"
   - "Create a task called 'Fix bug' with high priority"
   - "Start timer for task XYZ"
   - "Log 2 hours to task ABC"

### Comandos MCP Disponíveis

- **Tarefas**: criar, listar, atualizar, comentar
- **Espaços**: navegar, listar
- **Listas**: criar, gerenciar
- **Tempo**: iniciar/parar timer, registrar tempo
- **Busca**: encontrar tarefas, filtrar por status

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Executar build
npm start

# Watch mode (rebuild automático)
npm run watch

# Type checking sem build
npm run type-check

# Limpar build
npm run clean
```

## 📁 Estrutura do Projeto

```
src/
├── index.ts                 # Ponto de entrada principal
├── mcp-client.ts           # Cliente MCP do ClickUp
├── services/
│   ├── task-service.ts     # Gerenciamento de tarefas
│   ├── space-service.ts    # Gerenciamento de espaços
│   ├── list-service.ts     # Gerenciamento de listas
│   └── time-tracking.ts    # Rastreamento de tempo
├── types/
│   └── clickup.ts          # Definições TypeScript
├── utils/
│   ├── oauth.ts            # Autenticação OAuth 2.1 PKCE
│   └── logger.ts           # Utilitário de logging
└── examples/
    └── usage.ts            # Exemplos completos

.cursor/
├── mcp.json                # Configuração MCP
└── README.md               # Documentação MCP
```

## 🐛 Troubleshooting

### Erro: "Failed to get access token"

**Solução**: Verifique se completou o fluxo OAuth e os tokens estão válidos.

```typescript
// Verifique se tem tokens
if (!clickup.tokenManager.hasTokens()) {
  console.log('Você precisa autenticar primeiro!');
  console.log('Visite:', clickup.oauth.authorizationUrl);
}
```

### Erro: Rate Limit Exceeded

**Solução**: O ClickUp tem rate limits. Aguarde alguns minutos.

```typescript
// A biblioteca lida com rate limits automaticamente
// mas você pode adicionar retry logic:
const maxRetries = 3;
let attempt = 0;

while (attempt < maxRetries) {
  const result = await tasks.listTasks(listId);
  if (result.success) break;
  
  if (result.statusCode === 429) {
    await new Promise(r => setTimeout(r, 5000)); // 5 segundos
    attempt++;
  } else {
    throw new Error(result.error);
  }
}
```

### Erro: Invalid Workspace/Space ID

**Solução**: Verifique os IDs com a API:

```typescript
// Obter workspaces
const teams = await clickup.client.getWorkspaceTeams();
console.log(teams);

// Obter spaces
const spaces = await clickup.services.spaces.listSpaces('workspace_id');
console.log(spaces);
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite credenciais**:
   ```bash
   # .gitignore já inclui:
   .env
   .env.local
   *.token
   ```

2. **Use variáveis de ambiente**:
   ```typescript
   // ✅ Correto
   const clientId = process.env.CLICKUP_CLIENT_ID;
   
   // ❌ Incorreto
   const clientId = 'hardcoded-client-id';
   ```

3. **Armazene tokens de forma segura**:
   - Em desenvolvimento: variáveis de ambiente
   - Em produção: serviços de secrets (AWS Secrets Manager, etc.)

4. **Rotacione credenciais regularmente**

5. **Use HTTPS em produção** para redirect URIs

## 📖 Recursos Adicionais

- [Documentação Oficial ClickUp MCP](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [API Reference do ClickUp](https://developer.clickup.com/reference)
- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [OAuth 2.1 PKCE](https://oauth.net/2.1/)

## 💡 Dicas

1. **Desenvolvimento Local**: Use `npm run dev` para desenvolvimento com hot reload

2. **Logging**: Ajuste o nível de log no `.env`:
   ```env
   LOG_LEVEL=0  # DEBUG (mais verboso)
   LOG_LEVEL=1  # INFO (padrão)
   LOG_LEVEL=2  # WARN
   LOG_LEVEL=3  # ERROR (menos verboso)
   ```

3. **TypeScript**: Use os tipos exportados para autocomplete:
   ```typescript
   import { Task, CreateTaskParams } from './dist/types/clickup';
   ```

4. **Exemplos Completos**: Veja `src/examples/usage.ts` para workflows completos

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o [Status da API ClickUp](https://status.clickup.com/)
2. Consulte a [documentação oficial](https://developer.clickup.com/)
3. Revise os logs (ajuste `LOG_LEVEL=0` para mais detalhes)
4. Verifique o console do desenvolvedor no Cursor

---

**Desenvolvido com TypeScript e ❤️ para integração com ClickUp MCP**
