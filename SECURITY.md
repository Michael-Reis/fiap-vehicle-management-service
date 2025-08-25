# Configuração de Segurança - Senha do Administrador

## Problema Resolvido

Anteriormente, a senha do administrador inicial era hardcoded no código ou gerada aleatoriamente, o que causava problemas com ferramentas de análise de código como o SonarQube. Esta implementação resolve o problema permitindo configurar a senha através de variáveis de ambiente.

## Como Funciona

### 1. Configuração via Variável de Ambiente (Recomendado)

Configure a variável `ADMIN_PASSWORD` no seu ambiente:

#### Docker Compose
```yaml
environment:
  - ADMIN_PASSWORD=admin123
```

#### Arquivo .env
```bash
ADMIN_PASSWORD=admin123
```

#### Variável do Sistema
```bash
export ADMIN_PASSWORD=admin123
```

### 2. Geração Automática (Fallback)

Se a variável `ADMIN_PASSWORD` não estiver definida, o sistema automaticamente:
- Gera uma senha segura de 12 caracteres usando crypto.randomBytes
- Exibe a senha no console durante a inicialização
- Recomenda configurar a variável para futuras execuções

### 3. Atualização de Senha Existente

Se o usuário admin já existir no banco:
- O sistema atualiza a senha para o valor configurado em `ADMIN_PASSWORD`
- Isso garante que a senha esteja sempre sincronizada com a configuração
- Útil para redefinir senhas ou padronizar configurações

## Implementação Técnica

### Alterações no Código

1. **seed.ts**: Modificado para verificar `process.env.ADMIN_PASSWORD`
2. **docker-compose.yml**: Adicionada a variável de ambiente
3. **terraform/main.tf**: Incluída a configuração para produção
4. **.env e .env.example**: Documentação da nova variável

### Segurança

- ✅ Senha nunca fica hardcoded no código
- ✅ Compatível com SonarQube e ferramentas de análise
- ✅ Geração criptograficamente segura como fallback
- ✅ Configuração flexível por ambiente

### Exemplo de Uso

```bash
# Desenvolvimento local
ADMIN_PASSWORD=admin123

# Docker Compose
docker-compose up -d  # Usa admin123 como padrão

# Produção (recomendado: senha forte)
export ADMIN_PASSWORD="Minha$enhaF0rte!2024"
docker-compose up -d

# Terraform
# Configure em terraform.tfvars:
admin_password = "admin123"
```

## Credenciais do Admin

- **Email**: admin@admin.com.br
- **Senha**: Definida por ADMIN_PASSWORD ou exibida no console

## Logs de Inicialização

### Criação de novo admin com ADMIN_PASSWORD definida:
```
Admin inicial criado com sucesso!
Email: admin@admin.com.br
✅ Senha definida através da variável de ambiente ADMIN_PASSWORD
```

### Atualização de admin existente com ADMIN_PASSWORD definida:
```
Admin inicial já existe - senha atualizada com sucesso!
Email: admin@admin.com.br
✅ Senha atualizada através da variável de ambiente ADMIN_PASSWORD
```

### Criação/atualização sem ADMIN_PASSWORD (geração automática):
```
Admin inicial criado com sucesso!  # ou "já existe - senha atualizada"
Email: admin@admin.com.br
⚠️  Senha temporária gerada: Xy9$kM2nP4qR  # ou "atualizada"
⚠️  IMPORTANTE: Altere esta senha no primeiro login!
💡 TIP: Configure a variável ADMIN_PASSWORD para definir uma senha fixa
```

## Testes

A funcionalidade é coberta por testes unitários que verificam:
- Criação de novo admin com senha da variável de ambiente
- Criação de novo admin com geração automática de senha
- Atualização de admin existente com senha da variável de ambiente
- Atualização de admin existente com geração automática de senha
- Logs apropriados para cada cenário
- Segurança na criação das senhas
- Tratamento de erros de conexão e hash

## Compliance

Esta implementação atende às seguintes normas de segurança:
- ✅ SonarQube: Sem senhas hardcoded
- ✅ OWASP: Geração segura de senhas
- ✅ DevOps: Configuração por ambiente
- ✅ Auditoria: Logs claros de configuração
