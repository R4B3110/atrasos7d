/**
 * Teste de conexão usando API Token
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

async function testWithApiToken() {
  console.log('\n🧪 Testando Conexão com API Token\n');
  console.log('═'.repeat(60));

  // Adicionar suporte para API Token no .env
  const apiToken = process.env.CLICKUP_API_TOKEN;
  
  if (!apiToken) {
    console.log('❌ API Token não encontrado no .env\n');
    console.log('Execute: node setup-api-token.js\n');
    return;
  }

  console.log('✓ API Token encontrado\n');
  console.log('Testando conexão...\n');

  try {
    // Testar API
    const userResponse = await axios.get('https://api.clickup.com/api/v2/user', {
      headers: { 'Authorization': apiToken }
    });

    console.log('✅ Conexão bem-sucedida!\n');
    console.log('👤 Usuário:', userResponse.data.user.username);
    console.log('📧 Email:', userResponse.data.user.email);

    // Obter workspaces
    const teamsResponse = await axios.get('https://api.clickup.com/api/v2/team', {
      headers: { 'Authorization': apiToken }
    });

    console.log('\n🏢 Workspaces/Times:\n');
    teamsResponse.data.teams.forEach((team, i) => {
      console.log(`${i + 1}. ${team.name}`);
      console.log(`   ID: ${team.id}\n`);
    });

    if (teamsResponse.data.teams.length > 0) {
      const firstTeam = teamsResponse.data.teams[0];
      console.log('💡 Adicione ao seu .env:');
      console.log(`   CLICKUP_WORKSPACE_ID=${firstTeam.id}\n`);

      // Atualizar .env automaticamente
      const envPath = require('path').join(__dirname, '.env');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      const regex = /^CLICKUP_WORKSPACE_ID=.*$/m;
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `CLICKUP_WORKSPACE_ID=${firstTeam.id}`);
      } else {
        envContent += `\nCLICKUP_WORKSPACE_ID=${firstTeam.id}`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✓ CLICKUP_WORKSPACE_ID atualizado automaticamente!\n');

      // Buscar spaces
      const spacesResponse = await axios.get(
        `https://api.clickup.com/api/v2/team/${firstTeam.id}/space`,
        { headers: { 'Authorization': apiToken } }
      );

      if (spacesResponse.data.spaces?.length > 0) {
        console.log('📁 Spaces disponíveis:\n');
        spacesResponse.data.spaces.forEach((space, i) => {
          console.log(`${i + 1}. ${space.name}`);
          console.log(`   ID: ${space.id}\n`);
        });

        const firstSpace = spacesResponse.data.spaces[0];
        console.log('💡 Adicione ao seu .env (opcional):');
        console.log(`   CLICKUP_SPACE_ID=${firstSpace.id}\n`);
      }
    }

    console.log('═'.repeat(60));
    console.log('\n🎉 TUDO CONFIGURADO!\n');
    console.log('Agora você pode usar a integração!\n');
    console.log('Execute: node run-with-token.js\n');

  } catch (error) {
    console.log('❌ Erro ao conectar:\n');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Erro:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n💡 Token inválido ou expirado.');
        console.log('   Gere um novo token no ClickUp.\n');
      }
    } else {
      console.log(error.message);
    }
  }

  console.log('═'.repeat(60) + '\n');
}

testWithApiToken().catch(console.error);
