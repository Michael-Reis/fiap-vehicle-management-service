// Script para testar os endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/auth';

async function testarRegistroCliente() {
  console.log('🧪 Testando registro de cliente (público)...');
  
  try {
    const response = await axios.post(`${BASE_URL}/registrar-cliente`, {
      nome: 'João Silva',
      email: 'joao.teste@email.com',
      senha: '123456',
      cpf: '12345678901',
      telefone: '11999999999',
      endereco: 'Rua Teste, 123'
    });
    
    console.log('✅ Cliente registrado com sucesso:', response.data);
  } catch (error) {
    console.error('❌ Erro ao registrar cliente:', error.response?.data || error.message);
  }
}

async function testarLogin() {
  console.log('🧪 Testando login...');
  
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: 'admin@admin.com.br',
      senha: '123456789'
    });
    
    console.log('✅ Login realizado com sucesso');
    return response.data.token;
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error.response?.data || error.message);
    return null;
  }
}

async function testarRegistroAdmin(token) {
  console.log('🧪 Testando registro de admin (protegido)...');
  
  try {
    const response = await axios.post(`${BASE_URL}/registrar`, {
      nome: 'Admin Teste',
      email: 'admin.teste@email.com',
      senha: '123456',
      tipo: 'ADMIN'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Admin registrado com sucesso:', response.data);
  } catch (error) {
    console.error('❌ Erro ao registrar admin:', error.response?.data || error.message);
  }
}

async function executarTestes() {
  console.log('🚀 Iniciando testes dos endpoints...\n');
  
  // Teste 1: Registrar cliente (público)
  await testarRegistroCliente();
  console.log('');
  
  // Teste 2: Login para obter token
  const token = await testarLogin();
  console.log('');
  
  // Teste 3: Registrar admin (protegido)
  if (token) {
    await testarRegistroAdmin(token);
  }
  
  console.log('\n✨ Testes finalizados!');
}

executarTestes().catch(console.error);
