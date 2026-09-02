# Resets Page 2's and Page 13's डम-डम to read डम-डम! instead of डम-डम.!!
#
# The cries came out of the page renders as one picture each: two shouts and
# their sound-wave arcs together. Only the wording changed, so the arcs are
# kept exactly as they were drawn and only the lettering is replaced — the
# supplied assets/images/डम-डम!.png, set into each cry's own place.
#
# The two spellings are not the same shape, so the new art cannot simply be
# stretched to the old one's box. What has to match is the lettering itself,
# and three numbers are measured off both to make it:
#   theta  the text's tilt, from the principal axis of its ink
#   T      the glyph height, measured perpendicular to that axis over the
#          leading third of the text only — so it is the height of the "डम"
#          the two spellings share, not of the ".!!" / "!" that differ
#   anchor the ink centroid of a window half a glyph-height wide at the
#          leading edge: the middle of the first "ड", in both spellings
# The new art is then rotated by (theta_old - theta_new), scaled by T_old/T_new
# and translated so its anchor lands on the old one's. What that gives is the
# same glyphs at the same size, on the same slope, starting at the same point;
# the shout simply ends sooner, having one "!" where it had ".!!".
#
# Measured, in each file's own pixels:
#   dum-p2-uncut  both cries  tilt -12.24 deg  glyph height 108.4
#   dum-p13       upper       tilt -18.65 deg  glyph height  66.1
#                 lower       tilt -19.16 deg  glyph height  66.6
#   डम-डम!                    tilt -12.75 deg  glyph height  99.3
# Page 13's two cries differ by half a degree in the render itself, and are
# followed rather than averaged — each is put back on its own slope.
#
# The lettering is told apart from the arcs by colour, not by position: the
# shouts carry a yellow fill and the arcs are drawn in dark strokes alone, so
# every connected run of pixels holding any yellow is lettering and the rest
# is arcs. Both pages happen to come apart into two lettering components and
# three arcs per cry.
#
#   powershell -File tools/reword-dum.ps1 `
#     -OldPath assets/figma/dum-p2-uncut.png `
#     -CryPath "assets/images/डम-डम!.png" `
#     -OutPath assets/figma/dum-p2-cry.png
#   powershell -File tools/reword-dum.ps1 `
#     -OldPath assets/figma/dum-p13.png `
#     -CryPath "assets/images/डम-डम!.png" `
#     -OutPath assets/figma/dum-p13-cry.png
param(
  [Parameter(Mandatory=$true)][string]$OldPath,
  [Parameter(Mandatory=$true)][string]$CryPath,
  [Parameter(Mandatory=$true)][string]$OutPath
)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

