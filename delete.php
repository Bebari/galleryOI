<?php

$images = array();
$files = glob('uploads/*.{jpg,png,gif,JPG,PNG,GIF}', GLOB_BRACE);

foreach($files as $file) {
  // sample usage: 
    //$palette = colorPalette($file, 5, 4); 
    //averageColor = $palette[0];
    unlink($file);
    //$images[] = array("path" => $file, "color" => hexToHsl($averageColor), "hex" => $averageColor);        
}