# Docker - Serviço Principal de Veículos

Este documento descreve como executar a aplicação usando Docker e Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Estrutura do Container

- **Aplicação Node.js**: Porta 3000
- **Banco MySQL**: Porta 3306
- **Documentação API**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## Comandos básicos

### Executar o serviço completo (aplicação + banco)
```bash
docker-compose up -d
```

### Ver logs da aplicação
```bash
docker-compose logs -f servico-principal
```

### Ver logs do banco de dados
```bash
docker-compose logs -f mysql
```

### Ver logs de todos os serviços
```bash
docker-compose logs -f
```

### Parar todos os serviços
```bash
docker-compose down
```

### Rebuild completo (quando houver mudanças no código)
```bash
docker-compose down
docker-compose up --build -d
```

### Remover volumes (CUIDADO: apaga dados do banco)
```bash
docker-compose down -v
```

## Verificar se está funcionando

Após executar `docker-compose up -d`, aguarde alguns segundos e teste:

1. **Health Check**: http://localhost:3000/health
2. **Documentação da API**: http://localhost:3000/api-docs
3. **Status dos containers**:
   ```bash
   docker-compose ps
   ```

## Variáveis de Ambiente

As principais variáveis estão definidas no `docker-compose.yml`:

- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST=mysql`
- `DB_NAME=servico_principal`
- `DB_USER=root`
- `DB_PASSWORD=root123`

Para customizar, copie o `.env.example` para `.env` e ajuste conforme necessário.

## Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker-compose logs servico-principal

# Verificar se as portas estão disponíveis
netstat -an | findstr :3000
netstat -an | findstr :3306
```

### Banco de dados não conecta
```bash
# Verificar se o MySQL está healthy
docker-compose ps

# Conectar diretamente no MySQL
docker-compose exec mysql mysql -u root -p servico_principal
```

### Rebuild após mudanças no código
```bash
# Para forçar rebuild da aplicação
docker-compose build --no-cache servico-principal
docker-compose up -d
```
```bash
# No servico-vendas
docker-compose down

# No servico-principal
cd ../servico-principal
docker-compose down
```
