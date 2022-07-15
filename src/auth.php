<!DOCTYPE html>
<html lang="en">
<?php
  $domain = $_SERVER['HTTP_HOST'];
  require_once('configs/'.$domain.'.php');
?>

<head>
    <meta charset="UTF-8">
    <title>Authorization - <?php echo $vtcname ?></title>
    <link rel="icon" href="/images/logo.png" type="image/x-icon" />

    <meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
    <meta content="<?php echo $slogan ?>" property="og:description" />
    <meta content="<?php echo $domain ?>/" property="og:url" />
    <meta content="<?php echo $domain ?>/images/logo.png" property="og:image" />
    <meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
    <meta content="<?php echo $domain ?>/images/bg.jpg" name="twitter:card">
    <link rel="stylesheet" href="/css/font.css">

<style>
    .formRight form section button {
        background-color: <?php echo $vtccolor ?>;
    }

    .formRight form section button:hover {
        background-color: <?php echo $vtccolordark ?>;
    }
</style>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="/js/functions.js"></script>
    <link rel="stylesheet" href="/css/login.css">
    <script>
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

        function DiscordLogin() {
            location.href = 'https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/login';
        }

        function validate() {
            message = getUrlParameter("message");
            if (message) {
                $("#title").html("Error");
                $("#msg").html(message.replaceAll("+", " "));
                $("#msg").show();
                $("#loginbtn").show();
                return;
            }
            token = getUrlParameter("token");
            if (token) {
                $.ajax({
                    url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/token",
                    type: "PATCH",
                    dataType: "json",
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    success: function (data) {
                        if (data.error == false) {
                            console.log(data);
                            newtoken = data.response.token;
                            console.log(newtoken);
                            localStorage.setItem("token", newtoken);
                            window.location.href = "/auth";
                        } else {
                            $("#msg").html("Invalid token, please retry.");
                            $("#loginbtn").show();
                        }
                    },
                    error: function (data) {
                        $("#msg").html("Invalid token, please retry.");
                        $("#loginbtn").show();
                    }
                });
            } else {
                token = localStorage.getItem("token");
                $.ajax({
                    url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/token",
                    type: "GET",
                    dataType: "json",
                    headers: {
                        "Authorization": "Bearer " + token
                    },
                    success: function (data) {
                        if (data.error == false) {
                            if (data.response.extra == "" || document.referrer.indexOf("discord.com") != -
                                1) {
                                window.location.href = "/";
                                $("#msg").html("You are being redirected to Drivers Hub.");
                            } else if (data.response.extra == "steamauth") {
                                $("#title").html("Steam Authorization<br>");
                                $("#title").css("font-size", "1.5em");
                                $("#msg").html(
                                    "We need to check your steam account to: <br><br> - Bind your TruckersMP account <br> - Add you to our Navio company"
                                );
                                $("#steamauth").show();
                            } else if (data.response.extra == "truckersmp") {
                                $("#title").html("TruckersMP Connection");
                                $("#title").css("font-size", "1.5em");
                                $("#msg").html(
                                    "Enter your TruckersMP User ID below <br> and we'll check if it's bound to your steam account."
                                );
                                $("#truckersmpbind").show();
                            }
                        } else {
                            $("#msg").html("Invalid token, please retry.");
                            $("#loginbtn").show();
                        }
                    },
                    error: function (data) {
                        $("#msg").html("Invalid token, please retry.");
                        $("#loginbtn").show();
                    }
                });
            }
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
            steamupdate = getUrlParameter("steamupdate");
            if (steamupdate == "1") {
                $("#title").html("Steam Authorization<br>");
                $("#title").css("font-size", "1.5em");
                $("#msg").html(
                    "We need to check your steam account to: <br><br> - Bind your TruckersMP account <br> - Add you to our Navio company"
                );
                $("#steamauth").show();
                return;
            }
            truckersmpupdate = getUrlParameter("truckersmpupdate");
            if (truckersmpupdate == "1") {
                $("#title").html("TruckersMP Connection");
                $("#title").css("font-size", "1.5em");
                $("#msg").html(
                    "Enter your TruckersMP User ID below <br> and we'll check if it's bound to your steam account."
                );
                $("#truckersmpbind").show();
                return;
            }
            validate();
            $('#truckersmpid').keypress(function (e) {
                if (e.which == 13) {
                    e.preventDefault();
                    TMPBind();
                }
            });
        });
    </script>
</head>

<body style="overflow:hidden">
    <div id="formContainer">
        <div class="formLeft">
            <img src="/images/logo.png">
        </div>
        <div class="formRight">
            <!-- Login form -->
            <form id="login">
                <header>
                    <h1 id="title">Discord Authorization</h1>
                    <p id="msg">Validating authorization token...</p>
                </header>
                <section id="loginbtn" style="display:none">
                    <button type="button" onclick="DiscordLogin();">Login With Discord</button>
                </section>
                <section id="steamauth" style="display:none">
                    <a href="https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/steam/oauth">
                        <br>
                        <img src="https://community.akamai.steamstatic.com/public/images/signinthroughsteam/sits_01.png"
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
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a> & UCJOHN
		<br>
		<?php if($status != "") echo 'Status: <a href="https://'.$status.'" target="_blank">'.$status.'</a>'; ?>
		<br>
		Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a> / API: <a href="https://<?php echo $api ?>" target="_blank"><?php echo $api ?></a>
	</div>
</body>

</html>