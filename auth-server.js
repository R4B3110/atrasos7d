/**
 * Servidor de autenticação OAuth para ClickUp
 * Execute com: node auth-server.js
 */

require('dotenv').config();
const http = require('http');
const url = require('url');
const crypto = require('crypto');
const axios = require('axios');

// Configuração
const PORT = 3000;
const CLICKUP_AUTH_URL = 'https://app.clickup.com/api';
const CLICKUP_TOKEN_URL = 'https://api.clickup.com/api/v2/oauth/token';

// PKCE helpers
function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeVerifier() {
  return base64URLEncode(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier) {
  return base64URLEncode(
    crypto.createHash('sha256').update(verifier).digest()
  );
}

// Armazenar temporariamente o code verifier
let codeVerifier = '';
let tokens = null;

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  try {
    // Rota inicial - redireciona para autorização
    if (pathname === '/auth') {
      codeVerifier = generateCodeVerifier();
      const codeChallenge = generateCodeChallenge(codeVerifier);
      
      const params = new URLSearchParams({
        client_id: process.env.CLICKUP_CLIENT_ID,
        redirect_uri: process.env.CLICKUP_REDIRECT_URI,
        response_type: 'code',
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      });

      const authUrl = `${CLICKUP_AUTH_URL}?${params.toString()}`;
      
      res.writeHead(302, { 'Location': authUrl });
      res.end();
      return;
    }

    // Rota de callback - recebe código de autorização
    if (pathname === '/callback') {
      const code = parsedUrl.query.code;
      
      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>❌ Erro: Código de autorização não recebido</h1>');
        return;
      }

      console.log('\n✓ Código de autorização recebido!');
      console.log('✓ Trocando código por access token...\n');

      // Trocar código por token
      const tokenResponse = await axios.post(CLICKUP_TOKEN_URL, {
        client_id: process.env.CLICKUP_CLIENT_ID,
        client_secret: process.env.CLICKUP_CLIENT_SECRET,
        code,
        redirect_uri: process.env.CLICKUP_REDIRECT_URI,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      tokens = tokenResponse.data;
      console.log('✅ Autenticação bem-sucedida!\n');
      console.log('═'.repeat(60));

      // Buscar informações do usuário e workspace
      const userResponse = await axios.get('https://api.clickup.com/api/v2/user', {
        headers: { 'Authorization': tokens.access_token }
      });

      const teamsResponse = await axios.get('https://api.clickup.com/api/v2/team', {
        headers: { 'Authorization': tokens.access_token }
      });

      console.log('\n📊 INFORMAÇÕES DA SUA CONTA:\n');
      console.log(`Usuário: ${userResponse.data.user.username}`);
      console.log(`Email: ${userResponse.data.user.email}\n`);

      console.log('🏢 WORKSPACES DISPONÍVEIS:\n');
      teamsResponse.data.teams.forEach((team, i) => {
        console.log(`${i + 1}. ${team.name}`);
        console.log(`   ID: ${team.id}`);
        console.log(`   Membros: ${team.members?.length || 0}\n`);
      });

      if (teamsResponse.data.teams.length > 0) {
        const firstTeam = teamsResponse.data.teams[0];
        console.log(`\n💡 DICA: Seu primeiro workspace ID é: ${firstTeam.id}`);
        console.log(`   Adicione ao .env: CLICKUP_WORKSPACE_ID=${firstTeam.id}\n`);

        // Buscar spaces do primeiro workspace
        try {
          const spacesResponse = await axios.get(
            `https://api.clickup.com/api/v2/team/${firstTeam.id}/space`,
            { headers: { 'Authorization': tokens.access_token } }
          );

          if (spacesResponse.data.spaces?.length > 0) {
            console.log('📁 SPACES DISPONÍVEIS:\n');
            spacesResponse.data.spaces.forEach((space, i) => {
              console.log(`${i + 1}. ${space.name}`);
              console.log(`   ID: ${space.id}\n`);
            });

            const firstSpace = spacesResponse.data.spaces[0];
            console.log(`💡 DICA: Seu primeiro space ID é: ${firstSpace.id}`);
            console.log(`   Adicione ao .env: CLICKUP_SPACE_ID=${firstSpace.id}\n`);
          }
        } catch (error) {
          console.log('ℹ️  Não foi possível buscar spaces automaticamente\n');
        }
      }

      console.log('═'.repeat(60));
      console.log('\n🎉 AUTENTICAÇÃO COMPLETA!\n');
      console.log('Agora você pode:');
      console.log('1. Atualizar o .env com os IDs acima');
      console.log('2. Executar: npm run dev');
      console.log('3. Ou testar: node test-connection.js\n');

      // Salvar tokens (em produção, use um banco de dados)
      const fs = require('fs');
      const tokenPath = require('path').join(__dirname, '.tokens.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      console.log('✓ Tokens salvos em .tokens.json\n');

      // Resposta HTML
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Autenticação ClickUp - Sucesso</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background: #f5f5f5;
            }
            .success {
              background: white;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { color: #10B981; }
            .info { background: #EFF6FF; padding: 15px; border-radius: 4px; margin: 15px 0; }
            code { background: #E5E7EB; padding: 2px 6px; border-radius: 3px; }
            .warning { background: #FEF3C7; padding: 15px; border-radius: 4px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="success">
            <h1>✅ Autenticação Bem-Sucedida!</h1>
            <p>Você conectou sua conta ClickUp com sucesso.</p>
            
            <div class="info">
              <h3>📊 Suas Informações:</h3>
              <p><strong>Usuário:</strong> ${userResponse.data.user.username}</p>
              <p><strong>Email:</strong> ${userResponse.data.user.email}</p>
              <p><strong>Workspace ID:</strong> <code>${teamsResponse.data.teams[0]?.id || 'N/A'}</code></p>
            </div>

            <div class="warning">
              <h3>⚠️ Importante:</h3>
              <p>Verifique o terminal onde o servidor está rodando para ver todos os seus IDs.</p>
              <p>Atualize o arquivo <code>.env</code> com os valores corretos.</p>
            </div>

            <h3>🚀 Próximos Passos:</h3>
            <ol>
              <li>Volte ao terminal</li>
              <li>Pressione <code>Ctrl+C</code> para parar o servidor</li>
              <li>Atualize o <code>.env</code> com os IDs mostrados no terminal</li>
              <li>Execute: <code>node test-connection.js</code> para testar</li>
            </ol>

            <p style="margin-top: 30px; color: #666;">
              Você pode fechar esta janela agora.
            </p>
          </div>
        </body>
        </html>
      `);

      // Parar o servidor após 5 segundos
      setTimeout(() => {
        console.log('✓ Servidor será encerrado em 5 segundos...');
        console.log('✓ Pressione Ctrl+C para encerrar manualmente.\n');
      }, 2000);
    }

    // Rota raiz
    if (pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>ClickUp OAuth</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              max-width: 600px;
              margin: 100px auto;
              text-align: center;
              padding: 20px;
            }
            .button {
              display: inline-block;
              background: #7B68EE;
              color: white;
              padding: 15px 30px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              margin-top: 20px;
            }
            .button:hover { background: #6A5ACD; }
          </style>
        </head>
        <body>
          <h1>🚀 ClickUp MCP Integration</h1>
          <p>Clique no botão abaixo para conectar sua conta ClickUp</p>
          <a href="/auth" class="button">Conectar com ClickUp</a>
        </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.response) {
      console.error('Detalhes:', error.response.data);
    }
    
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>❌ Erro na autenticação</h1>
      <p>${error.message}</p>
      <p>Verifique o terminal para mais detalhes.</p>
    `);
  }
});

server.listen(PORT, () => {
  console.log('\n🚀 Servidor de Autenticação ClickUp OAuth\n');
  console.log('═'.repeat(60));
  console.log('\n✓ Servidor rodando em: http://localhost:3000');
  console.log('\n📋 INSTRUÇÕES:\n');
  console.log('1. Abra seu navegador em: http://localhost:3000/auth');
  console.log('2. Você será redirecionado para o ClickUp');
  console.log('3. Autorize a aplicação');
  console.log('4. Você será redirecionado de volta\n');
  console.log('═'.repeat(60));
  console.log('\nAguardando autorização...\n');
});
