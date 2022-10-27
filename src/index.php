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
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

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
        echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/2e38346f10efd7b4.js"></script>';
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

        .tabs {
            display: none;
        }

        a {
            text-decoration: none;
            color: #fff;
        }
        a:hover {
            color: #fff;
        }

        table a {
            color: #ccc;
        }
        table a:hover {
            color: #fff;
        }

        .form-label {
            font-weight: bold;
        }

        .member-only {
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

        select {
            max-width: 250px;
        }

        h1,h2,h3,p,span,text,label,input,textarea,select,tr,strong {color: white;}
        th > .fc-scrollgrid-sync-inner {background-color: #444}
        .flexdatalist-results {background-color:#2F3136;}
        .flexdatalist-multiple li.value {background-color:#2F3136;}
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
        <div style="height:60px;overflow:hidden">
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
                    <li class="nav-item member-only">
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
                    <li class="nav-item member-only">
                        <a id="button-challenge-tab" onclick="ShowTab('#challenge-tab', '#button-challenge-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-fire-flame-curved"></i></span>
                            Challenges
                        </a>
                    </li>
                    <li class="nav-item member-only">
                        <a id="button-division-tab" onclick="ShowTab('#division-tab', '#button-division-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-event-tab" onclick="ShowTab('#event-tab', '#button-event-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                </div>
                <div class="member-only" style="margin:5px 0;">
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
                        <a id="button-submit-application-tab" onclick="ShowTab('#submit-application-tab', '#button-submit-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                            New Application
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-my-application-tab" onclick="ShowTab('#my-application-tab', '#button-my-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-circle-check"></i></span>
                            My Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-all-application-tab" onclick="ShowTab('#all-application-tab', '#button-all-application-tab')" class="nav-link text-white clickable" aria-current="page" style="display:none">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            All Applications
                        </a>
                    </li>
                </div>
                <div id="sidebar-staff" style="margin:5px 0;display:none">
                    <li><strong style="color:darkgrey">Staff</strong></li>
                    <li class="nav-item">
                        <a id="button-manage-user-tab" onclick="ShowTab('#manage-user-tab', '#button-manage-user-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                            Pending Users
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
        <div class="dropdown text-white bg-dark" style="position:fixed;bottom:0;width:220px;height:80px;z-index:100;">
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
                <li><a class="dropdown-item clickable" onclick="LoadUserProfile(localStorage.getItem('userid'))">Profile</a></li>
                <li><a class="dropdown-item clickable" onclick="Logout()">Sign out</a></li>
            </ul>
            <a id="button-user-delivery-tab" onclick="LoadUserProfile(localStorage.getItem('userid'));" class="text-white text-decoration-none clickable" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-truck"></i></a>
            <a id="button-user-settings-tab" onclick="ShowTab('#user-settings-tab');" class="text-white text-decoration-none clickable" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-gear"></i></a>
        </div>
    </div>
    <div style="position:fixed;left:260px;top:0;width:calc(100% - 260px);height:60px;box-shadow:0 1px 2px 0 #111;background-color:#2F3136;z-index:98;">
        <strong id="topbar-message" style="position:fixed;left:280px;top:20px;"><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> 0 Driver Trucking</strong>
        <div>
            <strong style="position:fixed;right:50px;top:20px;"><?php echo $slogan ?></strong>
            <div class="dropdown" style="display:inline;">
                <div style="position:fixed;right:20px;top:20px;" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"><a class="mx-2 clickable position-relative" onclick="NotificationsMarkAllAsRead()">
                    <i class="fa-solid fa-bell"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notification-pop" style="display:none">
                        <span id="unread-notification"></span>
                    </span>
                </a></div>
                <div class="dropdown-menu dropdown-menu-end p-4 bg-dark text-white" style="border:solid 1px grey;width:500px;">
                    <h5 class="fw-bold mb-2" style="display:inline">Notifications</h5>
                    <div style="float:right;"><a class="clickable" onclick="ShowTab('#notification-tab');"><span class="rect-20"><i class="fa-solid fa-up-right-and-down-left-from-center"></i></span></a></div>
                    <br>
                    <div style="margin-top:5px;max-height:300px" id="notification-dropdown-wrapper">
                        <div id="notification-dropdown">
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                    <input type="text" class="form-control bg-dark text-white" id="mfa-otp" placeholder="000 000">
                </div>
                <button id="button-mfa-verify" type="button" class="btn btn-primary w-100" onclick="MFAVerify();">Verify</button>
            </div>
        </section>
        <section id="auth-message-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 400px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong><span id="auth-message-title"></strong></h1>
                <p><span id="auth-message-content"></p>
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
                                <canvas id="statistics-chart" width="100%" height="300px"></canvas>
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
                        <button id="button-announcement-new-post" type="button" class="btn btn-primary" style="float:right;" onclick="PostAnnouncement();">Post</button>
                    </div>
                </div>
            </div>
            <div id="announcements">
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
                    <div id="downloads-edit-hide-button-wrapper" style="float:right;"><a style="cursor:pointer" onclick='$("#downloads-edit-div").toggle();$("#downloads-edit-button-wrapper").show();'><span class="rect-20"><i class="fa-solid fa-eye-slash"></i></span></a></div>
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
                <div class="row">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <div style="padding:20px 0 0 20px;float:left" id="profile-info">
                        </div>
                        <div style="width:170px;padding:10px;float:right"><img id="profile-avatar" src="/images/logo.png" onerror="$(this).attr('src','/images/logo.png');" style="border-radius:100%;width:150px;height:150px;border:solid <?php echo $vtccolor ?> 5px;">
                        </div>
                        <a style="cursor:pointer"><img id="profile-banner" onclick="CopyBannerURL(profile_userid)" onerror="$(this).hide();" style="border-radius:10px;width:100%;margin-top:10px;margin-bottom:20px;"></a>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col-4">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user"></i></span> Account</strong></h5>
                        <div id="user-account-info"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> Statistics</strong></h5>
                        <div style="float:right">
                            <div class="btn-group" id="user-chart-scale-group">
                                <a id="user-chart-scale-1" onclick='chartscale=1;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary" aria-current="page">24h</a>
                                <a id="user-chart-scale-2" onclick='chartscale=2;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary">7d</a>
                                <a id="user-chart-scale-3" onclick='chartscale=3;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active">30d</a>
                            </div>
                            <a id="user-chart-sum" onclick='addup=1-addup;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active">Sum</a>
                        </div>
                        </h2>
                        <div class="p-4 overflow-x-auto" style="display: block;">
                            <canvas id="user-statistics-chart" width="100%" height="300px"></canvas>
                        </div>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col-4">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-align-left"></i></span> Statistics</strong></h5>
                        <div id="profile-text-statistics"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div id="delivery-log" class="shadow p-3 m-3 bg-dark rounded col" style="height:fit-content">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-truck"></i></span> Deliveries</strong></h5>
                    <div id="delivery-log-button-right-wrapper" style="float:right;"><a id="button-delivery-export" class="member-only clickable" onclick="ShowDeliveryLogExport();"><span class="rect-20"><i class="fa-solid fa-file-export"></i></span></a>
                    <a id="delivery-log-options-show" class="clickable" onclick='$("#delivery-log-options-show").hide();$("#delivery-log-options").show();'><span class="rec-20"><i class="fa-solid fa-gear"></i></span></a></div>
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
                    <div id="delivery-log-options-hide" style="float:right;"><a style="cursor:pointer" onclick='$("#delivery-log-options-show").show();$("#delivery-log-options").hide();'><span class="rect-20"><i class="fa-solid fa-eye-slash"></i></span></a></div>
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
                        <label class="form-label">Division ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-division-id" placeholder="">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Challenge ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-challenge-id" placeholder="">
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
                    <button id="button-delivery-log-options-update" type="button" class="btn btn-primary" style="float:right" onclick="LoadDeliveryList(noplaceholder=true);">Update</button>
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
        <section id="challenge-tab" class="tabs">
            <div id="challenge-new" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
                <h5 id="challenge-new-heading">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#challenge-new-collapse" aria-expanded="false" aria-controls="challenge-new-collapse">
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> New Challenge</strong>
                    </button>
                </h5>
                <div id="challenge-new-collapse" class="collapse" aria-labelledby="challenge-new-heading" data-bs-parent="#challenge-new-job-requirements">
                    <div class="row">
                        <div class="col">
                            <label for="challenge-new-title" class="form-label">Title</label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-title" placeholder="Challenge title">
                            </div>
                            <label for="challenge-new-description" class="form-label">Description</label>
                            <div class="input-group mb-3" style="height:calc(100% - 265px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="challenge-new-description" placeholder="Challenge description, including what drivers need to do to complete the challenge, MarkDown supported" style="height:100%"></textarea>
                            </div>
                            <label for="challenge-new-time" class="form-label">Time (mm/dd/yyyy hh:mm AM/PM)</label>
                            <div class="input-group mb-2">
                                <span class="input-group-text">Start</span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-new-start-time" placeholder="">
                            </div>
                            <div class="input-group mb-3">
                                <span class="input-group-text">End</span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-new-end-time" placeholder="">
                            </div>
                        </div>
                        <div class="col">
                            <label for="challenge-new-type" class="form-label" style="width:100%">Challenge Type</label>
                            <div class="mb-3">
                                <div class="form-check" style="display:inline-block;width:30%">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-1" checked value="1">
                                        <label class="form-check-label" for="challenge-new-type-1">
                                            Personal
                                        </label>
                                    </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-2" value="2">
                                    <label class="form-check-label" for="challenge-new-type-2">
                                        Company
                                    </label>
                                </div>
                            </div>
                            <label for="challenge-new-delivery-count" class="form-label">Delivery Count</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-delivery-count" placeholder="Number of deliveries required to complete the challenge">
                            </div>
                            <div>
                                <label class="form-label">Required Roles (any of them, up to 20 roles)</label>
                                <div class="input-group mb-2">
                                    <input id="challenge-new-required-roles" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="Roles" placeholder='Select roles from list' list="all-role-datalist" data-min-length='1' data-limit-of-values='20' multiple='' data-selection-required='1'>
                                </div>
                            </div>
                            <label for="challenge-new-required-distance" class="form-label">Required Distance</label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-required-distance" placeholder="Distance required to join the challenge">
                            </div>
                            <label for="challenge-new-reward-points" class="form-label">Reward Points</label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-reward-points" placeholder="Points rewarded when challenge is completed">
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col">
                            <label class="form-label" style="width:100%">Job Requirements</label>
                            <p>*All fields are optional. Only input those required for the challenge.</p>
                        </div>
                        <div class="col">
                            <label for="challenge-new-public-details" class="form-label" style="width:100%">Visibility</label>
                            <div class="mb-3">
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-public-details" id="challenge-new-public-details-1" value="1">
                                        <label class="form-check-label" for="challenge-new-public-details-1">
                                            Public (Members)
                                        </label>
                                    </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="challenge-new-public-details" id="challenge-new-public-details-0" checked value="0">
                                    <label class="form-check-label" for="challenge-new-public-details-0">
                                        Private (Staff-only)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <h5>Route</h5>
                            <label for="challenge-new-source-city-id" class="form-label">Source City ID</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-source-city-id" placeholder="Unique ID of source city" multiple=''>
                            </div>
                            <label for="challenge-new-source-company-id" class="form-label">Source Company ID</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-source-city-id" placeholder="Unique ID of source company" multiple=''>
                            </div>
                            <label for="challenge-new-destination-city-id" class="form-label">Destination City ID</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-destination-city-id" placeholder="Unique ID of destination city" multiple=''>
                            </div>
                            <label for="challenge-new-destination-company-id" class="form-label">Destination Company ID</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-destination-city-id" placeholder="Unique ID of destination company" multiple=''>
                            </div>
                            <label for="challenge-new-minimum-distance" class="form-label">Minimum Distance</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-minimum-distance" placeholder="">
                                <span class="input-group-text">km</span>
                            </div>
                            <hr>
                            <h5>Cargo</h5>
                            <label for="challenge-new-cargo-id" class="form-label">Cargo ID</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-cargo-id" placeholder="Unique ID of cargo" multiple=''>
                            </div>
                            <label for="challenge-new-cargo-mass" class="form-label">Minimum Cargo Mass</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-cargo-mass" placeholder="">
                                <span class="input-group-text">kg</span>
                            </div>
                            <label for="challenge-new-cargo-damage" class="form-label">Maximum Cargo Damage</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-cargo-damage" placeholder="">
                                <span class="input-group-text">%</span>
                            </div>
                        </div>
                        <div class="col">
                            <h5>Delivery</h5>
                            <label for="challenge-new-maximum-speed" class="form-label">Maximum Speed</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-speed" placeholder="">
                                <span class="input-group-text">km/h</span>
                            </div>
                            <label for="challenge-new-maximum-fuel" class="form-label">Maximum Fuel</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-fuel" placeholder="">
                                <span class="input-group-text">l</span>
                            </div>
                            <label for="challenge-new-minimum-profit" class="form-label">Minimum Profit</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-minimum-profit" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <label for="challenge-new-maximum-profit" class="form-label">Maximum Profit</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-profit" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <label for="challenge-new-maximum-offence" class="form-label">Maximum Offence</label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-offence" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <hr>
                            <h5>Misc</h5>
                            <div class="row mb-3">
                                <div class="col">
                                    <label for="challenge-new-allow-overspeed" class="form-label">Allow Overspeed</label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white" id="challenge-new-allow-overspeed">
                                            <option value="1" selected>Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                    <label for="challenge-new-allow-auto" class="form-label">Allow Automations</label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white" id="challenge-new-allow-auto">
                                            <option value="none">None</option>
                                            <option value="auto-park">Auto Park</option>
                                            <option value="auto-load">Auto Load</option>
                                            <option value="both" selected>Auto Park & Auto Load</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col">
                                    <label for="challenge-new-must-not-be-late" class="form-label">Must not be late</label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white" id="challenge-new-must-not-be-late">
                                            <option value="1">Yes</option>
                                            <option value="0" selected>No</option>
                                        </select>
                                    </div>
                                    <label for="challenge-new-must-be-special" class="form-label">Must be special transport</label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white" id="challenge-new-must-be-special">
                                            <option value="1">Yes</option>
                                            <option value="0" selected>No</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button id="button-challenge-new-create" type="button" class="btn btn-primary" style="float:right;" onclick="CreateChallenge();">Create</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5 style="display:inline"><strong><span class="rect-20"><i class="fa-solid fa-fire-flame-curved"></i></span> Challenges</strong></h5>
                <a id="button-challenge-edit-delivery" style="float:right;display:none;" class="clickable" onclick='EditChallengeDeliveryShow();'><span class="rec-20"><i class="fa-solid fa-gear"></i></span></a>
                <div id="table_challenge_list">
                    <table class="w-100">
                        <thead id="table_challenge_list_head">
                            <tr>
                                <th scope="col">Title</th>
                                <th scope="col">Type</th>
                                <th scope="col">Reward</th>
                                <th scope="col" style="width:30%">Progress</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody id="table_challenge_list_data">
                        </tbody>
                    </table>
                </div>
            </div>
            <div id="challenge-edit" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
            <h5 id="challenge-edit-heading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#challenge-edit-collapse" aria-expanded="true" aria-controls="challenge-edit-collapse">
                    <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> Edit Challenge #<span id="challenge-edit-id-span"></span></strong>
                </button>
            </h5>
            <div id="challenge-edit-collapse" class="collapsed" aria-labelledby="challenge-edit-heading" data-bs-parent="#challenge-edit-job-requirements">
                <div class="row">
                    <div class="col">
                        <label for="challenge-edit-title" class="form-label">Title</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-title" placeholder="Challenge title">
                        </div>
                        <label for="challenge-edit-description" class="form-label">Description</label>
                        <div class="input-group mb-3" style="height:calc(100% - 265px)">
                            <textarea type="text" class="form-control bg-dark text-white" id="challenge-edit-description" placeholder="Challenge description, including what drivers need to do to complete the challenge, MarkDown supported" style="height:100%"></textarea>
                        </div>
                        <label for="challenge-edit-time" class="form-label">Time (mm/dd/yyyy hh:mm AM/PM)</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text">Start</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-edit-start-time" placeholder="">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text">End</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-edit-end-time" placeholder="">
                        </div>
                    </div>
                    <div class="col">
                        <label for="challenge-edit-type" class="form-label" style="width:100%">Challenge Type</label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-1" checked value="1">
                                    <label class="form-check-label" for="challenge-edit-type-1">
                                        Personal
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-2" value="2">
                                <label class="form-check-label" for="challenge-edit-type-2">
                                    Company
                                </label>
                            </div>
                        </div>
                        <label for="challenge-edit-delivery-count" class="form-label">Delivery Count</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-delivery-count" placeholder="Number of deliveries required to complete the challenge">
                        </div>
                        <div>
                            <label class="form-label">Required Roles (any of them, up to 20 roles)</label>
                            <div class="input-group mb-2">
                                <input id="challenge-edit-required-roles" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="Roles" placeholder='Select roles from list' list="all-role-datalist" data-min-length='1' data-limit-of-values='20' multiple='' data-selection-required='1'>
                            </div>
                        </div>
                        <label for="challenge-edit-required-distance" class="form-label">Required Distance</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-required-distance" placeholder="Distance required to join the challenge">
                        </div>
                        <label for="challenge-edit-reward-points" class="form-label">Reward Points</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-reward-points" placeholder="Points rewarded when challenge is completed">
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col">
                        <label class="form-label" style="width:100%">Job Requirements</label>
                        <p>*All fields are optional. Only input those required for the challenge.</p>
                    </div>
                    <div class="col">
                        <label for="challenge-edit-public-details" class="form-label" style="width:100%">Visibility</label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:40%">
                                <input class="form-check-input" type="radio" name="challenge-edit-public-details" id="challenge-edit-public-details-1" value="1">
                                    <label class="form-check-label" for="challenge-edit-public-details-1">
                                        Public (Members)
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="challenge-edit-public-details" id="challenge-edit-public-details-0" checked value="0">
                                <label class="form-check-label" for="challenge-edit-public-details-0">
                                    Private (Staff-only)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <h5>Route</h5>
                        <label for="challenge-edit-source-city-id" class="form-label">Source City ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-source-city-id" placeholder="Unique ID of source city" multiple=''>
                        </div>
                        <label for="challenge-edit-source-company-id" class="form-label">Source Company ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-source-city-id" placeholder="Unique ID of source company" multiple=''>
                        </div>
                        <label for="challenge-edit-destination-city-id" class="form-label">Destination City ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-destination-city-id" placeholder="Unique ID of destination city" multiple=''>
                        </div>
                        <label for="challenge-edit-destination-company-id" class="form-label">Destination Company ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-destination-city-id" placeholder="Unique ID of destination company" multiple=''>
                        </div>
                        <label for="challenge-edit-minimum-distance" class="form-label">Minimum Distance</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-minimum-distance" placeholder="">
                            <span class="input-group-text">km</span>
                        </div>
                        <hr>
                        <h5>Cargo</h5>
                        <label for="challenge-edit-cargo-id" class="form-label">Cargo ID</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-cargo-id" placeholder="Unique ID of cargo" multiple=''>
                        </div>
                        <label for="challenge-edit-cargo-mass" class="form-label">Minimum Cargo Mass</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-cargo-mass" placeholder="">
                            <span class="input-group-text">kg</span>
                        </div>
                        <label for="challenge-edit-cargo-damage" class="form-label">Maximum Cargo Damage</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-cargo-damage" placeholder="">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                    <div class="col">
                        <h5>Delivery</h5>
                        <label for="challenge-edit-maximum-speed" class="form-label">Maximum Speed</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-speed" placeholder="">
                            <span class="input-group-text">km/h</span>
                        </div>
                        <label for="challenge-edit-maximum-fuel" class="form-label">Maximum Fuel</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-fuel" placeholder="">
                            <span class="input-group-text">l</span>
                        </div>
                        <label for="challenge-edit-minimum-profit" class="form-label">Minimum Profit</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-minimum-profit" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <label for="challenge-edit-maximum-profit" class="form-label">Maximum Profit</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-profit" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <label for="challenge-edit-maximum-offence" class="form-label">Maximum Offence</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-offence" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <hr>
                        <h5>Misc</h5>
                        <div class="row mb-3">
                            <div class="col">
                                <label for="challenge-edit-allow-overspeed" class="form-label">Allow Overspeed</label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white" id="challenge-edit-allow-overspeed">
                                        <option value="1" selected>Yes</option>
                                        <option value="0">No</option>
                                    </select>
                                </div>
                                <label for="challenge-edit-allow-auto" class="form-label">Allow Automations</label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white" id="challenge-edit-allow-auto">
                                        <option value="none">None</option>
                                        <option value="auto-park">Auto Park</option>
                                        <option value="auto-load">Auto Load</option>
                                        <option value="both" selected>Auto Park & Auto Load</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col">
                                <label for="challenge-edit-must-not-be-late" class="form-label">Must not be late</label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white" id="challenge-edit-must-not-be-late">
                                        <option value="1">Yes</option>
                                        <option value="0" selected>No</option>
                                    </select>
                                </div>
                                <label for="challenge-edit-must-be-special" class="form-label">Must be special transport</label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white" id="challenge-edit-must-be-special">
                                        <option value="1">Yes</option>
                                        <option value="0" selected>No</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button id="button-challenge-edit" type="button" class="btn btn-primary" style="float:right;" onclick="">Edit</button>
                        <button type="button" class="btn btn-secondary mx-2" style="float:right;" onclick="$('#challenge-edit').hide();">Close</button>
                    </div>
                </div>
            </div>
        </div>
        </section>
        <section id="division-tab" class="tabs">
            <div class="row mb-3">
                <div class="col-4" id="division-summary-list">
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                </div>
                <div class="shadow p-3 bg-dark rounded col-8">
                    <h5><strong><span class="rect-20"><i class="fa-solid fa-warehouse"></i></span> Division Deliveries</strong></h5>
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
        <section id="event-tab" class="tabs">
            <div id="event-new" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
                <h5 id="event-new-heading">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#event-new-collapse" aria-expanded="false" aria-controls="event-new-collapse">
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> New Event</strong>
                    </button>
                </h5>
                <div id="event-new-collapse" class="collapse row" aria-labelledby="event-new-heading" data-bs-parent="#event-new">
                    <div class="col">
                        <label for="event-new-title" class="form-label">Title</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-new-title" placeholder="Event title">
                        </div>
                        <label for="event-new-description" class="form-label">Description</label>
                        <div class="input-group mb-3" style="height:calc(100% - 160px)">
                            <textarea type="text" class="form-control bg-dark text-white" id="event-new-description" placeholder="Event description, including things to note like Event Server and Paint Scheme etc, MarkDown supported" style="height:100%"></textarea>
                        </div>
                    </div>
                    <div class="col">
                        <label for="event-new-truckersmp-link" class="form-label">TruckersMP Link</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-new-truckersmp-link" placeholder="(Optional) Link to TruckersMP event page">
                        </div>
                        <label for="event-new-location" class="form-label">Location</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-departure-label">Departure</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-departure" placeholder="Where the event starts" aria-describedby="event-new-departure-label">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-destination-label">Destination</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-destination" placeholder="Where the event ends" aria-describedby="event-new-destination-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-new-distance-label">Distance</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-distance" placeholder="How long the event is" aria-describedby="event-new-distance-label">
                        </div>
                        <label for="event-new-time" class="form-label">Time (mm/dd/yyyy hh:mm AM/PM)</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-meetup-time-label">Meetup</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-new-meetup-time" placeholder="" aria-describedby="event-new-meetup-time-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-new-departure-time-label">Departure</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-new-departure-time" placeholder="" aria-describedby="event-new-departure-time-label">
                        </div>
                        <label for="event-new-visibility" class="form-label" style="width:100%">Visibility</label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="event-new-visibility" id="event-visibility-public" checked>
                                    <label class="form-check-label" for="event-visibility-public">
                                        Public
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="event-new-visibility" id="event-visibility-private">
                                <label class="form-check-label" for="event-visibility-private">
                                    Private
                                </label>
                            </div>
                        </div>
                        <button id="button-event-new-create" type="button" class="btn btn-primary" style="float:right;" onclick="CreateEvent();">Create</button>
                    </div>
                </div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5><strong><span class="rect-20"><i class="fa-regular fa-calendar"></i></span> Events Calendar</strong></h5>
                <div id="events-calendar"></div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-table-list"></i></span> Events List</strong></h5>
                <div id="table_event_list">
                    <table class="w-100">
                        <thead id="table_event_list_head">
                            <tr>
                                <th scope="col">Title</th>
                                <th scope="col">Departure</th>
                                <th scope="col">Destination</th>
                                <th scope="col" style="width:120px">Distance</th>
                                <th scope="col" style="width:180px">Meetup Time</th>
                                <th scope="col" style="width:180px">Departure Time</th>
                                <th scope="col">Voters</th>
                            </tr>
                        </thead>
                        <tbody id="table_event_list_data">
                        </tbody>
                    </table>
                </div>
            </div>
            <div id="event-edit" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
                <h5 id="event-edit-heading">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#event-edit-collapse" aria-expanded="true" aria-controls="event-edit-collapse">
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> Edit Event #<span id="event-edit-id-span"></span></strong>
                    </button>
                </h5>
                <div id="event-edit-collapse" class="collapsed row" aria-labelledby="event-edit-heading" data-bs-parent="#event-edit">
                    <input type="text" class="form-control bg-dark text-white" id="event-edit-id" placeholder="Event id" style="display:none">
                    <div class="col">
                        <label for="event-edit-title" class="form-label">Title</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-edit-title" placeholder="Event title">
                        </div>
                        <label for="event-edit-description" class="form-label">Description</label>
                        <div class="input-group mb-3" style="height:calc(100% - 160px)">
                            <textarea type="text" class="form-control bg-dark text-white" id="event-edit-description" placeholder="Event description, including things to note like Event Server and Paint Scheme etc, MarkDown supported" style="height:100%"></textarea>
                        </div>
                    </div>
                    <div class="col">
                        <label for="event-edit-truckersmp-link" class="form-label">TruckersMP Link</label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-edit-truckersmp-link" placeholder="(Optional) Link to TruckersMP event page">
                        </div>
                        <label for="event-edit-location" class="form-label">Location</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-edit-departure-label">Departure</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-edit-departure" placeholder="Where the event starts" aria-describedby="event-edit-departure-label">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-edit-destination-label">Destination</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-edit-destination" placeholder="Where the event ends" aria-describedby="event-edit-destination-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-edit-distance-label">Distance</span>
                            <input type="text" class="form-control bg-dark text-white" id="event-edit-distance" placeholder="How long the event is" aria-describedby="event-edit-distance-label">
                        </div>
                        <label for="event-edit-location" class="form-label">Time (mm/dd/yyyy hh:mm AM/PM)</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-edit-meetup-time-label">Meetup</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-edit-meetup-time" placeholder="" aria-describedby="event-edit-meetup-time-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-edit-departure-time-label">Departure</span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-edit-departure-time" placeholder="" aria-describedby="event-edit-departure-time-label">
                        </div>
                        <label for="event-edit-visibility" class="form-label" style="width:100%">Visibility</label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="event-edit-visibility" id="event-edit-visibility-public" checked>
                                    <label class="form-check-label" for="event-edit-visibility-public">
                                        Public
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="event-edit-visibility" id="event-edit-visibility-private">
                                <label class="form-check-label" for="event-edit-visibility-private">
                                    Private
                                </label>
                            </div>
                        </div>
                        <button id="button-event-edit" type="button" class="btn btn-primary m-2" style="float:right;" onclick="EditEvent();">Edit</button>
                        <button type="button" class="btn btn-secondary m-2" style="float:right;" onclick="$('#event-edit').hide();">Close</button>
                    </div>
                </div>
            </div>
        </section>
        <section id="member-tab" class="tabs">
            <div class="row">
                <div class="col-4" id="member-tab-left" style="display:none">
                    <div class="shadow p-3 m-3 bg-dark rounded col card" style="driver-of-the-month">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> Driver of the Month</strong></h5>
                        <p class="card-text" style="font-size:25px;text-align:center"><span id="driver-of-the-month-info"><span class="placeholder" style="width:60%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card" style="staff-of-the-month">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-shield-halved"></i></span> Staff of the Month</strong></h5>
                        <p class="card-text" style="font-size:25px;text-align:center"><span id="staff-of-the-month-info"><span class="placeholder" style="width:60%"></span></span></p>
                    </div>
                </div>
                <div id="member-tab-right">
                    <div class="shadow p-3 m-3 bg-dark rounded">
                        <h5 style="display:inline"><strong><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> Members</strong></h5>
                        <div class="input-group mb-3" style="float:right;width:200px;position:relative;top:-5px;">
                            <input id="input-member-search" type="text" class="form-control bg-dark text-white" placeholder="Username" aria-label="Username" aria-describedby="button-member-list-search" >
                            <button class="btn btn-outline-secondary" type="button" id="button-member-list-search" style="min-width:0" onclick="LoadMemberList(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                        </div>
                        <div id="table_member_list" class="mt-3">
                            <table class="w-100">
                                <thead id="table_member_list_head">
                                    <tr>
                                        <th style="width:40px"></th>
                                        <th>Name</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody id="table_member_list_data">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="leaderboard-tab" class="tabs">
            <div class="row">
                <div id="leaderboard" class="shadow p-3 m-3 bg-dark rounded col" style="height:fit-content">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span> Leaderboard</strong></h5>
                    <div id="leaderboard-button-right-wrapper" style="float:right;">
                        <a id="leaderboard-options-show" class="clickable" onclick='$("#leaderboard-options-show").hide();$("#leaderboard-options").show();'><span class="rec-20"><i class="fa-solid fa-gear"></i></span></a>
                    </div>
                    <div id="table_leaderboard">
                        <table class="w-100">
                            <thead id="table_leaderboard_head">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Rank</th>
                                    <th scope="col">Distance (<span class="distance_unit"></span>)</th>
                                    <th scope="col">Challenge</th>
                                    <th scope="col">Event</th>
                                    <th scope="col">Division</th>
                                    <th scope="col">Myth</th>
                                    <th scope="col">Total</th>
                                </tr>
                            </thead>
                            <tbody id="table_leaderboard_data">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="leaderboard-options" class="shadow p-3 m-3 bg-dark rounded col-4" style="display:none;height:fit-content;">
                    <h5 style="display:inline-block"><strong>Options</strong></h5>
                    <div id="leaderboard-options-hide" style="float:right;"><a style="cursor:pointer" onclick='$("#leaderboard-options-show").show();$("#leaderboard-options").hide();'><span class="rect-20"><i class="fa-solid fa-eye-slash"></i></span></a></div>
                    <div>
                        <div>
                            <label class="form-label">Members</label>
                            <div class="input-group mb-2">
                                <input id="input-leaderboard-search" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="Users" placeholder='Select members from list' list="all-member-datalist" data-min-length='1' data-limit-of-values='10' multiple='' data-selection-required='1'>
                            </div>
                        </div>
                        <label class="form-label">Game</label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-ets2" checked>
                            <label class="form-check-label" for="leaderboard-ets2">
                                ETS2
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-ats" checked>
                            <label class="form-check-label" for="leaderboard-ats">
                                ATS
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Points</label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-distance" checked>
                            <label class="form-check-label" for="leaderboard-distance">
                                Distance
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-challenge" checked>
                            <label class="form-check-label" for="leaderboard-challenge">
                                Challenge
                            </label>
                        </div>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-event" checked>
                            <label class="form-check-label" for="leaderboard-event">
                                Event
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-division" checked>
                            <label class="form-check-label" for="leaderboard-division">
                                Division
                            </label>
                        </div>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-myth" checked>
                            <label class="form-check-label" for="leaderboard-myth">
                                Myth
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Max. Speed</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="leaderboard-speed-limit" placeholder="0">
                            <span class="input-group-text"><span class="distance_unit text-black"></span>/h</span>
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Date Range</label>
                        <div class="input-group mb-2">
                            <span class="input-group-text">From</span>
                            <input type="date" class="form-control bg-dark text-white" id="leaderboard-start-time">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text">To</span>
                            <input type="date" class="form-control bg-dark text-white" id="leaderboard-end-time">
                        </div>
                    </div>
                    <div>
                        <label class="form-label">Page Size</label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="leaderboard-page-size" placeholder="20">
                            <span class="input-group-text">rows</span>
                        </div>
                    </div>
                    <button id="button-leaderboard-options-update" type="button" class="btn btn-primary" style="float:right" onclick="LoadLeaderboard(noplaceholder=true);">Update</button>
                </div>
            </div>
        </section>
        <section id="ranking-tab" class="tabs">
            
        </section>
        <section id="submit-application-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span> New Application</strong></h5>
                <?php echo $application_html; ?>
                <button id="button-submit-application" type="button" class="btn btn-primary" style="float:right" onclick="SubmitApplication();">Submit</button>
            </div>
        </section>
        <section id="my-application-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-envelope-circle-check"></i></span> My Applications</strong></h5>
                <div id="table_my_application">
                    <table class="w-100">
                        <thead id="table_my_application_head">
                            <tr>
                                <th scope="col" style="min-width:80px">ID</th>
                                <th scope="col">Type</th>
                                <th scope="col">Status</th>
                                <th scope="col">Submit</th>
                                <th scope="col">Reply</th>
                                <th scope="col">Staff</th>
                            </tr>
                        </thead>
                        <tbody id="table_my_application_data">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <section id="manage-user-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user-clock"></i></span> Pending Users</strong></h5>
                <div class="input-group mb-3" style="float:right;width:200px;position:relative;top:-5px;">
                    <input id="input-user-search" type="text" class="form-control bg-dark text-white" placeholder="Username" aria-label="Username" aria-describedby="button-user-list-search" >
                    <button class="btn btn-outline-secondary" type="button" id="button-user-list-search" style="min-width:0" onclick="LoadUserList(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>
                <div id="table_pending_user_list">
                    <table class="w-100" style="line-height:30px">
                        <thead id="table_pending_user_list_head">
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Discord</th>
                            </tr>
                        </thead>
                        <tbody id="table_pending_user_list_data">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <section id="all-application-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span> All Applications</strong></h5>
                <div id="all-application-right-wrapper" style="float:right;">
                    <a class="clickable" onclick='UpdateStaffPositionsShow();'><span class="rec-20"><i class="fa-solid fa-gear"></i></span></a></div>
                <div id="table_all_application">
                    <table class="w-100">
                        <thead id="table_all_application_head">
                            <tr>
                                <th scope="col" style="min-width:80px">ID</th>
                                <th scope="col">Creator</th>
                                <th scope="col">Type</th>
                                <th scope="col">Status</th>
                                <th scope="col">Submit</th>
                                <th scope="col">Reply</th>
                                <th scope="col">Staff</th>
                            </tr>
                        </thead>
                        <tbody id="table_all_application_data">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <section id="audit-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-terminal"></i></span> Audit Log</strong></h5>
                <div id="audit-log-right-wrapper" style="float:right;">
                    <div class="input-group mb-3" style="width:300px;position:relative;top:-5px;">
                        <input id="input-audit-log-staff" type="text" class="form-control bg-dark text-white flexdatalist" placeholder="Select staff from list" aria-label="Username" aria-describedby="button-audit-log-staff-search" list="all-member-datalist" data-min-length='1' data-selection-required='1'>
                        <input type="text" class="form-control bg-dark text-white" id="input-audit-log-operation" placeholder="Operation">
                        <button class="btn btn-outline-secondary" type="button" id="button-audit-log-staff-search" style="min-width:0" onclick="LoadAuditLog(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                </div>
                <div id="table_audit_log">
                    <table class="w-100">
                        <thead id="table_audit_log_head">
                            <tr>
                                <th scope="col" style="min-width:180px">User</th>
                                <th scope="col" style="width:180px">Time</th>
                                <th scope="col">Operation</th>
                            </tr>
                        </thead>
                        <tbody id="table_audit_log_data">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <section id="config-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-server"></i></span> API Config</strong></h5>
                <p>Only JSON config editor is available at the moment. Simple editor will be added in the future.</p>
                <p>You have to reload API to make the changes take effect. (MFA has to be enabled)</p>
                <p>A backup is saved before reloading API, it can be retrieved by "Revert".</p>
                <br>
                <label for="json-config" class="form-label">JSON Config</label>
                <div class="input-group mb-3" style="height:500px">
                    <textarea type="text" class="form-control bg-dark text-white" id="json-config" placeholder="{...}"></textarea>
                </div>
                <br>
                <div style="float:right">
                    <button id="button-revert-config" type="button" class="btn btn-secondary" onclick="RevertConfig();">Revert</button>
                    <button id="button-reset-config" type="button" class="btn btn-secondary" onclick="ResetConfig();">Reset</button>
                    <button id="button-save-config" type="button" class="btn btn-primary" onclick="UpdateConfig();">Save</button>
                    <button id="button-reload-api-show" type="button" class="btn btn-danger" onclick="ReloadAPIShow();">Reload API</button>
                </div>
            </div>
        </section>
        <section id="user-settings-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span clas="rect-20"><i class="fa-solid fa-gear"></i></span> Settings</strong></h5>
                <ul class="nav nav-tabs" role="tablist" style="float:right">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white active" id="settings-general-tab" data-bs-toggle="tab" data-bs-target="#settings-general" type="button" role="tab" aria-controls="settings-general" aria-selected="true">General</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white" id="settings-security-tab" data-bs-toggle="tab" data-bs-target="#settings-security" type="button" role="tab" aria-controls="settings-security" aria-selected="false">Security</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white" id="settings-sessions-tab" data-bs-toggle="tab" data-bs-target="#settings-sessions" type="button" role="tab" aria-controls="settings-sessions" aria-selected="false">Sessions</button>
                    </li>
                </ul>
                <div class="tab-content mt-3" id="settings-subtab">
                    <div class="tab-pane fade show active" id="settings-general" role="tabpanel" aria-labelledby="settings-general-tab" tabindex="0">
                        <div class="row">
                            <div class="col">
                                <label for="settings-distance-unit" class="form-label" style="width:100%">Distance Unit</label>
                                <div class="btn-group mb-3" id="settings-distance-unit-group">
                                    <a id="settings-distance-unit-metric" onclick='localStorage.setItem("distance-unit","metric");window.location.reload();' style="cursor:pointer" class="btn btn-primary active" aria-current="page">Metric</a>
                                    <a id="settings-distance-unit-imperial" onclick='localStorage.setItem("distance-unit","imperial");window.location.reload();' style="cursor:pointer" class="btn btn-primary">Imperial</a>
                                </div>
                            </div>
                            <div class="col">
                                <label for="settings-distance-unit" class="form-label" style="width:100%">Theme</label>
                                <div class="btn-group mb-3" id="settings-theme">
                                    <a id="settings-theme-dark" onclick='ToggleDarkMode("dark");' style="cursor:pointer" class="btn btn-primary active disabled" aria-current="page">Dark</a>
                                    <a id="settings-theme-light" onclick='ToggleDarkMode("light");' style="cursor:pointer" class="btn btn-primary disabled">Light</a>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <label class="form-label" style="width:100%">Account Connections</label>
                        <div class="row">
                            <div class="col">
                                <label for="settings-user-truckersmpid" class="form-label">TruckersMP</label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="settings-user-truckersmpid" placeholder="/">
                                </div>
                                <button id="button-settings-update-truckersmpid" type="button" class="btn btn-primary" style="float:right" onclick="UpdateTruckersMPID();">Update</button>
                            </div>
                            <div class="col">
                                <label for="settings-user-steamid" class="form-label">Steam</label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark disabled" id="settings-user-steamid" placeholder="/" disabled style="color:#aaa">
                                </div>
                                <button id="button-settings-update-steamid" type="button" class="btn btn-primary" style="float:right" onclick="UpdateSteamID();">Update</button>
                            </div>
                        </div>
                        <hr>
                        <label for="settings-bio" class="form-label">About Me</label>
                        <div class="input-group mb-3" style="height:200px">
                            <textarea type="text" class="form-control bg-dark text-white" id="settings-bio" placeholder="About Me, MarkDown supported" style="height:100%"></textarea>
                        </div>
                        <button id="button-settings-bio-save" type="button" class="btn btn-primary" style="float:right" onclick="UpdateBio();">Save</button>
                    </div>
                    <div class="tab-pane fade" id="settings-security" role="tabpanel" aria-labelledby="settings-security-tab" tabindex="0">
                        <label for="settings-password" class="form-label">Password Login</label>
                        <p>You will be able to login with Discord email and Drivers Hub password.</p>
                        <div class="input-group mb-3" style="width:200px">
                            <input type="password" class="form-control bg-dark text-white" id="settings-password" placeholder="New Password">
                        </div>
                        <div style="display:block">
                            <button id="button-settings-password-disable" type="button" class="btn btn-danger" style="display:inline-block" onclick="DisablePassword(firstop=true);">Disable</button>
                            <button id="button-settings-password-update" type="button" class="btn btn-primary" style="display:inline-block" onclick="UpdatePassword(firstop=true);">Update</button>
                        </div>
                        <hr>
                        <label for="settings-application-token" class="form-label">Application Token</label>
                        <p>Application token has limited access to your account but they never expire. Make sure you trust the application before entering this token somewhere.</p>
                        <p id="settings-application-token-p" style="font-size:15px">For security purposes, tokens can only be viewed once, when created. If you forgot or lost access to your token, please regenerate a new one.</p>
                        <p id="settings-application-token" style="display:none"></p>
                        <div style="display:block">
                            <button id="button-application-token-copy" type="button" class="btn btn-secondary" style="display:none;display:none" onclick="">Copy</button>
                            <button id="button-settings-disable-application-token" type="button" class="btn btn-danger" style="display:inline-block" onclick="DisableApplicationToken(firstop=true);">Disable</button>
                            <button id="button-settings-reset-application-token" type="button" class="btn btn-primary" style="display:inline-block" onclick="ResetApplicationToken(firstop=true);">Reset Token</button>
                        </div>
                        <hr>
                        <label for="settings-mfa" class="form-label">Multiple Factor Authentication</label>
                        <p>MFA adds an extra layer of protection on login and sensitive operations by implementing TOTP.</p>
                        <button id="button-settings-mfa-disable" type="button" class="btn btn-danger" onclick="DisableMFAShow();" style="display:none">Disable</button>
                        <button id="button-settings-mfa-enable" type="button" class="btn btn-primary" onclick="EnableMFAShow();" style="display:none">Enable</button>
                        <div class="member-only">
                            <hr>
                            <label for="settings-mfa" class="form-label">Leave Company</label>
                            <p>Your delivery log will be erased and you will be removed from Navio company. This cannot be undone.</p>
                            <button id="button-settings-resign" type="button" class="btn btn-danger" onclick="UserResignShow();">Resign</button>
                        </div>
                        <hr>
                        <label for="settings-mfa" class="form-label">Delete Account</label>
                        <p>Your account will be deleted from our system, including basic info such as username and email, and account connections of Steam and TruckersMP.</p>
                        <p class="member-only">Your can only do this after you leave the company.</p>
                        <button id="button-settings-delete-account" type="button" class="btn btn-danger" onclick="DeleteAccountShow();">Delete</button>
                    </div>
                    <div class="tab-pane fade" id="settings-sessions" role="tabpanel" aria-labelledby="settings-sessions-tab" tabindex="0">
                        <div id="table_session">
                            <table class="w-100">
                                <thead id="table_session_head">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th>IP</th>
                                        <th>Login Time</th>
                                        <th>Expire Time</th>
                                    </tr>
                                </thead>
                                <tbody id="table_session_data">
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="notification-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-bell"></i></span> Notifications</strong></h5>
                <div id="table_notification_list">
                    <table class="w-100">
                        <thead id="table_notification_list_head">
                            <tr>
                                <th scope="col">Content</th>
                                <th scope="col" style="width:180px">Time</th>
                            </tr>
                        </thead>
                        <tbody id="table_notification_list_data">
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
        <datalist id="all-member-datalist" style="display:none">
            
        </datalist>
        <datalist id="all-role-datalist" style="display:none">
            
        </datalist>
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