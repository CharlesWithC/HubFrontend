<!DOCTYPE html>

<html lang="en">
<head>
    <?php
    $domain = $_SERVER['HTTP_HOST'];
    require_once('config/'.$domain.'.php');
    ?>
    
    <title>Drivers Hub: Backend (API) Information</title>
    <link rel="icon" href="/images/logo.png" type="image/x-icon" />
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="<?php echo $vtcname ?> Drivers Hub | <?php echo $slogan ?>">

    <meta content="Drivers Hub: Backend (API) Information" property="og:title" />
    <meta content="<?php echo $vtcname ?>" property="og:description" />
    <meta content="<?php echo $domain ?>/" property="og:url" />
    <meta content="/images/logo.png" property="og:image" />
    <meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
    <meta content="/images/bg.jpg" name="twitter:card">

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EDVTC3J2E"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7EDVTC3J2E');
    </script>

    <script>
        $(document).ready(function(){
            $.ajax({
                url: apidomain + "/" + vtcprefix,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    $("#api_status").html("Opertional");
                    $("#api_status").css("color", "green");
                    $("#api_version").html(data.response.version);
                    $("#message").html("API is working fine. If the pages don't load, there might be an issue with the code of frontend.")
                }, error: function (data) {
                    if(data.status == 502){
                        $("#api_status").html("Offline");
                        $("#api_status").css("color", "red");
                        $("#message").html("API is unoperational. This is usually due to an ongoing service reload. If it still doesn't work after a few minutes, please report the issue.");
                    } else if(data.status == 503 || data.status == 504){
                        $("#api_status").html("Degraded");
                        $("#api_status").css("color", "yellow");
                        $("#message").html("Server is temporarily unavailable. Probably there is a too-high traffic and server is unable to handle it. Services should resume in a short while.");
                    } else if(data.statusText == "timeout"){
                        $("#api_status").css("color", "grey");
                        $("#api_status").html("Unknown");
                        $("#message").html("Connection to server timed out. There might be a network connection issue on your side, or the entire server went offline.");
                    } else {
                        $("#api_status").css("color", "grey");
                        $("#api_status").html("Unknown (" + data.status + " " + data.statusText + ")");
                        $("#message").html("Server returned an unknown status. Please try again later.");
                    }
                    $("#api_version").html("Unknown");
                }
            })
        })
    </script>
</head>
<body>
    <h1>Drivers Hub: Backend (API) Information</h1>
    <p><b>VTC Name</b>: <?php echo $vtcname ?></p>
    <p><b>VTC Abbreviation</b>: <?php echo $vtcabbr ?></p>
    <p><b>Domain</b>: <?php echo $api ?></p>
    <p><b>Status</b>: <span id="api_status">Fetching...</span></p>
    <p><b>Version</b>: <span id="api_version">Fetching...</span></p>
    <p><span id="message"></span></p>
    <br>
    <p>Copyright &copy 2022 <a href="https://charlws.com" target="_blank" style="text-decoration:none;color:black">CharlesWithC</a></p>
</body>