function Read-Argb([string]$p) {
  $bmp = New-Object System.Drawing.Bitmap -ArgumentList ((Resolve-Path $p).Path)
  $w = $bmp.Width; $h = $bmp.Height
  $r = New-Object System.Drawing.Rectangle -ArgumentList 0,0,$w,$h
  $d = $bmp.LockBits($r, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $buf = [byte[]]::new($d.Stride * $h)
  [System.Runtime.InteropServices.Marshal]::Copy($d.Scan0, $buf, 0, $buf.Length)
  $bmp.UnlockBits($d)
  [pscustomobject]@{ bmp=$bmp; w=$w; h=$h; stride=$d.Stride; buf=$buf }
}

# ink pixel coordinates, optionally only those belonging to the wanted components
function Get-Ink($img, $label, $want) {
  $w = $img.w; $h = $img.h; $stride = $img.stride; $buf = $img.buf
  $xs = [System.Collections.Generic.List[int]]::new()
  $ys = [System.Collections.Generic.List[int]]::new()
  for ($y = 0; $y -lt $h; $y++) {
    $row = $y * $stride
    $lrow = $y * $w
    for ($x = 0; $x -lt $w; $x++) {
      if ($buf[$row + $x*4 + 3] -lt 40) { continue }
      if ($null -ne $label) { if ($label[$lrow + $x] -ne $want) { continue } }
      $xs.Add($x); $ys.Add($y)
    }
  }
  [pscustomobject]@{ xs=$xs; ys=$ys; n=$xs.Count }
}

# 8-connected components over alpha, tagged with whether they carry yellow fill
function Label-Components($img) {
  $w = $img.w; $h = $img.h; $stride = $img.stride; $buf = $img.buf
  $label = [int[]]::new($w*$h)
  $stack = [int[]]::new($w*$h)
  $comps = [System.Collections.Generic.List[object]]::new()
  $next = 0
  for ($p = 0; $p -lt $w*$h; $p++) {
    $y = [int][Math]::Floor($p / $w); $x = $p - $y*$w
    if ($buf[$y*$stride + $x*4 + 3] -lt 40) { continue }
    if ($label[$p] -ne 0) { continue }
    $next++
    $sp = 0; $stack[$sp++] = $p; $label[$p] = $next
    $n = 0; $yellow = 0
    while ($sp -gt 0) {
      $q = $stack[--$sp]
      $qy = [int][Math]::Floor($q / $w); $qx = $q - $qy*$w
      $qo = $qy*$stride + $qx*4
      $n++
      if ($buf[$qo+2] -gt 200 -and $buf[$qo+1] -gt 160 -and $buf[$qo] -lt 150) { $yellow++ }
      for ($dy = -1; $dy -le 1; $dy++) {
        for ($dx = -1; $dx -le 1; $dx++) {
          if ($dx -eq 0 -and $dy -eq 0) { continue }
          $nx = $qx+$dx; $ny = $qy+$dy
          if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
          $np = $ny*$w + $nx
          if ($label[$np] -ne 0) { continue }
          if ($buf[$ny*$stride + $nx*4 + 3] -lt 40) { continue }
          $label[$np] = $next
          $stack[$sp++] = $np
        }
      }
    }
    $comps.Add([pscustomobject]@{ id=$next; px=$n; yellow=$yellow })
  }
  [pscustomobject]@{ label=$label; comps=$comps }
}

# theta / glyph height / leading anchor for a set of ink points
function Measure-Text($ink) {
  $n = $ink.n; $xs = $ink.xs; $ys = $ink.ys
  $sx = 0.0; $sy = 0.0
  for ($i = 0; $i -lt $n; $i++) { $sx += $xs[$i]; $sy += $ys[$i] }
  $cx = $sx/$n; $cy = $sy/$n
  $xx = 0.0; $yy = 0.0; $xy = 0.0
  for ($i = 0; $i -lt $n; $i++) {
    $dx = $xs[$i]-$cx; $dy = $ys[$i]-$cy
    $xx += $dx*$dx; $yy += $dy*$dy; $xy += $dx*$dy
  }
  $xx /= $n; $yy /= $n; $xy /= $n
  $theta = 0.5 * [Math]::Atan2(2*$xy, $xx-$yy)     # the text's own direction
  $ct = [Math]::Cos($theta); $st = [Math]::Sin($theta)
  $u = [double[]]::new($n); $v = [double[]]::new($n)
  $uMin = [double]::MaxValue; $uMax = [double]::MinValue
  for ($i = 0; $i -lt $n; $i++) {
    $dx = $xs[$i]-$cx; $dy = $ys[$i]-$cy
    $u[$i] = $dx*$ct + $dy*$st
    $v[$i] = -$dx*$st + $dy*$ct
    if ($u[$i] -lt $uMin) { $uMin = $u[$i] }
    if ($u[$i] -gt $uMax) { $uMax = $u[$i] }
  }
  # glyph height over the leading third, where both spellings agree
  $lead = $uMin + ($uMax-$uMin)*0.34
  $vMin = [double]::MaxValue; $vMax = [double]::MinValue
  for ($i = 0; $i -lt $n; $i++) {
    if ($u[$i] -gt $lead) { continue }
    if ($v[$i] -lt $vMin) { $vMin = $v[$i] }
    if ($v[$i] -gt $vMax) { $vMax = $v[$i] }
  }
  $T = $vMax - $vMin
  # anchor: centroid of a window half a glyph height wide at the leading edge
  $win = $uMin + $T*0.5
  $ax = 0.0; $ay = 0.0; $an = 0
  for ($i = 0; $i -lt $n; $i++) {
    if ($u[$i] -gt $win) { continue }
    $ax += $xs[$i]; $ay += $ys[$i]; $an++
  }
  [pscustomobject]@{
    theta=$theta; deg=($theta*180/[Math]::PI); T=$T; len=($uMax-$uMin)
    ax=($ax/$an); ay=($ay/$an); cx=$cx; cy=$cy; n=$n
  }
}

# ── the old cut-out: split arcs from lettering ─────────────────────────────
$oldImg = Read-Argb $OldPath
$ow = $oldImg.w; $oh = $oldImg.h
$lab = Label-Components $oldImg
$yellowIds = @($lab.comps | Where-Object { $_.yellow -gt 0 } | Select-Object -ExpandProperty id)
$arcIds    = @($lab.comps | Where-Object { $_.yellow -eq 0 } | Select-Object -ExpandProperty id)
"{0}: {1}x{2}   lettering {3}   arcs {4}" -f (Split-Path $OldPath -Leaf), $ow, $oh, ($yellowIds -join ','), ($arcIds -join ',')

# ── the new cry, measured on its own ──────────────────────────────────────
$newImg = Read-Argb $CryPath
$mNew = Measure-Text (Get-Ink $newImg $null 0)
"new cry {0}x{1}: tilt {2:N2} deg, glyph height {3:N1}, length {4:N1}, anchor ({5:N1},{6:N1})" -f `
  $newImg.w, $newImg.h, $mNew.deg, $mNew.T, $mNew.len, $mNew.ax, $mNew.ay

# ── canvas: the arcs, exactly as they were ────────────────────────────────
$fmt = [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
$outBmp = New-Object System.Drawing.Bitmap -ArgumentList $ow, $oh, $fmt
$oR = New-Object System.Drawing.Rectangle -ArgumentList 0,0,$ow,$oh
$oD = $outBmp.LockBits($oR, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $fmt)
$oBuf = [byte[]]::new($oD.Stride * $oh)
for ($y = 0; $y -lt $oh; $y++) {
  for ($x = 0; $x -lt $ow; $x++) {
    $id = $lab.label[$y*$ow + $x]
    if ($id -eq 0) { continue }
    if ($arcIds -notcontains $id) { continue }
    $s = $y*$oldImg.stride + $x*4
    $d = $y*$oD.Stride + $x*4
    $oBuf[$d] = $oldImg.buf[$s]; $oBuf[$d+1] = $oldImg.buf[$s+1]
    $oBuf[$d+2] = $oldImg.buf[$s+2]; $oBuf[$d+3] = $oldImg.buf[$s+3]
  }
}
[System.Runtime.InteropServices.Marshal]::Copy($oBuf, 0, $oD.Scan0, $oBuf.Length)
$outBmp.UnlockBits($oD)

# ── each old cry's lettering, replaced in place ───────────────────────────
$g = [System.Drawing.Graphics]::FromImage($outBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

foreach ($id in ($yellowIds | Sort-Object)) {
  $m = Measure-Text (Get-Ink $oldImg $lab.label $id)
  $scale = $m.T / $mNew.T
  $dDeg = $m.deg - $mNew.deg
  "  cry #{0}: tilt {1:N2} deg, glyph height {2:N1}, length {3:N1}, anchor ({4:N1},{5:N1}) -> scale {6:N4}, rotate {7:N2} deg, drawn {8:N0}x{9:N0}" -f `
    $id, $m.deg, $m.T, $m.len, $m.ax, $m.ay, $scale, $dDeg, ($newImg.w*$scale), ($newImg.h*$scale)
  $g.ResetTransform()
  $g.TranslateTransform([single]$m.ax, [single]$m.ay)
  $g.RotateTransform([single]$dDeg)
  $g.ScaleTransform([single]$scale, [single]$scale)
  $g.TranslateTransform([single](-$mNew.ax), [single](-$mNew.ay))
  $g.DrawImage($newImg.bmp, 0, 0, $newImg.w, $newImg.h)
}
$g.Dispose()
$outBmp.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)
"wrote {0}  ({1}x{2}, {3} bytes)" -f $OutPath, $outBmp.Width, $outBmp.Height, (Get-Item $OutPath).Length
$outBmp.Dispose(); $oldImg.bmp.Dispose(); $newImg.bmp.Dispose()
