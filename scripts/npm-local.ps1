$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$npmCli = Join-Path $projectRoot '.tools\package\bin\npm-cli.js'
if (-not (Test-Path -LiteralPath $npmCli)) {
    $toolDirectory = Join-Path $projectRoot '.tools'
    New-Item -ItemType Directory -Force -Path $toolDirectory | Out-Null
    $metadata = Invoke-RestMethod 'https://registry.npmjs.org/npm/12.2.3'
    $archive = Join-Path $toolDirectory 'npm.tgz'
    Invoke-WebRequest $metadata.dist.tarball -OutFile $archive
    & tar -xzf $archive -C $toolDirectory
    if ($LASTEXITCODE -ne 0) { throw 'Could not extract npm.' }
}
Push-Location -LiteralPath $projectRoot
try { & node $npmCli @args; $result = $LASTEXITCODE } finally { Pop-Location }
exit $result
