# Puts back the parts of Page 2's डम-डम that its export cut off.
#
# assets/figma/dum-p2.png was cut out of a page render, and the cut was too
# tight: the upper डम-डम's "!!" runs off the top of the file, and the lower
# one's two longest sound-waves run off the bottom. On the page they simply
# stop mid-stroke.
#
# Nothing has to be redrawn, because the file already holds a whole copy of
# every piece — just in the other instance. The upper डम-डम is cut and the
# lower one is not; the lower waves are cut and the upper ones are not. So the
# whole copy of each is used to fill in what the cut took from its twin.
#
# The two instances line up exactly. Measured by sliding one over the other:
#   text   offset (+121, -217)   40,008 of 40,265 pixels land on the ink
#                                already there (99.4%), 1,277 above the cut
#   wave 1 offset (-124, +234)   97.7% agreement,  1,284 below the cut
#   wave 2 offset (-126, +233)   96.8% agreement,    558 below the cut
#   wave 3 offset (-126, +233)   92.5% agreement,      0 below the cut — whole
# The three waves agree on the offset independently, which is what says the
# two instances really are the same artwork at the same size and angle.
#
# ONLY the missing pixels are written. Every pixel the file already had is
# left byte for byte as it was.
#
#   powershell -File tools/uncut-dum-p2.ps1

Add-Type -AssemblyName System.Drawing
$fig = Join-Path (Split-Path $PSScriptRoot -Parent) "assets\figma"
$src = "$fig\dum-p2.png"

