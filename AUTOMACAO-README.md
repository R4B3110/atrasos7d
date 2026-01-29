# 🤖 Automação de Alertas ClickUp

Sistema automatizado que monitora tarefas atrasadas no ClickUp e envia alertas via Telegram.

## 📋 O que faz?

Verifica automaticamente **2 vezes por dia** (manhã e tarde) se existem tarefas atrasadas e envia um alerta no Telegram.

### Critérios de Tarefa Atrasada

Uma tarefa é considerada atrasada quando **TODOS** esses critérios são verdadeiros:

1. ✅ Está em uma das listas monitoradas
2. ✅ Possui a tag **"semana anterior"**
3. ✅ O **Due Date** foi há mais de **7 dias**
4. ✅ O status é um desses:
   - STAND BY
   - PENDENTE
   - PRONTO PARA FAZER
   - EM PROGRESSO
   - EM VALIDAÇÃO
   - EM ALTERAÇÃO

## 🚀 Configuração Rápida

### 1️⃣ Criar Bot do Telegram

1. Abra o Telegram e procure por: **@BotFather**
2. Envie o comando: `/newbot`
3. Escolha um nome e username para o bot
4. **Copie o Bot Token** que o BotFather fornecer

### 2️⃣ Obter Chat ID

1. Envie uma mensagem qualquer para seu novo bot
2. Acesse no navegador (substitua SEU_TOKEN):
   ```
   https://api.telegram.org/botSEU_TOKEN/getUpdates
   ```
3. Procure por `"chat":{"id":` e copie o número

### 3️⃣ Configurar .env

Edite o arquivo `.env` e preencha:

```env
# Bot Telegram
TELEGRAM_BOT_TOKEN=seu_bot_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui

# ClickUp - Já configurado!
CLICKUP_LIST_ID_1=192989536
CLICKUP_LIST_ID_2=901002328166
CLICKUP_TAG_NAME=semana anterior
ALERT_DAYS_THRESHOLD=7

# Horários (já configurado: 9h e 17h)
CRON_SCHEDULE_MORNING=0 9 * * *
CRON_SCHEDULE_AFTERNOON=0 17 * * *
```

## 🧪 Testar a Configuração

### Teste 1: Bot do Telegram

```bash
npm run test:telegram
```

Este comando vai:
- Verificar se o bot está configurado
- Enviar uma mensagem de teste
- Enviar um exemplo de alerta

### Teste 2: Verificação de Tarefas

```bash
npm run test:monitor
```

Este comando vai:
- Buscar tarefas do ClickUp
- Mostrar quais tarefas seriam alertadas
- **NÃO envia** mensagem no Telegram (apenas mostra)

### Teste 3: Executar Verificação Completa

```bash
npm run monitor
```

Este comando vai:
- Buscar tarefas atrasadas
- **Enviar alerta no Telegram** se houver tarefas atrasadas

## 🏃 Executar a Automação

### Modo Agendado (Recomendado)

Para rodar automaticamente 2x por dia:

```bash
npm run monitor:watch
```

Este comando vai:
- ✅ Agendar verificação às **9h** (manhã)
- ✅ Agendar verificação às **17h** (tarde)
- ✅ Manter rodando continuamente
- ✅ Executar uma verificação inicial imediatamente

**Mantenha o terminal aberto** ou use PM2 (veja abaixo).

### Modo Manual

Para executar uma única vez:

```bash
npm run monitor
```

## 📊 Ver Estatísticas

Para ver estatísticas das tarefas sem enviar alerta:

```bash
npm run monitor:stats
```

Mostra:
- Total de tarefas
- Tarefas com a tag "semana anterior"
- Tarefas atrasadas
- Distribuição por status

## 🔄 Manter Rodando Sempre (Produção)

### Opção 1: PM2 (Recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar automação
pm2 start src/automation/scheduler.js --name clickup-monitor

# Ver status
pm2 status

# Ver logs
pm2 logs clickup-monitor

# Parar
pm2 stop clickup-monitor

# Reiniciar
pm2 restart clickup-monitor

# Auto-start no boot do sistema
pm2 startup
pm2 save
```

### Opção 2: Screen/Tmux

```bash
# Com screen
screen -S clickup
npm run monitor:watch
# Pressione Ctrl+A depois D para sair

# Voltar ao screen
screen -r clickup

# Com tmux
tmux new -s clickup
npm run monitor:watch
# Pressione Ctrl+B depois D para sair

# Voltar ao tmux
tmux attach -t clickup
```

## 📱 Formato da Mensagem

Quando há tarefas atrasadas, você recebe no Telegram:

```
🚨 ALERTA: Tarefas Atrasadas

