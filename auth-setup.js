/**
 * Script de configuração de autenticação ClickUp
 * Execute com: node auth-setup.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, '.env');
  let content = fs.readFileSync(envPath, 'utf8');
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (content.match(regex)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, content);
  console.log(`✓ ${key} atualizado no .env`);
}

async function main() {
  console.log('\n🚀 Configuração de Autenticação ClickUp MCP\n');
  console.log('═'.repeat(60));
  
  // Passo 1: Credenciais OAuth
  console.log('\n📋 PASSO 1: Configurar Credenciais OAuth\n');
  console.log('Primeiro, você precisa criar uma aplicação OAuth no ClickUp:');
  console.log('1. Abra: https://app.clickup.com/settings/apps');
  console.log('2. Clique em "Create an App"');
  console.log('3. Preencha:');
  console.log('   - App Name: "MCP Integration"');
  console.log('   - Redirect URL: http://localhost:3000/callback');
  console.log('4. Copie o Client ID e Client Secret\n');
  
  const clientId = await question('Digite seu CLICKUP_CLIENT_ID: ');
  if (clientId && clientId !== 'your_client_id_here') {
    updateEnvFile('CLICKUP_CLIENT_ID', clientId.trim());
  }
  
  const clientSecret = await question('Digite seu CLICKUP_CLIENT_SECRET: ');
  if (clientSecret && clientSecret !== 'your_client_secret_here') {
    updateEnvFile('CLICKUP_CLIENT_SECRET', clientSecret.trim());
  }
  
  // Passo 2: IDs de Workspace e Space
  console.log('\n📋 PASSO 2: Encontrar seus IDs\n');
  console.log('Para encontrar seu Workspace ID:');
  console.log('1. Abra o ClickUp no navegador');
  console.log('2. Olhe na URL: https://app.clickup.com/ESTE_É_SEU_WORKSPACE_ID/...');
  console.log('3. Copie o número que aparece após o domínio\n');
  
  const workspaceId = await question('Digite seu CLICKUP_WORKSPACE_ID (ou deixe em branco para descobrir depois): ');
  if (workspaceId && workspaceId.trim() && workspaceId !== 'your_workspace_id_here') {
    updateEnvFile('CLICKUP_WORKSPACE_ID', workspaceId.trim());
  }
  
  const spaceId = await question('Digite seu CLICKUP_SPACE_ID (opcional, pode deixar em branco): ');
  if (spaceId && spaceId.trim() && spaceId !== 'your_space_id_here') {
    updateEnvFile('CLICKUP_SPACE_ID', spaceId.trim());
  }
  
  console.log('\n✅ Configuração salva no arquivo .env!\n');
  console.log('═'.repeat(60));
  console.log('\n📋 PRÓXIMOS PASSOS:\n');
  console.log('1. Execute o servidor de autenticação:');
  console.log('   node auth-server.js\n');
  console.log('2. Abra seu navegador em: http://localhost:3000/auth\n');
  console.log('3. Autorize a aplicação no ClickUp\n');
  console.log('4. Pronto! Você estará autenticado.\n');
  
  rl.close();
}

main().catch(error => {
  console.error('❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});
