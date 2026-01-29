# 🚀 Guia Rápido - Conectar sua Conta ClickUp

## Siga estes 3 passos simples:

### **1️⃣ Configure suas credenciais**

```bash
node auth-setup.js
```

O script vai perguntar:
- **Client ID** - você pega em https://app.clickup.com/settings/apps
- **Client Secret** - você pega no mesmo lugar
- **Workspace ID** - você pode pegar da URL do ClickUp ou deixar em branco (descobriremos depois)

---

### **2️⃣ Autentique sua conta**

```bash
node auth-server.js
```

Depois:
1. Abra seu navegador em: **http://localhost:3000/auth**
2. Você será redirecionado para o ClickUp
3. Clique em **"Authorize"** para autorizar o app
4. Pronto! O terminal mostrará todos os seus IDs

---

### **3️⃣ Teste a conexão**

```bash
node test-connection.js
```

Este comando vai verificar se está tudo funcionando!

---

## 📋 Detalhes do Passo 1: Criar App no ClickUp

Antes de executar `node auth-setup.js`, você precisa:

1. Ir para: https://app.clickup.com/settings/apps
2. Clicar em **"Create an App"**
3. Preencher:
   - **App Name**: "MCP Integration" (ou qualquer nome)
   - **Redirect URL(s)**: `http://localhost:3000/callback`
4. Clicar em **"Create App"**
5. Copiar o **Client ID** e **Client Secret**

---

## ✅ Depois de autenticado, você pode:

### Opção A: Usar via código TypeScript

```bash
npm run dev
```

### Opção B: Integrar com Cursor IDE

1. Edite `.cursor/mcp.json` com seus IDs
2. Reinicie o Cursor
3. Use comandos em linguagem natural!

---

## 🆘 Problemas?

### Erro: "Cannot find module"
```bash
npm install
```

### Erro: "Client ID invalid"
Verifique se copiou corretamente do ClickUp

### Erro: "Redirect URI mismatch"
Certifique-se de que o Redirect URL no ClickUp é: `http://localhost:3000/callback`

---

## 🎯 Comandos Úteis

```bash
# Ver exemplo de configuração
cat .env.example

# Editar configuração manualmente
nano .env

# Testar conexão
node test-connection.js

# Executar exemplos
npm run dev
```

---

**Pronto! Qualquer dúvida, consulte o SETUP.md para mais detalhes.**
