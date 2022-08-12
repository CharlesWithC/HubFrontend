<!DOCTYPE html>
<html lang="en">
<?php
  $domain = $_SERVER['HTTP_HOST'];
  require_once('configs/'.$domain.'.php');
?>

<head>
    <meta charset="UTF-8">
    <title>Authorization - <?php echo $vtcname ?></title>
    <link rel="icon" href="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png" type="image/x-icon" />

    <meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
    <meta content="<?php echo $slogan ?>" property="og:description" />
    <meta content="<?php echo $domain ?>/" property="og:url" />
    <meta content="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png" property="og:image" />
    <meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
    <meta content="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/bg.jpg" name="twitter:card">

    
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EDVTC3J2E"></script>
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/font.css">
<style>
    .formRight form section button {
        background-color: <?php echo $vtccolor ?>;
    }

    .formRight form section button:hover {
        background-color: <?php echo $vtccolordark ?>;
    }
</style>

    <script src="/configs/<?php echo $domainpure ?>.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://drivershub-cdn.charlws.com/js/functions.js"></script>
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/login.css">
    <script>
		drivershub = `    ____       _                         __  __      __  
   / __ \\_____(_)   _____  __________   / / / /_  __/ /_ 
  / / / / ___/ / | / / _ \\/ ___/ ___/  / /_/ / / / / __ \\
 / /_/ / /  / /| |/ /  __/ /  (__  )  / __  / /_/ / /_/ /
/_____/_/  /_/ |___/\\___/_/  /____/  /_/ /_/\\__,_/_.___/ 
                                                         `
console.log(drivershub);
console.log("Drivers Hub: Frontend (v1.3.6)");
console.log("Copyright (C) 2022 CharlesWithC All rights reserved.");
console.log('This product must work with "Drivers Hub: Backend" which is also made by CharlesWithC!');
        function toastFactory(type, title, text, time, showConfirmButton) {
          const Toast = Swal.mixin({
              toast: true,
              position: 'top-start',
              showConfirmButton: showConfirmButton || false,
              timer: time || '3000',
              timerProgressBar: true,
              didOpen: (toast) => {
                  toast.addEventListener('mouseenter', Swal.stopTimer);
                  toast.addEventListener('mouseleave', Swal.resumeTimer);
              },
          });
        
          Toast.fire({
              icon: type,
              title: '<strong>' + title + '</strong>',
              html: text,
          });
        }
        
        function validate() {
            var sPageURL = window.location.search.substring(1),
                sURLVariables = sPageURL.split('&'),
                sParameterName,
                i;
            $.ajax({
                url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/steam",
                type: "PATCH",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                data: {
                    "openid": sPageURL
                },
                success: function (data) {
                    if (data.error == false) {
                        if (data.response.skiptmp == true) {
                            toastFactory("success", "TruckesMP Bind Skipped",
                                "Your TruckersMP account is bound automatically.", 5000, false);
                            $("#title").html("All set!");
                            window.location.href = "/";
                            return;
                        }
                        $("#title").html("TruckersMP Bind");
                        $("#msg").html(
                            "Enter your TruckersMP User ID and we'll check if it's bound to your steam account."
                            );
                        $("#truckersmpbind").show();
                    } else {
                        $("#msg").html(data.descriptor);
                        $("#steamauth").show();
                    }
                },
                error: function (data) {
                    $("#msg").html(data.descriptor);
                    $("#steamauth").show();
                }
            });
        }

        function TMPBind() {
            $.ajax({
                url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/truckersmp",
                type: "PATCH",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                data: {
                    "truckersmpid": $("#truckersmpid").val()
                },
                success: function (data) {
                    if (data.error == false) {
                        $("#title").html("<?php echo $vtcname ?>");
                        $("#msg").html("You are being redirected to Drivers Hub.");
                        window.location.href = "/";
                    } else {
                        return toastFactory("error", "Error:", data.descriptor, 5000, false);
                    }
                },
                error: function (data) {
                    return toastFactory("error", "Error:", data.descriptor, 5000, false);
                }
            });
        }
        $(document).ready(function () {
            validate();
            $('#truckersmpid').keypress(function (e) {
                if (e.which == 13){
                    e.preventDefault();
                    TMPBind();
                }
            });
        });
    </script>
</head>

<body style="overflow:hidden;background:url('https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/bg.jpg') center/cover fixed;">
    <div id="formContainer">
        <div class="formLeft">
            <img src="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png">
        </div>
        <div class="formRight">
            <!-- Login form -->
            <form id="login">
                <header>
                    <h1 id="title">Steam Authorization</h1>
                    <p id="msg">Validating steam authorization...</p>
                </header>
                <section id="steamauth" style="display:none">
                    <a href="https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/steam/oauth">
                        <br>
                        <img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png"
                            style="display: block; margin-left: auto; margin-right: auto; width: 50%;">
                    </a>
                </section>
                <section id="truckersmpbind" style="display:none">
                    <input type="text" id="truckersmpid" placeholder="TruckersMP User ID"
                        style="display: block; margin-left: auto; margin-right: auto; width: 50%;" class="hover">
                    <br>
                    <button type="button" onclick="TMPBind();">Check</button>
                </section>
            </form>
        </div>
    </div>
	<div style="position: fixed;bottom: 10px;color: lightgrey;text-align: center;text-decoration:none;">
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
		<a href="https://drivershub.charlws.com" target="_blank">(Gehub)</a>
        &nbsp;|&nbsp;
		<a href="https://discord.gg/wNTaaBZ5qd" target="_blank">Get Help</a>
		<br>
		API: <span id="apiversion">v?.?.?</span> <a href="https://drivershub.charlws.com/changelog" target="_blank">Changelog</a>
		&nbsp;|&nbsp;
		Web: v1.3.6 <a href="/changelog" target="_blank">Changelog</a>
		<br>
		Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a>
		&nbsp;|&nbsp;
		<?php if($status != "") echo 'Status: <a href="https://'.$status.'/" target="_blank">'.$status.'</a>'; ?>
	</div>
</body>

</html>