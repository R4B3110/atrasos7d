/**
 * Monitor - Script Principal de Monitoramento
 * Orquestra a verificação de tarefas e envio de alertas
 */

require('dotenv').config();
const TaskChecker = require('./task-checker');
const TelegramNotifier = require('./telegram-bot');

class ClickUpMonitor {
  constructor() {
    this.taskChecker = null;
    this.telegram = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa os módulos
   */
  async initialize() {
    try {
      console.log('\n🚀 Inicializando ClickUp Monitor...\n');

      // Inicializar Task Checker
      this.taskChecker = new TaskChecker();

      // Inicializar Telegram Notifier
      this.telegram = new TelegramNotifier();

      this.isInitialized = true;
      console.log('\n✓ Monitor inicializado com sucesso!\n');
      
      return { success: true };

    } catch (error) {
      console.error('\n❌ Erro ao inicializar monitor:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Executa uma verificação completa
   */
  async runCheck() {
    try {
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult;
        }
      }

      console.log('\n' + '═'.repeat(60));
      console.log('🔍 VERIFICAÇÃO DE TAREFAS ATRASADAS');
      console.log('═'.repeat(60));

      // Verificar tarefas atrasadas
      const overdueTasks = await this.taskChecker.checkOverdueTasks();

      if (overdueTasks.length === 0) {
        console.log('\n✅ Nenhuma tarefa atrasada encontrada!');
        console.log('═'.repeat(60) + '\n');
        return { success: true, count: 0, message: 'Sem tarefas atrasadas' };
      }

      // Enviar alerta via Telegram
      console.log('\n📤 Enviando alerta via Telegram...');
      const alertResult = await this.telegram.sendAlert(overdueTasks);

      console.log('\n' + '═'.repeat(60));
      
      if (alertResult.success) {
        console.log(`\n✅ Verificação concluída com sucesso!`);
        console.log(`   ${overdueTasks.length} tarefa(s) atrasada(s) alertada(s)\n`);
      } else {
        console.log(`\n⚠️  Verificação concluída com alertas`);
        console.log(`   ${overdueTasks.length} tarefa(s) encontrada(s)`);
        console.log(`   Erro ao enviar: ${alertResult.error}\n`);
      }

      return {
        success: true,
        count: overdueTasks.length,
        alertSent: alertResult.success,
        tasks: overdueTasks
      };

    } catch (error) {
      console.error('\n❌ Erro durante verificação:', error.message);
      console.error(error.stack);

      // Tentar enviar alerta de erro para o Telegram
      if (this.telegram) {
        try {
          await this.telegram.sendSystemAlert(
            `Erro na verificação de tarefas:\n\n${error.message}`
          );
        } catch (telegramError) {
          console.error('❌ Não foi possível enviar alerta de erro:', telegramError.message);
        }
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Mostra estatísticas das tarefas
   */
  async showStatistics() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log('\n📊 ESTATÍSTICAS DAS TAREFAS\n');
      const stats = await this.taskChecker.getStatistics();

      console.log(`Total de tarefas: ${stats.total}`);
      console.log(`Com tag "${this.taskChecker.tagName}": ${stats.withTag}`);
      console.log(`Atrasadas: ${stats.overdue}`);
      
      console.log('\nPor Status:');
      Object.entries(stats.byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      console.log('');

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error.message);
    }
  }
}

// Se executado diretamente (não importado)
if (require.main === module) {
  (async () => {
    const monitor = new ClickUpMonitor();
    
    // Verificar argumentos de linha de comando
    const args = process.argv.slice(2);
    
    if (args.includes('--stats') || args.includes('-s')) {
      // Modo estatísticas
      await monitor.showStatistics();
    } else {
      // Modo verificação normal
      const result = await monitor.runCheck();
      
      // Exit code baseado no resultado
      if (!result.success) {
        process.exit(1);
      }
    }
  })();
}

module.exports = ClickUpMonitor;
