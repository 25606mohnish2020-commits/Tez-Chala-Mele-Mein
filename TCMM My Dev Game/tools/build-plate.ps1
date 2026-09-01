# Builds Assets/Images/"Page 35 aligned.png" from the two Figma exports.
# Run once, from the game folder:  powershell -File tools/build-plate.ps1
# See the eraser comment in index.html for why the plate is needed at all.
#
# System.Drawing's PNG writer is not a good one — its output was 33% heavier
# than the Figma export it is built from. Squeeze it afterwards; this is a
# lossless re-encode, verified pixel for pixel:
#   ffmpeg -y -i "Assets/Images/Page 35 aligned.png" \
#          -compression_level 100 -pred mixed out.png

Add-Type -AssemblyName System.Drawing
$dir  = Join-Path (Split-Path $PSScriptRoot -Parent) "Assets\Images"
$outP = "$dir\Page 35 aligned.png"

function Load($p){
  $bm=[System.Drawing.Bitmap]::FromFile($p)
  $r=New-Object System.Drawing.Rectangle 0,0,$bm.Width,$bm.Height
  $d=$bm.LockBits($r,[System.Drawing.Imaging.ImageLockMode]::ReadOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $n=$bm.Width*$bm.Height*4; $b=New-Object byte[] $n
  [System.Runtime.InteropServices.Marshal]::Copy($d.Scan0,$b,0,$n); $st=$d.Stride
  $bm.UnlockBits($d); $bm.Dispose()
  @{px=$b; stride=$st; w=$r.Width; h=$r.Height}
}
$A = Load "$dir\Page 19.png"     # the route, and the circles where they belong
$B = Load "$dir\Page 35.png"     # no route, but the circles 32 / 10px out
$W=$A.w; $H=$A.h; $ST=$A.stride
$p19=$A.px; $p35=$B.px
$out = New-Object byte[] $p35.Length
[Array]::Copy($p35,$out,$p35.Length)

$RX=104.0; $RY=102.0; $ZR=1.22
$CPS = @(
  @{n=2; x=1604.5; y=688.5; dx= 1; dy= 32},
  @{n=3; x=1104.5; y=531.5; dx= 0; dy=-10},
  @{n=4; x= 352.5; y=496.5; dx= 0; dy=-10}
)
$RECT = @{x0=1546; y0=226; x1=1726; y1=338}

# ---------------------------------------------------------------- the zone
# Every pixel Page 35 cannot be trusted for: where its own circle sits, and
# where Page 19's circle sits. Everywhere else Page 35 is the same picture
# with the route already gone, and is copied verbatim.
$region = New-Object 'bool[]' ($W*$H)
$boxes=@()
foreach($c in $CPS){
  $x35=$c.x+$c.dx; $y35=$c.y+$c.dy
  $b=@{ x0=[int]([Math]::Min($c.x,$x35)-$RX*$ZR-2); x1=[int]([Math]::Max($c.x,$x35)+$RX*$ZR+2)
        y0=[int]([Math]::Min($c.y,$y35)-$RY*$ZR-2); y1=[int]([Math]::Max($c.y,$y35)+$RY*$ZR+2) }
  $boxes += $b
  for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
    $a=($x-$c.x)/$RX; $e=($y-$c.y)/$RY
    $f=($x-$x35)/$RX; $g2=($y-$y35)/$RY
    if(($a*$a+$e*$e) -le ($ZR*$ZR) -or ($f*$f+$g2*$g2) -le ($ZR*$ZR)){ $region[$y*$W+$x]=$true }
  } }
}
$boxes += $RECT
for($y=$RECT.y0;$y -le $RECT.y1;$y++){ for($x=$RECT.x0;$x -le $RECT.x1;$x++){ $region[$y*$W+$x]=$true } }

# Page 19 goes down over the whole zone, circles, shadows, route and all
$nz=0
foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
  $i=$y*$W+$x; if(-not $region[$i]){continue}
  $o=$y*$ST+$x*4
  $out[$o]=$p19[$o]; $out[$o+1]=$p19[$o+1]; $out[$o+2]=$p19[$o+2]; $out[$o+3]=$p19[$o+3]; $nz++
} } }
"zone taken from Page 19: $nz px"

