<?php

function GetQuery($url) {
    $access_token = '3236981.1677ed0.cd7d4040029643d699a7d9fd06656aaf'; //pogotography
    //$access_token = '7503766599.d4b0359.a286b58babda465a8d924fecec58b856'; //rok.krytor

    $query = file_get_contents($url . "?access_token=" . $access_token);
    return json_decode($query);
    /*$ch = curl_init($url . "?access_token=" . $access_token);

    curl_setopt($ch, CURLOPT_HEADER, 0);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return $result;*/
}

function EmbedCode ($mediaUrl) {
    
    $embedUrl = 'https://api.instagram.com/oembed/?url=' . $mediaUrl;
    $query = file_get_contents($embedUrl);
    return json_decode($query);
    
    
}