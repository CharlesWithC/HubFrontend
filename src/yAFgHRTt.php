<!DOCTYPE html>

<html lang="en">

<head>
    <?php
    $domain = $_SERVER['HTTP_HOST'];
    require_once('config/'.$domain.'.php');

    $language = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
    $language = substr($language, 0, 2);
    if(file_exists('languages/'.$language.'.json')){
        $st = json_decode(file_get_contents('languages/'.$language.'.json'));
    } else {
        $st = json_decode(file_get_contents('languages/en.json'));
    }

    $path = $_SERVER['REQUEST_URI'];
    if (str_starts_with($path, '/images')) {
        $t = explode("/", $path);
        header('Location: //drivershub-cdn.charlws.com/assets/'.$vtcabbr.'/'.$t[2]);
        exit();
    }
    if (str_starts_with($path, '/js')) {
        $t = explode("/", $path);
        $beta_prefix = "";
        if(stristr($path, 'beta')){
            $beta_prefix = "beta";
        }
        header('Location: //drivershub-cdn.charlws.com/js/'.$beta_prefix.'/'.$t[2]);
        exit();
    }
    if (str_starts_with($path, '/banner')) {
        $t = explode("/", $path);
        header('Location: //'.$api.'/'.$vtcabbr.'/member/banner?userid='.$t[2]);
        exit();
    }
    ?>

    <title><?php echo $vtcname ?></title>
    <link rel="icon" href="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/logo.png" type="image/x-icon" />
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="<?php echo $vtcname ?> Drivers Hub | <?php echo $slogan ?>">

    <meta content="<?php echo $vtcname ?> Drivers Hub" property="og:title" />
    <meta content="<?php echo $slogan ?>" property="og:description" />
    <meta content="<?php echo $domain ?>/" property="og:url" />
    <meta content="/images/logo.png" property="og:image" />
    <meta content="<?php echo $vtccolor ?>" data-react-helmet="true" name="theme-color" />
    <meta content="/images/bg.jpg" name="twitter:card">

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/unisans/css/unisans.min.css">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ol3/4.5.0/ol-debug.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.css" />

    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/regular.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/solid.min.css" rel="stylesheet">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-Zenh87qX5JnK2Jl0vWa8Ck2rdkQ2Bzep5IDxbcnCeuOxjzrPF/et3URy9Bv1WTRi" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" integrity="sha384-oBqDVmMz9ATKxIep9tiCxS/Z9fNfEXiDAYTujMAeBAsjFuCZSmKbSSUnQlmh/jp3" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.min.js" integrity="sha384-IDwe1+LCz02ROU9k972gdyvl+AESN10+x7tBKgc9I5HFtuNz0wWnPclzo6p9vxnk" crossorigin="anonymous"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.css" />
    <script src="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js"></script>

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/flexdatalist/jquery.flexdatalist.min.css" />
    <script src="https://drivershub-cdn.charlws.com/assets/flexdatalist/jquery.flexdatalist.min.js"></script>

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/noty/noty.css" />
    <script src="https://drivershub-cdn.charlws.com/assets/noty/noty.min.js"></script>
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/noty/themes/mint.css" />

    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>

	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <?php
        echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/919309b716cb3ed6.js"></script>';
    ?>
    <?php
    $application_html = "";
    if(file_exists('/var/hub/cdn/assets/'.$vtcabbr.'/application.html')){
        $application_html = file_get_contents('/var/hub/cdn/assets/'.$vtcabbr.'/application.html');
        if($application_html == "")
            $application_html = file_get_contents('default_application.html');
    } else {
        $application_html = file_get_contents('default_application.html');
    }
    ?>
    <?php if(in_array("livemap", $enabled_plugins)){
    echo '<script src="https://drivershub-cdn.charlws.com/js/map/ets2map.js"></script>
    <script src="https://drivershub-cdn.charlws.com/js/map/ets2map_promods.js"></script>
    <script src="https://drivershub-cdn.charlws.com/js/map/atsmap.js"></script>
    <script src="https://drivershub-cdn.charlws.com/js/map/naviolive.js"></script>';} ?>
    <?php
    if(in_array("addon", $enabled_plugins)){
        echo '<script src="https://drivershub-cdn.charlws.com/assets/'.$vtcabbr.'/addon.js"></script>';
    }
    ?>
    <style>
        .bg-indigo-500 {
            background-color: <?php echo $vtccolor ?>;
        }

        .bg-indigo-500:hover {
            background-color: <?php echo $vtccolordark ?>;
        }

        .rect-20 {
            width: 20px;
            height: 20px;
            margin-right: 6px;
            display:inline-block;
        }

        .rect-32 {
            width: 32px;
            height: 32px;
            margin-right: 5px;
            display:inline-block;
        }

        .flexdatalist-alias {
            width: 200px;
            display: inline-block;
        }

        .sidebar a:hover {
            background-color:rgb(66,74,82);
        }

        td {
            padding-right: 10px;
        }
        
        .col {
            overflow: hidden;
        }

        .tabs {
            display: none;
        }

        a {
            text-decoration: none;
            color: #fff;
        }

        .form-label {
            font-weight: bold;
        }

        .member-only-tab {
            display: none;
        }

        .clickable {
            cursor: pointer;
        }
        
        .dot {
            height: 15px;
            width: 15px;
            background-color: skyblue;
            border: blue solid 2px;
            border-radius: 50%;
            display: inline-block;
        }

        .dot-small {
            height: 10px;
            width: 10px;
            background-color: skyblue;
            border: blue solid 1px;
            border-radius: 50%;
            display: inline-block;
        }

        .dot-area {
            height: 50px;
            width: 50px;
            background-color: red;
            opacity: 50%;
            border-radius: 50%;
            display: inline-block;

        }

        .timeline {
            border-left: 1px solid #888;
            position: relative;
            list-style: none;
        }

        .timeline .timeline-item {
            position: relative;
        }

        .timeline .timeline-item:after {
            position: absolute;
            display: block;
            top: 0;
        }

        .timeline .timeline-item:after {
            top: 6px;
            left: -38px;
            border-radius: 20%;
            height: 11px;
            width: 11px;
            content: "";
        }

        .timeline .timeline-white:after {
            background-color: hsl(0, 0%, 90%);
        }

        .timeline .timeline-green:after {
            background-color: hsl(126, 92%, 61%);
        }

        .timeline .timeline-red:after {
            background-color: hsl(0, 86%, 60%);
        }

        .timeline .timeline-yellow:after {
            background-color: hsl(64, 97%, 65%);
        }
        
        .blink {
            animation: blinker 1s linear 1;
        }
        @keyframes blinker {
            50% {
                opacity: 0;
            }
        }

        h1,h2,h3,p,span,text,label,input,textarea,select,tr,strong {color: white;}
        a:hover {color: white;}
        th > .fc-scrollgrid-sync-inner {background-color: #444}
        .flexdatalist-results {background-color:#57595D};
    </style>
    <?php 
    if(file_exists('/var/hub/cdn/assets/'.$vtcabbr.'/style.css')){
        echo "<style>".file_get_contents('/var/hub/cdn/assets/'.$vtcabbr.'/style.css')."</style>";
    }
    ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EDVTC3J2E"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-7EDVTC3J2E');
    </script>
</head>

<body style="width:100%;overflow-x:hidden;background-color:#2F3136;color:white;">
    <div class="d-flex flex-column flex-shrink-0 p-3 text-bg-dark sidebar" style="position:fixed;top:0;left:0;width:260px;height:100vh;z-index:99;">
        <div style="height:60px">
            <img src="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/banner.png" alt="Banner" width="100%">
        </div>
        <hr>
        <div id="sidebar" style="height:calc(100% - 150px);">
            <ul class="nav nav-pills flex-column mb-auto">
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Information</strong></li>
                    <li class="nav-item">
                        <a id="button-overview-tab" onclick="ShowTab('#overview-tab', '#button-overview-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-chart-column"></i></span>
                            Overview
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-announcement-tab" onclick="ShowTab('#announcement-tab', '#button-announcement-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            Announcements
                        </a>
                    </li>
                    <li class="nav-item member-only-tab">
                        <a id="button-downloads-tab" onclick="ShowTab('#downloads-tab', '#button-downloads-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-download"></i></span>
                            Downloads
                        </a>
                    </li>
                </div>
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Game</strong></li>
                    <li class="nav-item">
                        <a id="button-map-tab" onclick="ShowTab('#map-tab', '#button-map-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-map"></i></span>
                            Live Map
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-delivery-tab" onclick="ShowTab('#delivery-tab', '#button-delivery-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-truck"></i></span>
                            Deliveries
                        </a>
                    </li>
                    <li class="nav-item member-only-tab">
                        <a id="button-division-tab" onclick="ShowTab('#division-tab', '#button-division-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-event-tab" onclick="ShowTab('#event-tab', '#button-event-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                </div>
                <div class="member-only-tab" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Drivers</strong></li>
                    <li class="nav-item">
                        <a id="button-member-tab" onclick="ShowTab('#member-tab', '#button-member-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-leaderboard-tab" onclick="ShowTab('#leaderboard-tab', '#button-leaderboard-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span>
                            Leaderboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-ranking-tab" onclick="ShowTab('#ranking-tab', '#button-ranking-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-angles-up"></i></span>
                            Rankings
                        </a>
                    </li>
                </div>
                <div id="sidebar-application" style="margin:5px 0;display:none;">
                    <li><strong style="color:darkgrey">Applications</strong></li>
                    <li class="nav-item">
                        <a id="button-my-application-tab" onclick="ShowTab('#my-application-tab', '#button-my-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            My Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-submit-application-tab" onclick="ShowTab('#submit-application-tab', '#button-submit-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                            Submit Application
                        </a>
                    </li>
                </div>
                <div id="sidebar-staff" style="margin:5px 0;display:none">
                    <li><strong style="color:darkgrey">Staff</strong></li>
                    <li class="nav-item">
                        <a id="button-staff-event-tab" onclick="ShowTab('#staff-event-tab', '#button-staff-event-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-application-tab" onclick="ShowTab('#staff-application-tab', '#button-staff-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-user-tab" onclick="ShowTab('#staff-user-tab', '#button-staff-user-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                            Users
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-member-tab" onclick="ShowTab('#staff-member-tab', '#button-staff-member-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-audit-tab" onclick="ShowTab('#audit-tab', '#button-audit-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-terminal"></i></span>
                            Audit Log
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-config-tab" onclick="ShowTab('#config-tab', '#button-config-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-screwdriver-wrench"></i></span>
                            Configuration
                        </a>
                    </li>
                </div>
                <div><br></div>
            </ul>
        </div>
        <div class="dropdown text-bg-dark" style="position:fixed;bottom:0;width:220px;height:80px;z-index:100;">
            <hr style="margin:10px 0;">
            <a id="button-user-profile" class="text-white text-decoration-none clickable"
                    data-bs-toggle="dropdown" aria-expanded="false" style="padding:10px 5px;border-radius:5px;width:160px">
                <img id="sidebar-avatar" src="https://cdn.discordapp.com/avatars/873178118213472286/a_cb5bf8235227e32543d0aa1b516d8cab.gif" alt="" class="rounded-circle me-2"
                    width="30" height="30">
                <span style="display:inline-block;position:relative;top:10px;line-height:14px;">
                    <strong id="sidebar-username" style="max-width:100px;width:100px;overflow:hidden;display:inline-block;"><span class="placeholder col-8"></span></strong>
                    <br>
                    <span style="font-size:12px;color:#ccc;max-width:100px;width:100px;overflow:hidden;max-height:14px;display:inline-block;"><span id="sidebar-userid" style="color:#ccc;"><span class="placeholder col-2"></span></span> | <span id="sidebar-role" style="color:#ccc;"><span class="placeholder col-6"></span></span></span>
                </span>
            </a>
            <ul id="user-profile-dropdown" class="dropdown-menu dropdown-menu-dark text-small shadow" style="padding-top:0">
                <img id="sidebar-banner" src="" alt="" style="border-radius:5px 5px 0 0" onerror="$(this).hide();"
                        width="566px" height="100px">
                <div style="padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);margin-top:10px;">
                    <strong>About Me</strong>
                    <p style="margin-bottom:0" id="sidebar-bio"><span class="placeholder col-8"></span>&nbsp;&nbsp;<span class="placeholder col-2"></span><br><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></span>
                </div>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item clickable" onclick="Logout()">Sign out</a></li>
            </ul>
            <a id="button-user-delivery-tab" class="clickable" onclick="$('#delivery-log-userid').val(localStorage.getItem('userid'));ShowTab('#user-delivery-tab', '#button-user-delivery-tab')" class="text-white text-decoration-none" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-truck"></i></a>
            <a class="text-white text-decoration-none clickable" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-gear"></i></a>
        </div>
    </div>
    <div style="position:fixed;left:260px;top:0;width:calc(100% - 260px);height:60px;box-shadow:0 1px 2px 0 #111;background-color:#2F3136;z-index:98;">
        <strong id="topbar-message" style="position:fixed;left:280px;top:20px;"><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> 0 Driver Trucking</strong>
        <strong style="position:fixed;right:20px;top:20px;"><?php echo $slogan ?></strong>
    </div>
    <div class="container" style="margin:20px;margin-left:280px;margin-top:80px;width:calc(100% - 300px);">
        <section id="signin-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 400px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:800px">
                <h1><strong>Welcome back</strong></h1>
                <div class="row">
                    <div class="col-8">
                        <label for="signin-email" class="form-label">Email</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="signin-email" placeholder="somebody@charlws.com">
                        </div>
                        <label for="signin-password" class="form-label">Password</label>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control bg-dark text-white" id="signin-password" placeholder="12345678">
                        </div>
                        <button id="button-signin" type="button" class="btn btn-primary w-100" onclick="ShowCaptcha();"><span class="rect-20"><i class="fa-solid fa-right-to-bracket"></i></span> Log in</button>
                    </div>
                    <div class="col-4 py-3" style="border-left:solid 1px grey">
                        <p class="mb-0">Alternatively, sign in with:</p>
                        <button id="signin-discord" type="button" class="btn btn-secondary w-100 m-1" onclick="DiscordSignIn();"><span class="rect-20"><i class="fa-brands fa-discord"></i></span> Discord</button>
                        <button id="signin-steam" type="button" class="btn btn-secondary w-100 m-1" onclick="SteamSignIn();"><span class="rect-20"><i class="fa-brands fa-steam"></i></span> Steam</button>
                        <p style="font-size:12px">*If you are not yet registered, you are required to sign up with Discord.</p>
                    </div>
                </div>
            </div>
        </section>
        <section id="captcha-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 300px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong>Security Challenge</strong></h1>
                <label class="form-label">Wait, are you a robot?</label>
                <div class="h-captcha" data-sitekey="1788882d-3695-4807-abac-7d7166ec6325" data-theme="dark" data-callback="CaptchaCallback"></div>
            </div>
        </section>
        <section id="mfa-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 400px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong>Multiple Factor Authentication</strong></h1>
                <label for="mfa-otp" class="form-label">One Time Pass</label>
                <div class="input-group mb-3">
                    <input type="number" class="form-control bg-dark text-white" id="mfa-otp" placeholder="000 000">
                </div>
                <button id="button-mfa-verify" type="button" class="btn btn-primary w-100" onclick="MFAVerify();">Verify</button>
            </div>
        </section>
        <section id="overview-tab" class="tabs">
            <div class="row">
                <div class="col-8" id="overview-left-col">
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> Online</strong></h5>
                            <p class="card-text"><span id="overview-stats-live"><span class="placeholder col-4"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-regular fa-clock"></i></span><span id="overview-stats-live-datetime"><span class="placeholder col-6"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-id-card"></i></span> Drivers</strong></h5>
                            <p class="card-text"><span id="overview-stats-driver-tot"><span class="placeholder col-7"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-driver-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> Delivered</strong></h5>
                            <p class="card-text"><span id="overview-stats-delivery-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-delivery-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-road"></i></span> Distance</strong></h5>
                            <p class="card-text"><span id="overview-stats-distance-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-distance-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> Profit</strong></h5>
                            <p class="card-text"><span id="overview-stats-profit-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-profit-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-gas-pump"></i></span> Fuel</strong></h5>
                            <p class="card-text"><span id="overview-stats-fuel-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-fuel-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col">
                            <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> Statistics</strong></h5>
                            <div style="float:right">
                                <div class="btn-group" id="overview-chart-scale-group">
                                    <a id="overview-chart-scale-1" onclick='chartscale=1;LoadChart()' style="cursor:pointer" class="btn btn-primary" aria-current="page">24h</a>
                                    <a id="overview-chart-scale-2" onclick='chartscale=2;LoadChart()' style="cursor:pointer" class="btn btn-primary">7d</a>
                                    <a id="overview-chart-scale-3" onclick='chartscale=3;LoadChart()' style="cursor:pointer" class="btn btn-primary active">30d</a>
                                </div>
                                <a id="overview-chart-sum" onclick='addup=1-addup;LoadChart()' style="cursor:pointer" class="btn btn-primary active">Sum</a>
                            </div>
                            </h2>
                            <div class="p-4 overflow-x-auto" style="display: block;">
                                <canvas id="statisticsChart" width="100%" height="300px"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col">
                            <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> Online Drivers</strong></h5>
                            <div id="table_online_driver">
                                <table>
                                    <thead id="table_online_driver_head">
                                        <tr>
                                            <th scope="col" style="width:20%">Name</th>
                                            <th scope="col" style="width:20%">Truck</th>
                                            <th scope="col" style="width:40%">Cargo</th>
                                            <th scope="col" style="width:10%">Speed</th>
                                            <th scope="col" style="width:10%">Destination</th>
                                        </tr>
                                    </thead>
                                    <tbody id="table_online_driver_data">
                                        <tr>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:40%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        </tr>
                                        <tr>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:40%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        </tr>
                                        <tr>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:20%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:40%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                            <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-4" id="overview-right-col">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span> Leaderboard</strong></h5>
                        <div id="table_mini_leaderboard">
                            <table>
                                <thead id="table_mini_leaderboard_head">
                                    <tr>
                                        <th scope="col" style="width:40px"></th>
                                        <th scope="col" style="width:60%">Driver</th>
                                        <th scope="col" style="width:40%">Points</th>
                                    </tr>
                                </thead>
                                <tbody id="table_mini_leaderboard_data">
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-user-plus"></i></span> New Members</strong></h5>
                        <div id="table_new_driver">
                            <table>
                                <thead id="table_new_driver_head">
                                    <tr>
                                        <th scope="col" style="width:40px"></th>
                                        <th scope="col" style="width:60%">Name</th>
                                        <th scope="col" style="width:40%">Date</th>
                                    </tr>
                                </thead>
                                <tbody id="table_new_driver_data">
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                    <tr>
                                        <td style="width:10%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:55%;"><span class="placeholder w-100"></span></td>
                                        <td style="width:35%;"><span class="placeholder w-100"></span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="announcement-tab" class="tabs">
            <div id="announcement-new" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
                <h5 id="announcement-new-heading">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#announcement-new-collapse" aria-expanded="false" aria-controls="announcement-new-collapse">
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> New Announcement</strong>
                    </button>
                </h5>
                <div id="announcement-new-collapse" class="collapse row" aria-labelledby="announcement-new-heading" data-bs-parent="#announcement-new">
                    <div class="col">
                        <label for="announcement-new-title" class="form-label">Title</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-title" placeholder="A short and nice title">
                        </div>
                        <label for="announcement-new-content" class="form-label">Content</label>
                        <div class="input-group mb-3" style="height:calc(100% - 160px)">
                            <textarea type="text" class="form-control bg-dark text-white" id="announcement-new-content" placeholder="Content of the announcement, MarkDown supported" style="height:100%"></textarea>
                        </div>
                    </div>
                    <div class="col">
                        <label for="announcement-new-type" class="form-label">Type</label>
                        <div class="mb-3">
                            <select class="form-select bg-dark text-white" id="announcement-new-type">
                                <option selected>Select one from the list</option>
                                <option value="0">Information</option>
                                <option value="1">Event</option>
                                <option value="2">Warning</option>
                                <option value="3">Critical</option>
                                <option value="4">Resolved</option>
                            </select>
                        </div>
                        <label for="announcement-new-visibility" class="form-label" style="width:100%">Visibility</label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="announcement-new-visibility" id="announcement-visibility-public" checked>
                                    <label class="form-check-label" for="announcement-visibility-public">
                                        Public
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="announcement-new-visibility" id="announcement-visibility-private">
                                <label class="form-check-label" for="announcement-visibility-private">
                                    Private
                                </label>
                            </div>
                        </div>
                        <label for="announcement-new-discord" class="form-label">Discord Integration</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="announcement-new-discord-channel-label">Channel ID</span>
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-discord-channel" placeholder="(Optional) Discord channel to forward the announcement" aria-describedby="announcement-new-discord-channel-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="announcement-new-discord-message-label">Message</span>
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-discord-message" placeholder="(Optional) Discord message content" aria-describedby="announcement-new-discord-message-label">
                        </div>
                        <button id="button-announcement-new-post" type="button" class="btn btn-primary" style="float:right;width:100px;" onclick="PostAnnouncement();">Post</button>
                    </div>
                </div>
            </div>
            <div id="announcements">
                <div class="row">
                    <div class="announcement shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-8"></span></strong></h5>
                        <h6 style="font-size:15px"><span class="placeholder col-8"></span> <span class="placeholder col-6"></span></h6>
                        <p><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-7"></span></p>
                        <p><span class="placeholder col-6"></span>&nbsp;&nbsp;<span class="placeholder col-5"></span></p>
                    </div>
                    <div class="announcement shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
                        <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
                        <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
                        <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
                    </div>
                </div>
            </div>
        </section>
        <section id="downloads-tab" class="tabs">
            <div class="row">
                <div id="downloads-display" class="shadow p-3 m-3 bg-dark rounded col">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-download"></i></span> Downloads<span id="downloads-unsaved" style="display:none">*</span></strong></h5>
                    <div id="downloads-edit-button-wrapper" style="float:right;display:none;"><a style="cursor:pointer" onclick='$("#downloads-edit-div").toggle();$("#downloads-edit-button-wrapper").hide();'>Edit</a></div>
                    <p id="downloads-content"><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-5"></span><br><span class="placeholder col-6"></span>&nbsp;&nbsp;<span class="placeholder col-3"></span><br><span class="placeholder col-2"></span>&nbsp;&nbsp;<span class="placeholder col-7"></span></p>
                </div>
                <div id="downloads-edit-div" class="shadow p-3 m-3 bg-dark rounded col" style="display:none">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span> Edit</strong></h5>
                    <div id="downloads-edit-hide-button-wrapper" style="float:right;"><a style="cursor:pointer" onclick='$("#downloads-edit-div").toggle();$("#downloads-edit-button-wrapper").show();'>Hide</a></div>
                    <textarea class="form-control bg-dark text-white" id="downloads-edit-content" style="height:calc(100% - 100px)"></textarea>
                    <br>
                    <button id="button-downloads-edit-save" type="button" class="btn btn-primary" style="float:right" onclick="UpdateDownloads();">Save</button>
                </div>
            </div>
        </section>
        <section id="map-tab" class="tabs">
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;">Euro Truck Simulator 2</h5>
                <div id="map">
                </div>
            </div>
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;">ProMods Europe</h5>
                <div id="pmap">
                </div>
            </div>
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;">American Truck Simulator</h5>
                <div id="amap">
                </div>
            </div>
        </section>
        <section id="delivery-tab" class="tabs">
            <div id="company-statistics">
                <div class="row">
                    <h3><strong>Daily Statistics</strong></h3>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> Driver of the Day</strong></h5>
                        <p class="card-text"><span id="dotd"><span class="placeholder" style="width:60%"></span></span> <span id="dotddistance" style="font-size:14px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> Delivered / Distance</strong></h5>
                        <p class="card-text"><span id="dalljob"><span class="placeholder" style="width:40%"></span></span> / <span id="dtotdistance"><span class="placeholder" style="width:40%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> Profit</strong></h5>
                        <p class="card-text"><span id="dprofit"><span class="placeholder" style="width:50%"></span></span></p>
                    </div>
                </div>
                <div class="row">
                    <h3><strong>Weekly Statistics</strong></h3>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> Driver of the Week</strong></h5>
                        <p class="card-text"><span id="dotw"><span class="placeholder" style="width:60%"></span></span> <span id="dotwdistance" style="font-size:14px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> Delivered / Distance</strong></h5>
                        <p class="card-text"><span id="walljob"><span class="placeholder" style="width:40%"></span></span> / <span id="wtotdistance"><span class="placeholder" style="width:40%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> Profit</strong></h5>
                        <p class="card-text"><span id="wprofit"><span class="placeholder" style="width:50%"></span></span></p>
                    </div>
                </div>
            </div>
            <div id="user-statistics" style="display:none">

            </div>
            <div class="row">
                <div id="delivery-log" class="shadow p-3 m-3 bg-dark rounded col" style="height:fit-content">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-truck"></i></span> Deliveries</strong></h5>
                    <div id="delivery-log-export-show" style="float:right;"><a class="member-only-tab clickable" onclick="ShowDeliveryLogExport();">Export</a>&nbsp;&nbsp;&nbsp;
                    <a id="delivery-log-options-show" class="clickable" onclick='$("#delivery-log-options-show").hide();$("#delivery-log-options").show();'>Options</a></div>
                    <div id="table_delivery_log">
                        <table class="w-100">
                            <thead id="table_delivery_log_head">
                                <tr>
                                    <th scope="col" style="min-width:80px">ID</th>
                                    <th scope="col">Driver</th>
                                    <th scope="col">Source</th>
                                    <th scope="col">Destination</th>
                                    <th scope="col">Distance</th>
                                    <th scope="col">Cargo</th>
                                    <th scope="col">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody id="table_delivery_log_data">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="delivery-log-options" class="shadow p-3 m-3 bg-dark rounded col-4" style="display:none;height:fit-content;">
                    <h5 style="display:inline-block"><strong>Options</strong></h5>
                    <div id="delivery-log-options-hide" style="float:right;"><a style="cursor:pointer" onclick='$("#delivery-log-options-show").show();$("#delivery-log-options").hide();'>Hide</a></div>
                    <div>
                        <label class="form-label">Game</label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-ets2" checked>
                            <label class="form-check-label" for="delivery-log-ets2">
                                ETS2
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-ats" checked>
                            <label class="form-check-label" for="delivery-log-ats">
                                ATS
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Status</label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-delivered" checked>
                            <label class="form-check-label" for="delivery-log-delivered">
                                Delivered
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-cancelled">
                            <label class="form-check-label" for="delivery-log-cancelled">
                                Cancelled
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Max. Speed</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-speed-limit" placeholder="0">
                            <span class="input-group-text"><span class="distance_unit text-black"></span>/h</span>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Date Range</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text">From</span>
                            <input type="date" class="form-control bg-dark text-white" id="delivery-log-start-time">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text">To</span>
                            <input type="date" class="form-control bg-dark text-white" id="delivery-log-end-time">
                        </div>
                    </div>
                    <div style="display:none">
                        <label class="form-label">User ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-userid" placeholder="0">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Page Size</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-page-size" placeholder="10">
                            <span class="input-group-text">rows</span>
                        </div>
                    </div>
                    <button id="button-delivery-log-options-update" type="button" class="btn btn-primary" style="float:right" onclick="LoadDeliveryList();">Update</button>
                </div>
            </div>
        </section>
        <section id="delivery-detail-tab" class="tabs">
            <div class="m-3">
                <h3 style="display:inline-block"><strong><span id="delivery-detail-title"><span class="placeholder" style="width:150px"></span></span></strong></h3>
                <h3 style="float:right"><span id="delivery-detail-user"><span class="placeholder" style="width:100px"></span></span></h3>
            </div>
            <div class="row m-3">
                <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
                    <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-source-company"><span class="placeholder col-8"></span></span></b></p>
                    <p><span id="delivery-detail-source-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
                </div>
                <div class="col-6 m-auto" style="text-align:center">
                    <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-cargo"><span class="placeholder col-6"></span></span></p>
                    <div class="progress" style="height:5px;margin:5px;">
                        <div id="delivery-detail-progress" class="progress-bar progress-bar-striped" role="progressbar" style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-distance"><span class="placeholder col-8"></span></span></p>
                </div>
                <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
                    <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-destination-company"><span class="placeholder col-8"></span></span></b></p>
                    <p><span id="delivery-detail-destination-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
                </div>
            </div>
            <div class="row m-3" style="height:500px">
                <div id="dmap" class="col-8 h-100" style="background-color:#484E66;padding:0;border-radius:5px">
                </div>
                <div class="col-4" style="padding-right:0;">
                    <div id="delivery-detail-timeline-div" class="shadow p-5 bg-dark rounded" style="height:500px;overflow:auto;">
                        <ul class="timeline" id="delivery-detail-timeline">
                            <li class="timeline-item timeline-white mb-5">
                                <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                                <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                                <p><span class="placeholder" style="width:120px"></span></p>
                            </li>
                            <li class="timeline-item timeline-white mb-5">
                                <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                                <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                                <p><span class="placeholder" style="width:120px"></span></p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
        <section id="division-tab" class="tabs">
            <div class="row mb-3">
                <div class="col-4" id="division-summary-list">
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ><span class="placeholder" style="width:120px"></span></p>
                    </div>
                </div>
                <div class="shadow p-3 bg-dark rounded col-8">
                    <h5><strong><span class="rect-20"><i class="fa-solid fa-warehouse"></i></span> Recent Division Deliveries</strong></h5>
                    <div id="table_division_delivery" style="height:fit-content">
                        <table class="w-100">
                            <thead id="table_division_delivery_head">
                                <tr>
                                    <th scope="col" style="min-width:80px">ID</th>
                                    <th scope="col">Driver</th>
                                    <th scope="col">Source</th>
                                    <th scope="col">Destination</th>
                                    <th scope="col">Distance</th>
                                    <th scope="col">Cargo</th>
                                    <th scope="col">Net Profit</th>
                                </tr>
                            </thead>
                            <tbody id="table_division_delivery_data">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="row mb-3">
                <div class="shadow p-3 bg-dark rounded w-100" id="division-pending-list" style="display:none">
                    <h5><strong><span class="rect-20"><i class="fa-solid fa-warehouse"></i></span> Pending Division Validation Requests</strong></h5>
                    <div id="table_division_pending">
                        <table class="w-100">
                            <thead id="table_division_pending_head">
                                <tr>
                                    <th scope="col">Log ID</th>
                                    <th scope="col">Division</th>
                                    <th scope="col">Driver</th>
                                </tr>
                            </thead>
                            <tbody id="table_division_pending_data">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
        <section id="footer">
            <hr style="border:1px solid #777;margin-bottom:8px">
            <div style="width:49.5%;text-align:left;display:inline-block">
                &copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
            </div>
            <div style="width:49.5%;text-align:right;display:inline-block">
                <a href="https://drivershub.charlws.com/" target="_blank">CHub</a>
                &nbsp;&nbsp;
                <a href="https://discord.gg/wNTaaBZ5qd" target="_blank">Discord</a>
                &nbsp;&nbsp;
                <a href="https://wiki.charlws.com/" target="_blank">Wiki</a>
            </div>
        </section>
    </div>
</body>

</html>