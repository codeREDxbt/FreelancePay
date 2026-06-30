#############################################################
# Deploy FreelancePay escrow contract to Stellar TESTNET
# Requires:
#   - Rust toolchain (rustup)
#   - stellar CLI on PATH or at %USERPROFILE%\AppData\Local\Temp\stellar.exe
#   - wasm-opt (optional, from Binaryen) on PATH or at
#     %USERPROFILE%\AppData\Local\Temp\binaryen-version_118\bin\wasm-opt.exe
#   - A funded testnet secret key in $env:DEPLOYER_SECRET
#     (Generate one: stellar keys generate deployer --fund --network testnet)
#############################################################

$ErrorActionPreference = "Stop"

if (-not $env:DEPLOYER_SECRET) {
    Write-Host "ERROR: Set `$env:DEPLOYER_SECRET first." -ForegroundColor Red
    Write-Host 'Example: $env:DEPLOYER_SECRET = "SA..."  # your testnet funded secret key'
    exit 1
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$wasmPath = Join-Path $projectRoot "contracts/escrow/target/wasm32v1-none/release/escrow.wasm"

# --- 0. Locate stellar CLI ---
$stellarBin = Get-Command stellar -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $stellarBin) {
    $localStellar = Join-Path $env:USERPROFILE "AppData\Local\Temp\stellar.exe"
    if (Test-Path $localStellar) {
        $stellarBin = $localStellar
    } else {
        throw "stellar CLI not found. Install via cargo or download from GitHub releases."
    }
}
Write-Host "[0/5] Using stellar: $stellarBin" -ForegroundColor Green

# --- 1. Build WASM if missing ---
if (-not (Test-Path $wasmPath)) {
    Write-Host "[1/5] Building WASM..." -ForegroundColor Cyan
    Push-Location (Join-Path $projectRoot "contracts/escrow")
    try {
        cargo build --target wasm32v1-none --release
    } finally {
        Pop-Location
    }
    if (-not (Test-Path $wasmPath)) {
        throw "WASM build failed; expected $wasmPath"
    }
} else {
    Write-Host "[1/5] WASM already built at $wasmPath" -ForegroundColor Green
}

# --- 1b. Optimize WASM with wasm-opt if available ---
$wasmOptPath = Get-Command wasm-opt -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if (-not $wasmOptPath) {
    $localWasmOpt = Join-Path $env:USERPROFILE "AppData\Local\Temp\binaryen-version_118\bin\wasm-opt.exe"
    if (Test-Path $localWasmOpt) { $wasmOptPath = $localWasmOpt }
}
$deployWasm = $wasmPath
if ($wasmOptPath) {
    Write-Host "[1b/5] Optimizing WASM with wasm-opt..." -ForegroundColor Cyan
    $optWasm = Join-Path $projectRoot "contracts/escrow/target/wasm32v1-none/release/escrow_opt.wasm"
    & $wasmOptPath $wasmPath -Oz -o $optWasm --strip-producers --strip-debug --enable-bulk-memory
    if (Test-Path $optWasm) { $deployWasm = $optWasm }
    Write-Host "   Optimized WASM: $deployWasm" -ForegroundColor Green
} else {
    Write-Host "[1b/5] wasm-opt not found, deploying unoptimized WASM" -ForegroundColor Yellow
}

# --- 2. Configure stellar CLI with deployer key ---
Write-Host "[2/5] Configuring stellar CLI with deployer key..." -ForegroundColor Cyan
$envConfig = @"
[alice]
secret_key = "$env:DEPLOYER_SECRET"
network_passphrase = "Test SDF Network ; September 2015"
network = "TESTNET"
"@
$cfgPath = "$env:USERPROFILE\.config\stellar\stellar-cli.toml"
$cfgDir  = Split-Path -Path $cfgPath -Parent
if (-not (Test-Path $cfgDir)) { New-Item -ItemType Directory -Path $cfgDir | Out-Null }
Set-Content -Path $cfgPath -Value $envConfig
& $stellarBin keys use alice 2>&1 | Out-Null
$pubKey = (& $stellarBin keys address alice 2>&1 | Out-String).Trim()
Write-Host "   Deployer: $pubKey" -ForegroundColor Yellow

# Confirm account is funded
$horizon = "https://horizon-testnet.stellar.org"
$acctUrl = "$horizon/accounts/$pubKey"
try {
    Invoke-WebRequest -Uri $acctUrl -UseBasicParsing | Out-Null
} catch {
    Write-Host "   Account not found on testnet. Funding via friendbot..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://friendbot.stellar.org?addr=$pubKey" -UseBasicParsing | Out-Null
    Start-Sleep -Seconds 5
}

# --- 3. Upload WASM ---
Write-Host "[3/5] Uploading WASM..." -ForegroundColor Cyan
$installOut = & $stellarBin contract upload --wasm $deployWasm --source alice --network testnet 2>&1 | Out-String
Write-Host "   Output: $installOut"
$wasmHash = if ($installOut -match '[a-f0-9]{64}') { $Matches[0] } else { $null }
if (-not $wasmHash) { throw "Could not parse WASM hash from upload output" }
Write-Host "   WASM Hash: $wasmHash" -ForegroundColor Yellow

# --- 4. Deploy ---
Write-Host "[4/5] Deploying contract..." -ForegroundColor Cyan
$deployOut = & $stellarBin contract deploy --wasm-hash $wasmHash --source alice --network testnet 2>&1 | Out-String
$contractId = if ($deployOut -match 'C[A-Z0-9]{55}') { $Matches[0] } else { $null }
if (-not $contractId) { throw "Could not parse Contract ID from deploy output. Full output: $deployOut" }

Write-Host ""
Write-Host "SUCCESS!" -ForegroundColor Green
Write-Host "Contract ID: $contractId"
Write-Host ""

# --- 5. Patch .env.local ---
$envFile = Join-Path $projectRoot ".env.local"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    if ($content -match 'NEXT_PUBLIC_ESCROW_CONTRACT_ID=') {
        $content = $content -replace 'NEXT_PUBLIC_ESCROW_CONTRACT_ID=.*', "NEXT_PUBLIC_ESCROW_CONTRACT_ID=$contractId"
    } else {
        $content += "`nNEXT_PUBLIC_ESCROW_CONTRACT_ID=$contractId`n"
    }
    Set-Content -Path $envFile -Value $content.TrimEnd() -NoNewline
    Write-Host "Updated .env.local with NEXT_PUBLIC_ESCROW_CONTRACT_ID=$contractId" -ForegroundColor Green
} else {
    Write-Host ".env.local not found at $envFile. Add this manually:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_ESCROW_CONTRACT_ID=$contractId"
}

# --- 6. Verify ---
try {
    $verify = Invoke-WebRequest "$horizon/contracts/$contractId" -UseBasicParsing
    Write-Host "Verified on Horizon: $($verify.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Horizon verification failed. Contract may still be propagating (retry in 5s)." -ForegroundColor Yellow
}

# --- 7. Clean up secret from disk ---
try {
    Remove-Item -Force $cfgPath -ErrorAction SilentlyContinue
    Write-Host "Cleaned up stellar CLI config (secret removed from disk)." -ForegroundColor Green
} catch {
    Write-Host "WARNING: Could not remove $cfgPath - delete manually." -ForegroundColor Yellow
}
