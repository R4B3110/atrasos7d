/**
 * Teste de Telegram Bot
 * Valida se o bot está configurado corretamente
 */

require('dotenv').config();
const TelegramNotifier = require('./telegram-bot');

async function testTelegramBot() {
  console.log('\n🧪 Teste do Bot Telegram\n');
  console.log('═'.repeat(60));

  try {
    // Verificar variáveis de ambiente
    console.log('\n1️⃣ Verificando configuração...\n');
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || botToken === 'seu_bot_token_aqui') {
      console.log('❌ TELEGRAM_BOT_TOKEN não configurado no .env');
      console.log('\n💡 Passos para configurar:');
      console.log('   1. Abra o Telegram e procure por @BotFather');
      console.log('   2. Envie: /newbot');
      console.log('   3. Siga as instruções e copie o token');
      console.log('   4. Adicione no .env: TELEGRAM_BOT_TOKEN=seu_token\n');
      process.exit(1);
    }

    if (!chatId || chatId === 'seu_chat_id_aqui') {
      console.log('❌ TELEGRAM_CHAT_ID não configurado no .env');
      console.log('\n💡 Passos para obter o Chat ID:');
      console.log('   1. Envie uma mensagem para seu bot no Telegram');
      console.log(`   2. Acesse: https://api.telegram.org/bot${botToken.substring(0, 20)}..../getUpdates`);
      console.log('   3. Copie o valor de "chat":{"id": XXXXXX}');
      console.log('   4. Adicione no .env: TELEGRAM_CHAT_ID=seu_chat_id\n');
      process.exit(1);
    }

    console.log('✓ Bot Token: Configurado');
    console.log('✓ Chat ID: Configurado');

    // Criar instância do notifier
    console.log('\n2️⃣ Criando instância do bot...\n');
    const telegram = new TelegramNotifier();
    console.log('✓ Bot criado com sucesso');

    // Enviar mensagem de teste
    console.log('\n3️⃣ Enviando mensagem de teste...\n');
    const result = await telegram.sendTestMessage();

    if (result.success) {
      console.log('✅ TESTE BEM-SUCEDIDO!');
      console.log('\n✓ O bot está configurado corretamente');
      console.log('✓ Mensagem enviada para o Telegram');
      console.log('\n💡 Verifique seu Telegram para ver a mensagem\n');
    } else {
      console.log('❌ TESTE FALHOU');
      console.log(`\nErro: ${result.error}\n`);
      process.exit(1);
    }

    // Testar mensagem com tarefas simuladas
    console.log('4️⃣ Testando formato de alerta...\n');
    
    const mockTasks = [
      {
        id: 'test123',
        name: 'Tarefa de Teste - Criar post para Instagram',
        due_date: String(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        status: { status: 'EM PROGRESSO' },
        assignees: [{ username: 'João Silva' }],
        url: 'https://app.clickup.com/t/test123',
        tags: [{ name: 'semana anterior' }]
      },
      {
        id: 'test456',
        name: 'Tarefa de Teste - Revisar campanha',
        due_date: String(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 dias atrás
        status: { status: 'EM VALIDAÇÃO' },
        assignees: [{ username: 'Maria Santos' }],
        url: 'https://app.clickup.com/t/test456',
        tags: [{ name: 'semana anterior' }]
      }
    ];

    const alertResult = await telegram.sendAlert(mockTasks);
    
    if (alertResult.success) {
      console.log('✓ Alerta de teste enviado com sucesso');
      console.log('✓ Verifique o formato da mensagem no Telegram\n');
    } else {
      console.log('⚠️  Erro ao enviar alerta de teste');
      console.log(`   ${alertResult.error}\n`);
    }

    console.log('═'.repeat(60));
    console.log('\n🎉 Todos os testes concluídos!\n');

  } catch (error) {
    console.log('\n❌ ERRO NO TESTE\n');
    console.error(error.message);
    console.error(error.stack);
    console.log('');
    process.exit(1);
  }
}

// Executar teste
testTelegramBot();
