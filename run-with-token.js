/**
 * Exemplo de uso com API Token
 */

require('dotenv').config();
const axios = require('axios');

const API_TOKEN = process.env.CLICKUP_API_TOKEN;
const WORKSPACE_ID = process.env.CLICKUP_WORKSPACE_ID;

async function example() {
  console.log('\n🚀 Exemplo de Uso - ClickUp API Token\n');
  
  if (!API_TOKEN) {
    console.log('❌ Configure primeiro: node setup-api-token.js\n');
    return;
  }

  const headers = { 'Authorization': API_TOKEN };

  try {
    // 1. Listar spaces
    console.log('📁 Listando spaces...\n');
    const spacesRes = await axios.get(
      `https://api.clickup.com/api/v2/team/${WORKSPACE_ID}/space`,
      { headers }
    );
    
    spacesRes.data.spaces.forEach(space => {
      console.log(`• ${space.name} (${space.id})`);
    });

    if (spacesRes.data.spaces.length > 0) {
      const spaceId = spacesRes.data.spaces[0].id;
      
      // 2. Listar listas
      console.log('\n📋 Listando listas...\n');
      const listsRes = await axios.get(
        `https://api.clickup.com/api/v2/space/${spaceId}/list`,
        { headers }
      );
      
      listsRes.data.lists.forEach(list => {
        console.log(`• ${list.name} (${list.task_count} tarefas)`);
      });

      if (listsRes.data.lists.length > 0) {
        const listId = listsRes.data.lists[0].id;
        
        // 3. Listar tarefas
        console.log('\n✓ Listando tarefas...\n');
        const tasksRes = await axios.get(
          `https://api.clickup.com/api/v2/list/${listId}/task`,
          { headers }
        );
        
        if (tasksRes.data.tasks.length > 0) {
          tasksRes.data.tasks.slice(0, 5).forEach(task => {
            console.log(`• ${task.name}`);
            console.log(`  Status: ${task.status.status}`);
            console.log(`  URL: ${task.url}\n`);
          });
        } else {
          console.log('Nenhuma tarefa encontrada.\n');
        }
      }
    }

    console.log('✅ Funcionando perfeitamente!\n');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

example();