# ---------------------------------------------------- ring versus dash
# Both are the same dark brown, so colour cannot tell them apart and neither
# can radius — a dash lands wherever the route happens to pass. Shape can:
# the ring is one ~6000px blob two hundred pixels across, a dash is a stub of
# a couple of hundred pixels that fits in a 70px box. Grouping the ink into
# connected blobs and judging each by its size leaves the artwork alone.

# The circle is walled off first, by radius. Measured on the artwork: the
# cream edge is 104 x 102, the outer ring closes at 1.05 of that and its soft
# edge by 1.08 — the drop shadow beyond is not this colour and is not at risk.
# Without this wall a dash that happens to touch the ring joins it, becomes
# one 25,000px blob, and is kept as artwork; with it, the same dash is its own
# small blob and goes. And because the wall is drawn round the artwork rather
# than round the dashes, the ring can never be nibbled.
$RING=1.08
$guard = New-Object 'bool[]' ($W*$H)
foreach($c in $CPS){
  $x0=[int]($c.x-$RX*$RING-2); $x1=[int]($c.x+$RX*$RING+2)
  $y0=[int]($c.y-$RY*$RING-2); $y1=[int]($c.y+$RY*$RING+2)
  for($y=$y0;$y -le $y1;$y++){ for($x=$x0;$x -le $x1;$x++){
    $a=($x-$c.x)/$RX; $e=($y-$c.y)/$RY
    if(($a*$a+$e*$e) -le ($RING*$RING)){ $guard[$y*$W+$x]=$true }
  } }
}

$ink = New-Object 'bool[]' ($W*$H)
foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
  $i=$y*$W+$x; if(-not $region[$i] -or $guard[$i]){continue}
  $o=$y*$ST+$x*4; $R=$p19[$o+2];$G=$p19[$o+1];$Bl=$p19[$o]
  if($R -gt $G -and $G -ge $Bl -and $R -lt 100 -and ($R-$G) -ge 15){ $ink[$i]=$true }
} } }

$seen = New-Object 'bool[]' ($W*$H)
$dash = New-Object 'bool[]' ($W*$H)
$kept=0; $painted=0; $blobs=0
foreach($b in $boxes){ for($sy=$b.y0;$sy -le $b.y1;$sy++){ for($sx=$b.x0;$sx -le $b.x1;$sx++){
  $s=$sy*$W+$sx
  if(-not $ink[$s] -or $seen[$s]){continue}
  $blobs++
  $stack=New-Object System.Collections.Generic.Stack[int]
  $stack.Push($s); $seen[$s]=$true
  $cells=New-Object System.Collections.Generic.List[int]
  $minx=$sx;$maxx=$sx;$miny=$sy;$maxy=$sy
  while($stack.Count -gt 0){
    $i=$stack.Pop(); $cells.Add($i)
    $iy=[Math]::Floor($i/$W); $ix=$i-$iy*$W
    if($ix -lt $minx){$minx=$ix}; if($ix -gt $maxx){$maxx=$ix}
    if($iy -lt $miny){$miny=$iy}; if($iy -gt $maxy){$maxy=$iy}
    foreach($dd in @(-1,1,-$W,$W,(-$W-1),(-$W+1),($W-1),($W+1))){
      $j=$i+$dd; if($j -lt 0 -or $j -ge ($W*$H)){continue}
      if($seen[$j] -or -not $ink[$j]){continue}
      $seen[$j]=$true; $stack.Push($j)
    }
  }
  $isDash = ($cells.Count -le 900) -and (($maxx-$minx) -le 80) -and (($maxy-$miny) -le 80)
  if($isDash){ foreach($i in $cells){ $dash[$i]=$true }; $painted += $cells.Count }
  else { $kept += $cells.Count }
} } }
"ink blobs: $blobs    kept as artwork: $kept px    taken as route: $painted px"

