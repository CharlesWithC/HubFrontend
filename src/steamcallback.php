<!DOCTYPE html>
<html lang="en">
<?php
  $domain = $_SERVER['HTTP_HOST'];
  require_once('config/'.$domain.'.php');
?>

<head>
    <meta charset="UTF-8">
    <title>Login - <?php echo $vtcname ?></title>

    <link rel="icon" href="/images/logo.png" type="image/x-icon" />

	<meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
	<meta content="<?php echo $slogan ?>" property="og:description" />
	<meta content="<?php echo $domain ?>/" property="og:url" />
	<meta content="/images/logo.png" property="og:image" />
	<meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
	<meta content="/images/bg.jpg" name="twitter:card">
    
	<script src="/config/<?php echo $domainpure ?>.js"></script>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EDVTC3J2E"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "G-7EDVTC3J2E");
    </script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
		integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
		crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/font.css">
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/login.css">
	<style>
		.formRight form section button {background-color:<?php echo $vtccolor ?>;}
		.formRight form section button:hover {background-color: <?php echo $vtccolordark ?>;}
	</style>

    <script src="https://drivershub-cdn.charlws.com/js/functions.js"></script>
    <script src="https://drivershub-cdn.charlws.com/js/bundles/d6db1f74d9a6c6d3.js"></script>
    <script>
        $(document).ready(function () {
            SteamValidate();
        });
    </script>
</head>

<body style="overflow:hidden;background:url('/images/bg.jpg') center/cover fixed;">
    <div id="formContainer">
        <div class="formLeft">
            <img src="/images/logo.png">
        </div>
        <div class="formRight">
            <form id="login">
                <header>
                    <h1 id="title">Steam Authorization</h1>
                    <p id="msg">Validating steam authorization...</p>
                </header>
                <section id="steamauth" style="display:none">
                    <a href="https://<?php echo $api ?>/<?php echo $vtcabbr ?>/auth/steam/redirect?connect_account=true">
                        <br>
                        <img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png"
                            style="display: block; margin-left: auto; margin-right: auto; width: 50%;">
                    </a>
                </section>
            </form>
        </div>
    </div>
	<div style="position:fixed;bottom:10px;color:lightgrey;text-align:center;text-decoration:none;">
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
    <a href="https://drivershub.charlws.com" target="_blank">(CHub)</a>
    &nbsp;|&nbsp;
    <a href="https://discord.gg/wNTaaBZ5qd" target="_blank">Discord</a>
    &nbsp;|&nbsp;
    <a href="https://wiki.charlws.com/" target="_blank">Wiki</a>
    <br>
    <a href="/api" target="_blank">API</a>: <span id="apiversion">v?.?.?</span> <a href="https://drivershub.charlws.com/changelog" target="_blank">Changelog</a>
    &nbsp;|&nbsp;
    Web: v1.5.3 <a href="/changelog" target="_blank">Changelog</a>
    <br>
    Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a>
    &nbsp;|&nbsp;
    <?php if($status != "") echo 'Status: <a href="https://'.$status.'/" target="_blank">'.$status.'</a>'; ?>
	</div>
</body>

</html>