$bm = [System.Drawing.Bitmap]::FromFile($src)
$W = $bm.Width; $H = $bm.Height
$rect = New-Object System.Drawing.Rectangle 0,0,$W,$H
$lb = $bm.LockBits($rect,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$ST = $lb.Stride; $N = $ST*$H
$px = New-Object byte[] $N
[System.Runtime.InteropServices.Marshal]::Copy($lb.Scan0,$px,0,$N)
$bm.UnlockBits($lb); $bm.Dispose()
"read $src  ${W}x${H}"

# --- find the pieces -------------------------------------------------------
$ink = New-Object 'bool[]' ($W*$H)
for($y=0;$y -lt $H;$y++){ $r=$y*$ST
  for($x=0;$x -lt $W;$x++){ if($px[$r+$x*4+3] -gt 110){ $ink[$y*$W+$x]=$true } } }

$seen = New-Object 'bool[]' ($W*$H)
$blobs = @()
for($s=0;$s -lt ($W*$H);$s++){
  if(-not $ink[$s] -or $seen[$s]){continue}
  $stack = New-Object System.Collections.Generic.Stack[int]
  $stack.Push($s); $seen[$s]=$true
  $cells = New-Object System.Collections.Generic.List[int]
  $x0=$W;$x1=-1;$y0=$H;$y1=-1
  while($stack.Count -gt 0){
    $i=$stack.Pop(); [void]$cells.Add($i)
    $iy=[Math]::Floor($i/$W); $ix=$i-$iy*$W
    if($ix -lt $x0){$x0=$ix}; if($ix -gt $x1){$x1=$ix}
    if($iy -lt $y0){$y0=$iy}; if($iy -gt $y1){$y1=$iy}
    foreach($d in @(-1,1,-$W,$W,(-$W-1),(-$W+1),($W-1),($W+1))){
      if($d -eq -1 -and $ix -eq 0){continue}
      if($d -eq 1 -and $ix -eq ($W-1)){continue}
      $j=$i+$d; if($j -lt 0 -or $j -ge ($W*$H)){continue}
      if($seen[$j] -or -not $ink[$j]){continue}
      $seen[$j]=$true; $stack.Push($j)
    }
  }
  if($cells.Count -ge 40){ $blobs += [pscustomobject]@{cells=$cells;x0=$x0;x1=$x1;y0=$y0;y1=$y1;n=$cells.Count} }
}
$blobs = $blobs | Sort-Object n -Descending
"found $($blobs.Count) pieces"
$texts = $blobs | Select-Object -First 2
$waves = $blobs | Select-Object -Skip 2
$textWhole = $texts | Where-Object { $_.y0 -gt 0 } | Select-Object -First 1
$wavesWhole = ($waves | Where-Object { $_.y0 -lt 260 } | Sort-Object x0)
foreach($b in $blobs){ "   piece $($b.n)px  x $($b.x0)..$($b.x1)  y $($b.y0)..$($b.y1)" }

# which piece owns each pixel, so a copy never drags a neighbour along
$owner = New-Object 'int[]' ($W*$H)
for($i=0;$i -lt ($W*$H);$i++){ $owner[$i] = -1 }
for($k=0;$k -lt $blobs.Count;$k++){ foreach($i in $blobs[$k].cells){ $owner[$i]=$k } }
function IndexOfBlob($b){ for($k=0;$k -lt $blobs.Count;$k++){ if($blobs[$k] -eq $b){ return $k } } return -1 }

# --- the new canvas --------------------------------------------------------
$TOP = 25      # rows the cut took off the top    (text offset dy = -217, so -25)
$BOT = 62      # rows the cut took off the bottom (wave 1 reaches composite y 471)
$NH = $H + $TOP + $BOT
$out = New-Object byte[] ($ST*$NH)
# everything that was there already, moved down by TOP and otherwise untouched
[Array]::Copy($px, 0, $out, $TOP*$ST, $N)
"new canvas ${W}x${NH}   (+$TOP above, +$BOT below)"

# copy one piece's pixels, and only where they land outside the old cut
function Restore($blob, $dx, $dy, $label){
  $k = IndexOfBlob $blob
  $n = 0
  foreach($i in $blob.cells){
    $sy=[Math]::Floor($i/$W); $sx=$i-$sy*$W
    # take the soft edge with it: any pixel of this piece, plus what touches it
    for($oy=-2;$oy -le 2;$oy++){ for($ox=-2;$ox -le 2;$ox++){
      $ax=$sx+$ox; $ay=$sy+$oy
      if($ax -lt 0 -or $ay -lt 0 -or $ax -ge $W -or $ay -ge $H){continue}
      $ai=$ay*$W+$ax
      if($owner[$ai] -ne $k -and $owner[$ai] -ne -1){continue}   # belongs to a neighbour
      $so=$ay*$ST+$ax*4
      if($px[$so+3] -eq 0){continue}
      $ty=$ay+$dy; $tx=$ax+$dx
      if($tx -lt 0 -or $tx -ge $W){continue}
      # only what the cut removed: outside the old 0..H-1 band
      if($ty -ge 0 -and $ty -lt $H){continue}
      $ny=$ty+$TOP
      if($ny -lt 0 -or $ny -ge $NH){continue}
      $no=$ny*$ST+$tx*4
      if($out[$no+3] -ge $px[$so+3]){continue}
      $out[$no]=$px[$so]; $out[$no+1]=$px[$so+1]; $out[$no+2]=$px[$so+2]; $out[$no+3]=$px[$so+3]
      $n++
    } }
  }
  "   restored $label : $n px"
}
Restore $textWhole  121 -217 "the upper डम-डम's top"
Restore $wavesWhole[0] -124  234 "the lower wave 1's tail"
Restore $wavesWhole[1] -126  233 "the lower wave 2's tail"
Restore $wavesWhole[2] -126  233 "the lower wave 3's tail"

$nb = New-Object System.Drawing.Bitmap $W,$NH,([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$nr = New-Object System.Drawing.Rectangle 0,0,$W,$NH
$nl = $nb.LockBits($nr,[System.Drawing.Imaging.ImageLockMode]::WriteOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
[System.Runtime.InteropServices.Marshal]::Copy($out,0,$nl.Scan0,$out.Length)
$nb.UnlockBits($nl)
$nb.Save("$fig\dum-p2-uncut.png",[System.Drawing.Imaging.ImageFormat]::Png)
$nb.Dispose()
"wrote $fig\dum-p2-uncut.png  ($((Get-Item "$fig\dum-p2-uncut.png").Length) bytes)"
