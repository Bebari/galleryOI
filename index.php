<?php 

include 'query.php'; 

$url = 'https://api.instagram.com/v1/users/self/media/recent/';

$allImages = array();
$allImages = glob("images/*.jpg");
/*
 * 
$json = GetQuery($url);


$ix = 0;
while ($json->pagination->next_url != "" && $ix < 3) {
    $ix++;
    $json = GetQuery($json->pagination->next_url);
    foreach($json->data as $data) {
        $imageUrl =  $data->images->thumbnail->url;
        $content = file_get_contents($imageUrl);
        $allImages[] = array($data->id, $data->link);
        if(file_exists("images/" . $data->id . ".jpg"))
           continue;

        file_put_contents("images/" . $data->id . ".jpg" , $content);
    }
}
 * 
 * 
 */
?>

<html>
<head>
    <script type="text/javascript" src="scripts/jquery-3.3.1.min.js"></script>
    <script type="text/javascript" src="scripts/jquery.fancybox.min.js"></script>
    <script type="text/javascript" src="scripts/embeds.js"></script>
    <script type="text/javascript" src="scripts/Vibrant.min.js"></script>
    <script type="text/javascript" src="scripts/color-thief.min.js"></script>
    <!--<script type="text/javascript" src="scripts/main.js"></script>-->
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <link rel="stylesheet" type="text/css" href="css/jquery.fancybox.min.css">
</head>
<body>
    <div id="loadedImages" colorify-main-color>
<?php foreach($allImages as $img)://foreach($json->data as $data): ?>
        
    <?php 
        //$embed = EmbedCode($data->link);
    ?>
    <!--<a href="javascript:InstgramMediaPopup(this, '<?=$data->link;?>');"><img class="vibrant" src="<?=$data->images->thumbnail->url?>"></a>-->
    <!--<a href="javascript:InstgramMediaPopup(this, '<?=$img[1];?>');"><img class="vibrant" src="images/<?=$img[0] . ".jpg"?>"></a>-->
    <img class="vibrant" src="<?=$img?>">
    
<?php endforeach; ?>
    </div>
    
    <hr />
    
    <div id="colorified">
        
        
    </div>

</body>
<script type="text/javascript" src="scripts/main.js"></script>
</html>