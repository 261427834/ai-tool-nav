param(
  [Parameter(Mandatory = $true)][string]$Manifest,
  [string]$Ua = "Mozilla/5.0"
)

# 批量下载图标：读取 manifest（[{file,url,id}]），逐个抓取，写出 .result.json
$ErrorActionPreference = 'Continue'
$jobs = Get-Content -LiteralPath $Manifest -Raw | ConvertFrom-Json
$results = [System.Collections.Generic.List[object]]::new()
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$ok = 0
$fail = 0

foreach ($j in $jobs) {
  try {
    Invoke-WebRequest -Uri $j.url -WebSession $session -UserAgent $Ua -TimeoutSec 25 -UseBasicParsing -OutFile $j.file | Out-Null
    $size = (Get-Item -LiteralPath $j.file).Length
    if ($size -lt 70) {
      Remove-Item -LiteralPath $j.file -Force -ErrorAction SilentlyContinue
      $results.Add(@{ id = $j.id; url = $j.url; ok = $false; error = "too-small($size)" })
      $fail++
    } else {
      $results.Add(@{ id = $j.id; url = $j.url; ok = $true; size = $size })
      $ok++
    }
  } catch {
    $results.Add(@{ id = $j.id; url = $j.url; ok = $false; error = $_.Exception.Message })
    $fail++
  }
  if (($ok + $fail) % 100 -eq 0) { Write-Host "  ... $ok ok / $fail fail" }
  Start-Sleep -Milliseconds 40
}

$out = ($Manifest -replace '\.json$', '.result.json')
$results | ConvertTo-Json -Compress | Set-Content -LiteralPath $out -Encoding utf8NoBOM
Write-Host "done: $ok ok, $fail fail"
