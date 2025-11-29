# Auth0 Deploy helper: loads envs from environments/.env.auth0 and runs a0deploy
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts/auth0-deploy.ps1 -Action import
#   powershell -ExecutionPolicy Bypass -File scripts/auth0-deploy.ps1 -Action export
#   powershell -ExecutionPolicy Bypass -File scripts/auth0-deploy.ps1 -Action dry-run

param(
  [ValidateSet("import", "export", "dry-run")]
  [string]$Action = "import",
  [string]$EnvPath = "environments/.env.auth0"
)

if (-not (Test-Path $EnvPath)) {
  Write-Error "Env file not found: $EnvPath"; exit 1
}

Get-Content $EnvPath | Where-Object { $_ -match '^\s*[^#].+=.+' } | ForEach-Object {
  $name, $value = $_ -split '=', 2
  $name = $name.Trim()
  $value = $value.Trim().Trim("'").Trim('"')
  [System.Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

switch ($Action) {
  'import' { a0deploy import --input_file ./auth0/tenant.yaml }
  'export' { a0deploy export --format yaml --output_folder ./auth0 }
  'dry-run' { a0deploy import --input_file ./auth0/tenant.yaml --dry-run }
}
