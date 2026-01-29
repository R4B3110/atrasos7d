# ClickUp MCP Integration

Projeto TypeScript para integração com o servidor MCP (Model Context Protocol) oficial do ClickUp.

## Funcionalidades

- ✅ Gerenciamento completo de tarefas (criar, listar, atualizar)
- ✅ Navegação em espaços e listas
- ✅ Rastreamento de tempo (timers e logs)
- ✅ Busca em documentos e comentários
- ✅ Autenticação OAuth 2.1 com PKCE
- ✅ Integração nativa com Cursor IDE

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

## Recursos

- [Documentação oficial ClickUp MCP](https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server)
- [MCP Tools disponíveis](https://developer.clickup.com/docs/mcp-tools)
- [ClickUp API Reference](https://developer.clickup.com/reference)
- [OAuth ClickUp](https://developer.clickup.com/docs/oauth)

## Licença

MIT
