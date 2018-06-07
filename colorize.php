<?php

$images = array();
$files = glob('uploads/*.{jpg,png,gif,JPG,PNG,GIF}', GLOB_BRACE);
if(empty($files)) {
    $files = glob('uploads/test/*.{jpg,png,gif,JPG,PNG,GIF}', GLOB_BRACE);
}

foreach($files as $file) {
  // sample usage: 
    //$palette = colorPalette($file, 5, 4); 
    //averageColor = $palette[0];
    $averageColor = GetAverageColor($file);
    $images[] = array("path" => $file, "color" => hexToHsl($averageColor), "hex" => $averageColor);        
}

usort($images, function ($img1, $img2) {
    
    $a = $img1["color"];
    $b = $img2["color"];
    //Compare the hue when they are in the same "range"
    if(!huesAreinSameInterval($a['h'],$b['h'])){
       if ($a['h'] < $b['h'])
           return -1;
       if ($a['h'] > $b['h'])
           return 1;
    }
    if ($a['l'] < $b['l'])
        return 1;
    if ($a['l'] > $b['l'])
        return -1;
    if ($a['s'] < $b['s'])
         return -1;
    if ($a['s'] > $b['s'])
          return 1;
    return 0;
 });

$result = json_encode($images);
//return JSON
die($result);
 
/*echo "<table>";
foreach($images as $image) {
    $color = $image["hex"];
    $name = $image["path"];
    echo "<tr><td style='background-color:#$color;width:2em;'>&nbsp;</td><td>$name</td></tr>\n"; 
} 
echo "</table>";*/


/**
 * Convert a hexadecimal color in RGB
 * @param string $hex
 * @return array
 */
function hexToHsl($hex){
    list($r, $g, $b) = sscanf($hex, "%02x%02x%02x");
    return rgbToHsl($r, $g, $b);
}

/**
 * Convert a RGB color in its HSL value
 * @param int $r red
 * @param int $g green
 * @param int $b blue
 * @return array
 */
function rgbToHsl($r, $g, $b)
{
    $r /= 255;
    $g /= 255;
    $b /= 255;

    $max = max($r, $g, $b);
    $min = min($r, $g, $b);

    $h = 0;
    $l = ($max + $min) / 2;
    $d = $max - $min;

    if ($d == 0) {
        $h = $s = 0; // achromatic
    } else {
        $s = $d / (1 - abs(2 * $l - 1));

        switch ($max) {
            case $r:
                $h = 60 * fmod((($g - $b) / $d), 6);
                if ($b > $g) {
                    $h += 360;
                }
                break;

            case $g:
                $h = 60 * (($b - $r) / $d + 2);
                break;

            case $b:
                $h = 60 * (($r - $g) / $d + 4);
                break;
        }
    }
    return array('h' => round($h, 2), 's' => round($s, 2), 'l' => round($l, 2));
}

/**
 * Check if two hues are in the same given interval
 * @param float $hue1
 * @param float $hue2
 * @param int $interval
 * @return bool
 */
function huesAreinSameInterval($hue1, $hue2, $interval = 30){
    return (round(($hue1 / $interval), 0, PHP_ROUND_HALF_DOWN) === round(($hue2 / $interval), 0, PHP_ROUND_HALF_DOWN));
}


function GetAverageColor($imageFile, $granularity = 4) {
   $granularity = max(1, abs((int)$granularity)); 
   $colors = array(); 
   $size = @getimagesize($imageFile); 
   if($size === false) 
   { 
      user_error("Unable to get image size data"); 
      return false; 
   } 
   //$img = @imagecreatefromjpeg($imageFile);
   // Andres mentioned in the comments the above line only loads jpegs, 
   // and suggests that to load any file type you can use this:
   $img = @imagecreatefromstring(file_get_contents($imageFile)); 

   if(!$img) 
   { 
      user_error("Unable to open image file"); 
      return false; 
   } 
   
   $pixelCount = 0;
   $red = 0; $green = 0; $blue = 0;
   for($x = 0; $x < $size[0]; $x += $granularity) 
   { 
      for($y = 0; $y < $size[1]; $y += $granularity) 
      { 
         $pixelCount++;
         $thisColor = imagecolorat($img, $x, $y); 
         $rgb = imagecolorsforindex($img, $thisColor); 
         $red += round(round(($rgb['red'] / 0x33)) * 0x33); 
         $green += round(round(($rgb['green'] / 0x33)) * 0x33); 
         $blue += round(round(($rgb['blue'] / 0x33)) * 0x33);   
      } 
   }
  $avgR= floor($red/$pixelCount);
  $avgG = floor($green/$pixelCount);
  $avgB = floor($blue/$pixelCount);
   
   $hex = sprintf('%02X%02X%02X', $avgR, $avgG, $avgB); 
   return $hex;
}

function colorPalette($imageFile, $numColors, $granularity = 5) 
{ 
   $granularity = max(1, abs((int)$granularity)); 
   $colors = array(); 
   $size = @getimagesize($imageFile); 
   if($size === false) 
   { 
      user_error("Unable to get image size data"); 
      return false; 
   } 
   $img = @imagecreatefromjpeg($imageFile);
   // Andres mentioned in the comments the above line only loads jpegs, 
   // and suggests that to load any file type you can use this:
   // $img = @imagecreatefromstring(file_get_contents($imageFile)); 

   if(!$img) 
   { 
      user_error("Unable to open image file"); 
      return false; 
   } 
   for($x = 0; $x < $size[0]; $x += $granularity) 
   { 
      for($y = 0; $y < $size[1]; $y += $granularity) 
      { 
         $thisColor = imagecolorat($img, $x, $y); 
         $rgb = imagecolorsforindex($img, $thisColor); 
         $red = round(round(($rgb['red'] / 0x33)) * 0x33); 
         $green = round(round(($rgb['green'] / 0x33)) * 0x33); 
         $blue = round(round(($rgb['blue'] / 0x33)) * 0x33); 
         $thisRGB = sprintf('%02X%02X%02X', $red, $green, $blue); 
         if(array_key_exists($thisRGB, $colors)) 
         { 
            $colors[$thisRGB]++; 
         } 
         else 
         { 
            $colors[$thisRGB] = 1; 
         } 
      } 
   } 
   arsort($colors); 
   return array_slice(array_keys($colors), 0, $numColors); 
} 