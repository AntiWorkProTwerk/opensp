# Run only after copying the approved hosted MCP URL from Penpot's Integrations UI.
# Windows DPAPI binds the encrypted credential to the current Windows user.
$clipboardText = (Get-Clipboard -Raw).Trim()
$urlMatch = [regex]::Match($clipboardText, 'https://design\.penpot\.app/mcp/stream\?userToken=[A-Za-z0-9._~%+\-]+')
if (-not $urlMatch.Success) { throw 'No hosted Penpot connection URL was copied.' }
$connectionUrl = $urlMatch.Value
$connectionUri = [Uri]$connectionUrl
if ($connectionUri.Scheme -ne 'https' -or $connectionUri.Host -ne 'design.penpot.app' -or $connectionUri.AbsolutePath -ne '/mcp/stream' -or $connectionUri.Query -notmatch 'userToken=') {
    throw 'Clipboard does not contain the expected Penpot hosted MCP URL.'
}
$credentialDir = Join-Path $env:LOCALAPPDATA 'OpenSP'
New-Item -ItemType Directory -Path $credentialDir -Force | Out-Null
$credentialPath = Join-Path $credentialDir 'penpot-mcp.xml'
if (Test-Path -LiteralPath $credentialPath) { throw 'A saved connection already exists; inspect its status before replacing it.' }
ConvertTo-SecureString -String $connectionUrl -AsPlainText -Force | Export-Clixml -LiteralPath $credentialPath
Set-Clipboard -Value ''
$connectionUrl = $null
$clipboardText = $null
Write-Output 'Hosted Penpot connection saved with Windows user encryption outside the repository. Clipboard cleared.'
