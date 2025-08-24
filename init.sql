-- Script básico de inicialização do banco
-- Apenas cria o banco se não existir
-- O schema será criado automaticamente pela aplicação

CREATE DATABASE IF NOT EXISTS servico_principal
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE servico_principal;

-- As tabelas serão criadas automaticamente pelo initializeSchema() da aplicação
-- O usuário admin será criado automaticamente pela DatabaseSeed
