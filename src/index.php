<?php
    $request_uri = $_SERVER['REQUEST_URI'];

    if (strpos($request_uri, '/nightly') === 0) {
        require('./nightly.php');
    }
    else {
        require('./stable.php');
    }
?>
