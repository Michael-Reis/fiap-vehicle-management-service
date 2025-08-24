# Configuração ECS para Serviço Principal no LocalStack

# Definir endpoint do LocalStack
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"
$env:AWS_DEFAULT_REGION = "us-east-1"
$env:AWS_ENDPOINT_URL = "http://localhost:4566"

Write-Host "Configurando ECS para Serviço Principal..."

# Criar cluster ECS
aws ecs create-cluster `
    --cluster-name servico-principal-cluster `
    --endpoint-url $env:AWS_ENDPOINT_URL

# Registrar definição de task
$taskDefinition = @'
[
    {
        "name": "servico-principal",
        "image": "servico-principal:latest",
        "memory": 512,
        "essential": true,
        "portMappings": [
            {
                "containerPort": 3000,
                "hostPort": 3000,
                "protocol": "tcp"
            }
        ],
        "environment": [
            {"name": "NODE_ENV", "value": "production"},
            {"name": "PORT", "value": "3000"},
            {"name": "DB_HOST", "value": "mysql"},
            {"name": "DB_PORT", "value": "3306"},
            {"name": "DB_NAME", "value": "servico_principal"},
            {"name": "DB_USER", "value": "root"},
            {"name": "DB_PASSWORD", "value": "root123"}
        ]
    }
]
'@

aws ecs register-task-definition `
    --family servico-principal-task `
    --network-mode bridge `
    --requires-compatibilities EC2 `
    --cpu 256 `
    --memory 512 `
    --container-definitions $taskDefinition `
    --endpoint-url $env:AWS_ENDPOINT_URL

# Criar serviço ECS
aws ecs create-service `
    --cluster servico-principal-cluster `
    --service-name servico-principal-service `
    --task-definition servico-principal-task `
    --desired-count 1 `
    --endpoint-url $env:AWS_ENDPOINT_URL

Write-Host "ECS configurado para Serviço Principal com sucesso!"
