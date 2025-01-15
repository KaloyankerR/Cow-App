$scriptDirectory = Split-Path -Parent $MyInvocation.MyCommand.Definition

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"
}).IPAddress


# Change to the script's directory
Set-Location -Path $scriptDirectory
Write-Output "Updated API_BASE_URL in config.js to http://$ip:8000"

$configPath = Join-Path -Path $scriptDirectory -ChildPath "config.js"
(Get-Content $configPath) -replace '(http://)[\d\.]+(:8000)', "`http://$ip`$2" | Set-Content $configPath

# Run 'npx expo start' in the script's directory
Write-Output "Starting Expo server in $scriptDirectory..."
npx expo start


Read-Host -Prompt "Press Enter to exit"