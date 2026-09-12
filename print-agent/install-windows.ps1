param(
  [switch]$TestPrint
)

$ErrorActionPreference = "Stop"
$AgentDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $AgentDirectory ".env"
$ExampleFile = Join-Path $AgentDirectory ".env.example"
$StartFile = Join-Path $AgentDirectory "start-agent.cmd"
$TaskName = "Moca Print Agent"

$Node = Get-Command node -ErrorAction SilentlyContinue
if (-not $Node) {
  throw "Node.js 20 ou superior não foi encontrado. Instale o Node.js antes de continuar."
}

$Major = [int]((& node --version).TrimStart("v").Split(".")[0])
if ($Major -lt 20) {
  throw "É necessário Node.js 20 ou superior."
}

if (-not (Test-Path $EnvFile)) {
  Copy-Item $ExampleFile $EnvFile
  Write-Host "Arquivo .env criado. Preencha os dados antes de iniciar o agente." -ForegroundColor Yellow
  Start-Process notepad.exe -ArgumentList $EnvFile -Wait
}

if ($TestPrint) {
  Push-Location $AgentDirectory
  try { & node "src/test-print.mjs" } finally { Pop-Location }
}

$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$StartFile`""
$Trigger = New-ScheduledTaskTrigger -AtStartup
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$Settings = New-ScheduledTaskSettingsSet -RestartCount 99 -RestartInterval (New-TimeSpan -Minutes 1) -ExecutionTimeLimit (New-TimeSpan -Days 3650)

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

Write-Host "Moca Print Agent instalado e iniciado." -ForegroundColor Green
Write-Host "Logs: $AgentDirectory\logs\agent.log"
