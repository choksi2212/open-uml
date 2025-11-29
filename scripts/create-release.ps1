# Create GitHub Release for Open UML
$REPO = "choksi2212/open-uml"
$VERSION = "v1.0.0"
$TOKEN = $env:GITHUB_TOKEN

if (-not $TOKEN) {
    Write-Host "Error: GITHUB_TOKEN environment variable is required" -ForegroundColor Red
    Write-Host "Please create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "Then set it with: `$env:GITHUB_TOKEN='your_token'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this script with: `$env:GITHUB_TOKEN='your_token'; .\scripts\create-release.ps1" -ForegroundColor Cyan
    exit 1
}

# Read changelog
$changelog = "✨ Initial release of Open UML`n`nA completely offline, smooth, modern PlantUML editor with bundled rendering engine."
$changelogPath = Join-Path $PSScriptRoot "..\CHANGELOG.md"
if (Test-Path $changelogPath) {
    $content = Get-Content $changelogPath -Raw
    if ($content -match '(?s)## \[1\.0\.0\](.*?)(?=## \[|$)') {
        $changelog = $matches[1].Trim()
    }
}

$releaseBody = @"
$changelog

## 📦 Downloads

- 🪟 **Windows**: Download ``OpenUML-Setup-$VERSION.exe`` below
- 🍎 **macOS**: Coming soon (build in progress)

## 🚀 Installation

### Windows
1. Download and run the ``.exe`` installer
2. Follow the setup wizard
3. Launch Open UML from the desktop shortcut
"@

$releaseData = @{
    tag_name = $VERSION
    name = "Open UML $VERSION"
    body = $releaseBody
    draft = $false
    prerelease = $false
} | ConvertTo-Json

$headers = @{
    "Authorization" = "token $TOKEN"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "Open-UML-Release-Script"
}

Write-Host "Creating release $VERSION..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$REPO/releases" `
        -Method Post `
        -Headers $headers `
        -Body $releaseData `
        -ContentType "application/json"
    
    Write-Host "✅ Release created successfully!" -ForegroundColor Green
    Write-Host "🔗 URL: $($response.html_url)" -ForegroundColor Cyan
    
    # Upload Windows installer
    $exePath = Join-Path $PSScriptRoot "..\build\OpenUML-Setup-$VERSION.exe"
    if (Test-Path $exePath) {
        Write-Host "`n📤 Uploading Windows installer..." -ForegroundColor Cyan
        
        $fileName = "OpenUML-Setup-$VERSION.exe"
        $uploadUrl = $response.upload_url -replace '\{.*$', "?name=$fileName"
        
        $fileBytes = [System.IO.File]::ReadAllBytes($exePath)
        $fileEnc = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileBytes)
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        
        $bodyLines = (
            "--$boundary",
            "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"",
            "Content-Type: application/octet-stream$LF",
            $fileEnc,
            "--$boundary--"
        ) -join $LF
        
        $uploadHeaders = @{
            "Authorization" = "token $TOKEN"
            "Accept" = "application/vnd.github.v3+json"
            "Content-Type" = "multipart/form-data; boundary=$boundary"
        }
        
        try {
            $uploadResponse = Invoke-RestMethod -Uri $uploadUrl `
                -Method Post `
                -Headers $uploadHeaders `
                -Body ([System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($bodyLines))
            
            Write-Host "✅ $fileName uploaded successfully!" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to upload installer: $_" -ForegroundColor Yellow
            Write-Host "   You can manually upload it at: $($response.html_url)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠️  Windows installer not found at: $exePath" -ForegroundColor Yellow
        Write-Host "   Please build it first with: npm run electron:build" -ForegroundColor Yellow
    }
    
    Write-Host "`n🎉 Release is complete!" -ForegroundColor Green
    Write-Host "🔗 View it at: $($response.html_url)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to create release: $_" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "   Release might already exist. Check: https://github.com/$REPO/releases" -ForegroundColor Yellow
    }
    exit 1
}

