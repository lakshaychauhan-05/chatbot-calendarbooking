Param()

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stateFile = Join-Path $root ".project-processes.json"

if (Test-Path $stateFile) {
    Remove-Item $stateFile -Force
}

$processes = @()

function Start-Terminal {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )

    $escapedTitle = $Title.Replace("'", "''")
    $escapedDir = $WorkingDirectory.Replace("'", "''")
    $escapedCommand = $Command.Replace("'", "''")

    $psCommand = "& {`$Host.UI.RawUI.WindowTitle = '$escapedTitle'; Set-Location -LiteralPath '$escapedDir'; $escapedCommand}"
    $proc = Start-Process -FilePath "powershell" -ArgumentList @("-NoExit", "-Command", $psCommand) -PassThru
    return $proc
}

$frontendDir = Join-Path $root "chatbot-frontend"
$frontend = Start-Terminal -Title "Calendar Frontend" -WorkingDirectory $frontendDir -Command "npm start"
$processes += [pscustomobject]@{ Name = "frontend"; Id = $frontend.Id; Command = "npm start"; WorkingDirectory = $frontendDir }

Start-Sleep -Seconds 1

$api = Start-Terminal -Title "Calendar API" -WorkingDirectory $root -Command "python run.py"
$processes += [pscustomobject]@{ Name = "calendar-api"; Id = $api.Id; Command = "python run.py"; WorkingDirectory = $root }

Start-Sleep -Seconds 1

$chatbotDir = Join-Path $root "chatbot-service"
$chatbot = Start-Terminal -Title "Calendar Chatbot" -WorkingDirectory $chatbotDir -Command "python run_chatbot.py"
$processes += [pscustomobject]@{ Name = "chatbot"; Id = $chatbot.Id; Command = "python run_chatbot.py"; WorkingDirectory = $chatbotDir }

$processes | ConvertTo-Json -Depth 2 | Set-Content -Path $stateFile -Encoding UTF8

Write-Host "Started project processes. PIDs saved to $stateFile"
