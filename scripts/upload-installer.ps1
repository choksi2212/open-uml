# Upload Windows Installer to GitHub Release
param(
    [string]$Version = "v1.0.0",
    [string]$Token = $env:GITHUB_TOKEN
)

$REPO = "choksi2212/open-uml"
$exePath = Join-Path $PSScriptRoot "..\build\OpenUML-Setup-$Version.exe"

if (-not $Token) {
    Write-Host "Error: GITHUB_TOKEN environment variable is required" -ForegroundColor Red
    Write-Host "Create a token at: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "Then run: `$env:GITHUB_TOKEN='your_token'; .\scripts\upload-installer.ps1" -ForegroundColor Cyan
    exit 1
}

if (-not (Test-Path $exePath)) {
    Write-Host "Error: Installer not found at: $exePath" -ForegroundColor Red
    Write-Host "Please build it first with: npm run electron:build" -ForegroundColor Yellow
    exit 1
}

Write-Host "Getting release information for $Version..." -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
        "User-Agent" = "Open-UML-Upload-Script"
    }
    
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/releases/tags/$Version" -Headers $headers
    
    Write-Host "✅ Found release: $($release.html_url)" -ForegroundColor Green
    Write-Host "📤 Uploading installer..." -ForegroundColor Cyan
    
    $fileName = "OpenUML-Setup-$Version.exe"
    $uploadUrl = $release.upload_url -replace '\{.*$', "?name=$fileName"
    
    $fileBytes = [System.IO.File]::ReadAllBytes($exePath)
    $fileSize = $fileBytes.Length
    
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
        "Content-Type: application/octet-stream$LF"
    ) -join $LF
    
    $bodyBytes = [System.Text.Encoding]::ASCII.GetBytes($bodyLines)
    $endBytes = [System.Text.Encoding]::ASCII.GetBytes("$LF--$boundary--$LF")
    
    $totalBody = New-Object byte[] ($bodyBytes.Length + $fileBytes.Length + $endBytes.Length)
    [System.Buffer]::BlockCopy($bodyBytes, 0, $totalBody, 0, $bodyBytes.Length)
    [System.Buffer]::BlockCopy($fileBytes, 0, $totalBody, $bodyBytes.Length, $fileBytes.Length)
    [System.Buffer]::BlockCopy($endBytes, 0, $totalBody, $bodyBytes.Length + $fileBytes.Length, $endBytes.Length)
    
    $uploadHeaders = @{
        "Authorization" = "token $Token"
        "Accept" = "application/vnd.github.v3+json"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $uploadResponse = Invoke-RestMethod -Uri $uploadUrl `
        -Method Post `
        -Headers $uploadHeaders `
        -Body $totalBody
    
    Write-Host "✅ Installer uploaded successfully!" -ForegroundColor Green
    Write-Host "🔗 Release URL: $($release.html_url)" -ForegroundColor Cyan
    Write-Host "📦 File: $fileName ($([math]::Round($fileSize/1MB, 2)) MB)" -ForegroundColor Green
    
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "❌ Release not found. Please create it first." -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "⚠️  File might already be uploaded or release doesn't exist." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
    exit 1
}

