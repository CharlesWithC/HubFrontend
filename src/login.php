<!DOCTYPE html>
<html lang="en">
<?php
  $domain = $_SERVER['HTTP_HOST'];
  require_once('configs/'.$domain.'.php');
?>

<head>
	<meta charset="UTF-8">
	<title>Login - <?php echo $vtcname ?></title>
    <link rel="icon" href="/images/logo.png" type="image/x-icon" />

	<meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
	<meta content="<?php echo $slogan ?> | © CharlesWithC" property="og:description" />
	<meta content="<?php echo $domain ?>/" property="og:url" />
	<meta content="<?php echo $domain ?>/images/logo.png" property="og:image" />
	<meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
	<meta content="<?php echo $domain ?>/images/bg.jpg" name="twitter:card">

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

		function GuestLogin() {
			localStorage.setItem("token", "guest");
			location.href = '/';
		}

		function validate() {
			token = localStorage.getItem("token");
			if (token == undefined) {
				return;
			}
			$.ajax({
				url: "https://<?php echo $api ?>/<?php echo $vtcabbr ?>/user/validate",
				type: "GET",
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + token
				},
				success: function (data) {
					if (data.error == false) {
						localStorage.setItem("token", token);
						if (data.response.extra == "") {
							window.location.href = "/";
						} else {
							window.location.href = "/auth?token=" + token;
						}
					}
				}
			});
		}
		$(document).ready(function () {
			validate();
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
			<form id="login" style="margin-top:40px">
				<header>
					<h1>Welcome back</h1>
					<p>Please login to access the Drivers Hub.</p>
				</header>
				<section>
					<button type="button" onclick="DiscordLogin();">Login With Discord</button>
				</section>
				<section style="position:relative;float:right;margin-top:-30px">
					<p style="font-size:15px;color:grey;text-align:right"><br><a style="cursor:pointer"
							onclick="GuestLogin();">Guest Login</a></p>
				</section>
			</form>
		</div>
	</div>
	<div style="position: fixed;bottom: 10px;color: lightgrey;text-align: center;text-decoration:none;">
		&copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
		<br>
		<?php if($status != "") echo 'Status: <a href="https://'.$status.'" target="_blank">'.$status.'</a>'; ?>
		<br>
		Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a> / API: <a href="https://<?php echo $api ?>" target="_blank"><?php echo $api ?></a>
	</div>
</body>

</html>