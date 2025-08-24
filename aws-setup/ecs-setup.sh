#!/bin/bash

# Configuração ECS para Serviço Principal no LocalStack

# Definir endpoint do LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
export AWS_ENDPOINT_URL=http://localhost:4566

echo "Configurando ECS para Serviço Principal..."

# Criar cluster ECS
aws ecs create-cluster \
    --cluster-name servico-principal-cluster \
    --endpoint-url $AWS_ENDPOINT_URL

# Registrar definição de task
aws ecs register-task-definition \
    --family servico-principal-task \
    --network-mode bridge \
    --requires-compatibilities EC2 \
    --cpu 256 \
    --memory 512 \
    --container-definitions '[
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
    ]' \
    --endpoint-url $AWS_ENDPOINT_URL

# Criar serviço ECS
aws ecs create-service \
    --cluster servico-principal-cluster \
    --service-name servico-principal-service \
    --task-definition servico-principal-task \
    --desired-count 1 \
    --endpoint-url $AWS_ENDPOINT_URL

echo "ECS configurado para Serviço Principal com sucesso!"
