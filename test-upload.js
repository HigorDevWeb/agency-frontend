// Script para testar o endpoint de upload do Strapi
// Execute este script com: node test-upload.js

// Substitua pelo seu token JWT válido
const JWT_TOKEN = "SEU_TOKEN_AQUI";
const API_URL = "https://api.recruitings.info";

async function testUpload() {
  try {
    console.log("🔍 Testando endpoint de upload...");
    
    // Primeiro, vamos testar se conseguimos acessar o endpoint /api/users/me
    console.log("\n1. Testando autenticação...");
    const authResponse = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status da autenticação: ${authResponse.status}`);
    if (authResponse.ok) {
      const userData = await authResponse.json();
      console.log(`✅ Autenticado como: ${userData.username} (${userData.email})`);
    } else {
      const error = await authResponse.text();
      console.log(`❌ Erro de autenticação: ${error}`);
      return;
    }

    // Agora vamos testar o endpoint de upload
    console.log("\n2. Testando endpoint de upload...");
    
    // Criar um arquivo de teste simples
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('files', testFile, 'test.txt');

    const uploadResponse = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
      },
      body: formData
    });

    console.log(`Status do upload: ${uploadResponse.status}`);
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log("✅ Upload bem-sucedido!");
      console.log("Resposta:", JSON.stringify(uploadData, null, 2));
    } else {
      const errorText = await uploadResponse.text();
      console.log(`❌ Erro no upload: ${errorText}`);
      
      // Vamos também verificar os headers de resposta
      console.log("\nHeaders de resposta:");
      for (const [key, value] of uploadResponse.headers.entries()) {
        console.log(`${key}: ${value}`);
      }
    }

  } catch (error) {
    console.error("❌ Erro durante o teste:", error);
  }
}

// Instruções para o usuário
console.log("📋 INSTRUÇÕES:");
console.log("1. Obtenha seu token JWT fazendo login na aplicação");
console.log("2. Abra o DevTools do navegador > Application > Local Storage");
console.log("3. Copie o valor de 'auth_token'");
console.log("4. Substitua 'SEU_TOKEN_AQUI' neste arquivo pelo token real");
console.log("5. Execute: node test-upload.js");
console.log("\n" + "=".repeat(50));

// Verificar se o token foi fornecido
if (JWT_TOKEN === "SEU_TOKEN_AQUI") {
  console.log("\n❌ Por favor, substitua SEU_TOKEN_AQUI pelo seu token JWT real!");
  console.log("Execute as instruções acima para obter o token.");
} else {
  testUpload();
}
