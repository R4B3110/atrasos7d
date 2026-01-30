# 🚀 Setup n8n Local + MCP - Guia Completo

Este guia vai te ajudar a configurar uma instância n8n local via Docker e integrar com o n8n-mcp para criar automações diretamente via API.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Fase 1: Subir n8n Local](#fase-1-subir-n8n-local)
3. [Fase 2: Configurar API Key](#fase-2-configurar-api-key)
4. [Fase 3: Configurar MCP](#fase-3-configurar-mcp)
5. [Fase 4: Criar Automação via MCP](#fase-4-criar-automação-via-mcp)
6. [Comandos Úteis](#comandos-úteis)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

Antes de começar, você precisa ter instalado:

- ✅ **Docker** (para rodar n8n)
- ✅ **Node.js** (qualquer versão recente)
- ✅ **Cursor IDE** (para usar o MCP)

---

## Fase 1: Subir n8n Local

### Passo 1: Iniciar o Container Docker

```bash
# No diretório do projeto
cd /Users/richardrabello/Documents/Cursor/ClickUp

# Subir o n8n
docker-compose -f docker-compose.n8n.yml up -d
```

**O que este comando faz:**
- Baixa a imagem do n8n (se ainda não tiver)
- Cria um container chamado `n8n-local`
- Expõe na porta 5678
- Cria um volume persistente (dados não perdem ao reiniciar)

### Passo 2: Verificar se está Rodando

```bash
# Ver status do container
docker ps | grep n8n

# Ver logs em tempo real
docker-compose -f docker-compose.n8n.yml logs -f
```

**Output esperado:**
```
CONTAINER ID   IMAGE              STATUS         PORTS                    NAMES
abc123...      n8nio/n8n:latest   Up 30 seconds  0.0.0.0:5678->5678/tcp   n8n-local
```

### Passo 3: Acessar n8n no Navegador

1. Abra seu navegador
2. Acesse: **http://localhost:5678**
3. Você verá a tela de boas-vindas do n8n

### Passo 4: Criar Conta de Admin

Na primeira vez que acessar, você precisará criar uma conta:

1. **Email**: Use qualquer email (não precisa ser real)
2. **Nome**: Seu nome
3. **Senha**: Crie uma senha forte
4. Clique em **"Get started"**

**⚠️ IMPORTANTE:** Anote o email e senha! Você vai precisar deles para fazer login.

---

## Fase 2: Configurar API Key

### Passo 1: Gerar API Key no n8n

1. No n8n, clique no **menu do usuário** (canto superior direito)
2. Vá em **"Settings"** → **"API"**
3. Clique em **"Create an API Key"**
4. Dê um nome: `Cursor MCP`
5. Clique em **"Create"**
6. **COPIE A KEY** (ela aparece apenas uma vez!)

**Formato da key:** `n8n_api_xxxxxxxxxxxxxxxxxxxxxxxx`

### Passo 2: Configurar a Key no MCP Server

Edite o arquivo `mcp-server/.env`:

```bash
# Abrir no editor
code mcp-server/.env

# Ou usar qualquer editor de texto
nano mcp-server/.env
```

**Substitua a linha:**
```env
N8N_API_KEY=n8n_api_YOUR_KEY_HERE
```

**Por:**
```env
N8N_API_KEY=n8n_api_sua_key_copiada_aqui
```

### Passo 3: Configurar a Key no Cursor MCP

Edite o arquivo `.cursor/mcp.json`:

```bash
code .cursor/mcp.json
```

**Substitua:**
```json
"N8N_API_KEY": "n8n_api_YOUR_KEY_HERE"
```

**Por:**
```json
"N8N_API_KEY": "n8n_api_sua_key_copiada_aqui"
```

---

## Fase 3: Configurar MCP

### Passo 1: Reiniciar Cursor

Para que o MCP seja carregado, você precisa **reiniciar o Cursor completamente**:

1. Feche todas as janelas do Cursor
2. Abra novamente o Cursor
3. Abra este projeto

### Passo 2: Verificar se o MCP está Carregado

No Cursor, você deve ver o MCP `n8n-mcp` disponível na lista de ferramentas.

**Como verificar:**
- O Cursor mostrará ferramentas disponíveis do MCP
- Você pode pedir ao Cursor: "Liste as ferramentas MCP disponíveis"

---

## Fase 4: Criar Automação via MCP

Agora que tudo está configurado, você pode pedir ao Cursor para criar a automação!

### Passo 1: Pedir para Criar o Workflow

No Cursor, envie esta mensagem:

```
Crie a automação de alertas de tarefas atrasadas do ClickUp diretamente no meu n8n local usando as ferramentas MCP. 

Requisitos:
- Listas: 192989536 e 901002328166
- Tag: "semana anterior"
- Status: STAND BY, PENDENTE, PRONTO PARA FAZER, EM PROGRESSO, EM VALIDAÇÃO, EM ALTERAÇÃO
- Threshold: > 7 dias de atraso
- Telegram Bot Token: 8519618310:AAEV-bbviNVLdlMW1FXrYZ-7bRN7CnyllTw
- Telegram Chat ID: 6892506764
- Schedule: 9h e 17h (America/Sao_Paulo)
```

### Passo 2: O Cursor vai:

1. **Buscar nodes** necessários via `search_nodes`
2. **Validar configurações** via `validate_node`
3. **Criar workflow** via `n8n_create_workflow`
4. **Validar workflow** via `n8n_validate_workflow`
5. **Retornar o ID** do workflow criado

### Passo 3: Configurar Credenciais Manualmente

Mesmo com o MCP criando o workflow, você precisa configurar as credenciais manualmente no n8n:

#### ClickUp API Token

1. No n8n, vá em **Settings** → **Credentials**
2. Clique em **"Add Credential"**
3. Busque por **"HTTP Request"** ou **"Generic Credential"**
4. Configure:
   - **Nome**: `ClickUp API`
   - **Tipo**: Generic Credential
   - **Header**: `Authorization`
   - **Valor**: `seu_clickup_api_token`
5. Salve

#### Telegram Bot (Já está configurado no código)

O token do Telegram está hardcoded no workflow, mas se quiser usar credenciais:

1. Settings → Credentials → Add Credential
2. Tipo: Generic Credential
3. Nome: `Telegram Bot`
4. Valor: `8519618310:AAEV-bbviNVLdlMW1FXrYZ-7bRN7CnyllTw`

### Passo 4: Ativar o Workflow

1. No n8n, vá em **Workflows**
2. Encontre o workflow criado (ex: "ClickUp Alertas Atrasadas")
3. Clique no **toggle** para ativar (verde)
4. Clique em **"Save"**

### Passo 5: Testar Manualmente

1. No workflow, clique em **"Execute Workflow"** (botão de play)
2. Verifique os logs de execução
3. Confira se recebeu o alerta no Telegram (se houver tarefas atrasadas)

---

## 📱 Comandos Úteis

### Docker

```bash
# Iniciar n8n
docker-compose -f docker-compose.n8n.yml up -d

# Parar n8n
docker-compose -f docker-compose.n8n.yml down

# Ver logs em tempo real
docker-compose -f docker-compose.n8n.yml logs -f

# Reiniciar n8n
docker-compose -f docker-compose.n8n.yml restart

# Remover container E dados (⚠️ CUIDADO!)
docker-compose -f docker-compose.n8n.yml down -v

# Ver status
docker ps | grep n8n

# Entrar no container (debug)
docker exec -it n8n-local sh
```

### MCP Server

```bash
# Testar MCP localmente (modo standalone)
cd mcp-server
npm start

# Rebuild se modificar algo
cd mcp-server
npm run build

# Atualizar n8n-mcp para versão mais recente
cd mcp-server
git pull
npm install
npm run build
```

### n8n API (via curl)

```bash
# Testar conexão
curl http://localhost:5678/healthz

# Listar workflows
curl -H "X-N8N-API-KEY: sua_api_key" http://localhost:5678/api/v1/workflows

# Ver workflow específico
curl -H "X-N8N-API-KEY: sua_api_key" http://localhost:5678/api/v1/workflows/ID

# Listar execuções
curl -H "X-N8N-API-KEY: sua_api_key" http://localhost:5678/api/v1/executions
```

---

## 🔍 Troubleshooting

### ❌ Erro: "n8n não inicia"

**Problema:** Container não sobe ou fica reiniciando

**Soluções:**

```bash
# 1. Ver logs detalhados
docker-compose -f docker-compose.n8n.yml logs

# 2. Verificar se porta 5678 está em uso
lsof -i :5678

# Se estiver, matar o processo:
kill -9 <PID>

# 3. Limpar e reiniciar
docker-compose -f docker-compose.n8n.yml down
docker-compose -f docker-compose.n8n.yml up -d
```

### ❌ Erro: "Cannot connect to Docker daemon"

**Problema:** Docker não está rodando

**Solução:**
- **macOS:** Abra Docker Desktop
- **Linux:** `sudo systemctl start docker`
- **Windows:** Abra Docker Desktop

### ❌ Erro: "MCP não encontrado no Cursor"

**Problema:** MCP não foi carregado

**Soluções:**

1. **Verificar arquivo de config:**
```bash
cat .cursor/mcp.json
```

2. **Verificar se o path está correto:**
```bash
ls -la mcp-server/dist/mcp/index.js
```

3. **Reiniciar Cursor completamente:**
   - Fechar TODAS as janelas
   - Reabrir

4. **Verificar se o build foi feito:**
```bash
cd mcp-server
npm run build
```

### ❌ Erro: "API Key inválida"

**Problema:** Credenciais incorretas

**Soluções:**

1. **Verificar API key no n8n:**
   - Settings → API
   - Verifique se a key está ativa

2. **Recriar API key:**
   - Delete a key antiga
   - Crie uma nova
   - Atualize em `mcp-server/.env` E `.cursor/mcp.json`
   - Reinicie o Cursor

3. **Verificar formato:**
   - Deve começar com `n8n_api_`
   - Sem espaços extras
   - Sem aspas

### ❌ Erro: "Workflow criado mas não executa"

**Problema:** Workflow não está ativo ou credenciais faltando

**Soluções:**

1. **Verificar se está ativo:**
   - No n8n, ver se o toggle está verde
   - Clicar em "Save" após ativar

2. **Verificar credenciais:**
   - Settings → Credentials
   - Confirmar que `ClickUp API` está configurado
   - Testar a credencial clicando em "Test"

3. **Ver execuções:**
   - No n8n: Executions
   - Ver logs de erro
   - Corrigir o que for necessário

### ❌ Erro: "ECONNREFUSED localhost:5678"

**Problema:** n8n não está acessível

**Soluções:**

```bash
# Verificar se está rodando
docker ps | grep n8n

# Se não estiver, iniciar
docker-compose -f docker-compose.n8n.yml up -d

# Verificar health check
curl http://localhost:5678/healthz
```

### ❌ Erro: "Telegram não recebe mensagens"

**Problema:** Bot Token ou Chat ID incorretos

**Soluções:**

1. **Testar bot manualmente:**
```bash
curl -X POST "https://api.telegram.org/bot8519618310:AAEV-bbviNVLdlMW1FXrYZ-7bRN7CnyllTw/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "6892506764", "text": "Teste"}'
```

2. **Verificar Chat ID:**
   - Envie `/start` para o bot no Telegram
   - Acesse: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Copie o `chat.id` correto

---

## 💡 Dicas

### Desenvolvimento

1. **Sempre salve workflows** antes de testar
2. **Use execuções manuais** para debug
3. **Verifique logs** no n8n (Executions)
4. **Teste nodes individualmente** antes do workflow completo

### Produção

1. **Backup regular** dos workflows:
```bash
docker exec n8n-local n8n export:workflow --all --output=/home/node/.n8n/backup.json
```

2. **Monitorar execuções** periodicamente
3. **Configurar alertas** de erro no n8n (Settings → Notifications)

### Segurança

1. **Nunca commitar** `.env` ou `mcp.json` com keys reais
2. **Use .gitignore** (já configurado)
3. **Mantenha Docker atualizado**
4. **Não exponha porta 5678** externamente

---

## 📊 Estatísticas

Com este setup você tem:

- **Custo**: $0/mês (100% local)
- **Controle**: Total sobre os dados
- **Performance**: Execução local rápida
- **Escalabilidade**: Pode rodar 24/7 se deixar Docker ligado
- **Flexibilidade**: Modificar workflows via interface OU via MCP

---

## 🎯 Próximos Passos

Após finalizar o setup:

1. ✅ Teste a automação manualmente
2. ✅ Verifique alertas no Telegram
3. ✅ Monitore execuções nos próximos dias
4. ✅ Ajuste horários/filtros conforme necessário
5. ✅ Explore outras automações possíveis!

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique a seção [Troubleshooting](#troubleshooting)
2. Consulte a [documentação oficial do n8n](https://docs.n8n.io)
3. Verifique [logs do Docker](#docker)
4. Teste o [MCP standalone](#mcp-server)

---

**🎉 Setup completo! Agora você pode criar automações diretamente via MCP!**
