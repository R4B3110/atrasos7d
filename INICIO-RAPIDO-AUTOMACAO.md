# 🚀 Início Rápido - Automação de Alertas

## ✅ O que já está pronto:

- ✅ Código da automação completo
- ✅ IDs das listas configurados (192989536 e 901002328166)
- ✅ API Token do ClickUp configurado
- ✅ Tag "semana anterior" configurada
- ✅ Status monitorados configurados
- ✅ Threshold de 7 dias configurado

## 🎯 O que você precisa fazer AGORA:

### 1. Criar Bot do Telegram (5 minutos)

**Passo 1**: Abra o Telegram e procure por: `@BotFather`

**Passo 2**: Envie: `/newbot`

**Passo 3**: Escolha um nome (ex: "ClickUp Alertas")

**Passo 4**: Escolha um username (ex: "meubotclickup_bot")

**Passo 5**: **COPIE O TOKEN** que aparecer (algo como `123456789:ABCdef...`)

### 2. Obter seu Chat ID (2 minutos)

**Passo 1**: Envie qualquer mensagem para seu bot (ex: "teste")

**Passo 2**: Abra no navegador (substitua SEU_TOKEN pelo token do bot):
```
https://api.telegram.org/botSEU_TOKEN/getUpdates
```

**Passo 3**: Procure por `"chat":{"id":` e **COPIE O NÚMERO**

Exemplo: se aparecer `"chat":{"id":123456789`, copie `123456789`

### 3. Configurar o .env (1 minuto)

Edite o arquivo `.env` e preencha **APENAS** estas linhas:

```env
TELEGRAM_BOT_TOKEN=cole_seu_token_aqui
TELEGRAM_CHAT_ID=cole_seu_chat_id_aqui
```

**O resto já está configurado!**

### 4. Testar (2 minutos)

Execute:

```bash
npm run test:telegram
```

Se funcionar, você verá:
- ✅ Mensagem de teste no Telegram
- ✅ Exemplo de alerta formatado

### 5. Testar Verificação (1 minuto)

Execute:

```bash
npm run test:monitor
```

Vai mostrar:
- Quantas tarefas foram encontradas
- Quais tarefas estão atrasadas
- **NÃO envia** no Telegram (apenas mostra)

### 6. Executar pela Primeira Vez (30 segundos)

```bash
npm run monitor
```

Se houver tarefas atrasadas, você receberá o alerta no Telegram! 🎉

### 7. Deixar Rodando Automaticamente

#### Opção A: Terminal Aberto

```bash
npm run monitor:watch
```

Deixe o terminal aberto. Vai executar às 9h e 17h automaticamente.

#### Opção B: PM2 (Recomendado para servidor)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start src/automation/scheduler.js --name clickup-monitor

# Ver status
pm2 status

# Ver logs
pm2 logs
```

---

## 🎉 Pronto!

A automação está funcionando. Você receberá alertas no Telegram às **9h** e **17h** sempre que houver tarefas atrasadas.

---

## 📋 Comandos Úteis

```bash
# Ver se tem tarefas atrasadas AGORA (envia no Telegram)
npm run monitor

# Ver estatísticas (NÃO envia no Telegram)
npm run monitor:stats

# Testar Telegram
npm run test:telegram

# Testar verificação (NÃO envia no Telegram)
npm run test:monitor
```

---

## ⚙️ Personalizar Horários

Edite no `.env`:

```env
# Formato: minuto hora * * *
CRON_SCHEDULE_MORNING=0 8 * * *     # 8h da manhã
CRON_SCHEDULE_AFTERNOON=0 18 * * *  # 18h da tarde
```

---

## 🐛 Problemas?

### "Bot Token não configurado"
→ Verifique se copiou o token corretamente no `.env`

### "Chat ID não configurado"  
→ Certifique-se de enviar uma mensagem para o bot antes de pegar o Chat ID

### "Nenhuma tarefa encontrada"
→ Verifique se os IDs das listas estão corretos no `.env`

### Não recebe mensagens
→ Execute `npm run test:telegram` para verificar

---

## 📖 Documentação Completa

Para mais detalhes, veja: `AUTOMACAO-README.md`

---

**Tempo total de configuração: ~10 minutos** ⏱️
