<?php

$target_dir = "uploads/";

$uploadOk = 1;

// Check if image file is a actual image or fake image
//$imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));

$files = $_FILES["files"];
for($i = 0; $i < count($files["name"]); $i++)
{

    $fileName = basename($files["name"][$i]);
    if($fileName == "")
        continue;
    
    $targetFile = $target_dir . $fileName;
    $tempFile = $files["tmp_name"][$i];   
    //$imageFileType = strtolower(pathinfo($targetFile,PATHINFO_EXTENSION));
    //$colorAverage = GetAverageColor($tempFile);
    
    if (move_uploaded_file($tempFile, $targetFile)) {
        continue;
    } else {
        die(json_encode([ 'success'=> false, 'error'=> "Unknown error."]));
    }
}

die(json_encode(['success'=> true, 'error' => '']));
?>