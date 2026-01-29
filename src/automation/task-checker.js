/**
 * Task Checker - Verificador de Tarefas Atrasadas
 * Verifica tarefas que atendem aos critérios de atraso
 */

require('dotenv').config();
const axios = require('axios');

class TaskChecker {
  constructor() {
    this.apiToken = process.env.CLICKUP_API_TOKEN;
    this.listIds = [
      process.env.CLICKUP_LIST_ID_1,
      process.env.CLICKUP_LIST_ID_2
    ].filter(Boolean); // Remove valores undefined/null

    this.tagName = process.env.CLICKUP_TAG_NAME || 'semana anterior';
    
    // Parse os status do .env
    const statusesStr = process.env.CLICKUP_ALERT_STATUSES || 
      'STAND BY,PENDENTE,PRONTO PARA FAZER,EM PROGRESSO,EM VALIDAÇÃO,EM ALTERAÇÃO';
    this.alertStatuses = statusesStr.split(',').map(s => s.trim());

    this.daysThreshold = parseInt(process.env.ALERT_DAYS_THRESHOLD) || 7;

    if (!this.apiToken) {
      throw new Error('CLICKUP_API_TOKEN não configurado');
    }

    if (this.listIds.length === 0) {
      throw new Error('Nenhum CLICKUP_LIST_ID configurado');
    }

    console.log('📋 Task Checker inicializado');
    console.log(`   Listas monitoradas: ${this.listIds.length}`);
    console.log(`   Tag monitorada: "${this.tagName}"`);
    console.log(`   Status que geram alerta: ${this.alertStatuses.length}`);
    console.log(`   Threshold: ${this.daysThreshold} dias`);
  }

  /**
   * Busca tarefas de uma lista
   */
  async fetchTasksFromList(listId) {
    try {
      const url = `https://api.clickup.com/api/v2/list/${listId}/task`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': this.apiToken,
          'Content-Type': 'application/json'
        },
        params: {
          archived: false,
          subtasks: true,
          include_closed: false
        }
      });

      return response.data.tasks || [];
    } catch (error) {
      console.error(`❌ Erro ao buscar tarefas da lista ${listId}:`, error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Busca todas as tarefas de todas as listas configuradas
   */
  async fetchAllTasks() {
    console.log('\n📥 Buscando tarefas...');
    
    const allTasks = [];
    
    for (const listId of this.listIds) {
      console.log(`   Lista ${listId}...`);
      const tasks = await this.fetchTasksFromList(listId);
      allTasks.push(...tasks);
      console.log(`   ✓ ${tasks.length} tarefas encontradas`);
    }

    console.log(`\n✓ Total: ${allTasks.length} tarefas em ${this.listIds.length} lista(s)`);
    return allTasks;
  }

  /**
   * Verifica se uma tarefa tem a tag monitorada
   */
  hasTargetTag(task) {
    if (!task.tags || task.tags.length === 0) return false;
    return task.tags.some(tag => tag.name === this.tagName);
  }

  /**
   * Verifica se o status da tarefa está na lista de status que geram alerta
   */
  hasAlertStatus(task) {
    if (!task.status || !task.status.status) return false;
    return this.alertStatuses.includes(task.status.status);
  }

  /**
   * Verifica se o due date está atrasado (mais de X dias atrás)
   */
  isDueDateOverdue(task) {
    if (!task.due_date) return false;
    
    const dueDate = parseInt(task.due_date);
    const now = Date.now();
    const diffMs = now - dueDate;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays > this.daysThreshold;
  }

  /**
   * Verifica se uma tarefa atende aos critérios de atraso
   */
  isTaskOverdue(task) {
    // Critério 1: Tem a tag "semana anterior"
    if (!this.hasTargetTag(task)) {
      return false;
    }

    // Critério 2: Due date está atrasado (> 7 dias)
    if (!this.isDueDateOverdue(task)) {
      return false;
    }

    // Critério 3: Status está na lista de status que geram alerta
    if (!this.hasAlertStatus(task)) {
      return false;
    }

    return true;
  }

  /**
   * Filtra tarefas atrasadas
   */
  filterOverdueTasks(tasks) {
    console.log('\n🔍 Filtrando tarefas atrasadas...');
    console.log(`   Critérios:`);
    console.log(`   - Tag: "${this.tagName}"`);
    console.log(`   - Due date > ${this.daysThreshold} dias atrás`);
    console.log(`   - Status: ${this.alertStatuses.join(', ')}`);

    const overdueTasks = tasks.filter(task => this.isTaskOverdue(task));

    console.log(`\n   ✓ ${overdueTasks.length} tarefa(s) atrasada(s) encontrada(s)`);

    // Log detalhado para debug
    if (overdueTasks.length > 0) {
      console.log('\n   Tarefas atrasadas:');
      overdueTasks.forEach((task, i) => {
        const daysAgo = Math.floor((Date.now() - parseInt(task.due_date)) / (1000 * 60 * 60 * 24));
        console.log(`   ${i + 1}. ${task.name}`);
        console.log(`      Status: ${task.status.status}`);
        console.log(`      Atraso: ${daysAgo} dias`);
      });
    }

    return overdueTasks;
  }

  /**
   * Verifica e retorna tarefas atrasadas
   */
  async checkOverdueTasks() {
    try {
      console.log('\n🤖 Iniciando verificação de tarefas atrasadas...');
      console.log(`   Horário: ${new Date().toLocaleString('pt-BR')}`);

      // Buscar todas as tarefas
      const allTasks = await this.fetchAllTasks();

      if (allTasks.length === 0) {
        console.log('\n⚠️  Nenhuma tarefa encontrada nas listas configuradas');
        return [];
      }

      // Filtrar tarefas atrasadas
      const overdueTasks = this.filterOverdueTasks(allTasks);

      return overdueTasks;

    } catch (error) {
      console.error('\n❌ Erro ao verificar tarefas:', error.message);
      throw error;
    }
  }

  /**
   * Retorna estatísticas das tarefas
   */
  async getStatistics() {
    const allTasks = await this.fetchAllTasks();
    
    const withTag = allTasks.filter(task => this.hasTargetTag(task));
    const overdue = this.filterOverdueTasks(allTasks);

    return {
      total: allTasks.length,
      withTag: withTag.length,
      overdue: overdue.length,
      byStatus: this.groupByStatus(allTasks)
    };
  }

  /**
   * Agrupa tarefas por status
   */
  groupByStatus(tasks) {
    const grouped = {};
    tasks.forEach(task => {
      const status = task.status.status;
      if (!grouped[status]) {
        grouped[status] = 0;
      }
      grouped[status]++;
    });
    return grouped;
  }
}

module.exports = TaskChecker;
