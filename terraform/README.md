# 🚀 Terraform Deploy - FIAP Vehicle Management Service

Deploy automatizado da API no AWS ECS + Fargate usando Terraform.

## 📋 Pré-requisitos

- ✅ **Terraform** instalado (>= 1.0)
- ✅ **AWS CLI** configurado
- ✅ **Docker** instalado
- ✅ **Imagem no ECR**: `497986631333.dkr.ecr.us-east-1.amazonaws.com/fiap-vehicle-management-service:latest`

## 🚀 Deploy Rápido

### 1. **Deploy completo**:
```powershell
.\terraform\deploy.ps1
```

### 2. **Apenas visualizar o plano**:
```powershell
.\terraform\deploy.ps1 -Plan
```

### 3. **Destruir infraestrutura**:
```powershell
.\terraform\deploy.ps1 -Destroy
```

## 🏗️ O que será criado:

### **Rede**
- **VPC** com CIDR `10.0.0.0/16`
- **2 Subnets públicas** em AZs diferentes
- **Internet Gateway** para acesso à internet
- **Route Tables** configuradas
- **Security Group** liberando porta 3000

### **Containers**
- **ECS Cluster** com Fargate
- **Task Definition** otimizada
- **ECS Service** com 1 instância
- **CloudWatch Logs** configurado
- **IAM Roles** necessárias

## 📊 Recursos Criados

| Recurso | Nome | Descrição |
|---------|------|-----------|
| VPC | `fiap-vehicle-management-vpc` | Rede virtual isolada |
| Subnets | `fiap-vehicle-management-public-subnet-*` | Subnets públicas |
| Security Group | `fiap-vehicle-management-sg` | Firewall para porta 3000 |
| ECS Cluster | `fiap-vehicle-management-cluster` | Cluster Fargate |
| ECS Service | `fiap-vehicle-management-service` | Serviço da aplicação |
| CloudWatch | `/ecs/fiap-vehicle-management` | Logs da aplicação |

## 🌐 Acesso à API

Após o deploy, a API estará disponível em:
```
http://[IP-PÚBLICO]:3000
```

O IP será exibido no final da execução.

## 📝 Comandos Úteis

### **Ver logs em tempo real**:
```bash
aws logs tail /ecs/fiap-vehicle-management --follow --region us-east-1
```

### **Status do serviço**:
```bash
aws ecs describe-services \
  --cluster fiap-vehicle-management-cluster \
  --services fiap-vehicle-management-service \
  --region us-east-1
```

### **Obter IP público**:
```bash
# 1. Obter ARN da task
TASK_ARN=$(aws ecs list-tasks \
  --cluster fiap-vehicle-management-cluster \
  --service-name fiap-vehicle-management-service \
  --query 'taskArns[0]' --output text --region us-east-1)

# 2. Obter ENI ID
ENI_ID=$(aws ecs describe-tasks \
  --cluster fiap-vehicle-management-cluster \
  --tasks $TASK_ARN \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text --region us-east-1)

# 3. Obter IP público
PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids $ENI_ID \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text --region us-east-1)

echo "API disponível em: http://$PUBLIC_IP:3000"
```

## 🔄 Atualizar Aplicação

Para fazer deploy de uma nova versão:

1. **Fazer push da nova imagem** para ECR
2. **Forçar novo deployment**:
   ```bash
   aws ecs update-service \
     --cluster fiap-vehicle-management-cluster \
     --service fiap-vehicle-management-service \
     --force-new-deployment \
     --region us-east-1
   ```

## 💰 Custos Estimados

| Recurso | Custo/mês |
|---------|-----------|
| Fargate (0.25 vCPU + 0.5 GB) | ~$8.50 |
| CloudWatch Logs (5GB grátis) | $0.00 |
| VPC, Subnets, IGW | $0.00 |
| **Total** | **~$8.50/mês** |

## 🔧 Customização

Para personalizar a infraestrutura, edite as variáveis em `main.tf`:

```hcl
variable "app_name" {
  default = "fiap-vehicle-management"  # Nome da aplicação
}

variable "container_port" {
  default = 3000  # Porta da aplicação
}

variable "ecr_image_uri" {
  default = "497986631333.dkr.ecr.us-east-1.amazonaws.com/fiap-vehicle-management-service:latest"
}
```

## 🧹 Limpeza

Para deletar TODA a infraestrutura:

```powershell
.\terraform\deploy.ps1 -Destroy
```

⚠️ **CUIDADO**: Isso vai deletar TODOS os recursos criados!

## 🚨 Troubleshooting

### **Erro: "No tasks found"**
- A task pode estar parando por erro na aplicação
- Verifique os logs: `aws logs tail /ecs/fiap-vehicle-management --follow`

### **Erro: "Cannot pull image"**
- Verifique se a imagem existe no ECR
- Confirme as credenciais AWS

### **API não responde**
- Aguarde alguns minutos para a task iniciar
- Verifique se a aplicação roda na porta 3000
- Teste localmente: `docker run -p 3000:3000 [imagem]`

### **Terraform init falha**
- Verifique se tem permissões AWS suficientes
- Execute: `aws sts get-caller-identity`

## 📁 Estrutura de Arquivos

```
terraform/
├── main.tf          # Configuração principal
├── deploy.ps1       # Script de deploy
├── .gitignore       # Ignorar arquivos terraform
└── README.md        # Esta documentação
```

## 🎯 Próximos Passos

Após o deploy básico funcionar, considere adicionar:

- [ ] **Application Load Balancer** para alta disponibilidade
- [ ] **Auto Scaling** para elasticidade
- [ ] **CloudFront** para CDN
- [ ] **Route 53** para domínio personalizado
- [ ] **RDS** para banco de dados gerenciado
- [ ] **Secrets Manager** para variáveis sensíveis
