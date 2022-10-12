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

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/unisans/css/unisans.min.css">
	<link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/login.css">
	<style>
		.formRight form section button {background-color:<?php echo $vtccolor ?>;}
		.formRight form section button:hover {background-color: <?php echo $vtccolordark ?>;}
	</style>

	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
    <script src="https://drivershub-cdn.charlws.com/js/functions.js"></script>
    <script src="https://drivershub-cdn.charlws.com/js/bundles/2d7272b0a25d7f8a.js"></script>
	<script>
	$(document).ready(function () {
		LoginValidate();
		$("#captcha").click(function (){$("#captcha").fadeOut();});
		$("#email").keypress(function (e) {
			var key = e.which;
			if (key == 13) {
				if ($("#password").val() == "") {
					$("#password").focus();
				} else {
					ShowCaptcha();
				}
			}
		});
		$("#password").keypress(function (e) {
			var key = e.which;
			if (key == 13) {
				ShowCaptcha();
			}
		});
		working = false;
		setInterval(function () {
			if ($("#captcha").is(":visible") && $("[name=h-captcha-response]").val() != "" && !working) {
				working = true;
				hcaptcha_response = $("[name=h-captcha-response]").val();
				email = $("#email").val();
				password = $("#password").val();
				$.ajax({
					url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/auth/password",
					type: "POST",
					dataType: "json",
					data: {
						email: email,
						password: password,
						"h-captcha-response": hcaptcha_response
					},
					success: function (data) {
						if (!data.error) {
							token = data.response.token;
							localStorage.setItem("token", token);
							window.location.href = "/";
						}
					},
					error: function (data) {
						$("#captcha").fadeOut();
						toastNotification("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000, false);
						setTimeout(function () {
							working = false;
						}, 1000);
					}
				});
			}
		}, 1000);
	});
	</script>
</head>

<body style="overflow:hidden;background:url('/images/bg.jpg') center/cover fixed;">
	<div id="formContainer">
		<div class="formLeft">
			<img src="/images/logo.png">
		</div>
		<div class="formRight">
			<form id="login" style="margin-top:20px">
				<header>
					<h1><?php echo $vtcname ?></h1>
					<p><?php echo $slogan ?></p>
				</header>
				<section>
					<div style="width:75%;margin:auto">
						<p style="color:white">Email: <input id="email" style="float:right;width:60%"></p>
						<p style="color:white">Password: <input id="password" type="password" style="float:right;width:60%"></p>
					</div>
					<button type="button" onclick="ShowCaptcha();">Login</button>
					<br><br>
					<button type="button" onclick="window.location.href='https://<?php echo $api ?>/<?php echo $vtcabbr ?>/auth/discord/redirect';" style="width:48%;display:inline-block;">Login with &nbsp;<svg xmlns="http://www.w3.org/2000/svg" style="margin-bottom:-3px" width="16" height="16" fill="currentColor" class="bi bi-discord" viewBox="0 0 16 16"> <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/> </svg> </button>
					&nbsp;&nbsp;
					<button type="button" onclick="window.location.href='https://<?php echo $api ?>/<?php echo $vtcabbr ?>/auth/steam/redirect';" style="width:48%;display:inline-block;">Login with &nbsp;<svg xmlns="http://www.w3.org/2000/svg" style="margin-bottom:-3px" width="16" height="16" fill="currentColor" class="bi bi-steam" viewBox="0 0 16 16"> <path d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006 4.304 1.769A2.198 2.198 0 0 1 5.62 8.88l1.96-2.844-.001-.04a3.046 3.046 0 0 1 3.042-3.043 3.046 3.046 0 0 1 3.042 3.043 3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11 2.217 2.217 0 0 1-1.312-1.568L.33 10.333Z"/> <path d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165 1.705 1.705 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029 2.03 2.03 0 0 0 2.027-2.029 2.03 2.03 0 0 0-2.027-2.027 2.03 2.03 0 0 0-2.027 2.027Zm2.03-1.527a1.524 1.524 0 1 1-.002 3.048 1.524 1.524 0 0 1 .002-3.048Z"/> </svg> </button>
				</section>
			</form>
		</div>
	</div>
	<div id="captcha" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7)">
		<div style="margin:auto;position:relative;text-align:center;top:45%;width:fit-content;">
			<div class="h-captcha" data-sitekey="1788882d-3695-4807-abac-7d7166ec6325"></div>
		</div>
	</div>
	<div style="position:fixed;bottom:10px;right:10px;color:lightgrey;text-decoration:none;">
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
	</div>
</body>

</html>