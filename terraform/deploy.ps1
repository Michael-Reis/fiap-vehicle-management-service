# Script para Deploy com Terraform
# Executa terraform init, plan e apply

param(
    [switch]$Destroy = $false,
    [switch]$Plan = $false
)

Write-Host "🚀 FIAP Vehicle Management - Deploy com Terraform" -ForegroundColor Green
Write-Host ""

# Navegar para o diretório terraform
Set-Location "terraform"

if ($Destroy) {
    Write-Host "🗑️ DESTRUINDO infraestrutura..." -ForegroundColor Red
    Write-Host "⚠️  ATENÇÃO: Isso vai deletar TUDO!" -ForegroundColor Yellow
    $confirm = Read-Host "Tem certeza? (yes/no)"
    if ($confirm -eq "yes") {
        terraform destroy -auto-approve
    } else {
        Write-Host "❌ Operação cancelada" -ForegroundColor Yellow
    }
    Set-Location ".."
    return
}

# 1. Terraform Init
Write-Host "📦 Inicializando Terraform..." -ForegroundColor Cyan
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no terraform init" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

# 2. Terraform Plan
Write-Host "`n📋 Planejando infraestrutura..." -ForegroundColor Cyan
terraform plan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no terraform plan" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

if ($Plan) {
    Write-Host "✅ Plan executado com sucesso!" -ForegroundColor Green
    Set-Location ".."
    return
}

# 3. Terraform Apply
Write-Host "`n🚀 Criando infraestrutura..." -ForegroundColor Cyan
Write-Host "⏳ Isso pode levar alguns minutos..." -ForegroundColor Yellow
terraform apply -auto-approve

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no terraform apply" -ForegroundColor Red
    Set-Location ".."
    exit 1
}

Write-Host "`n🎉 Deploy concluído com sucesso!" -ForegroundColor Green

# Obter outputs
Write-Host "`n📋 Informações da infraestrutura:" -ForegroundColor Yellow
terraform output

# Obter IP público da task
Write-Host "`n🌐 Obtendo IP público..." -ForegroundColor Cyan
$CLUSTER_NAME = terraform output -raw ecs_cluster_name
$SERVICE_NAME = terraform output -raw ecs_service_name

Start-Sleep 10  # Aguardar um pouco para a task iniciar

$TASK_ARN = aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --query 'taskArns[0]' --output text --region us-east-1
if ($TASK_ARN -and $TASK_ARN -ne "None") {
    $ENI_ID = aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text --region us-east-1
    if ($ENI_ID -and $ENI_ID -ne "None") {
        $PUBLIC_IP = aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text --region us-east-1
        if ($PUBLIC_IP -and $PUBLIC_IP -ne "None") {
            Write-Host "`n🌐 Sua API está disponível em:" -ForegroundColor Green
            Write-Host "http://${PUBLIC_IP}:3000" -ForegroundColor Cyan
        } else {
            Write-Host "⏳ IP público ainda não disponível. Aguarde alguns minutos." -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "⏳ Task ainda não iniciada. Aguarde alguns minutos." -ForegroundColor Yellow
}

Write-Host "`n📝 Comandos úteis:" -ForegroundColor Yellow
Write-Host "Ver logs: aws logs tail /ecs/fiap-vehicle-management --follow --region us-east-1" -ForegroundColor White
Write-Host "Ver status: aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region us-east-1" -ForegroundColor White
Write-Host "Destruir tudo: .\deploy.ps1 -Destroy" -ForegroundColor White

Set-Location ".."
