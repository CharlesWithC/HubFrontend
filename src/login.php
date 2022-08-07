<!DOCTYPE html>
<html lang="en">
<?php
  $domain = $_SERVER['HTTP_HOST'];
  require_once('configs/'.$domain.'.php');
?>

<head>
	<meta charset="UTF-8">
	<title>Login - <?php echo $vtcname ?></title>
    <link rel="icon" href="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png" type="image/x-icon" />

	<meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
	<meta content="<?php echo $slogan ?>" property="og:description" />
	<meta content="<?php echo $domain ?>/" property="og:url" />
	<meta content="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png" property="og:image" />
	<meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
	<meta content="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/bg.jpg" name="twitter:card">

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
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
		integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
		crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://drivershub-cdn.charlws.com/js/functions.js"></script>
	<link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/login.css">
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
			token = localStorage.getItem("token");
			if (token == undefined) {
				return;
			}
			$.ajax({
				url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/token",
				type: "GET",
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + token
				},
				success: function (data) {
					if (data.error == false) {
						localStorage.setItem("token", token);
						if (data.response.note == "") {
							window.location.href = "/";
						} else {
							window.location.href = "/auth?token=" + token;
						}
					}
				}
			});
		}

		function ShowCaptcha(){
			email = $("#email").val();
			password = $("#password").val();
			if(email == "" || password == ""){
				return toastFactory("warning", "", "Enter email and password.", 3000, false);
			}
			$('#captcha').fadeIn();
		}

		$(document).ready(function () {
			validate();

			$("#captcha").click(function(){
				$("#captcha").fadeOut();
			});

			$("#email").keypress(function (e) {
				var key = e.which;
				if(key == 13){
					if($("#password").val() == ""){
						$("#password").focus();
					} else {
						ShowCaptcha();
					}
				}
			});

			$("#password").keypress(function (e) {
				var key = e.which;
				if(key == 13){
					ShowCaptcha();
				}
			});

			working = false;
			setInterval(function(){
				if($("#captcha").is(":visible") && $("[name=h-captcha-response]").val() != "" && !working){
					working = true;
					hcaptcha_response = $("[name=h-captcha-response]").val();
					email = $("#email").val();
					password = $("#password").val();
					$.ajax({
						url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/login/password",
						type: "POST",
						dataType: "json",
						data: {
							email: email,
							password: password,
							"h-captcha-response": hcaptcha_response
						},
						success: function (data) {
							console.log(data);
							if(!data.error){
								token = data.response.token;
								localStorage.setItem("token", token);
								window.location.href = "/";
							}
						}, error: function (data){
							$("#captcha").fadeOut();
							toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
							setTimeout(function(){working = false;},1000);
						}
					});
				}
			}, 1000);
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
					<p style="float:right"><a onclick="DiscordLogin();" style="cursor:pointer">Or login / sign up with Discord</a></p>
				</section>
			</form>
		</div>
	</div>
	<div id="captcha" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7)">
		<div style="margin:auto;position:relative;text-align:center;top:45%;width:fit-content;">
			<div class="h-captcha" data-sitekey="1788882d-3695-4807-abac-7d7166ec6325"></div>
		</div>
	</div>
	<div style="position: fixed;bottom: 10px;color: lightgrey;text-align: center;text-decoration:none;">
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
		<a href="https://drivershub.charlws.com" target="_blank">(Gehub)</a>
		<br>
		API: <span id="apiversion">v?.?.?</span> <a href="https://drivershub.charlws.com/changelog" target="_blank">Changelog</a>
		&nbsp;|&nbsp;
		Web: v1.3.4 <a href="/changelog" target="_blank">Changelog</a>
		<br>
		Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a>
		&nbsp;|&nbsp;
		<?php if($status != "") echo 'Status: <a href="https://'.$status.'/status/hub" target="_blank">'.$status.'</a>'; ?>
	</div>
</body>

</html>