# Get the directory where the script is located
$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Definition

$subDirectory = Join-Path -Path $scriptDirectory -ChildPath "fastapi-backend"  # Replace 'subdirectory_name' with your folder

# Change to the script's directory
Set-Location -Path $subDirectory


# PowerShell Script to Get IPv4 Address on Windows
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
}).IPAddress

Set-Location -Path $subDirectory

Write-Output "Starting Python server in $subDirectory..."

python -m uvicorn main:app --host $ip --port 8000


Read-Host -Prompt "Press Enter to exit"