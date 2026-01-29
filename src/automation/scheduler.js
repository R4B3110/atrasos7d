/**
 * Scheduler - Agendador de Verificações
 * Executa o monitor automaticamente 2x por dia
 */

require('dotenv').config();
const cron = require('node-cron');
const ClickUpMonitor = require('./monitor');

class MonitorScheduler {
  constructor() {
    this.monitor = new ClickUpMonitor();
    this.morningSchedule = process.env.CRON_SCHEDULE_MORNING || '0 9 * * *';
    this.afternoonSchedule = process.env.CRON_SCHEDULE_AFTERNOON || '0 17 * * *';
    this.jobs = [];
  }

  /**
   * Valida expressão cron
   */
  validateCronExpression(expression) {
    return cron.validate(expression);
  }

  /**
   * Formata horário da expressão cron para exibição
   */
  formatCronTime(expression) {
    const parts = expression.split(' ');
    if (parts.length >= 2) {
      const hour = parts[1].padStart(2, '0');
      const minute = parts[0].padStart(2, '0');
      return `${hour}:${minute}`;
    }
    return expression;
  }

  /**
   * Executa uma verificação e trata erros
   */
  async runMonitoring(label = 'Verificação') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⏰ ${label} - ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(60));

    try {
      await this.monitor.runCheck();
    } catch (error) {
      console.error(`❌ Erro em ${label}:`, error.message);
    }

    console.log('='.repeat(60) + '\n');
  }

  /**
   * Agenda as verificações
   */
  start() {
    console.log('\n🕐 Iniciando Scheduler do ClickUp Monitor\n');
    console.log('═'.repeat(60));

    // Validar expressões cron
    if (!this.validateCronExpression(this.morningSchedule)) {
      throw new Error(`Expressão cron inválida para manhã: ${this.morningSchedule}`);
    }

    if (!this.validateCronExpression(this.afternoonSchedule)) {
      throw new Error(`Expressão cron inválida para tarde: ${this.afternoonSchedule}`);
    }

    // Agendar verificação da manhã
    const morningJob = cron.schedule(this.morningSchedule, () => {
      this.runMonitoring('Verificação da Manhã');
    });

    this.jobs.push(morningJob);
    console.log(`✓ Verificação da manhã agendada: ${this.formatCronTime(this.morningSchedule)}`);

    // Agendar verificação da tarde
    const afternoonJob = cron.schedule(this.afternoonSchedule, () => {
      this.runMonitoring('Verificação da Tarde');
    });

    this.jobs.push(afternoonJob);
    console.log(`✓ Verificação da tarde agendada: ${this.formatCronTime(this.afternoonSchedule)}`);

    console.log('═'.repeat(60));
    console.log('\n✅ Scheduler ativo! Aguardando horários agendados...\n');
    console.log('💡 Pressione Ctrl+C para parar\n');

    // Executar uma verificação inicial (opcional)
    const runInitialCheck = process.env.RUN_INITIAL_CHECK !== 'false';
    if (runInitialCheck) {
      console.log('🔍 Executando verificação inicial...\n');
      this.runMonitoring('Verificação Inicial').catch(console.error);
    }
  }

  /**
   * Para todos os jobs agendados
   */
  stop() {
    console.log('\n⏹️  Parando scheduler...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('✓ Scheduler parado\n');
  }

  /**
   * Retorna status dos jobs
   */
  getStatus() {
    return {
      active: this.jobs.length > 0,
      jobCount: this.jobs.length,
      morningSchedule: this.morningSchedule,
      afternoonSchedule: this.afternoonSchedule,
      morningTime: this.formatCronTime(this.morningSchedule),
      afternoonTime: this.formatCronTime(this.afternoonSchedule)
    };
  }
}

// Se executado diretamente
if (require.main === module) {
  const scheduler = new MonitorScheduler();

  // Tratamento de sinais para parada graciosa
  process.on('SIGINT', () => {
    console.log('\n\n📛 Recebido sinal de interrupção...');
    scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n📛 Recebido sinal de terminação...');
    scheduler.stop();
    process.exit(0);
  });

  // Iniciar scheduler
  try {
    scheduler.start();

    // Manter processo rodando
    setInterval(() => {
      // Keep alive
    }, 1000);

  } catch (error) {
    console.error('❌ Erro ao iniciar scheduler:', error.message);
    process.exit(1);
  }
}

module.exports = MonitorScheduler;
