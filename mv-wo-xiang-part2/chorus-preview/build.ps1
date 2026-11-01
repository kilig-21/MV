$ErrorActionPreference = 'Stop'
node (Join-Path $PSScriptRoot 'build.mjs') @args
if ($LASTEXITCODE -ne 0) { throw 'Preview build failed' }
