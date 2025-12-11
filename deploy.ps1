param(
    [string]$Action = 'start'
)

$ErrorActionPreference = 'Stop'

function Start-LMS {
    Write-Host "Starting LMS..."
    docker-compose up -d --build
    docker-compose ps
}

function Stop-LMS {
    Write-Host "Stopping LMS..."
    docker-compose down
}

function Restart-LMS {
    Write-Host "Restarting LMS..."
    docker-compose restart
    docker-compose ps
}

if ($Action -eq 'start') {
    Start-LMS
}
elseif ($Action -eq 'stop') {
    Stop-LMS
}
elseif ($Action -eq 'restart') {
    Restart-LMS
}
elseif ($Action -eq 'logs') {
    docker-compose logs -f
}
elseif ($Action -eq 'rebuild') {
    Stop-LMS
    Start-LMS
}
else {
    Write-Host "Unknown action: $Action"
    Write-Host "Usage: .\deploy.ps1 -Action [start|stop|restart|logs|rebuild]"
}
