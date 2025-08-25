# Serviço Principal - Sistema de Gerenciamento de Veículos

## Configuração do Administrador Inicial

O sistema cria automaticamente um usuário administrador inicial no primeiro boot. A senha pode ser configurada de duas formas:

### 1. Usando Variável de Ambiente (Recomendado)

Configure a variável `ADMIN_PASSWORD` no seu arquivo `.env` ou docker-compose.yml:

```bash
ADMIN_PASSWORD=admin123
```

### 2. Senha Gerada Automaticamente

Se a variável `ADMIN_PASSWORD` não for definida, o sistema gerará uma senha aleatória e segura que será exibida no console durante a inicialização.

## Credenciais do Admin

- **Email**: `admin@admin.com.br`
- **Senha**: `admin123` (configurada via ADMIN_PASSWORD) ou gerada automaticamente

## Comportamento do Sistema

### Primeira Execução (Admin não existe)
- Cria o usuário admin com a senha configurada
- Exibe mensagem de confirmação no console

### Execuções Subsequentes (Admin já existe)
- **ATUALIZA** a senha do admin para a configurada em ADMIN_PASSWORD
- Garante que a senha esteja sempre sincronizada com a configuração
- Útil para redefinir senhas esquecidas

## Configuração de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas variáveis:

```bash
cp .env.example .env
```

## Executando com Docker

```bash
docker-compose up -d
```

## Segurança

⚠️ **Importante**: A senha do administrador nunca fica hardcoded no código-fonte para atender às exigências do SonarQube e boas práticas de segurança.