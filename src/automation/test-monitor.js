/**
 * Teste do Monitor (sem enviar mensagem no Telegram)
 * Apenas verifica se consegue buscar e filtrar tarefas
 */

require('dotenv').config();
const TaskChecker = require('./task-checker');

async function testMonitor() {
  console.log('\n🧪 Teste do Monitor (Modo Dry-Run)\n');
  console.log('═'.repeat(60));

  try {
    // Verificar configuração
    console.log('\n1️⃣ Verificando configuração do ClickUp...\n');
    
    const apiToken = process.env.CLICKUP_API_TOKEN;
    const listId1 = process.env.CLICKUP_LIST_ID_1;
    const listId2 = process.env.CLICKUP_LIST_ID_2;

    if (!apiToken) {
      console.log('❌ CLICKUP_API_TOKEN não configurado');
      console.log('\n💡 Execute: node test-api-token.js para configurar\n');
      process.exit(1);
    }

    console.log('✓ API Token: Configurado');
    console.log(`✓ Lista 1: ${listId1}`);
    console.log(`✓ Lista 2: ${listId2}`);

    // Criar task checker
    console.log('\n2️⃣ Inicializando Task Checker...\n');
    const checker = new TaskChecker();

    // Buscar tarefas
    console.log('\n3️⃣ Buscando tarefas...\n');
    const tasks = await checker.fetchAllTasks();
    
    console.log(`\n✓ ${tasks.length} tarefas encontradas`);

    if (tasks.length === 0) {
      console.log('\n⚠️  Nenhuma tarefa encontrada nas listas');
      console.log('   Verifique se os IDs das listas estão corretos\n');
      process.exit(0);
    }

    // Mostrar algumas tarefas
    console.log('\n📋 Primeiras 5 tarefas:\n');
    tasks.slice(0, 5).forEach((task, i) => {
      console.log(`${i + 1}. ${task.name}`);
      console.log(`   Status: ${task.status.status}`);
      console.log(`   Tags: ${task.tags?.map(t => t.name).join(', ') || 'nenhuma'}`);
      console.log(`   Due Date: ${task.due_date ? new Date(parseInt(task.due_date)).toLocaleDateString('pt-BR') : 'não definido'}`);
      console.log('');
    });

    // Filtrar tarefas atrasadas
    console.log('4️⃣ Filtrando tarefas atrasadas...\n');
    const overdue = checker.filterOverdueTasks(tasks);

    if (overdue.length > 0) {
      console.log(`✓ ${overdue.length} tarefa(s) atrasada(s) encontrada(s)\n`);
      console.log('📋 Tarefas que seriam alertadas:\n');
      
      overdue.forEach((task, i) => {
        const daysAgo = Math.floor((Date.now() - parseInt(task.due_date)) / (1000 * 60 * 60 * 24));
        console.log(`${i + 1}. ${task.name}`);
        console.log(`   Responsável: ${task.assignees?.map(a => a.username).join(', ') || 'Sem responsável'}`);
        console.log(`   Status: ${task.status.status}`);
        console.log(`   Atraso: ${daysAgo} dias`);
        console.log(`   Link: ${task.url}`);
        console.log('');
      });

      console.log('💡 Essas tarefas serão enviadas via Telegram quando o monitor rodar\n');
    } else {
      console.log('✅ Nenhuma tarefa atrasada encontrada!\n');
    }

    // Estatísticas
    console.log('5️⃣ Estatísticas:\n');
    const stats = await checker.getStatistics();
    
    console.log(`Total de tarefas: ${stats.total}`);
    console.log(`Com tag "semana anterior": ${stats.withTag}`);
    console.log(`Atrasadas: ${stats.overdue}`);
    console.log('\nPor Status:');
    Object.entries(stats.byStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

    console.log('\n═'.repeat(60));
    console.log('\n✅ Teste concluído com sucesso!\n');
    console.log('💡 Para testar o envio no Telegram, execute:');
    console.log('   node src/automation/monitor.js\n');

  } catch (error) {
    console.log('\n❌ ERRO NO TESTE\n');
    console.error(error.message);
    console.error(error.stack);
    console.log('');
    process.exit(1);
  }
}

// Executar teste
testMonitor();
