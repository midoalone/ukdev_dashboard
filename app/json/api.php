<?php
header('Access-Control-Allow-Origin: *');

$widget = $_GET['widget'];
$content = "";

if(is_file($widget.'.html')){
    $content = file_get_contents($widget.'.html');
}

if(is_file($widget.'.json')){
    $json = file_get_contents($widget.'.json');
    $json = json_decode($json);
}

echo json_encode(array(
    'title' => $json->title,
    'content' => $content
));