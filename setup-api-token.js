/**
 * Configuração usando API Token (mais simples que OAuth)
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
}

async function main() {
  console.log('\n🚀 Configuração com API Token do ClickUp\n');
  console.log('═'.repeat(60));
  
  console.log('\n1. Na tela do ClickUp que você está vendo:');
  console.log('   - Clique em "Generate" para gerar um API Token');
  console.log('   - Copie o token gerado\n');
  
  const apiToken = await question('Cole seu API Token aqui: ');
  
  if (apiToken && apiToken.trim()) {
    updateEnvFile('CLICKUP_API_TOKEN', apiToken.trim());
    console.log('\n✓ API Token salvo!\n');
    
    console.log('═'.repeat(60));
    console.log('\nAgora execute:\n');
    console.log('   node test-api-token.js');
    console.log('\n');
  }
  
  rl.close();
}

main().catch(console.error);