━━━━━━━━━━━━━━━━━━━━━

1️⃣ Nome da Tarefa
👤 João Silva
📅 Prazo: 15/01/2026 (14 dias atrás)
📊 Status: EM PROGRESSO
🔗 [Abrir tarefa](link)

2️⃣ Outra Tarefa
👤 Maria Santos
📅 Prazo: 18/01/2026 (11 dias atrás)
📊 Status: EM VALIDAÇÃO
🔗 [Abrir tarefa](link)

━━━━━━━━━━━━━━━━━━━━━
Total: 2 tarefas atrasadas
Verificado em: 29/01/2026 09:00
```

## ⚙️ Personalização

### Alterar Horários

Edite no `.env`:

```env
# Formato: minuto hora * * *
# Exemplos:
CRON_SCHEDULE_MORNING=0 8 * * *     # 8h
CRON_SCHEDULE_AFTERNOON=0 18 * * *  # 18h
CRON_SCHEDULE_MORNING=30 9 * * *    # 9h30
```

### Alterar Threshold de Dias

```env
# Alertar após X dias
ALERT_DAYS_THRESHOLD=7   # Padrão: 7 dias
ALERT_DAYS_THRESHOLD=5   # Mais rígido: 5 dias
ALERT_DAYS_THRESHOLD=10  # Mais tolerante: 10 dias
```

### Alterar Status Monitorados

```env
# Adicionar ou remover status (separados por vírgula)
CLICKUP_ALERT_STATUSES=STAND BY,PENDENTE,EM PROGRESSO
```

### Adicionar Mais Listas

Edite `src/automation/task-checker.js` e adicione mais IDs:

```javascript
this.listIds = [
  process.env.CLICKUP_LIST_ID_1,
  process.env.CLICKUP_LIST_ID_2,
  process.env.CLICKUP_LIST_ID_3,  // Adicionar
  // ...
].filter(Boolean);
```

E no `.env`:

```env
CLICKUP_LIST_ID_3=seu_novo_id
```

## 🐛 Troubleshooting

### Erro: "TELEGRAM_BOT_TOKEN não configurado"

- Verifique se editou o `.env` corretamente
- O token deve começar com números seguidos de `:` (ex: `123456789:ABC...`)

### Erro: "CLICKUP_API_TOKEN não configurado"

- Execute: `node test-api-token.js` para configurar o token

### Erro: "Failed to send message"

- Verifique se o Chat ID está correto
- Certifique-se de que enviou pelo menos uma mensagem para o bot antes

### Nenhuma tarefa encontrada

- Verifique se os IDs das listas estão corretos
- Execute: `npm run test:monitor` para ver detalhes

### Tarefas não são detectadas como atrasadas

- Verifique se a tag "semana anterior" está escrita exatamente assim
- Verifique se o due date está configurado nas tarefas
- Execute: `npm run monitor:stats` para ver estatísticas

## 📂 Arquivos da Automação

```
src/automation/
├── monitor.js          # Script principal
├── scheduler.js        # Agendador (cron)
├── task-checker.js     # Lógica de verificação
├── telegram-bot.js     # Envio de mensagens
├── test-telegram.js    # Teste do Telegram
└── test-monitor.js     # Teste de verificação
```

## 🔒 Segurança

- ✅ Tokens armazenados apenas no `.env` (não commitados)
- ✅ Bot com permissões mínimas (apenas envio)
- ✅ Sem acesso a outras conversas do Telegram
- ✅ API Token do ClickUp protegido

## 📝 Comandos Úteis

```bash
# Testes
npm run test:telegram     # Testar Telegram
npm run test:monitor      # Testar verificação (sem enviar)
npm run test:all          # Todos os testes

# Execução
npm run monitor           # Executar uma vez
npm run monitor:watch     # Executar continuamente
npm run monitor:stats     # Ver estatísticas

# Desenvolvimento
npm run build             # Build TypeScript
npm run dev               # Modo desenvolvimento
```

## 💡 Dicas

1. **Primeira vez**: Execute `npm run test:all` para garantir que tudo está configurado
2. **Testar horários**: Use `npm run monitor` manualmente antes de deixar agendado
3. **Monitorar logs**: Use PM2 ou veja o terminal para acompanhar execuções
4. **Silenciar temporariamente**: Pare o scheduler com `Ctrl+C` ou `pm2 stop`

## 🆘 Suporte

Se encontrar problemas:

1. Execute os testes: `npm run test:all`
2. Verifique o `.env` está configurado corretamente
3. Veja os logs com `pm2 logs` (se usando PM2)
4. Execute `npm run monitor:stats` para diagnóstico

---

**Desenvolvido para monitoramento automatizado de tarefas ClickUp** 🚀