# grow each stub by 2px so its soft edge goes with it
for($pass=1;$pass -le 2;$pass++){
  $add=@()
  foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
    $i=$y*$W+$x
    if($dash[$i] -or $ink[$i] -or $guard[$i] -or -not $region[$i]){continue}
    if($dash[$i-1] -or $dash[$i+1] -or $dash[$i-$W] -or $dash[$i+$W]){ $add += $i }
  } } }
  foreach($i in $add){ $dash[$i]=$true }
}
$nd=0; foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){ if($dash[$y*$W+$x]){$nd++} } } }
"to paint out, edges included: $nd px"

# grow the ground inwards over them; the kept artwork is never a source
$left=$nd; $round=0
while($left -gt 0 -and $round -lt 80){
  $round++; $done=@()
  foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
    $i=$y*$W+$x; if(-not $dash[$i]){continue}
    $o=$y*$ST+$x*4; $sr=0;$sg=0;$sb=0;$k=0
    foreach($dd in @(-1,1,-$W,$W,(-$W-1),(-$W+1),($W-1),($W+1))){
      $j=$i+$dd; if($j -lt 0 -or $j -ge ($W*$H)){continue}
      if($dash[$j] -or $ink[$j] -or $guard[$j]){continue}
      $jy=[Math]::Floor($j/$W); $jx=$j-$jy*$W
      $jo=$jy*$ST+$jx*4
      $sr+=$out[$jo+2]; $sg+=$out[$jo+1]; $sb+=$out[$jo]; $k++
    }
    if($k -gt 0){ $done += @{i=$i;o=$o;r=[int]($sr/$k);g=[int]($sg/$k);b=[int]($sb/$k)} }
  } } }
  if($done.Count -eq 0){break}
  foreach($d in $done){ $out[$d.o+2]=$d.r; $out[$d.o+1]=$d.g; $out[$d.o]=$d.b; $dash[$d.i]=$false; $left-- }
}
"fill rounds: $round   left after diffusion: $left"

# Anything still unfilled is walled in — pinned against the ring with no
# ground touching it. Reach further out for the first real ground pixel, so
# the circle's own brown is never smeared back into the gap it left.
if($left -gt 0){
  $rescued=0
  foreach($b in $boxes){ for($y=$b.y0;$y -le $b.y1;$y++){ for($x=$b.x0;$x -le $b.x1;$x++){
    $i=$y*$W+$x; if(-not $dash[$i]){continue}
    $near=-1
    for($rr=2;$rr -le 30 -and $near -lt 0;$rr++){
      for($ang=0;$ang -lt 64;$ang++){
        $t=$ang*6.283185/64
        $nx=[int]($x+$rr*[Math]::Cos($t)); $ny=[int]($y+$rr*[Math]::Sin($t))
        if($nx -lt 1 -or $ny -lt 1 -or $nx -ge ($W-1) -or $ny -ge ($H-1)){continue}
        $j=$ny*$W+$nx
        if($dash[$j] -or $ink[$j] -or $guard[$j]){continue}
        $near=$ny*$ST+$nx*4; break
      }
    }
    if($near -ge 0){
      $o=$y*$ST+$x*4
      $out[$o+2]=$out[$near+2]; $out[$o+1]=$out[$near+1]; $out[$o]=$out[$near]
      $dash[$i]=$false; $rescued++
    }
  } } }
  "walled-in pixels reached from further out: $rescued"
}

$bm = New-Object System.Drawing.Bitmap $W,$H,([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$r = New-Object System.Drawing.Rectangle 0,0,$W,$H
$d = $bm.LockBits($r,[System.Drawing.Imaging.ImageLockMode]::WriteOnly,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
[System.Runtime.InteropServices.Marshal]::Copy($out,0,$d.Scan0,$out.Length)
$bm.UnlockBits($d); $bm.Save($outP,[System.Drawing.Imaging.ImageFormat]::Png); $bm.Dispose()
"wrote $outP  ($((Get-Item $outP).Length) bytes)"
