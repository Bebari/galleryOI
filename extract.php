<?php
$num_results = (! empty($_GET['num_results'])) ? $_GET['num_results'] : 8;
$delta = (! empty($_GET['delta'])) ? $_GET['delta'] : 24;
$reduce_brightness = (isset($_GET['reduce_brightness'])) ? $_GET['reduce_brightness'] : 1;
$reduce_gradients = (isset($_GET['reduce_gradients'])) ? $_GET['reduce_gradients'] : 1;
$imagePath = (isset($_GET['imagePath'])) ? __DIR__ . "/.." . parse_url($_GET['imagePath'])["path"] : "uploads/strawberries-3359755_640.jpg";

include_once("colors.inc.php");
$ex=new GetMostCommonColors();
$colors=$ex->Get_Color($imagePath, $num_results, $reduce_brightness, $reduce_gradients, $delta);

$jsonResult = array();
foreach ( $colors as $hex => $count )
{
	if ( $count > 0 )
	{
            $jsonResult[] = array("hex" => $hex, "percent" => round($count,5));
	}
}

echo json_encode($jsonResult);
?>