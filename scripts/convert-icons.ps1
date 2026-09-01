# 把 icon-tmp 下的 ico/gif/webp 统一转为 PNG 写入 public/icons
param(
  [Parameter(Mandatory = $true)][string]$Src,
  [Parameter(Mandatory = $true)][string]$Dst
)
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$files = Get-ChildItem -LiteralPath $Src -File | Where-Object { $_.Extension -notin '.png' }
$ok = 0
$fail = 0
foreach ($f in $files) {
  $out = Join-Path $Dst ($f.BaseName + '.png')
  try {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    # ICO 取最大帧
    $frameDim = [System.Drawing.Imaging.FrameDimension]::new([Guid]::new("Dimension Page Size"))
    try {
      $count = $img.GetFrameCount($frameDim)
      if ($count -gt 1) {
        $best = 0
        $bestIdx = 0
        for ($i = 0; $i -lt $count; $i++) {
          $img.SelectActiveFrame($frameDim, $i) | Out-Null
          $props = $img.PropertyItems
          if ($img.Width * $img.Height -gt $best) { $best = $img.Width * $img.Height; $bestIdx = $i }
        }
        $img.SelectActiveFrame($frameDim, $bestIdx) | Out-Null
      }
    } catch { }
    $bmp = [System.Drawing.Bitmap]::new($img, $img.Width, $img.Height)
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose(); $img.Dispose()
    $ok++
  } catch {
    try {
      Copy-Item -LiteralPath $f.FullName -Destination $out -Force
      $ok++
    } catch { $fail++ }
  }
  Remove-Item -LiteralPath $f.FullName -Force -ErrorAction SilentlyContinue
}
Write-Host "转换完成：$ok 成功 / $fail 失败"
