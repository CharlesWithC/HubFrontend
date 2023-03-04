<?php
    $request_uri = $_SERVER['REQUEST_URI'];

    if (strpos($request_uri, '/nighty') === 0) {
        require('./nighty.php');
    }
    else {
        require('./stable.php');
    }
?>
