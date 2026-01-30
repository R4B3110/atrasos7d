# 🚀 Guia Completo: Configurar Automação no n8n

Este guia vai te ajudar a configurar a automação de alertas de tarefas atrasadas do ClickUp usando o n8n Cloud (100% gratuito!).

---

## 📋 Índice

1. [O que é n8n?](#o-que-é-n8n)
2. [Criar conta no n8n Cloud](#criar-conta-no-n8n-cloud)
3. [Importar o workflow](#importar-o-workflow)
4. [Configurar credenciais](#configurar-credenciais)
5. [Testar o workflow](#testar-o-workflow)
6. [Ativar a automação](#ativar-a-automação)
7. [Monitorar execuções](#monitorar-execuções)
8. [Troubleshooting](#troubleshooting)

---

## 🤔 O que é n8n?

n8n é uma plataforma de automação de workflows (tipo Zapier, mas open-source) que permite conectar diferentes aplicativos e criar automações complexas de forma visual.

**Por que usar n8n para esta automação?**

✅ **Gratuito**: Plano free com 5.000 execuções/mês (precisamos de ~60/mês)  
✅ **Visual**: Arrastar e soltar, sem precisar programar  
✅ **Integrações nativas**: ClickUp + Telegram já prontos  
✅ **Cloud**: Roda 24/7 sem precisar de servidor próprio  
✅ **Fácil de modificar**: Alterar horários, adicionar listas, etc. em segundos  

---

## 1️⃣ Criar Conta no n8n Cloud

### Passo 1: Acessar n8n.io

1. Abra seu navegador e acesse: **https://n8n.io**
2. Clique em **"Get Started for Free"** (canto superior direito)

### Passo 2: Criar conta

Você pode criar conta usando:
- ✉️ **Email + Senha**
- 🔗 **GitHub**
- 🔗 **Google**

**Recomendação**: Use Google ou GitHub para login mais rápido.

### Passo 3: Verificar email (se necessário)

Se você escolheu email, verifique sua caixa de entrada para ativar a conta.

### Passo 4: Escolher região

Quando perguntado, escolha:
- **Region**: `US` ou `EU` (qualquer uma funciona, mas US é mais rápido para Brasil)

### Passo 5: Pular tour (opcional)

Você pode pular o tour inicial clicando em "Skip tour" - vamos direto ao que interessa!

---

## 2️⃣ Importar o Workflow

### Passo 1: Acessar área de workflows

1. No dashboard do n8n, clique em **"Workflows"** no menu lateral
2. Clique em **"+ Add workflow"** (botão azul no canto superior direito)

### Passo 2: Importar o JSON

1. Na tela do workflow em branco, clique no **menu de três pontos** (⋮) no canto superior direito
2. Selecione **"Import from File"**
3. Navegue até o arquivo `workflows/clickup-alertas-n8n.json` (que foi criado neste projeto)
4. Clique em **"Open"** ou **"Abrir"**

### Passo 3: Verificar importação

Você deve ver algo assim:

```
[Schedule Trigger] → [ClickUp Lista 1]
                   → [ClickUp Lista 2]
                            ↓
                        [Merge]
                            ↓
                   [Filter Atrasadas]
                            ↓
                     [IF Tem Tarefas?]
                       ↙          ↘
              [Format Message]   [No Op]
                       ↓
              [Send Telegram]
```

Se os nodes aparecerem, a importação foi bem-sucedida! ✅

---

## 3️⃣ Configurar Credenciais

Agora precisamos conectar suas contas do ClickUp e Telegram.

### 🔧 Configurar ClickUp

#### Passo 1: Obter seu API Token do ClickUp

1. Acesse: **https://app.clickup.com/settings/apps**
2. Role até a seção **"API Token"**
3. Clique em **"Generate"** (ou copie se já tiver um)
4. **COPIE O TOKEN** (você só verá ele uma vez!)

#### Passo 2: Adicionar credencial no n8n

1. No workflow, clique no node **"ClickUp - Lista 1"**
2. No painel direito, encontre o campo **"Credential to connect with"**
3. Clique em **"Create New Credential"**
4. Escolha o método: **"Access Token"**
5. Cole seu token do ClickUp no campo **"Access Token"**
6. Dê um nome: `ClickUp API` (ou qualquer nome que preferir)
7. Clique em **"Create"**

#### Passo 3: Aplicar para o node Lista 2

1. Clique no node **"ClickUp - Lista 2"**
2. No campo "Credential to connect with", selecione a credencial que você acabou de criar: **"ClickUp API"**

### 📱 Configurar Telegram

#### Passo 1: Você já tem o Bot Token

Do nosso setup anterior:
```
Bot Token: 8519618310:AAEV-bbviNVLdlMW1FXrYZ-7bRN7CnyllTw
Chat ID: 6892506764
```

#### Passo 2: Adicionar credencial no n8n

1. No workflow, clique no node **"Telegram: Enviar Alerta"**
2. No campo **"Credential to connect with"**, clique em **"Create New Credential"**
3. Escolha **"Telegram API"**
4. Cole o **Bot Token** no campo **"Access Token"**
5. Dê um nome: `Telegram Bot` (ou qualquer nome)
6. Clique em **"Create"**

---

## 4️⃣ Testar o Workflow

Antes de ativar, vamos testar se tudo está funcionando!

### Teste Manual

1. No topo do workflow, clique no botão **"Execute Workflow"** (▶️ ícone de play)
2. Aguarde alguns segundos...
3. Verifique os resultados:

#### ✅ Teste bem-sucedido:

Você verá:
- ✅ **ClickUp - Lista 1**: Mostra X tarefas recuperadas
- ✅ **ClickUp - Lista 2**: Mostra Y tarefas recuperadas
- ✅ **Merge**: Mostra X+Y tarefas combinadas
- ✅ **Filter Atrasadas**: Mostra tarefas filtradas
- ✅ **IF Tem Tarefas?**: Seguiu pelo caminho TRUE ou FALSE
- ✅ **Telegram** (se houver tarefas): Enviou mensagem

#### ⚠️ Se algo der errado:

Verifique:
1. **Erro no ClickUp node**: Token está correto? IDs das listas estão corretos?
2. **Erro no Telegram node**: Bot Token está correto? Chat ID está correto?
3. **Nenhuma tarefa encontrada**: Normal se não houver tarefas atrasadas!

### Teste com Dados Reais

Se quiser forçar um teste:

1. Vá no ClickUp e adicione a tag `semana anterior` em uma tarefa de teste
2. Altere o `due_date` dela para 10 dias atrás (manualmente via API ou automação)
3. Rode o workflow novamente
4. Você deve receber um alerta no Telegram! 📱

---

## 5️⃣ Ativar a Automação

Agora que testamos e está tudo funcionando, vamos ativar!

### Passo 1: Salvar o workflow

1. Clique no botão **"Save"** (💾) no canto superior direito
2. Dê um nome ao workflow: `ClickUp - Alertas Atrasadas` (ou qualquer nome)

### Passo 2: Ativar

1. No topo da tela, encontre o toggle **"Inactive" / "Active"**
2. Clique para mudar para **"Active"** (deve ficar verde ✅)

### Passo 3: Confirmar horários

O workflow está configurado para rodar:
- 🌅 **9h da manhã** (0 9 * * *)
- 🌆 **5h da tarde** (0 17 * * *)

Timezone: **America/Sao_Paulo** (horário de Brasília)

---

## 6️⃣ Monitorar Execuções

### Ver histórico de execuções

1. Clique em **"Executions"** no menu lateral esquerdo
2. Você verá todas as execuções do workflow:
   - ✅ **Success**: Executou com sucesso
   - ❌ **Error**: Teve algum erro
   - ⏸️ **Waiting**: Aguardando algo

### Ver detalhes de uma execução

1. Clique em qualquer execução da lista
2. Você verá o fluxo completo com os dados que passaram por cada node
3. Útil para debug!

### Receber alertas de erro por email

n8n envia automaticamente emails se um workflow falhar. Verifique sua caixa de entrada!

---

## 7️⃣ Modificar a Automação

### Alterar horários

1. Clique no node **"Schedule: 9h e 17h"**
2. Modifique as expressões cron:
   - `0 9 * * *` = 9h da manhã
   - `0 17 * * *` = 5h da tarde
   - `0 12 * * *` = meio-dia
   - `0 0 * * *` = meia-noite
3. Use https://crontab.guru para ajudar com expressões cron

### Adicionar mais listas

1. Clique com botão direito no canvas
2. Adicione um novo node **"ClickUp"**
3. Configure com o novo List ID
4. Conecte ao node **"Merge"**
5. Salve!

### Alterar número de dias (threshold)

1. Clique no node **"Code: Filtrar Atrasadas"**
2. Encontre a linha: `const DAYS_THRESHOLD = 7;`
3. Altere para o número desejado (ex: `10` para 10 dias)
4. Salve!

### Alterar statuses monitorados

1. Clique no node **"Code: Filtrar Atrasadas"**
2. Encontre o array `STATUSES_ALERTAR`
3. Adicione ou remova statuses (em MAIÚSCULAS)
4. Salve!

---

## 8️⃣ Troubleshooting

### ❌ "ClickUp: The request failed with error code 401"

**Problema**: Token do ClickUp inválido ou expirado

**Solução**:
1. Vá em https://app.clickup.com/settings/apps
2. Gere um novo token
3. Atualize a credencial no n8n (Settings → Credentials → ClickUp API → Edit)

### ❌ "Telegram: Bad Request: chat not found"

**Problema**: Chat ID incorreto

**Solução**:
1. Verifique o Chat ID: `6892506764`
2. Certifique-se de ter enviado pelo menos 1 mensagem para o bot primeiro
3. Use https://api.telegram.org/bot<TOKEN>/getUpdates para confirmar o Chat ID

### ❌ Workflow não está executando nos horários

**Problema**: Timezone incorreto ou workflow não está ativo

**Solução**:
1. Verifique se o toggle está **"Active"** (verde)
2. Clique no node Schedule e confirme timezone: `America/Sao_Paulo`
3. Aguarde até o próximo horário agendado

### ❌ "No items to process"

**Problema**: Nenhuma tarefa atrasada encontrada (isso é bom!)

**Solução**: Isso é normal se não houver tarefas atrasadas. Não é um erro!

### ❌ Workflow falhou com "Execution timed out"

**Problema**: Muitas tarefas para processar (>100 por lista)

**Solução**:
1. No node ClickUp, aumente o **"Limit"** para 200 ou 500
2. Ou adicione paginação (mais avançado)

---

## 📊 Estatísticas Esperadas

Com este workflow, você terá:

- **Execuções/mês**: ~60 (2x por dia × 30 dias)
- **Uso do plano gratuito**: ~1,2% (60 de 5.000 execuções)
- **Tempo médio de execução**: 5-10 segundos
- **Custo**: $0/mês 💰

---

## 🎯 Próximos Passos

Agora que sua automação está rodando:

1. ✅ Monitore os alertas no Telegram nos próximos dias
2. ✅ Verifique o dashboard de execuções no n8n
3. ✅ Ajuste os horários/configurações conforme necessário
4. ✅ Compartilhe com o time se funcionar bem!

---

## 🆘 Precisa de Ajuda?

- **Documentação oficial n8n**: https://docs.n8n.io
- **Fórum da comunidade**: https://community.n8n.io
- **ClickUp API Docs**: https://clickup.com/api

---

## ✨ Recursos Extras

### Webhook para teste manual

Você pode adicionar um **Webhook node** no início do workflow para poder testar manualmente a qualquer momento:

1. Adicione um novo trigger: **"Webhook"**
2. Configure como **"GET"** ou **"POST"**
3. Copie a URL gerada
4. Acesse a URL no navegador para disparar o workflow instantaneamente!

### Notificações por email

Além do Telegram, você pode adicionar um **"Send Email"** node para receber alertas também por email.

### Dashboard visual

Você pode conectar o n8n com ferramentas como **Google Sheets** ou **Notion** para criar dashboards das tarefas atrasadas.

---

**🎉 Parabéns! Sua automação está rodando 24/7 na nuvem!**
