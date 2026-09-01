# 生成 public/og.png（1200x630）与 public/apple-icon.png（180x180）
# 用 Windows GDI+ 绘制，避免引入图片处理依赖。改品牌文案后重跑：npm run gen:og
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Get-CjkFont([single]$size, [System.Drawing.FontStyle]$style) {
  foreach ($name in @('Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans SC', 'Arial')) {
    try { return [System.Drawing.Font]::new($name, $size, $style, [System.Drawing.GraphicsUnit]::Pixel) } catch { }
  }
  throw 'no usable font'
}

function New-RoundedRect([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $p = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $d = $r * 2
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

function New-BrandBrush([System.Drawing.RectangleF]$rect) {
  return [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 79, 70, 229),
    [System.Drawing.Color]::FromArgb(255, 124, 58, 237),
    45)
}

function New-Solid([byte]$a, [byte]$r, [byte]$g, [byte]$b) {
  return [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb($a, $r, $g, $b))
}

function Draw-BrandMark($graphics, [single]$x, [single]$y, [single]$size, [single]$radius, [single]$fontSize) {
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $path = New-RoundedRect $x $y $size $size $radius
  $brush = New-BrandBrush ([System.Drawing.RectangleF]::new($x, $y, $size, $size))
  $graphics.FillPath($brush, $path)
  $font = [System.Drawing.Font]::new('Arial', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = [System.Drawing.StringFormat]::new()
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString('AI', $font, [System.Drawing.Brushes]::White,
    [System.Drawing.RectangleF]::new($x, $y, $size, $size), $sf)
  $font.Dispose(); $brush.Dispose(); $path.Dispose(); $sf.Dispose()
}

# ---------------- og.png ----------------
$bmp = [System.Drawing.Bitmap]::new(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$g.FillRectangle((New-Solid 255 246 247 250), [System.Drawing.Rectangle]::new(0, 0, 1200, 630))
$g.FillRectangle((New-Solid 70 99 102 241), [System.Drawing.Rectangle]::new(0, 0, 1200, 230))

$card = New-RoundedRect 80 130 1040 372 28
$g.FillPath((New-Solid 235 255 255 255), $card)
$card.Dispose()

Draw-BrandMark $g 140 188 120 26 58

$titleFont = Get-CjkFont 64 ([System.Drawing.FontStyle]::Bold)
$g.DrawString('AI 工具集', $titleFont, (New-Solid 255 38 40 44), [single]292, [single]204)

$subFont = Get-CjkFont 31 ([System.Drawing.FontStyle]::Regular)
$g.DrawString('一站式 AI 工具导航 · 写作 / 编程 / 图像 / 视频 / 办公', $subFont, (New-Solid 255 91 98 112), [single]142, [single]344)

$metaFont = Get-CjkFont 25 ([System.Drawing.FontStyle]::Regular)
$g.DrawString('站内搜索 · 分类浏览 · 夜间模式', $metaFont, (New-Solid 255 143 149 158), [single]142, [single]398)

$btn = New-RoundedRect 142 448 216 54 27
$g.FillPath((New-BrandBrush ([System.Drawing.RectangleF]::new(142, 448, 216, 54))), $btn)
$btn.Dispose()
$btnFont = Get-CjkFont 23 ([System.Drawing.FontStyle]::Bold)
$sfC = [System.Drawing.StringFormat]::new()
$sfC.Alignment = [System.Drawing.StringAlignment]::Center
$sfC.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString('开始浏览', $btnFont, [System.Drawing.Brushes]::White,
  [System.Drawing.RectangleF]::new(142, 448, 216, 54), $sfC)

$g.Dispose()
$bmp.Save((Join-Path $PSScriptRoot '..\public\og.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---------------- apple-icon.png ----------------
$ico = [System.Drawing.Bitmap]::new(180, 180)
$gi = [System.Drawing.Graphics]::FromImage($ico)
$gi.Clear([System.Drawing.Color]::Transparent)
Draw-BrandMark $gi 12 12 156 38 76
$gi.Dispose()
$ico.Save((Join-Path $PSScriptRoot '..\public\apple-icon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$ico.Dispose()

Write-Host 'ok: public/og.png (1200x630), public/apple-icon.png (180x180)'
