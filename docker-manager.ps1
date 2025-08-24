# Script PowerShell para gerenciar a aplicação Docker
# Uso: .\docker-manager.ps1 [comando]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "build", "status", "clean")]
    [string]$Action = "start"
)

function Show-Help {
    Write-Host "Docker Manager - Serviço Principal de Veículos" -ForegroundColor Green
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
    Write-Host "  start   - Inicia os containers"
    Write-Host "  stop    - Para os containers"
    Write-Host "  restart - Reinicia os containers"
    Write-Host "  logs    - Mostra os logs"
    Write-Host "  build   - Rebuild dos containers"
    Write-Host "  status  - Status dos containers"
    Write-Host "  clean   - Remove containers e volumes (CUIDADO!)"
    Write-Host ""
    Write-Host "Exemplo: .\docker-manager.ps1 start"
}

switch ($Action) {
    "start" {
        Write-Host "Iniciando containers..." -ForegroundColor Green
        docker-compose up -d
        Write-Host "Aguardando containers ficarem prontos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Write-Host "Verificando status..." -ForegroundColor Yellow
        docker-compose ps
        Write-Host ""
        Write-Host "Aplicação disponível em:" -ForegroundColor Green
        Write-Host "  - API: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "  - Health: http://localhost:3000/health" -ForegroundColor Cyan
        Write-Host "  - Docs: http://localhost:3000/api-docs" -ForegroundColor Cyan
    }
    
    "stop" {
        Write-Host "Parando containers..." -ForegroundColor Yellow
        docker-compose down
    }
    
    "restart" {
        Write-Host "Reiniciando containers..." -ForegroundColor Yellow
        docker-compose restart
    }
    
    "logs" {
        Write-Host "Mostrando logs (Ctrl+C para sair)..." -ForegroundColor Green
        docker-compose logs -f
    }
    
    "build" {
        Write-Host "Fazendo rebuild dos containers..." -ForegroundColor Yellow
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
    }
    
    "status" {
        Write-Host "Status dos containers:" -ForegroundColor Green
        docker-compose ps
        Write-Host ""
        Write-Host "Testando health check..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            Write-Host "✅ API está respondendo" -ForegroundColor Green
        } catch {
            Write-Host "❌ API não está respondendo" -ForegroundColor Red
        }
    }
    
    "clean" {
        Write-Host "⚠️  ATENÇÃO: Isto irá remover todos os containers e volumes!" -ForegroundColor Red
        $confirm = Read-Host "Tem certeza? (digite 'sim' para confirmar)"
        if ($confirm -eq "sim") {
            Write-Host "Removendo containers e volumes..." -ForegroundColor Red
            docker-compose down -v
            docker system prune -f
        } else {
            Write-Host "Operação cancelada." -ForegroundColor Yellow
        }
    }
    
    default {
        Show-Help
    }
}
