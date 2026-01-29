/**
 * Módulo de Telegram Bot
 * Responsável por enviar alertas via Telegram
 */

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

class TelegramNotifier {
  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN;
    this.chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!this.botToken || this.botToken === 'seu_bot_token_aqui') {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado no .env');
    }
    
    if (!this.chatId || this.chatId === 'seu_chat_id_aqui') {
      throw new Error('TELEGRAM_CHAT_ID não configurado no .env');
    }

    // Criar bot em modo de polling desabilitado (apenas envio)
    this.bot = new TelegramBot(this.botToken, { polling: false });
  }

  /**
   * Formata data para exibição
   */
  formatDate(timestamp) {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Calcula quantos dias atrás
   */
  getDaysAgo(timestamp) {
    const now = Date.now();
    const diff = now - parseInt(timestamp);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  }

  /**
   * Formata mensagem de alerta com tarefas atrasadas
   */
  formatAlertMessage(tasks) {
    if (!tasks || tasks.length === 0) {
      return null;
    }

    let message = '🚨 *ALERTA: Tarefas Atrasadas*\n\n';
    message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    tasks.forEach((task, index) => {
      const numero = index + 1;
      const emoji = this.getNumberEmoji(numero);
      const daysAgo = this.getDaysAgo(task.due_date);
      const dueDate = this.formatDate(task.due_date);
      
      // Nome da tarefa (limitar a 50 caracteres)
      const taskName = task.name.length > 50 
        ? task.name.substring(0, 47) + '...' 
        : task.name;

      message += `${emoji} *${taskName}*\n`;
      
      // Responsável
      if (task.assignees && task.assignees.length > 0) {
        const assigneeNames = task.assignees.map(a => a.username).join(', ');
        message += `👤 ${assigneeNames}\n`;
      } else {
        message += `👤 _Sem responsável_\n`;
      }

      // Due Date e dias de atraso
      message += `📅 Prazo: ${dueDate} _(${daysAgo} dias atrás)_\n`;
      
      // Status
      message += `📊 Status: ${task.status.status}\n`;
      
      // Link
      message += `🔗 [Abrir tarefa](${task.url})\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Total: ${tasks.length} tarefa${tasks.length > 1 ? 's' : ''} atrasada${tasks.length > 1 ? 's' : ''}*\n`;
    
    const now = new Date();
    const timeStr = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    message += `Verificado em: ${timeStr}`;

    return message;
  }

  /**
   * Retorna emoji de número
   */
  getNumberEmoji(num) {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return num <= 10 ? emojis[num - 1] : `${num}.`;
  }

  /**
   * Envia mensagem de alerta
   */
  async sendAlert(tasks) {
    try {
      const message = this.formatAlertMessage(tasks);
      
      if (!message) {
        console.log('✓ Nenhuma tarefa atrasada para alertar');
        return { success: true, message: 'Sem alertas' };
      }

      const result = await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });

      console.log(`✓ Alerta enviado com sucesso! ${tasks.length} tarefa(s) atrasada(s)`);
      return { success: true, result };

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem no Telegram:', error.message);
      
      // Tentar enviar sem formatação Markdown em caso de erro
      try {
        const simpleMessage = `🚨 ALERTA: ${tasks.length} tarefas atrasadas\n\nErro ao formatar mensagem detalhada.`;
        await this.bot.sendMessage(this.chatId, simpleMessage);
        return { success: false, error: 'Enviado sem formatação' };
      } catch (retryError) {
        return { success: false, error: retryError.message };
      }
    }
  }

  /**
   * Envia mensagem de teste
   */
  async sendTestMessage() {
    try {
      const message = '✅ *Teste de Conexão*\n\nBot do ClickUp conectado com sucesso!';
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
      console.log('✓ Mensagem de teste enviada com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem de teste:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia mensagem de erro/alerta do sistema
   */
  async sendSystemAlert(message) {
    try {
      const alertMessage = `⚠️ *Alerta do Sistema*\n\n${message}`;
      await this.bot.sendMessage(this.chatId, alertMessage, { parse_mode: 'Markdown' });
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao enviar alerta do sistema:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = TelegramNotifier;
