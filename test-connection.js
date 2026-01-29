/**
 * Teste de conexão com ClickUp
 * Execute com: node test-connection.js
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testConnection() {
  console.log('\n🧪 Testando Conexão com ClickUp\n');
  console.log('═'.repeat(60));

  // Verificar .env
  console.log('\n1️⃣ Verificando configuração...\n');
  
  const requiredVars = [
    'CLICKUP_CLIENT_ID',
    'CLICKUP_CLIENT_SECRET',
    'CLICKUP_WORKSPACE_ID'
  ];

  const missing = requiredVars.filter(v => !process.env[v] || process.env[v] === 'your_' + v.toLowerCase());
  
  if (missing.length > 0) {
    console.log('❌ Variáveis faltando no .env:');
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\n💡 Execute: node auth-setup.js para configurar\n');
    return;
  }

  console.log('✓ Variáveis de ambiente configuradas');

  // Verificar tokens
  console.log('\n2️⃣ Verificando autenticação...\n');
  
  const tokenPath = path.join(__dirname, '.tokens.json');
  if (!fs.existsSync(tokenPath)) {
    console.log('❌ Tokens não encontrados');
    console.log('\n💡 Execute: node auth-server.js para autenticar\n');
    return;
  }

  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  console.log('✓ Tokens encontrados');

  // Testar API
  console.log('\n3️⃣ Testando API do ClickUp...\n');

  try {
    // Obter informações do usuário
    const userResponse = await axios.get('https://api.clickup.com/api/v2/user', {
      headers: { 'Authorization': tokens.access_token }
    });

    console.log('✅ Conexão bem-sucedida!\n');
    console.log('👤 Usuário:', userResponse.data.user.username);
    console.log('📧 Email:', userResponse.data.user.email);

    // Obter workspaces
    const teamsResponse = await axios.get('https://api.clickup.com/api/v2/team', {
      headers: { 'Authorization': tokens.access_token }
    });

    console.log('\n🏢 Workspaces:');
    teamsResponse.data.teams.forEach(team => {
      console.log(`   - ${team.name} (ID: ${team.id})`);
    });

    // Testar workspace configurado
    if (process.env.CLICKUP_WORKSPACE_ID && 
        process.env.CLICKUP_WORKSPACE_ID !== 'your_workspace_id_here') {
      
      console.log('\n4️⃣ Testando workspace configurado...\n');
      
      const spacesResponse = await axios.get(
        `https://api.clickup.com/api/v2/team/${process.env.CLICKUP_WORKSPACE_ID}/space`,
        { headers: { 'Authorization': tokens.access_token } }
      );

      console.log('✓ Workspace acessível');
      console.log(`📁 Spaces encontrados: ${spacesResponse.data.spaces?.length || 0}`);

      if (spacesResponse.data.spaces?.length > 0) {
        console.log('\n   Spaces disponíveis:');
        spacesResponse.data.spaces.forEach(space => {
          console.log(`   - ${space.name} (ID: ${space.id})`);
        });
      }
    }

    console.log('\n═'.repeat(60));
    console.log('\n🎉 TUDO FUNCIONANDO!\n');
    console.log('Você pode agora:');
    console.log('• Executar: npm run dev');
    console.log('• Usar os exemplos em: src/examples/usage.ts');
    console.log('• Integrar com Cursor IDE usando .cursor/mcp.json\n');

  } catch (error) {
    console.log('❌ Erro ao conectar:\n');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Token expirado ou inválido.');
        console.log('   Execute: node auth-server.js para autenticar novamente\n');
      }
    } else {
      console.log(error.message);
    }
  }

  console.log('═'.repeat(60) + '\n');
}

testConnection().catch(console.error);
