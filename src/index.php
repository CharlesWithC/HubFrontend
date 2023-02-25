<!DOCTYPE html>

<html lang="en">

<head>
    <?php
    $domain = $_SERVER['HTTP_HOST'];

    if(!file_exists('/var/hub/config/'.$domain.'.json')){
        header('Location: //drivershub.charlws.com/');
        exit();
    }
    $config = json_decode(file_get_contents('/var/hub/config/'.$domain.'.json'), true);

    $language = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
    $language = substr($language, 0, 2);
    $use_cookie_language = false;
    if(isset($_COOKIE['language'])){
        $use_cookie_language = true;
        $language = $_COOKIE['language'];
    }

    $enlang = json_decode(file_get_contents('./languages/en.json'), true);
    $lang = json_decode(file_get_contents('./languages/en.json'), true);
    if(file_exists('./languages/'.$language.'.json')){
        $lang = json_decode(file_get_contents('./languages/'.$language.'.json'), true);
    } else {
        if($use_cookie_language){
            $language = $_SERVER['HTTP_ACCEPT_LANGUAGE'];
            $language = substr($language, 0, 2);
            if(file_exists('./languages/'.$language.'.json')){
                $lang = json_decode(file_get_contents('./languages/'.$language.'.json'), true);
            }
        }
    }

    function mltr($key){ // multilang: translate
        global $lang;
        global $enlang;
        if(array_key_exists($key, $lang)){
            return $lang[$key];
        } else {
            if(array_key_exists($key, $enlang)){
                return $enlang[$key];
            } else {
                return "";
            }
        }
    }

    $path = $_SERVER['REQUEST_URI'];
    if (str_starts_with($path, '/images')) {
        $t = explode("/", $path);
        header('Location: //cdn.chub.page/assets/'.$config["abbr"].'/'.$t[2]);
        exit();
    }
    if (str_starts_with($path, '/js')) {
        $t = explode("/", $path);
        $beta_prefix = "";
        if(stristr($path, 'beta')){
            $beta_prefix = "beta";
        }
        header('Location: //cdn.chub.page/js/'.$beta_prefix.'/'.$t[2]);
        exit();
    }
    if (str_starts_with($path, '/banner')) {
        $t = explode("/", $path);
        header('Location: '.$config["api_host"].'/'.$config["abbr"].'/member/banner?userid='.$t[2]);
        exit();
    }
    ?>

    <title><?php echo $config["name"] ?></title>
    <link rel="icon" href="https://cdn.chub.page/assets/<?php echo $config["abbr"] ?>/logo.png?<?php echo $config["logo_key"] ?>" type="image/x-icon" />
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="<?php echo $config["name"] ?> <?php echo mltr("drivers_hub"); ?> | <?php echo $config["slogan"] ?>">

    <meta property="og:title" content="<?php echo $config["name"] ?> <?php echo mltr("drivers_hub"); ?>" />
    <meta property="og:description" content="<?php echo $config["slogan"] ?>" />
    <meta name="keywords" content="Game,TruckSim,ETS2,ATS,TruckersMP,DriversHub">
    <meta property="og:url" content="https://<?php echo $domain ?>/" />
    <meta property="og:image" content="https://cdn.chub.page/assets/<?php echo $config["abbr"] ?>/logo.png?<?php echo $config["logo_key"] ?>" />
    <meta content="<?php echo $config["color"] ?>" data-react-helmet="true" name="theme-color" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:image:src" content="https://cdn.chub.page/assets/<?php echo $config["abbr"] ?>/logo.png?<?php echo $config["logo_key"] ?>" />
    <meta name="twitter:site" content="@CharlesWithC" />
    <meta name="twitter:creator" content="@CharlesWithC" />

    <script>
        <?php 
            echo 'language = "'.$language.'";';
            echo 'dhabbr = "'.$config["abbr"].'";';
            echo 'dhcolor = "'.$config["color"].'";';
            echo 'company_name = "'.$config["name"].'";';
            echo 'api_host = "'.$config["api_host"].'";';
            echo 'navio_company_id = "'.$config["navio_company_id"].'";';
            echo 'company_distance_unit = "'.$config["distance_unit"].'";';
            echo 'logo_key = "'.$config["logo_key"].'";';
            echo 'banner_key = "'.$config["banner_key"].'";';
        ?>
    </script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/js/bootstrap.min.js" crossorigin="anonymous"></script>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
    <link href="https://cdn.chub.page/css/custom.css" rel="stylesheet">

    <script src="https://cdn.jsdelivr.net/simplemde/latest/simplemde.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/xcatliu/simplemde-theme-dark@master/dist/simplemde-theme-dark.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/simplebar@5.3.9/dist/simplebar.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplebar@5.3.9/dist/simplebar.css" />

    <script src="https://cdn.chub.page/assets/flexdatalist/jquery.flexdatalist.min.js"></script>
    <link rel="stylesheet" href="https://cdn.chub.page/assets/flexdatalist/jquery.flexdatalist.min.css" />

    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.css" />

    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    
    <script src="https://cdn.chub.page/assets/noty/noty.min.js"></script>
    <link rel="stylesheet" href="https://cdn.chub.page/assets/noty/noty.css" />
    <link rel="stylesheet" href="https://cdn.chub.page/assets/noty/themes/mint.css" />

    <script id="bundle" src="https://cdn.chub.page/js/bundles/b42e6717e4a59423.js"></script>

    <link rel="stylesheet" href="https://cdn.chub.page/assets/unisans/css/unisans.min.css">
    <link href="https://cdn.chub.page/assets/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="https://cdn.chub.page/assets/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="https://cdn.chub.page/assets/fontawesome/css/regular.min.css" rel="stylesheet">
    <link href="https://cdn.chub.page/assets/fontawesome/css/solid.min.css" rel="stylesheet">
    <script src="https://js.sentry-cdn.com/74f4194340d9481491344b82f1623100.min.js" crossorigin="anonymous"></script>
	<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
    <script src="https://cdn.chub.page/js/map/ets2map.js"></script>
    <script src="https://cdn.chub.page/js/map/ets2map_promods.js"></script>
    <script src="https://cdn.chub.page/js/map/atsmap.js"></script>
    <script src="https://cdn.chub.page/assets/ics/ics.min.js"></script>

    <?php
    $application_html = "";
    if(file_exists('/var/hub/cdn/assets/'.$config["abbr"].'/application.html')){
        $application_html = file_get_contents('/var/hub/cdn/assets/'.$config["abbr"].'/application.html');
        if($application_html == "")
            $application_html = file_get_contents('default_application.html');
    } else {
        $application_html = file_get_contents('default_application.html');
    }
    ?>
    <?php
    if(in_array("addon", $config["plugins"])){
        echo '<script src="https://cdn.chub.page/assets/'.$config["abbr"].'/addon.js"></script>';
    }
    ?>
    <style>
        a {
            word-break:break-all
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

        .info-tooltip-btn {
            height: 20px;
            position: relative;
            top: -4px;
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
        tbody > tr {
            border-top: solid 1px #444;
            line-height: 180%;
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

        h1,h2,h3,p,span,text,label,input,textarea,select,tr,strong,.fa-regular,.fa-solid,.fa-brands {color: white;}
        th > .fc-scrollgrid-sync-inner {background-color: #444}
        .flexdatalist-results {background-color:#2F3136;}
        .flexdatalist-multiple li.value {background-color:#2F3136;}
    </style>
    <script>
        $(document).ready(function(){
            <?php
                if(!in_array("announcement", $config["plugins"])){echo '$(".announcement-plugin").remove();';}
                if(!in_array("challenge", $config["plugins"])){echo '$(".challenge-plugin").remove();';}
                if(!in_array("downloads", $config["plugins"])){echo '$(".downloads-plugin").remove();';}
                if(!in_array("division", $config["plugins"])){echo '$(".division-plugin").remove();';}
                if(!in_array("application", $config["plugins"])){echo '$(".application-plugin").remove();';}
                if(!in_array("event", $config["plugins"])){echo '$(".event-plugin").remove();';}
                if(!in_array("ranking", $config["plugins"])){echo '$(".ranking-plugin").remove();';}
                if(!in_array("livemap", $config["plugins"])){echo '$(".livemap-plugin").remove();';}
            ?>
        });
    </script>
    <?php 
    if(file_exists('/var/hub/cdn/assets/'.$config["abbr"].'/style.css')){
        echo "<style>".file_get_contents('/var/hub/cdn/assets/'.$config["abbr"].'/style.css')."</style>";
    }
    ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-SLZ5TY9MVN"></script>
    <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-SLZ5TY9MVN');
    </script>
</head>

<body style="width:100%;overflow-x:hidden;background-color:#2F3136;color:white;">
    <div class="d-flex flex-column flex-shrink-0 p-3 text-bg-dark sidebar" style="position:fixed;top:0;left:0;width:260px;height:100vh;z-index:99;">
        <div style="height:60px;overflow:hidden">
            <img src="https://cdn.chub.page/assets/<?php echo $config["abbr"] ?>/banner.png?<?php echo $config["banner_key"] ?>" alt="Banner" width="100%">
        </div>
        <hr>
        <div id="sidebar" style="height:calc(100% - 150px);">
            <ul class="nav nav-pills flex-column mb-auto">
                <div style="margin:5px 0;">
                    <li id="sidebar-information"><strong style="color:darkgrey"><?php echo mltr("information"); ?></strong></li>
                    <li class="nav-item">
                        <a id="button-overview-tab" onclick="ShowTab('#overview-tab', '#button-overview-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-chart-column"></i></span>
                            <?php echo mltr("overview"); ?>
                        </a>
                    </li>
                    <li class="nav-item announcement-plugin">
                        <a id="button-announcement-tab" onclick="ShowTab('#announcement-tab', '#button-announcement-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            <?php echo mltr("announcements"); ?>
                        </a>
                    </li>
                    <li class="nav-item member-only downloads-plugin">
                        <a id="button-downloads-tab" onclick="ShowTab('#downloads-tab', '#button-downloads-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-download"></i></span>
                            <?php echo mltr("downloads"); ?>
                        </a>
                    </li>
                </div>
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey"><?php echo mltr("game"); ?></strong></li>
                    <li class="nav-item livemap-plugin">
                        <a id="button-map-tab" onclick="ShowTab('#map-tab', '#button-map-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-map"></i></span>
                            <?php echo mltr("live_map"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-delivery-tab" onclick="ShowTab('#delivery-tab', '#button-delivery-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-truck"></i></span>
                            <?php echo mltr("deliveries"); ?>
                        </a>
                    </li>
                    <li class="nav-item member-only challenge-plugin">
                        <a id="button-challenge-tab" onclick="ShowTab('#challenge-tab', '#button-challenge-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-fire-flame-curved"></i></span>
                            <?php echo mltr("challenges"); ?>
                        </a>
                    </li>
                    <li class="nav-item member-only division-plugin">
                        <a id="button-division-tab" onclick="ShowTab('#division-tab', '#button-division-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            <?php echo mltr("divisions"); ?>
                        </a>
                    </li>
                    <li class="nav-item event-plugin">
                        <a id="button-event-tab" onclick="ShowTab('#event-tab', '#button-event-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-calendar-days"></i></span>
                            <?php echo mltr("events"); ?>
                        </a>
                    </li>
                </div>
                <div class="member-only" style="margin:5px 0;">
                    <li><strong style="color:darkgrey"><?php echo mltr("drivers"); ?></strong></li>
                    <li class="nav-item">
                        <a id="button-member-tab" onclick="ShowTab('#member-tab', '#button-member-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            <?php echo mltr("members"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-leaderboard-tab" onclick="ShowTab('#leaderboard-tab', '#button-leaderboard-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span>
                            <?php echo mltr("leaderboard"); ?>
                        </a>
                    </li>
                    <li class="nav-item ranking-plugin">
                        <a id="button-ranking-tab" onclick="ShowTab('#ranking-tab', '#button-ranking-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-angles-up"></i></span>
                            <?php echo mltr("rankings"); ?>
                        </a>
                    </li>
                </div>
                <div id="sidebar-application" class="application-plugin" style="margin:5px 0;display:none;">
                    <li><strong style="color:darkgrey"><?php echo mltr("applications"); ?></strong></li>
                    <li class="nav-item">
                        <a id="button-submit-application-tab" onclick="ShowTab('#submit-application-tab', '#button-submit-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                            <?php echo mltr("new_application"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-my-application-tab" onclick="ShowTab('#my-application-tab', '#button-my-application-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-circle-check"></i></span>
                            <?php echo mltr("my_applications"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-all-application-tab" onclick="ShowTab('#all-application-tab', '#button-all-application-tab')" class="nav-link text-white clickable" aria-current="page" style="display:none">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            <?php echo mltr("all_applications"); ?>
                        </a>
                    </li>
                </div>
                <div id="sidebar-staff" style="margin:5px 0;display:none">
                    <li><strong style="color:darkgrey"><?php echo mltr("staff"); ?></strong></li>
                    <li class="nav-item">
                        <a id="button-manage-user-tab" onclick="ShowTab('#manage-user-tab', '#button-manage-user-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                            <?php echo mltr("pending_users"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-audit-tab" onclick="ShowTab('#audit-tab', '#button-audit-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-terminal"></i></span>
                            <?php echo mltr("audit_log"); ?>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-config-tab" onclick="ShowTab('#config-tab', '#button-config-tab')" class="nav-link text-white clickable" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-screwdriver-wrench"></i></span>
                            <?php echo mltr("configuration"); ?>
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
                <img id="sidebar-avatar" src="https://charlws.com/me.gif" alt="" class="rounded-circle me-2"
                    width="30" height="30">
                <span style="display:inline-block;position:relative;top:12px;line-height:14px;">
                    <strong id="sidebar-username" style="max-width:100px;width:100px;overflow:hidden;display:inline-block;"><span class="placeholder col-8"></span></strong>
                    <br>
                    <span style="font-size:12px;color:#ccc;max-width:100px;width:100px;overflow:hidden;max-height:14px;display:inline-block;"><span id="sidebar-userid" style="color:#ccc;"><span class="placeholder col-2"></span></span> | <span id="sidebar-role" style="color:#ccc;"><span class="placeholder col-6"></span></span></span>
                </span>
            </a>
            <ul id="user-profile-dropdown" class="dropdown-menu dropdown-menu-dark text-small shadow" style="padding-top:0">
                <img id="sidebar-banner" src="" alt="" style="border-radius:5px 5px 0 0" onerror="$(this).hide();"
                        width="566px" height="100px">
                <div style="padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);margin-top:10px;">
                    <strong><?php echo mltr("about_me"); ?></strong>
                    <p style="margin-bottom:0" id="sidebar-bio"><span class="placeholder col-8"></span>&nbsp;&nbsp;<span class="placeholder col-2"></span><br><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></span>
                </div>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item clickable" onclick="LoadUserProfile(localStorage.getItem('userid'))"><?php echo mltr("profile"); ?></a></li>
                <li><a class="dropdown-item clickable" onclick="Logout()"><?php echo mltr("sign_out"); ?></a></li>
            </ul>
            <a id="button-user-delivery-tab" onclick="LoadUserProfile(localStorage.getItem('userid'));" class="text-white text-decoration-none clickable" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-truck"></i></a>
            <a id="button-user-settings-tab" onclick="ShowTab('#user-settings-tab');" class="text-white text-decoration-none clickable" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-gear"></i></a>
        </div>
    </div>
    <div style="position:fixed;left:260px;top:0;width:calc(100% - 260px);height:60px;box-shadow:0 1px 2px 0 #111;background-color:#2F3136;z-index:98;">
        <strong id="topbar-message" style="position:fixed;left:280px;top:20px;"><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> 0 <?php echo mltr("driver_trucking"); ?></strong>
        <div>
            <strong style="position:fixed;right:50px;top:20px;"><?php echo $config["slogan"] ?></strong>
            <div class="dropdown" style="display:inline;">
                <div style="position:fixed;right:20px;top:20px;" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"><a class="mx-2 clickable position-relative" onclick="NotificationsMarkAllAsRead()">
                    <i class="fa-solid fa-bell"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="notification-pop" style="display:none">
                        <span id="unread-notification"></span>
                    </span>
                </a></div>
                <div class="dropdown-menu dropdown-menu-end p-4 bg-dark text-white" style="border:solid 1px grey;width:500px;">
                    <h5 class="fw-bold mb-2" style="display:inline"><?php echo mltr("notifications"); ?></h5>
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
                <h1><strong><?php echo mltr("welcome_back"); ?></strong></h1>
                <div class="row">
                    <div class="col-8">
                        <label for="signin-email" class="form-label"><?php echo mltr("email"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="signin-email" placeholder="somebody@charlws.com">
                        </div>
                        <label for="signin-password" class="form-label"><?php echo mltr("password"); ?></label>
                        <div class="input-group mb-3">
                            <input type="password" class="form-control bg-dark text-white" id="signin-password" placeholder="12345678">
                            <span class="input-group-text" style="background-color:transparent;color:white;"><i class="fa fa-eye" aria-hidden="true" id="toggleLoginPassword" style="cursor:pointer"></i></span>
                        </div>
                        <button id="button-signin" type="button" class="btn btn-primary w-100" onclick="ShowCaptcha();"><span class="rect-20"><i class="fa-solid fa-right-to-bracket"></i></span> <?php echo mltr("log_in"); ?></button>
                    </div>
                    <div class="col-4 py-3" style="border-left:solid 1px grey">
                        <p class="mb-0"><?php echo mltr("alternative_sign_in"); ?></p>
                        <button id="signin-discord" type="button" class="btn btn-secondary w-100 m-1" onclick="DiscordSignIn();"><span class="rect-20"><i class="fa-brands fa-discord"></i></span> <?php echo mltr("discord"); ?></button>
                        <button id="signin-steam" type="button" class="btn btn-secondary w-100 m-1" onclick="SteamSignIn();"><span class="rect-20"><i class="fa-brands fa-steam"></i></span> <?php echo mltr("steam"); ?></button>
                        <p style="font-size:12px"><?php echo mltr("register_note"); ?></p>
                    </div>
                </div>
            </div>
        </section>
        <section id="captcha-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 300px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong><?php echo mltr("security_challenge"); ?></strong></h1>
                <label class="form-label"><?php echo mltr("wait_are_you_a_robot"); ?></label>
                <div class="h-captcha" data-sitekey="1788882d-3695-4807-abac-7d7166ec6325" data-theme="dark" data-callback="CaptchaCallback"></div>
            </div>
        </section>
        <section id="mfa-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 400px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong><?php echo mltr("multiple_factor_authentication"); ?></strong></h1>
                <label for="mfa-otp" class="form-label"><?php echo mltr("one_time_pass"); ?></label>
                <div class="input-group mb-3">
                    <input type="text" class="form-control bg-dark text-white" id="mfa-otp" placeholder="000 000">
                </div>
                <button id="button-mfa-verify" type="button" class="btn btn-primary w-100" onclick="MFAVerify();"><?php echo mltr("verify"); ?></button>
            </div>
        </section>
        <section id="auth-message-tab" class="tabs" style="height:80vh">
            <div style="height:calc(max(0px, (100% - 400px) / 2))"></div>
            <div class="shadow p-5 m-3 bg-dark rounded m-auto" style="width:500px">
                <h1><strong><span id="auth-message-title"></strong></h1>
                <p><span id="auth-message-content"></p>
            </div>
        </section>
        <!-- <section id="2022wrapped-tab" class="tabs">
            <div class="row">
                <div id="2022wrapped-left">
                    <div class="shadow p-3 bg-dark rounded" style="min-height:200px;margin:1rem 1rem 50vh 1rem;">
                        <div style="width:170px;padding:10px;float:right"><img id="22w-avatar" src="https://cdn.discordapp.com/avatars/873178118213472286/a_cb5bf8235227e32543d0aa1b516d8cab.gif" onerror="if($(this).attr('src')!='/images/logo.png?4a19d588') $(this).attr('src','/images/logo.png?4a19d588');" style="border-radius:100%;width:150px;height:150px;border:solid #770202 5px;">
                        </div>
                        <div style="padding:20px 0 0 20px;" id="22w-head">
                            <p style="font-size:40px;;"></p>
                        </div>
                        <div class="p-3" style="position:relative">
                            <ul class="timeline" id="22w-timeline"></ul>
                        </div>
                    </div>
                </div>
                <div id="2022wrapped-right" class="col-5" style="display:none;">
                    <div class="shadow p-3 m-1 bg-dark rounded">
                    <h5 style="display:inline-block"><strong><img src="https://drivershub.charlws.com/images/logo.png" width="20px" height="20px"> CHub Statistics</strong></h5>
                    <img src="https://2022-wrapped.chub.page/charts/company_dlog.png" width="100%">
                    <img src="https://2022-wrapped.chub.page/charts/top_10_driver.png" width="100%">
                    <img src="https://2022-wrapped.chub.page/charts/top_10_truck.png" width="100%">
                    <img src="https://2022-wrapped.chub.page/charts/top_10_cargo.png" width="100%">
                    <img src="https://2022-wrapped.chub.page/charts/top_10_route.png" width="100%">
                </div>
                </div>
            </div>
        </section> -->
        <section id="overview-tab" class="tabs">
            <div class="row">
                <div class="col-8" id="overview-left-col">
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> <?php echo mltr("online"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-live"><span class="placeholder col-4"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-regular fa-clock"></i></span><span id="overview-stats-live-datetime"><span class="placeholder col-6"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-id-card"></i></span> <?php echo mltr("drivers"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-driver-tot"><span class="placeholder col-7"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-driver-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> <?php echo mltr("jobs"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-delivery-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-delivery-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-road"></i></span> <?php echo mltr("distance"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-distance-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-distance-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> <?php echo mltr("profit"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-profit-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-profit-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                        <div class="shadow p-3 m-3 bg-dark rounded col card">
                            <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-gas-pump"></i></span> <?php echo mltr("fuel"); ?></strong></h5>
                            <p class="card-text"><span id="overview-stats-fuel-tot"><span class="placeholder col-5"></span></span></p>
                            <p class="card-text"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span id="overview-stats-fuel-new"><span class="placeholder col-4"></span></span></p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col">
                            <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> <?php echo mltr("statistics"); ?></strong></h5>
                            <div style="float:right">
                                <select class="form-select bg-dark text-white" style="display:inline-block;margin-right:5px;width:120px;" id="statistics-chart-select">
                                    <option value="1">24 Hours</option>
                                    <option value="2">7 Days</option>
                                    <option value="3">14 Days</option>
                                    <option value="4">30 Days</option>
                                    <option value="5">90 Days</option>
                                    <option value="6" selected id="statistics-chart-select-360d">360 Days</option>
                                    <option value="7">600 Days</option>
                                </select>
                                <a id="overview-chart-sum" onclick='addup=1-addup;LoadChart()' style="cursor:pointer" class="btn btn-primary active"><?php echo mltr("sum"); ?></a>
                            </div>
                            </h2>
                            <div class="p-4 overflow-x-auto" style="display: block;max-height:400px;">
                                <canvas id="statistics-chart" width="100%" height="400px"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="shadow p-3 m-3 bg-dark rounded col">
                            <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> <?php echo mltr("online_drivers"); ?></strong></h5>
                            <div id="table_online_driver">
                                <table>
                                    <thead id="table_online_driver_head">
                                        <tr>
                                            <th scope="col" style="width:20%"><?php echo mltr("name"); ?></th>
                                            <th scope="col" style="width:20%"><?php echo mltr("truck"); ?></th>
                                            <th scope="col" style="width:40%"><?php echo mltr("cargo"); ?></th>
                                            <th scope="col" style="width:10%"><?php echo mltr("speed"); ?></th>
                                            <th scope="col" style="width:10%"><?php echo mltr("destination"); ?></th>
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
                    <div class="shadow p-3 m-3 bg-dark rounded col row" id="tsr-card">
                        <div style="display:inline-block;width:calc(100% - 120px)">
                            <span><span class="badge" style="background:#2F8DF8;font-size:15px;margin-bottom:12px">Now Playing</span>&nbsp;&nbsp;<a style="cursor:pointer;color:#444" onclick='$("#tsr-card").remove();localStorage.setItem("no-tsr","true");'>x</a></span>
                            <h5 style="max-width:100%;overflow:clip;margin-bottom:8px"><b id="tsr-song">TruckStopRadio</b></h5>
                            <p style="color:#888;max-width:100%;overflow:clip;margin-bottom:12px"><b id="tsr-artist">Loading data...</b></p>
                            <p style="float:left;"><a style="cursor:pointer;" onclick="TSRPlay()" id="tsr-control"><i class="fa-solid fa-circle-play" style="color:#2F8DF8;font-size:40px;"></i></a>&nbsp;&nbsp;&nbsp;&nbsp;<a id="tsr-spotify" style="cursor:pointer" target="_blank"><i class="fa-brands fa-spotify" style="font-size:40px;"></i></a></p>
                        </div>
                        <div style="display:inline-block;width:100px">
                            <a href="https://truckstopradio.co.uk/" target="_blank"><img src="https://truckstopradio.co.uk/img/tsr-logo.png" height="30px" style="margin-bottom:15px"></img></a>
                            <img id="tsr-graphic" src="https://truckstopradio.co.uk/img/autodj.png" height="100px"></img>
                        </div>
                    </div>
                    <?php if ($_SERVER['HTTP_CF_CONNECTING_IP'] === 'FR' && config["api_host"] != "https://drivershub.charlws.com") {
                        echo'<div class="shadow m-3 bg-dark rounded col row" id="ccot-card"><a href="https://truckersmp.com/events/9994" target="_blank" style="padding:0"><img src="https://static.truckersmp.com/images/event/cover/9994.1674582834.jpeg" style="width:100%;padding:0;border-radius:5px;"></a></div>';} ?>
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span> <?php echo mltr("leaderboard"); ?></strong></h5>
                        <div id="table_mini_leaderboard">
                            <table>
                                <thead id="table_mini_leaderboard_head">
                                    <tr>
                                        <th scope="col" style="width:40px"></th>
                                        <th scope="col" style="width:60%"><?php echo mltr("driver"); ?></th>
                                        <th scope="col" style="width:40%"><?php echo mltr("points"); ?></th>
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
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-user-plus"></i></span> <?php echo mltr("new_members"); ?></strong></h5>
                        <div id="table_new_driver">
                            <table>
                                <thead id="table_new_driver_head">
                                    <tr>
                                        <th scope="col" style="width:40px"></th>
                                        <th scope="col" style="width:60%"><?php echo mltr("name"); ?></th>
                                        <th scope="col" style="width:40%"><?php echo mltr("date"); ?></th>
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
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-person-walking"></i></span> <?php echo mltr("recent_visitors"); ?></strong></h5>
                        <div id="table_recent_visitors">
                            <table>
                                <thead id="table_recent_visitors_head">
                                    <tr>
                                        <th scope="col" style="width:40px"></th>
                                        <th scope="col" style="width:60%"><?php echo mltr("name"); ?></th>
                                        <th scope="col" style="width:40%"><?php echo mltr("time"); ?></th>
                                    </tr>
                                </thead>
                                <tbody id="table_recent_visitors_data">
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
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("new_announcement"); ?></strong>
                    </button>
                </h5>
                <div id="announcement-new-collapse" class="collapse row" aria-labelledby="announcement-new-heading" data-bs-parent="#announcement-new">
                    <div class="col-6">
                        <label for="announcement-new-title" class="form-label"><?php echo mltr("title"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-title" placeholder="<?php echo mltr("title_placeholder"); ?>">
                        </div>
                        <label for="announcement-new-content" class="form-label"><?php echo mltr("content"); ?></label>
                        <textarea type="text" class="form-control bg-dark text-white" id="announcement-new-content" placeholder=""></textarea>
                    </div>
                    <div class="col-6">
                        <label for="announcement-new-type" class="form-label"><?php echo mltr("type"); ?></label>
                        <div class="mb-3">
                            <select class="form-select bg-dark text-white" id="announcement-new-type">
                                <option selected><?php echo mltr("select_one_from_the_list"); ?></option>
                                <option value="0"><?php echo mltr("information"); ?></option>
                                <option value="1"><?php echo mltr("event"); ?></option>
                                <option value="2"><?php echo mltr("warning"); ?></option>
                                <option value="3"><?php echo mltr("critical"); ?></option>
                                <option value="4"><?php echo mltr("resolved"); ?></option>
                            </select>
                        </div>
                        <label for="announcement-new-visibility" class="form-label" style="width:100%"><?php echo mltr("visibility"); ?></label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="announcement-new-visibility" id="announcement-visibility-public" checked>
                                    <label class="form-check-label" for="announcement-visibility-public">
                                    <?php echo mltr("public"); ?>
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="announcement-new-visibility" id="announcement-visibility-private">
                                <label class="form-check-label" for="announcement-visibility-private">
                                <?php echo mltr("private"); ?>
                                </label>
                            </div>
                        </div>
                        <label for="announcement-new-discord" class="form-label"><?php echo mltr("discord_integration"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="announcement-new-discord-channel-label"><?php echo mltr("channel_id"); ?></span>
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-discord-channel" placeholder="<?php echo mltr("discord_channel_id_placeholder"); ?>" aria-describedby="announcement-new-discord-channel-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="announcement-new-discord-message-label"><?php echo mltr("message"); ?></span>
                            <input type="text" class="form-control bg-dark text-white" id="announcement-new-discord-message" placeholder="<?php echo mltr("discord_message_placeholder"); ?>" aria-describedby="announcement-new-discord-message-label">
                        </div>
                    </div>
                    <button id="button-announcement-new-post" type="button" class="btn btn-primary w-100" onclick="PostAnnouncement();"><?php echo mltr("post"); ?></button>
                </div>
            </div>
            <div id="announcements">
            </div>
        </section>
        <section id="downloads-tab" class="tabs">
            <div id="downloads-new" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
                <h5 id="downloads-new-heading">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#downloads-new-collapse" aria-expanded="false" aria-controls="downloads-new-collapse">
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("new_downloadable_item"); ?></strong>
                    </button>
                </h5>
                <div id="downloads-new-collapse" class="collapse row" aria-labelledby="downloads-new-heading" data-bs-parent="#downloads-new">
                    <div class="col-6">
                        <label for="downloads-new-title" class="form-label"><?php echo mltr("title"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="downloads-new-title" placeholder="<?php echo mltr("title_placeholder"); ?>">
                        </div>
                        <label for="downloads-new-link" class="form-label"><?php echo mltr("link"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="downloads-new-link" placeholder="<?php echo mltr("link_placeholder"); ?>">
                        </div>
                        <label for="downloads-new-orderid" class="form-label"><?php echo mltr("order_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="downloads-new-orderid" placeholder="<?php echo mltr("order_id_placeholder"); ?>">
                        </div>
                    </div>
                    <div class="col-6">
                        <label for="downloads-new-description" class="form-label"><?php echo mltr("description"); ?></label>
                        <textarea type="text" class="form-control bg-dark text-white" id="downloads-new-description" placeholder="" style="height:calc(100% - 40px)"></textarea>
                    </div>
                    <button id="button-downloads-new-create" type="button" class="btn btn-primary mt-3 w-100" onclick="CreateDownloads();"><?php echo mltr("create"); ?></button>
                </div>
            </div>
            <div id="downloads">
            </div>
            <div id="downloads-edit" class="shadow p-3 m-3 bg-dark rounded row" style="display:none">
            <h5 id="downloads-edit-heading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#downloads-edit-collapse" aria-expanded="false" aria-controls="downloads-edit-collapse">
                    <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("edit_downloadable_item"); ?> #<span id="downloads-edit-id-span"></span></strong>
                </button>
            </h5>
        </div>
        </section>
        <section id="map-tab" class="tabs">
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;"><?php echo mltr("euro_truck_simulator_2"); ?></h5>
                <div id="map">
                </div>
            </div>
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;"><?php echo mltr("promods_europe"); ?></h5>
                <div id="pmap">
                </div>
            </div>
            <div class="shadow m-3 mb-5 rounded" style="background-color:#484E66;">
                <h5 style="position:absolute;z-index:10;padding:10px;"><?php echo mltr("american_truck_simulator"); ?></h5>
                <div id="amap">
                </div>
            </div>
        </section>
        <section id="delivery-tab" class="tabs">
            <div id="company-statistics">
                <div class="row">
                    <h3><strong><?php echo mltr("daily_statistics"); ?></strong></h3>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> <?php echo mltr("driver_of_the_day"); ?></strong></h5>
                        <p class="card-text"><span id="dotd"><span class="placeholder" style="width:60%"></span></span> <span id="dotddistance" style="font-size:14px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> <?php echo mltr("delivered_distance"); ?></strong></h5>
                        <p class="card-text"><span id="dalljob"><span class="placeholder" style="width:40%"></span></span> / <span id="dtotdistance"><span class="placeholder" style="width:40%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> <?php echo mltr("profit"); ?></strong></h5>
                        <p class="card-text"><span id="dprofit"><span class="placeholder" style="width:50%"></span></span></p>
                    </div>
                </div>
                <div class="row">
                    <h3><strong>Weekly Statistics</strong></h3>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> <?php echo mltr("driver_of_the_week"); ?></strong></h5>
                        <p class="card-text"><span id="dotw"><span class="placeholder" style="width:60%"></span></span> <span id="dotwdistance" style="font-size:14px"></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span> <?php echo mltr("delivered_distance"); ?></strong></h5>
                        <p class="card-text"><span id="walljob"><span class="placeholder" style="width:40%"></span></span> / <span id="wtotdistance"><span class="placeholder" style="width:40%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span> <?php echo mltr("profit"); ?></strong></h5>
                        <p class="card-text"><span id="wprofit"><span class="placeholder" style="width:50%"></span></span></p>
                    </div>
                </div>
            </div>
            <div id="user-statistics" style="display:none">
                <div class="row">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <div style="padding:20px 0 0 20px;float:left" id="profile-info">
                        </div>
                        <div style="width:170px;padding:10px;float:right"><img id="profile-avatar" src="/images/logo.png" onerror="if($(this).attr('src')!='/images/logo.png?<?php echo $config['logo_key'] ?>') $(this).attr('src','/images/logo.png?<?php echo $config['logo_key'] ?>');" style="border-radius:100%;width:150px;height:150px;border:solid <?php echo $config["color"] ?> 5px;">
                        </div>
                        <a style="cursor:pointer"><img id="profile-banner" onclick="CopyBannerURL(profile_userid)" onerror="$(this).hide();" style="border-radius:10px;width:100%;margin-top:10px;margin-bottom:20px;"></a>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col-4">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user"></i></span> <?php echo mltr("account"); ?></strong></h5>
                        <div id="user-account-info"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> <?php echo mltr("statistics"); ?></strong></h5>
                        <div style="float:right">
                            <select class="form-select bg-dark text-white" style="display:inline-block;margin-right:5px;width:120px;" id="user-statistics-chart-select">
                                <option value="1">24 Hours</option>
                                <option value="2">7 Days</option>
                                <option value="3">14 Days</option>
                                <option value="4">30 Days</option>
                                <option value="5">90 Days</option>
                                <option value="6" selected id="user-statistics-chart-select-360d">360 Days</option>
                                <option value="7">600 Days</option>
                            </select>
                            <a id="user-chart-sum" onclick='addup=1-addup;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active"><?php echo mltr("sum"); ?></a>
                        </div>
                        </h2>
                        <div class="p-4 overflow-x-auto" style="display:block;max-height:400px;">
                            <canvas id="user-statistics-chart" width="100%" height="400px"></canvas>
                        </div>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col-4">
                        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-align-left"></i></span> <?php echo mltr("statistics"); ?></strong></h5>
                        <div id="profile-text-statistics"></div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div id="delivery-log" class="shadow p-3 m-3 bg-dark rounded col" style="height:fit-content">
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-truck"></i></span> <?php echo mltr("deliveries"); ?></strong></h5>
                    <div id="delivery-log-button-right-wrapper" style="float:right;"><a id="button-delivery-export" class="member-only clickable" onclick="ShowDeliveryLogExport();"><span class="rect-20"><i class="fa-solid fa-file-export"></i></span></a>
                    <a id="delivery-log-options-show" class="clickable" onclick='$("#delivery-log-options-show").hide();$("#delivery-log-options").show();'><span class="rect-20"><i class="fa-solid fa-gear"></i></span></a></div>
                    <div id="table_delivery_log">
                        <table class="w-100">
                            <thead id="table_delivery_log_head">
                                <tr>
                                    <th scope="col" style="min-width:80px"><?php echo mltr("id"); ?></th>
                                    <th scope="col"><?php echo mltr("driver"); ?></th>
                                    <th scope="col"><?php echo mltr("source"); ?></th>
                                    <th scope="col"><?php echo mltr("destination"); ?></th>
                                    <th scope="col"><?php echo mltr("distance"); ?></th>
                                    <th scope="col"><?php echo mltr("cargo"); ?></th>
                                    <th scope="col"><?php echo mltr("net_profit"); ?></th>
                                </tr>
                            </thead>
                            <tbody id="table_delivery_log_data">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="delivery-log-options" class="shadow p-3 m-3 bg-dark rounded col-4" style="display:none;height:fit-content;">
                    <h5 style="display:inline-block"><strong><?php echo mltr("options"); ?></strong></h5>
                    <div id="delivery-log-options-hide" style="float:right;"><a style="cursor:pointer" onclick='$("#delivery-log-options-show").show();$("#delivery-log-options").hide();'><span class="rect-20"><i class="fa-solid fa-eye-slash"></i></span></a></div>
                    <div>
                        <label class="form-label"><?php echo mltr("game"); ?></label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-ets2" checked>
                            <label class="form-check-label" for="delivery-log-ets2">
                                <?php echo mltr("ets2"); ?>
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-ats" checked>
                            <label class="form-check-label" for="delivery-log-ats">
                                <?php echo mltr("ats"); ?>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("status"); ?></label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-delivered" checked>
                            <label class="form-check-label" for="delivery-log-delivered">
                                <?php echo mltr("delivered"); ?>
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="delivery-log-cancelled">
                            <label class="form-check-label" for="delivery-log-cancelled">
                                <?php echo mltr("cancelled"); ?>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("max_speed"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-speed-limit" placeholder="0">
                            <span class="input-group-text"><span class="distance_unit text-black"></span>/h</span>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("division"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-division-id" placeholder="">
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("challenge"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-challenge-id" placeholder="">
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("date_range"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><?php echo mltr("from"); ?></span>
                            <input type="date" class="form-control bg-dark text-white" id="delivery-log-start-time">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><?php echo mltr("to"); ?></span>
                            <input type="date" class="form-control bg-dark text-white" id="delivery-log-end-time">
                        </div>
                    </div>
                    <div style="display:none">
                        <label class="form-label"><?php echo mltr("user_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-userid" placeholder="0">
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("page_size"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="delivery-log-page-size" placeholder="20">
                            <span class="input-group-text"><?php echo mltr("rows"); ?></span>
                        </div>
                    </div>
                    <button id="button-delivery-log-options-update" type="button" class="btn btn-primary" style="float:right" onclick="LoadDeliveryList(noplaceholder=true);"><?php echo mltr("update"); ?></button>
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
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("new_challenge"); ?></strong>
                    </button>
                </h5>
                <div id="challenge-new-collapse" class="collapse" aria-labelledby="challenge-new-heading" data-bs-parent="#challenge-new-job-requirements">
                    <div class="row">
                        <div class="col-6">
                            <label for="challenge-new-title" class="form-label"><?php echo mltr("title"); ?></label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-title" placeholder="<?php echo mltr("title_placeholder"); ?>">
                            </div>
                            <label for="challenge-new-description" class="form-label"><?php echo mltr("description"); ?></label>
                            <textarea type="text" class="form-control bg-dark text-white" id="challenge-new-description" placeholder="<?php echo mltr("challenge_description_placeholder"); ?>" style="height:calc(100% - 265px)"></textarea>
                            <label for="challenge-new-time" class="form-label"><?php echo mltr("time_with_note"); ?></label>
                            <div class="input-group mb-2">
                                <span class="input-group-text"><?php echo mltr("start"); ?></span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-new-start-time" placeholder="">
                            </div>
                            <div class="input-group mb-3">
                                <span class="input-group-text"><?php echo mltr("end"); ?></span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-new-end-time" placeholder="">
                            </div>
                        </div>
                        <div class="col-6">
                            <label for="challenge-new-type" class="form-label" style="width:100%"><?php echo mltr("challenge_type"); ?></label>
                            <div class="mb-3">
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-1" checked value="1">
                                        <label class="form-check-label" for="challenge-new-type-1">
                                            <?php echo mltr("personal_one_time"); ?>
                                        </label>
                                    </div>
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-3" value="3">
                                    <label class="form-check-label" for="challenge-new-type-3">
                                        <?php echo mltr("personal_recurring"); ?>
                                    </label>
                                </div>
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-4" value="4">
                                    <label class="form-check-label" for="challenge-new-type-4">
                                        <?php echo mltr("personal_distance_based"); ?>
                                    </label>
                                </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-2" value="2">
                                    <label class="form-check-label" for="challenge-new-type-2">
                                        <?php echo mltr("company_one_time"); ?>
                                    </label>
                                </div>
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-type" id="challenge-new-type-5" value="5">
                                    <label class="form-check-label" for="challenge-new-type-5">
                                        <?php echo mltr("company_distance_based"); ?>
                                    </label>
                                </div>
                                <button id="challenge-type-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("challenge_type_note"); ?>"><i class="fa-solid fa-circle-info"></i></button>
                            </div>
                            <label for="challenge-new-delivery-count" class="form-label"><?php echo mltr("delivery_count"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-delivery-count" placeholder="<?php echo mltr("challenge_delivery_count_placeholder"); ?>">
                            </div>
                            <div>
                                <label class="form-label"><?php echo mltr("required_roles_with_note"); ?></label>
                                <div class="input-group mb-2">
                                    <input id="challenge-new-required-roles" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="<?php echo mltr("roles"); ?>" placeholder='Select roles from list' list="all-role-datalist" data-min-length='1' data-limit-of-values='20' multiple='' data-selection-required='1'>
                                </div>
                            </div>
                            <label for="challenge-new-required-distance" class="form-label"><?php echo mltr("required_distance"); ?></label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-required-distance" placeholder="<?php echo mltr("challenge_required_distance_placeholder"); ?>">
                            </div>
                            <label for="challenge-new-reward-points" class="form-label"><?php echo mltr("reward_points"); ?></label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="challenge-new-reward-points" placeholder="<?php echo mltr("challenge_reward_points_placeholder"); ?>">
                            </div>
                        </div>
                    </div>
                    <hr>
                    <div class="row">
                        <div class="col-6">
                            <label class="form-label" style="width:100%"><?php echo mltr("job_requirements"); ?></label>
                            <p><?php echo mltr("job_requirements_note"); ?></p>
                        </div>
                        <div class="col-6">
                            <label for="challenge-new-public-details" class="form-label" style="width:100%"><?php echo mltr("visibility"); ?></label>
                            <div class="mb-3">
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-new-public-details" id="challenge-new-public-details-true" value="true">
                                        <label class="form-check-label" for="challenge-new-public-details-true">
                                            <?php echo mltr("public_challenge"); ?>
                                        </label>
                                    </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="challenge-new-public-details" id="challenge-new-public-details-false" checked value="false">
                                    <label class="form-check-label" for="challenge-new-public-details-false">
                                        <?php echo mltr("private_challenge"); ?>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <h5><?php echo mltr("route"); ?></h5>
                            <label for="challenge-new-source-city-id" class="form-label"><?php echo mltr("source_city_id"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-source-city-id" placeholder="<?php echo mltr("unique_id_of_source_city"); ?>" multiple=''>
                            </div>
                            <label for="challenge-new-source-company-id" class="form-label"><?php echo mltr("source_company_id"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-source-company-id" placeholder="<?php echo mltr("unique_id_of_source_company"); ?>" multiple=''>
                            </div>
                            <label for="challenge-new-destination-city-id" class="form-label"><?php echo mltr("destination_city_id"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-destination-city-id" placeholder="<?php echo mltr("unique_id_of_destination_city"); ?>" multiple=''>
                            </div>
                            <label for="challenge-new-destination-company-id" class="form-label"><?php echo mltr("destination_company_id"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-destination-company-id" placeholder="<?php echo mltr("unique_id_of_destination_company"); ?>" multiple=''>
                            </div>
                            <label for="challenge-new-minimum-distance" class="form-label"><?php echo mltr("minimum_distance"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-minimum-distance" placeholder="">
                                <span class="input-group-text">km</span>
                            </div>
                            <hr>
                            <h5><?php echo mltr("cargo"); ?></h5>
                            <label for="challenge-new-cargo-id" class="form-label"><?php echo mltr("cargo_id"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white flexdatalist challenge-new-job-requirements" id="challenge-new-cargo-id" placeholder="<?php echo mltr("unique_id_of_cargo"); ?>" multiple=''>
                            </div>
                            <label for="challenge-new-cargo-mass" class="form-label"><?php echo mltr("minimum_cargo_mass"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-cargo-mass" placeholder="">
                                <span class="input-group-text">kg</span>
                            </div>
                            <label for="challenge-new-cargo-damage" class="form-label"><?php echo mltr("maximum_cargo_damage"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-cargo-damage" placeholder="">
                                <span class="input-group-text">%</span>
                            </div>
                        </div>
                        <div class="col-6">
                            <h5><?php echo mltr("delivery"); ?></h5>
                            <label for="challenge-new-maximum-speed" class="form-label"><?php echo mltr("maximum_speed"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-speed" placeholder="">
                                <span class="input-group-text">km/h</span>
                            </div>
                            <label for="challenge-new-maximum-fuel" class="form-label"><?php echo mltr("maximum_fuel"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-fuel" placeholder="">
                                <span class="input-group-text">l</span>
                            </div>
                            <label for="challenge-new-minimum-profit" class="form-label"><?php echo mltr("minimum_profit"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-minimum-profit" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <label for="challenge-new-maximum-profit" class="form-label"><?php echo mltr("maximum_profit"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-profit" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <label for="challenge-new-maximum-offence" class="form-label"><?php echo mltr("maximum_offence"); ?></label>
                            <div class="input-group mb-2">
                                <input type="text" class="form-control bg-dark text-white challenge-new-job-requirements" id="challenge-new-maximum-offence" placeholder="">
                                <span class="input-group-text">€/$</span>
                            </div>
                            <hr>
                            <h5><?php echo mltr("misc"); ?></h5>
                            <div class="row mb-3">
                                <div class="col-6">
                                    <label for="challenge-new-allow-overspeed" class="form-label"><?php echo mltr("allow_overspeed"); ?></label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white challenge-new-job-requirements" id="challenge-new-allow-overspeed">
                                            <option value="1" selected><?php echo mltr("yes"); ?></option>
                                            <option value="0"><?php echo mltr("no"); ?></option>
                                        </select>
                                    </div>
                                    <label for="challenge-new-allow-auto" class="form-label"><?php echo mltr("allow_automations"); ?></label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white challenge-new-job-requirements" id="challenge-new-allow-auto">
                                            <option value="none"><?php echo mltr("none"); ?></option>
                                            <option value="auto-park"><?php echo mltr("auto_park"); ?></option>
                                            <option value="auto-load"><?php echo mltr("auto_load"); ?></option>
                                            <option value="both" selected><?php echo mltr("auto_park"); ?> & <?php echo mltr("auto_load"); ?></option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <label for="challenge-new-must-not-be-late" class="form-label"><?php echo mltr("must_not_be_late"); ?></label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white challenge-new-job-requirements" id="challenge-new-must-not-be-late">
                                            <option value="1"><?php echo mltr("yes"); ?></option>
                                            <option value="0" selected><?php echo mltr("no"); ?></option>
                                        </select>
                                    </div>
                                    <label for="challenge-new-must-be-special" class="form-label"><?php echo mltr("must_be_special_delivery"); ?></label>
                                    <div class="mb-3">
                                        <select class="form-select bg-dark text-white challenge-new-job-requirements" id="challenge-new-must-be-special">
                                            <option value="1"><?php echo mltr("yes"); ?></option>
                                            <option value="0" selected><?php echo mltr("no"); ?></option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button id="button-challenge-new-create" type="button" class="btn btn-primary w-100" onclick="CreateChallenge();"><?php echo mltr("create"); ?></button>
                    </div>
                </div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5 style="display:inline"><strong><span class="rect-20"><i class="fa-solid fa-fire-flame-curved"></i></span> <?php echo mltr("challenges"); ?></strong></h5>
                <a id="button-challenge-edit-delivery" style="float:right;display:none;" class="clickable" onclick='EditChallengeDeliveryShow();'><span class="rect-20"><i class="fa-solid fa-gear"></i></span></a>
                <div id="table_challenge_list">
                    <table class="w-100">
                        <thead id="table_challenge_list_head">
                            <tr>
                                <th scope="col"><?php echo mltr("title"); ?></th>
                                <th scope="col"><?php echo mltr("type"); ?></th>
                                <th scope="col"><?php echo mltr("reward"); ?></th>
                                <th scope="col" style="width:30%"><?php echo mltr("progress"); ?></th>
                                <th scope="col"><?php echo mltr("status"); ?></th>
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
                    <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("edit_challenge"); ?> #<span id="challenge-edit-id-span"></span></strong>
                </button>
            </h5>
            <div id="challenge-edit-collapse" class="collapse" aria-labelledby="challenge-edit-heading" data-bs-parent="#challenge-edit-job-requirements">
                <div class="row">
                    <div class="col-6">
                        <label for="challenge-edit-title" class="form-label"><?php echo mltr("title"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-title" placeholder="<?php echo mltr("title_placeholder"); ?>">
                        </div>
                        <label for="challenge-edit-description" class="form-label"><?php echo mltr("description"); ?></label>
                        <textarea type="text" class="form-control bg-dark text-white" id="challenge-edit-description" placeholder="<?php echo mltr("challenge_description_placeholder"); ?>" style="height:calc(100% - 265px)"></textarea>
                        <label for="challenge-edit-time" class="form-label"><?php echo mltr("time_with_note"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><?php echo mltr("start"); ?></span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-edit-start-time" placeholder="">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text"><?php echo mltr("end"); ?></span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="challenge-edit-end-time" placeholder="">
                        </div>
                    </div>
                    <div class="col-6">
                        <label for="challenge-edit-type" class="form-label" style="width:100%"><?php echo mltr("challenge_type"); ?></label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:40%">
                                <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-1" checked value="1" disabled>
                                    <label class="form-check-label" for="challenge-edit-type-1">
                                        <?php echo mltr("personal_one_time"); ?>
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block;width:40%">
                                <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-3" value="3" disabled>
                                <label class="form-check-label" for="challenge-edit-type-3">
                                    <?php echo mltr("personal_recurring"); ?>
                                </label>
                            </div>
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-4" value="4" disabled>
                                    <label class="form-check-label" for="challenge-edit-type-4">
                                        <?php echo mltr("personal_distance_based"); ?>
                                    </label>
                                </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-2" value="2" disabled>
                                    <label class="form-check-label" for="challenge-edit-type-2">
                                        <?php echo mltr("company_one_time"); ?>
                                    </label>
                                </div>
                                <div class="form-check" style="display:inline-block;width:40%">
                                    <input class="form-check-input" type="radio" name="challenge-edit-type" id="challenge-edit-type-5" value="5" disabled>
                                    <label class="form-check-label" for="challenge-edit-type-5">
                                        <?php echo mltr("company_distance_based"); ?>
                                    </label>
                                </div>
                        </div>
                        <label for="challenge-edit-delivery-count" class="form-label"><?php echo mltr("delivery_count"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-delivery-count" placeholder="<?php echo mltr("challenge_delivery_count_placeholder"); ?>">
                        </div>
                        <div>
                            <label class="form-label"><?php echo mltr("required_roles_with_note"); ?></label>
                            <div class="input-group mb-2">
                                <input id="challenge-edit-required-roles" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="<?php echo mltr("roles"); ?>" placeholder='Select roles from list' list="all-role-datalist" data-min-length='1' data-limit-of-values='20' multiple='' data-selection-required='1'>
                            </div>
                        </div>
                        <label for="challenge-edit-required-distance" class="form-label"><?php echo mltr("required_distance"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-required-distance" placeholder="<?php echo mltr("challenge_required_distance_placeholder"); ?>">
                        </div>
                        <label for="challenge-edit-reward-points" class="form-label"><?php echo mltr("reward_points"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="challenge-edit-reward-points" placeholder="<?php echo mltr("challenge_reward_points_placeholder"); ?>">
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-6">
                        <label class="form-label" style="width:100%"><?php echo mltr("job_requirements"); ?></label>
                        <p><?php echo mltr("job_requirements_note"); ?></p>
                    </div>
                    <div class="col-6">
                        <label for="challenge-edit-public-details" class="form-label" style="width:100%"><?php echo mltr("visibility"); ?></label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:40%">
                                <input class="form-check-input" type="radio" name="challenge-edit-public-details" id="challenge-edit-public-details-true" value="true">
                                    <label class="form-check-label" for="challenge-edit-public-details-true">
                                        <?php echo mltr("public_challenge"); ?>
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="challenge-edit-public-details" id="challenge-edit-public-details-false" checked value="false">
                                <label class="form-check-label" for="challenge-edit-public-details-false">
                                    <?php echo mltr("private_challenge"); ?>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6">
                        <h5><?php echo mltr("route"); ?></h5>
                        <label for="challenge-edit-source-city-id" class="form-label"><?php echo mltr("source_city_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-source-city-id" placeholder="<?php echo mltr("unique_id_of_source_city"); ?>" multiple=''>
                        </div>
                        <label for="challenge-edit-source-company-id" class="form-label"><?php echo mltr("source_company_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-source-company-id" placeholder="<?php echo mltr("unique_id_of_source_company"); ?>" multiple=''>
                        </div>
                        <label for="challenge-edit-destination-city-id" class="form-label"><?php echo mltr("destination_city_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-destination-city-id" placeholder="<?php echo mltr("unique_id_of_destination_city"); ?>" multiple=''>
                        </div>
                        <label for="challenge-edit-destination-company-id" class="form-label"><?php echo mltr("destination_company_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-destination-company-id" placeholder="<?php echo mltr("unique_id_of_destination_company"); ?>" multiple=''>
                        </div>
                        <label for="challenge-edit-minimum-distance" class="form-label"><?php echo mltr("minimum_distance"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-minimum-distance" placeholder="">
                            <span class="input-group-text">km</span>
                        </div>
                        <hr>
                        <h5><?php echo mltr("cargo"); ?></h5>
                        <label for="challenge-edit-cargo-id" class="form-label"><?php echo mltr("cargo_id"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white flexdatalist challenge-edit-job-requirements" id="challenge-edit-cargo-id" placeholder="<?php echo mltr("unique_id_of_cargo"); ?>" multiple=''>
                        </div>
                        <label for="challenge-edit-cargo-mass" class="form-label"><?php echo mltr("minimum_cargo_mass"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-cargo-mass" placeholder="">
                            <span class="input-group-text">kg</span>
                        </div>
                        <label for="challenge-edit-cargo-damage" class="form-label"><?php echo mltr("maximum_cargo_damage"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-cargo-damage" placeholder="">
                            <span class="input-group-text">%</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <h5><?php echo mltr("delivery"); ?></h5>
                        <label for="challenge-edit-maximum-speed" class="form-label"><?php echo mltr("maximum_speed"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-speed" placeholder="">
                            <span class="input-group-text">km/h</span>
                        </div>
                        <label for="challenge-edit-maximum-fuel" class="form-label"><?php echo mltr("maximum_fuel"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-fuel" placeholder="">
                            <span class="input-group-text">l</span>
                        </div>
                        <label for="challenge-edit-minimum-profit" class="form-label"><?php echo mltr("minimum_profit"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-minimum-profit" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <label for="challenge-edit-maximum-profit" class="form-label"><?php echo mltr("maximum_profit"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-profit" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <label for="challenge-edit-maximum-offence" class="form-label"><?php echo mltr("maximum_offence"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-maximum-offence" placeholder="">
                            <span class="input-group-text">€/$</span>
                        </div>
                        <hr>
                        <h5><?php echo mltr("misc"); ?></h5>
                        <div class="row mb-3">
                            <div class="col-6">
                                <label for="challenge-edit-allow-overspeed" class="form-label"><?php echo mltr("allow_overspeed"); ?></label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-allow-overspeed">
                                        <option value="1" selected><?php echo mltr("yes"); ?></option>
                                        <option value="0"><?php echo mltr("no"); ?></option>
                                    </select>
                                </div>
                                <label for="challenge-edit-allow-auto" class="form-label"><?php echo mltr("allow_automations"); ?></label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-allow-auto">
                                        <option value="none"><?php echo mltr("none"); ?></option>
                                        <option value="auto-park"><?php echo mltr("auto_park"); ?></option>
                                        <option value="auto-load"><?php echo mltr("auto_load"); ?></option>
                                        <option value="both" selected><?php echo mltr("auto_park"); ?> & <?php echo mltr("auto_load"); ?></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-6">
                                <label for="challenge-edit-must-not-be-late" class="form-label"><?php echo mltr("must_not_be_late"); ?></label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-must-not-be-late">
                                        <option value="1"><?php echo mltr("yes"); ?></option>
                                        <option value="0" selected><?php echo mltr("no"); ?></option>
                                    </select>
                                </div>
                                <label for="challenge-edit-must-be-special" class="form-label"><?php echo mltr("must_be_special_delivery"); ?></label>
                                <div class="mb-3">
                                    <select class="form-select bg-dark text-white challenge-edit-job-requirements" id="challenge-edit-must-be-special">
                                        <option value="1"><?php echo mltr("yes"); ?></option>
                                        <option value="0" selected><?php echo mltr("no"); ?></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button id="button-challenge-edit" type="button" class="btn btn-primary w-100"><?php echo mltr("edit"); ?></button>
                </div>
            </div>
        </div>
        </section>
        <section id="division-tab" class="tabs">
            <div class="row mb-3">
                <div class="col-2" id="division-summary-list">
                    <div class="shadow p-3 mb-3 mt-0 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 mb-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                    <div class="shadow p-3 mb-3 bg-dark rounded col card">
                        <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span><span class="placeholder" style="width:100px"></span></p>
                        <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span><span class="placeholder" style="width:120px"></span></p>
                    </div>
                </div>
                <div class="shadow p-3 bg-dark rounded col-10">
                    <h5><strong><span class="rect-20"><i class="fa-solid fa-warehouse"></i></span> <?php echo mltr("division_deliveries"); ?></strong></h5>
                    <div id="table_division_delivery" style="height:fit-content">
                        <table class="w-100">
                            <thead id="table_division_delivery_head">
                                <tr>
                                    <th scope="col" style="min-width:80px"><?php echo mltr("id"); ?></th>
                                    <th scope="col"><?php echo mltr("driver"); ?></th>
                                    <th scope="col"><?php echo mltr("source"); ?></th>
                                    <th scope="col"><?php echo mltr("destination"); ?></th>
                                    <th scope="col"><?php echo mltr("distance"); ?></th>
                                    <th scope="col"><?php echo mltr("cargo"); ?></th>
                                    <th scope="col"><?php echo mltr("net_profit"); ?></th>
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
                    <h5><strong><span class="rect-20"><i class="fa-solid fa-warehouse"></i></span> <?php echo mltr("pending_validation_requests"); ?></strong></h5>
                    <div id="table_division_pending">
                        <table class="w-100">
                            <thead id="table_division_pending_head">
                                <tr>
                                    <th scope="col"><?php echo mltr("id"); ?></th>
                                    <th scope="col"><?php echo mltr("division"); ?></th>
                                    <th scope="col"><?php echo mltr("driver"); ?></th>
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
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("new_event"); ?></strong>
                    </button>
                </h5>
                <div id="event-new-collapse" class="collapse row" aria-labelledby="event-new-heading" data-bs-parent="#event-new">
                    <div class="col-6">
                        <label for="event-new-title" class="form-label"><?php echo mltr("title"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-new-title" placeholder="<?php echo mltr("title_placeholder"); ?>">
                        </div>
                        <label for="event-new-description" class="form-label"><?php echo mltr("description"); ?></label>
                        <textarea type="text" class="form-control bg-dark text-white" id="event-new-description" placeholder="<?php echo mltr("event_note"); ?>" style="height:calc(100% - 160px)"></textarea>
                    </div>
                    <div class="col-6">
                        <label for="event-new-truckersmp-link" class="form-label"><?php echo mltr("truckersmp_link"); ?></label>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control bg-dark text-white" id="event-new-truckersmp-link" placeholder="<?php echo mltr("truckersmp_link_placeholder"); ?>">
                        </div>
                        <label for="event-new-location" class="form-label"><?php echo mltr("location"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-departure-label"><?php echo mltr("departure"); ?></span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-departure" placeholder="<?php echo mltr("event_departure_placeholder"); ?>" aria-describedby="event-new-departure-label">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-destination-label"><?php echo mltr("destination"); ?></span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-destination" placeholder="<?php echo mltr("event_destination_placeholder"); ?>" aria-describedby="event-new-destination-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-new-distance-label"><?php echo mltr("distance"); ?></span>
                            <input type="text" class="form-control bg-dark text-white" id="event-new-distance" placeholder="<?php echo mltr("event_distance_placeholder"); ?>" aria-describedby="event-new-distance-label">
                        </div>
                        <label for="event-new-time" class="form-label"><?php echo mltr("time_with_note"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text" id="event-new-meetup-time-label"><?php echo mltr("meetup"); ?></span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-new-meetup-time" placeholder="" aria-describedby="event-new-meetup-time-label">
                        </div>
                        <div class="input-group mb-3">
                            <span class="input-group-text" id="event-new-departure-time-label"><?php echo mltr("departure"); ?></span>
                            <input type="datetime-local" class="form-control bg-dark text-white" id="event-new-departure-time" placeholder="" aria-describedby="event-new-departure-time-label">
                        </div>
                        <label for="event-new-visibility" class="form-label" style="width:100%"><?php echo mltr("visibility"); ?></label>
                        <div class="mb-3">
                            <div class="form-check" style="display:inline-block;width:30%">
                                <input class="form-check-input" type="radio" name="event-new-visibility" id="event-visibility-public" checked>
                                    <label class="form-check-label" for="event-visibility-public">
                                        <?php echo mltr("public"); ?>
                                    </label>
                                </div>
                            <div class="form-check" style="display:inline-block">
                                <input class="form-check-input" type="radio" name="event-new-visibility" id="event-visibility-private">
                                <label class="form-check-label" for="event-visibility-private">
                                    <?php echo mltr("private"); ?>
                                </label>
                            </div>
                        </div>
                    </div>
                    <button id="button-event-new-create" type="button" class="btn btn-primary w-100" onclick="CreateEvent();"><?php echo mltr("create"); ?></button>
                </div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5><strong><span class="rect-20"><i class="fa-regular fa-calendar"></i></span> <?php echo mltr("events_calendar"); ?></strong></h5>
                <div id="events-calendar"></div>
            </div>
            <div class="shadow p-3 m-3 bg-dark rounded">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-table-list"></i></span> <?php echo mltr("events_list"); ?></strong></h5>
                <div id="table_event_list" style="overflow:scroll">
                    <table class="w-100">
                        <thead id="table_event_list_head">
                            <tr>
                                <th scope="col" style="min-width:180px"><?php echo mltr("title"); ?></th>
                                <th scope="col"><?php echo mltr("departure"); ?></th>
                                <th scope="col"><?php echo mltr("destination"); ?></th>
                                <th scope="col" style="width:120px"><?php echo mltr("distance"); ?></th>
                                <th scope="col" style="width:180px"><?php echo mltr("meetup_time"); ?></th>
                                <th scope="col" style="width:180px"><?php echo mltr("departure_time"); ?></th>
                                <th scope="col"><?php echo mltr("voters"); ?></th>
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
                        <strong style="font-size:20px"><span class="rect-20"><i class="fa-regular fa-square-plus"></i></span> <?php echo mltr("edit_event"); ?> #<span id="event-edit-id-span"></span></strong>
                    </button>
                </h5>
                <div id="event-edit-collapse" class="collapsed" aria-labelledby="event-edit-heading" data-bs-parent="#event-edit">
                    <input type="text" class="form-control bg-dark text-white" id="event-edit-id" placeholder="" style="display:none">
                    <div class="row">
                        <div class="col-6">
                            <label for="event-edit-title" class="form-label"><?php echo mltr("title"); ?></label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="event-edit-title">
                            </div>
                            <label for="event-edit-description" class="form-label"><?php echo mltr("description"); ?></label>
                            <textarea type="text" class="form-control bg-dark text-white" id="event-edit-description" placeholder="<?php echo mltr("event_note"); ?>" style="height:calc(100% - 160px)"></textarea>
                        </div>
                        <div class="col-6">
                            <label for="event-edit-truckersmp-link" class="form-label"><?php echo mltr("truckersmp_link"); ?></label>
                            <div class="input-group mb-3">
                                <input type="text" class="form-control bg-dark text-white" id="event-edit-truckersmp-link" placeholder="<?php echo mltr("truckersmp_link_placeholder"); ?>">
                            </div>
                            <label for="event-edit-location" class="form-label"><?php echo mltr("location"); ?></label>
                            <div class="input-group mb-2">
                                <span class="input-group-text" id="event-edit-departure-label"><?php echo mltr("departure"); ?></span>
                                <input type="text" class="form-control bg-dark text-white" id="event-edit-departure" placeholder="<?php echo mltr("event_departure_placeholder"); ?>" aria-describedby="event-edit-departure-label">
                            </div>
                            <div class="input-group mb-2">
                                <span class="input-group-text" id="event-edit-destination-label"><?php echo mltr("destination"); ?></span>
                                <input type="text" class="form-control bg-dark text-white" id="event-edit-destination" placeholder="<?php echo mltr("event_destination_placeholder"); ?>" aria-describedby="event-edit-destination-label">
                            </div>
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="event-edit-distance-label"><?php echo mltr("distance"); ?></span>
                                <input type="text" class="form-control bg-dark text-white" id="event-edit-distance" placeholder="<?php echo mltr("event_distance_placeholder"); ?>" aria-describedby="event-edit-distance-label">
                            </div>
                            <label for="event-edit-location" class="form-label"><?php echo mltr("time_with_note"); ?></label>
                            <div class="input-group mb-2">
                                <span class="input-group-text" id="event-edit-meetup-time-label"><?php echo mltr("meetup"); ?></span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="event-edit-meetup-time" placeholder="" aria-describedby="event-edit-meetup-time-label">
                            </div>
                            <div class="input-group mb-3">
                                <span class="input-group-text" id="event-edit-departure-time-label"><?php echo mltr("departure"); ?></span>
                                <input type="datetime-local" class="form-control bg-dark text-white" id="event-edit-departure-time" placeholder="" aria-describedby="event-edit-departure-time-label">
                            </div>
                            <label for="event-edit-visibility" class="form-label" style="width:100%"><?php echo mltr("visibility"); ?></label>
                            <div class="mb-3">
                                <div class="form-check" style="display:inline-block;width:30%">
                                    <input class="form-check-input" type="radio" name="event-edit-visibility" id="event-edit-visibility-public" checked>
                                        <label class="form-check-label" for="event-edit-visibility-public">
                                            <?php echo mltr("public"); ?>
                                        </label>
                                    </div>
                                <div class="form-check" style="display:inline-block">
                                    <input class="form-check-input" type="radio" name="event-edit-visibility" id="event-edit-visibility-private">
                                    <label class="form-check-label" for="event-edit-visibility-private">
                                        <?php echo mltr("private"); ?>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col p-3">
                            <button id="button-event-edit" type="button" class="btn btn-primary w-100" onclick="EditEvent();"><?php echo mltr("edit"); ?></button>
                        </div>
                        <div class="col p-3">
                            <button type="button" class="btn btn-secondary w-100" onclick="$('#event-edit').hide();"><?php echo mltr("close"); ?></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="member-tab" class="tabs">
            <div class="row">
                <div class="col-4" id="member-tab-left" style="display:none">
                    <div class="shadow p-3 m-3 bg-dark rounded col card" id="driver-of-the-month">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-crown"></i></span> <?php echo mltr("driver_of_the_month"); ?></strong></h5>
                        <p class="card-text" style="font-size:25px;text-align:center"><span id="driver-of-the-month-info"><span class="placeholder" style="width:60%"></span></span></p>
                    </div>
                    <div class="shadow p-3 m-3 bg-dark rounded col card" id="staff-of-the-month">
                        <h5 class="card-title"><strong><span class="rect-20"><i class="fa-solid fa-shield-halved"></i></span> <?php echo mltr("staff_of_the_month"); ?></strong></h5>
                        <p class="card-text" style="font-size:25px;text-align:center"><span id="staff-of-the-month-info"><span class="placeholder" style="width:60%"></span></span></p>
                    </div>
                </div>
                <div id="member-tab-right">
                    <div class="shadow p-3 m-3 bg-dark rounded">
                        <h5 style="display:inline"><strong><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> <?php echo mltr("members"); ?></strong></h5>
                        <div class="input-group mb-3" style="float:right;width:250px;position:relative;top:-5px;">
                            <input id="input-member-search" type="text" class="form-control bg-dark text-white" placeholder="<?php echo mltr("username"); ?>" aria-label="<?php echo mltr("username"); ?>" aria-describedby="button-member-list-search" >
                            <button class="btn btn-outline-secondary" type="button" id="button-member-list-search" style="min-width:0" onclick="LoadMemberList(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                            <button class="btn btn-outline-secondary" type="button" id="button-member-list-filter" style="min-width:0" onclick="FilterRolesShow();"><i class="fa-solid fa-gear"></i></button>
                        </div>
                        <div id="table_member_list" class="mt-3">
                            <table class="w-100">
                                <thead id="table_member_list_head">
                                    <tr>
                                        <th style="width:40px"></th>
                                        <th><?php echo mltr("name"); ?></th>
                                        <th><?php echo mltr("role"); ?></th>
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
                    <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span> <?php echo mltr("leaderboard"); ?></strong></h5>
                    <div id="leaderboard-button-right-wrapper" style="float:right;">
                        <a id="leaderboard-options-show" class="clickable" onclick='$("#leaderboard-options-show").hide();$("#leaderboard-options").show();'><span class="rect-20"><i class="fa-solid fa-gear"></i></span></a>
                    </div>
                    <div id="table_leaderboard">
                        <table class="w-100">
                            <thead id="table_leaderboard_head">
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col"><?php echo mltr("name"); ?></th>
                                    <th scope="col"><?php echo mltr("rank"); ?></th>
                                    <th scope="col"><?php echo mltr("distance"); ?> (<span class="distance_unit"></span>)</th>
                                    <th scope="col"><?php echo mltr("challenge"); ?></th>
                                    <th scope="col"><?php echo mltr("event"); ?></th>
                                    <th scope="col"><?php echo mltr("division"); ?></th>
                                    <th scope="col"><?php echo mltr("myth"); ?></th>
                                    <th scope="col"><?php echo mltr("total"); ?></th>
                                </tr>
                            </thead>
                            <tbody id="table_leaderboard_data">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id="leaderboard-options" class="shadow p-3 m-3 bg-dark rounded col-4" style="display:none;height:fit-content;">
                    <h5 style="display:inline-block"><strong><?php echo mltr("options"); ?></strong></h5>
                    <div id="leaderboard-options-hide" style="float:right;"><a style="cursor:pointer" onclick='$("#leaderboard-options-show").show();$("#leaderboard-options").hide();'><span class="rect-20"><i class="fa-solid fa-eye-slash"></i></span></a></div>
                    <div>
                        <div>
                            <label class="form-label"><?php echo mltr("members"); ?></label>
                            <div class="input-group mb-2">
                                <input id="input-leaderboard-search" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="Users" placeholder='<?php echo mltr("select_members_from_list"); ?>' list="all-member-datalist" data-min-length='1' data-limit-of-values='10' multiple='' data-selection-required='1'>
                            </div>
                        </div>
                        <label class="form-label">Game</label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-ets2" checked>
                            <label class="form-check-label" for="leaderboard-ets2"><?php echo mltr("ets2"); ?></label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-ats" checked>
                            <label class="form-check-label" for="leaderboard-ats"><?php echo mltr("ats"); ?></label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("points"); ?></label>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-distance" checked>
                            <label class="form-check-label" for="leaderboard-distance">
                                <?php echo mltr("distance"); ?>
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-challenge" checked>
                            <label class="form-check-label" for="leaderboard-challenge">
                                <?php echo mltr("challenge"); ?>
                            </label>
                        </div>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-event" checked>
                            <label class="form-check-label" for="leaderboard-event">
                                <?php echo mltr("event"); ?>
                            </label>
                        </div>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-division" checked>
                            <label class="form-check-label" for="leaderboard-division">
                                <?php echo mltr("division"); ?>
                            </label>
                        </div>
                        <br>
                        <div class="form-check mb-2" style="width: 100px;display:inline-block">
                            <input class="form-check-input" type="checkbox" value="" id="leaderboard-myth" checked>
                            <label class="form-check-label" for="leaderboard-myth">
                                <?php echo mltr("myth"); ?>
                            </label>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("max_speed"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="leaderboard-speed-limit" placeholder="0">
                            <span class="input-group-text"><span class="distance_unit text-black"></span>/h</span>
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("date_range"); ?></label>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><?php echo mltr("from"); ?></span>
                            <input type="date" class="form-control bg-dark text-white" id="leaderboard-start-time">
                        </div>
                        <div class="input-group mb-2">
                            <span class="input-group-text"><?php echo mltr("to"); ?></span>
                            <input type="date" class="form-control bg-dark text-white" id="leaderboard-end-time">
                        </div>
                    </div>
                    <div>
                        <label class="form-label"><?php echo mltr("page_size"); ?></label>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control bg-dark text-white" id="leaderboard-page-size" placeholder="20">
                            <span class="input-group-text"><?php echo mltr("rows"); ?></span>
                        </div>
                    </div>
                    <button id="button-leaderboard-options-update" type="button" class="btn btn-primary" style="float:right" onclick="LoadLeaderboard(noplaceholder=true);"><?php echo mltr("update"); ?></button>
                </div>
            </div>
        </section>
        <section id="ranking-tab" class="tabs">
            
        </section>
        <section id="submit-application-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span> <?php echo mltr("new_application"); ?></strong></h5>
                <?php echo $application_html; ?>
                <div class="form-check mb-2">
                    <input class="form-check-input" type="checkbox" value="" id="check-application-enable-notification" checked>
                    <label class="form-check-label" for="check-application-enable-notification">
                        <?php echo mltr("enable_appliation_notification"); ?>
                    </label>
                </div>
                <button id="button-submit-application" type="button" class="btn btn-primary mt-2 w-100" onclick="SubmitApplication();"><?php echo mltr("submit"); ?></button>
            </div>
        </section>
        <section id="my-application-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5><strong><span class="rect-20"><i class="fa-solid fa-envelope-circle-check"></i></span> <?php echo mltr("my_applications"); ?></strong></h5>
                <div id="table_my_application">
                    <table class="w-100">
                        <thead id="table_my_application_head">
                            <tr>
                                <th scope="col" style="min-width:80px"><?php echo mltr("id"); ?></th>
                                <th scope="col"><?php echo mltr("type"); ?></th>
                                <th scope="col"><?php echo mltr("status"); ?></th>
                                <th scope="col"><?php echo mltr("submit"); ?></th>
                                <th scope="col"><?php echo mltr("reply"); ?></th>
                                <th scope="col"><?php echo mltr("staff"); ?></th>
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
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user-clock"></i></span> <?php echo mltr("pending_users"); ?></strong></h5>
                <div class="input-group mb-3" style="float:right;width:200px;position:relative;top:-5px;">
                    <input id="input-user-search" type="text" class="form-control bg-dark text-white" placeholder="<?php echo mltr("username"); ?>" aria-label="<?php echo mltr("username"); ?>" aria-describedby="button-user-list-search" >
                    <button class="btn btn-outline-secondary" type="button" id="button-user-list-search" style="min-width:0" onclick="LoadUserList(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                </div>
                <div id="table_pending_user_list">
                    <table class="w-100" style="line-height:30px">
                        <thead id="table_pending_user_list_head">
                            <tr>
                                <th scope="col"><?php echo mltr("name"); ?></th>
                                <th scope="col"><?php echo mltr("discord"); ?></th>
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
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span> <?php echo mltr("all_applications"); ?></strong></h5>
                <div id="all-application-right-wrapper" style="float:right;">
                    <a class="clickable" onclick='UpdateStaffPositionsShow();'><span class="rect-20"><i class="fa-solid fa-gear"></i></span></a></div>
                <div id="table_all_application">
                    <table class="w-100">
                        <thead id="table_all_application_head">
                            <tr>
                                <th scope="col" style="min-width:80px"><?php echo mltr("id"); ?></th>
                                <th scope="col"><?php echo mltr("creator"); ?></th>
                                <th scope="col"><?php echo mltr("type"); ?></th>
                                <th scope="col"><?php echo mltr("status"); ?></th>
                                <th scope="col"><?php echo mltr("submit"); ?></th>
                                <th scope="col"><?php echo mltr("reply"); ?></th>
                                <th scope="col"><?php echo mltr("staff"); ?></th>
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
                <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-terminal"></i></span> <?php echo mltr("audit_log"); ?></strong></h5>
                <div id="audit-log-right-wrapper" style="float:right;">
                    <div class="input-group mb-3" style="width:300px;position:relative;top:-5px;">
                        <input id="input-audit-log-staff" type="text" class="form-control bg-dark text-white flexdatalist" placeholder="<?php echo mltr("select_staff_from_list"); ?>" aria-label="<?php echo mltr("username"); ?>" aria-describedby="button-audit-log-staff-search" list="all-member-datalist" data-min-length='1' data-selection-required='1'>
                        <input type="text" class="form-control bg-dark text-white" id="input-audit-log-operation" placeholder="<?php echo mltr("operation"); ?>">
                        <button class="btn btn-outline-secondary" type="button" id="button-audit-log-staff-search" style="min-width:0" onclick="LoadAuditLog(noplaceholder=true);"><i class="fa-solid fa-magnifying-glass"></i></button>
                    </div>
                </div>
                <div id="table_audit_log">
                    <table class="w-100">
                        <thead id="table_audit_log_head">
                            <tr>
                                <th scope="col" style="min-width:180px"><?php echo mltr("user"); ?></th>
                                <th scope="col" style="width:180px"><?php echo mltr("time"); ?></th>
                                <th scope="col"><?php echo mltr("operation"); ?></th>
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
                <h5 style="display:inline-block"><strong><span clas="rect-20"><i class="fa-solid fa-screwdriver-wrench"></i></span> <?php echo mltr("configuration"); ?></strong></h5>
                <ul class="nav nav-tabs" role="tablist" style="float:right">
                    <!-- <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white active" id="config-api-tab" data-bs-toggle="tab" data-bs-target="#config-api" type="button" role="tab" aria-controls="config-api" aria-selected="true"><?php echo mltr("api"); ?></button>
                    </li> -->
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white active" id="config-api-json-tab" data-bs-toggle="tab" data-bs-target="#config-api-json" type="button" role="tab" aria-controls="config-api-json" aria-selected="true"><?php echo mltr("api_json"); ?></button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white" id="config-web-tab" data-bs-toggle="tab" data-bs-target="#config-web" type="button" role="tab" aria-controls="config-web" aria-selected="false"><?php echo mltr("web"); ?></button>
                    </li>
                </ul>
                <div class="tab-content mt-3" id="config-subtab">
                    <!-- <div class="tab-pane fade show active" id="config-api" role="tabpanel" aria-labelledby="config-api-tab" tabindex="0">
                        <?php echo mltr("api_note"); ?>
                        <br>
                        <label class="form-label"><?php echo mltr("company_info"); ?></label>
                        <div class="row">
                            <div class="col-6">
                                <label for="api-name" class="form-label"><?php echo mltr("name"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-name">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-distance-unit" class="form-label"><?php echo mltr("distance_unit"); ?></label>
                                <div class="input-group mb-3">
                                    <select class="form-select bg-dark text-white" id="api-distance-unit">
                                        <option value="metric" id="api-distance-unit-metric"><?php echo mltr("metric"); ?></option>
                                        <option value="imperial" id="api-distance-unit-imperial"><?php echo mltr("imperial"); ?></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-hex-color" class="form-label"><?php echo mltr("hex_color"); ?> <button id="api-hex-color-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("hex_color_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-hex-color">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <label for="api-logo-link" class="form-label"><?php echo mltr("logo_link"); ?> <button id="api-logo-link-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("logo_link_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-logo-link">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-require-truckersmp" class="form-label"><?php echo mltr("require_truckersmp_account"); ?> <button id="api-require-truckersmp-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("require_truckersmp_account_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <select class="form-select bg-dark text-white" id="api-require-truckersmp">
                                        <option value="true" id="api-require-truckersmp-enable"><?php echo mltr("enable"); ?></option>
                                        <option value="false" id="api-require-truckersmp-disable"><?php echo mltr("disable"); ?></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-privacy" class="form-label"><?php echo mltr("privacy"); ?> <button id="api-privacy-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("privacy_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <select class="form-select bg-dark text-white" id="api-privacy">
                                        <option value="true" id="api-privacy-enable"><?php echo mltr("enable"); ?></option>
                                        <option value="false" id="api-privacy-disable"><?php echo mltr("disable"); ?></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <br>
                        <label class="form-label"><?php echo mltr("discord_integration"); ?> (<a href="https://wiki.charlws.com/books/chub/page/discord-application" target="_blank"><?php echo mltr("wiki"); ?></a>)</label>
                        <div class="row">
                            <div class="col-9">
                                <label for="api-guild-id" class="form-label"><?php echo mltr("server_id"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-guild-id">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-in-guild-check" class="form-label"><?php echo mltr("in_guild_check"); ?> <button id="api-in-guild-check-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("in_guild_check_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <select class="form-select bg-dark text-white" id="api-in-guild-check">
                                        <option value="true" id="api-in-guild-check-enable"><?php echo mltr("enable"); ?></option>
                                        <option value="false" id="api-in-guild-check-disable"><?php echo mltr("disable"); ?></option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <label for="api-discord-client-id" class="form-label"><?php echo mltr("client_id"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-discord-client-id">
                                </div>
                            </div>
                            <div class="col-6">
                                <label for="api-discord-client-secret" class="form-label"><?php echo mltr("client_secret"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-discord-client-secret">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6">
                                <label for="api-discord-callback-url" class="form-label"><?php echo mltr("callback_url"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-discord-callback-url">
                                </div>
                            </div>
                            <div class="col-6">
                                <label for="api-discord-oauth2-url" class="form-label"><?php echo mltr("oauth2_url"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-discord-oauth2-url">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <label for="api-discord-bot-token" class="form-label"><?php echo mltr("bot_token"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-discord-bot-token">
                                </div>
                            </div>
                        </div>
                        <br>
                        <label class="form-label"><?php echo mltr("navio_integration"); ?> (<a href="https://wiki.charlws.com/books/chub/page/navio-integration" target="_blank"><?php echo mltr("wiki"); ?></a>)</label>
                        <div class="row">
                            <div class="col-6">
                                <label for="api-navio-api-token" class="form-label"><?php echo mltr("api_token"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-navio-api-token" placeholder="<?php echo mltr("leave_empty_to_keep_unchanged"); ?>">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-navio-company-id" class="form-label"><?php echo mltr("company_id"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-navio-company-id">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="api-delivery-log-channel-id" class="form-label"><?php echo mltr("delivery_log_channel_id"); ?> <button id="api-delivery-log-channel-id-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("delivery_log_channel_id_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="api-delivery-log-channel-id">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-3">
                                <label for="api-delivery-post-gifs" class="form-label"><?php echo mltr("delivery_post_gifs"); ?> <button id="api-delivery-post-gifs-tooltip" type="button" class="btn p-0 info-tooltip-btn" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="<?php echo mltr("delivery_post_gifs_note"); ?>"><i class="fa-solid fa-circle-info"></i></button></label>
                            </div>
                        </div>
                    </div> -->
                    <div class="tab-pane fade show active" id="config-api-json" role="tabpanel" aria-labelledby="config-api-json-tab" tabindex="0">
                        <?php echo mltr("api_json_note"); ?>
                        <br>
                        <label for="json-config" class="form-label"><?php echo mltr("json_config"); ?></label>
                        <div class="input-group mb-3" style="height:500px">
                            <textarea type="text" class="form-control bg-dark text-white" id="json-config" placeholder="{...}"></textarea>
                        </div>
                        <div class="row justify-content-end" id="config-api-control">
                            <button id="button-active-tracksim" type="button" class="btn btn-danger col-2 mx-2" onclick="ActivateTrackSim();"><?php echo mltr("activate_tracksim"); ?></button>
                            <button id="button-revert-config" type="button" class="btn btn-secondary col-1 mx-2" onclick="RevertConfig();"><?php echo mltr("revert"); ?></button>
                            <button id="button-reset-config" type="button" class="btn btn-secondary col-1 mx-2" onclick="ResetConfig();"><?php echo mltr("reset"); ?></button>
                            <button id="button-save-config" type="button" class="btn btn-primary col-1 mx-2" onclick="UpdateConfig();"><?php echo mltr("save"); ?></button>
                            <button id="button-reload-api-show" type="button" class="btn btn-danger col-1 mx-2" onclick="ReloadAPIShow();"><?php echo mltr("reload"); ?></button>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="config-web" role="tabpanel" aria-labelledby="config-web-tab" tabindex="0">
                        <div class="row">
                            <div class="col-6">
                                <label for="web-name" class="form-label"><?php echo mltr("name"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-name">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="web-distance-unit" class="form-label"><?php echo mltr("distance_unit"); ?></label>
                                <div class="input-group mb-3">
                                    <select class="form-select bg-dark text-white" id="web-distance-unit">
                                        <option value="metric" id="web-distance-unit-metric"><?php echo mltr("metric"); ?></option>
                                        <option value="imperial" id="web-distance-unit-imperial"><?php echo mltr("imperial"); ?></option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="web-navio-company-id" class="form-label"><?php echo mltr("navio_company_id"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-navio-company-id">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-9">
                                <label for="web-slogan" class="form-label"><?php echo mltr("slogan"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-slogan">
                                </div>
                            </div>
                            <div class="col-3">
                                <label for="web-color" class="form-label"><?php echo mltr("color"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-color">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                <label for="web-logo-download-link" class="form-label"><?php echo mltr("logo_download_link"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-logo-download-link" placeholder="https://...">
                                </div>
                            </div>
                            <div class="col">
                                <label for="web-banner-download-link" class="form-label"><?php echo mltr("banner_download_link"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="web-banner-download-link" placeholder="https://...">
                                </div>
                            </div>
                        </div>
                        <label for="web-custom-application" class="form-label"><?php echo mltr("custom_application_(.html)"); ?></label>
                        <div class="input-group mb-3">
                            <input type="file" class="form-control bg-dark text-white" id="web-custom-application">
                            <button class="btn btn-outline-secondary" type="button" onclick="custom_application='';$('#web-custom-application').val('');"><?php echo mltr("clear"); ?></button>
                            <button class="btn btn-outline-secondary" type="button" id="button-reset-custom-application" onclick="ResetCustomApplication();"><?php echo mltr("reset"); ?></button>
                            <button class="btn btn-outline-secondary" type="button" onclick="FileURLOutput('default_application.html','/default_application.html');"><?php echo mltr("download_default"); ?></button>
                            <button class="btn btn-outline-secondary" type="button" onclick="FileURLOutput('application.html','https://cdn.chub.page/assets/<?php echo $config['abbr']; ?>/application.html');"><?php echo mltr("download_current"); ?></button>
                        </div>
                        <label for="web-custom-style" class="form-label"><?php echo mltr("custom_style_(.css)"); ?></label>
                        <div class="input-group mb-3">
                            <input type="file" class="form-control bg-dark text-white" id="web-custom-style">
                            <button class="btn btn-outline-secondary" type="button" onclick="custom_style='';$('#web-custom-style').val('');"><?php echo mltr("clear"); ?></button>
                            <button class="btn btn-outline-secondary" type="button" onclick="FileURLOutput('style.css','https://cdn.chub.page/assets/<?php echo $config['abbr']; ?>/style.css');"><?php echo mltr("download_current"); ?></button>
                        </div>
                        <div class="row justify-content-end">
                            <button id="button-save-web-config" type="button" class="btn btn-primary col-1 mx-2" onclick="UpdateWebConfig();"><?php echo mltr("save"); ?></button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section id="user-settings-tab" class="tabs">
            <div class="shadow p-3 m-3 bg-dark rounded col">
                <h5 style="display:inline-block"><strong><span clas="rect-20"><i class="fa-solid fa-gear"></i></span> <?php echo mltr("settings"); ?></strong></h5>
                <ul class="nav nav-tabs" role="tablist" style="float:right">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white active" id="settings-general-tab" data-bs-toggle="tab" data-bs-target="#settings-general" type="button" role="tab" aria-controls="settings-general" aria-selected="true"><?php echo mltr("general"); ?></button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white" id="settings-security-tab" data-bs-toggle="tab" data-bs-target="#settings-security" type="button" role="tab" aria-controls="settings-security" aria-selected="false"><?php echo mltr("security"); ?></button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link bg-dark text-white" id="settings-sessions-tab" data-bs-toggle="tab" data-bs-target="#settings-sessions" type="button" role="tab" aria-controls="settings-sessions" aria-selected="false"><?php echo mltr("sessions"); ?></button>
                    </li>
                </ul>
                <div class="tab-content mt-3" id="settings-subtab">
                    <div class="tab-pane fade show active" id="settings-general" role="tabpanel" aria-labelledby="settings-general-tab" tabindex="0">
                        <div class="row">
                            <div class="col-6">
                                <label for="settings-distance-unit" class="form-label" style="width:100%"><?php echo mltr("distance_unit"); ?></label>
                                <div class="btn-group mb-3" id="settings-distance-unit-group">
                                    <a id="settings-distance-unit-metric" onclick='localStorage.setItem("distance-unit","metric");window.location.reload();' style="cursor:pointer" class="btn btn-primary active" aria-current="page"><?php echo mltr("metric"); ?></a>
                                    <a id="settings-distance-unit-imperial" onclick='localStorage.setItem("distance-unit","imperial");window.location.reload();' style="cursor:pointer" class="btn btn-primary"><?php echo mltr("imperial"); ?></a>
                                </div>
                            </div>
                            <div class="col-6">
                                <label for="settings-distance-unit" class="form-label" style="width:100%">Theme</label>
                                <div class="btn-group mb-3" id="settings-theme">
                                    <a id="settings-theme-dark" onclick='ToggleDarkMode("dark");' style="cursor:pointer" class="btn btn-primary active disabled" aria-current="page"><?php echo mltr("dark"); ?></a>
                                    <a id="settings-theme-light" onclick='ToggleDarkMode("light");' style="cursor:pointer" class="btn btn-primary disabled"><?php echo mltr("light"); ?></a>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <label class="form-label" style="width:100%"><?php echo mltr("notifications"); ?></label>
                        <div class="row px-3">
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-drivershub" disabled>
                                <label class="form-check-label" for="notifications-drivershub">
                                    <?php echo mltr("drivers_hub"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-discord" disabled>
                                <label class="form-check-label" for="notifications-discord">
                                    <?php echo mltr("discord"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-login" disabled>
                                <label class="form-check-label" for="notifications-login">
                                    <?php echo mltr("login"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-dlog" disabled>
                                <label class="form-check-label" for="notifications-dlog">
                                    <?php echo mltr("delivery_log"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-member" disabled>
                                <label class="form-check-label" for="notifications-member">
                                    <?php echo mltr("member"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-application" disabled>
                                <label class="form-check-label" for="notifications-application">
                                    <?php echo mltr("application"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-challenge" disabled>
                                <label class="form-check-label" for="notifications-challenge">
                                    <?php echo mltr("challenge"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-division" disabled>
                                <label class="form-check-label" for="notifications-division">
                                    <?php echo mltr("division"); ?>
                                </label>
                            </div>
                            <div class="form-check mb-2 col" style="display:inline-block">
                                <input class="form-check-input settings-notification" type="checkbox" value="" id="notifications-event" disabled>
                                <label class="form-check-label" for="notifications-event">
                                    <?php echo mltr("event"); ?>
                                </label>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col">
                                <label class="form-label" style="width:100%"><?php echo mltr("language"); ?></label>
                                <div class="mb-3 mx-3">
                                    <select class="form-select bg-dark text-white" id="api-language">
                                        <?php echo mltr("loading"); ?>
                                    </select>
                                </div>
                            </div>
                            <div class="col">
                                <label class="form-label" style="width:100%"><?php echo mltr("clear_cache"); ?></label>
                                <button id="button-settings-clear-cache" type="button" class="btn btn-primary" onclick="ClearCache();"><?php echo mltr("clear"); ?></button>
                            </div>
                        </div>
                        <hr>
                        <label class="form-label" style="width:100%"><?php echo mltr("account_connections"); ?></label>
                        <div class="row">
                            <div class="col-6">
                                <label for="settings-user-truckersmpid" class="form-label"><?php echo mltr("truckersmp"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark text-white" id="settings-user-truckersmpid" placeholder="/">
                                </div>
                                <button id="button-settings-update-truckersmpid" type="button" class="btn btn-primary" style="float:right" onclick="UpdateTruckersMPID();"><?php echo mltr("update"); ?></button>
                            </div>
                            <div class="col-6">
                                <label for="settings-user-steamid" class="form-label"><?php echo mltr("steam"); ?></label>
                                <div class="input-group mb-3">
                                    <input type="text" class="form-control bg-dark disabled" id="settings-user-steamid" placeholder="/" disabled style="color:#aaa">
                                </div>
                                <button id="button-settings-update-steamid" type="button" class="btn btn-primary" style="float:right" onclick="UpdateSteamID();"><?php echo mltr("update"); ?></button>
                            </div>
                        </div>
                        <hr>
                        <label for="settings-bio" class="form-label"><?php echo mltr("about_me"); ?></label>
                        <textarea type="text" class="form-control bg-dark text-white" id="settings-bio" placeholder="<?php echo mltr("about_me"); ?>" style="height:100%"></textarea>
                        <button id="button-settings-bio-save" type="button" class="btn btn-primary mt-2 w-100" onclick="UpdateBio();"><?php echo mltr("save"); ?></button>
                    </div>
                    <div class="tab-pane fade" id="settings-security" role="tabpanel" aria-labelledby="settings-security-tab" tabindex="0">
                        <label for="settings-password" class="form-label"><?php echo mltr("password_login"); ?></label>
                        <p><?php echo mltr("password_login_note"); ?></p>
                        <div class="input-group mb-3" style="width:200px">
                            <input type="password" class="form-control bg-dark text-white" id="settings-password" placeholder="<?php echo mltr("new_password"); ?>">
                        </div>
                        <div style="display:block">
                            <button id="button-settings-password-disable" type="button" class="btn btn-danger" style="display:inline-block" onclick="DisablePassword(firstop=true);"><?php echo mltr("disable"); ?></button>
                            <button id="button-settings-password-update" type="button" class="btn btn-primary" style="display:inline-block" onclick="UpdatePassword(firstop=true);"><?php echo mltr("update"); ?></button>
                        </div>
                        <hr>
                        <label for="settings-application-token" class="form-label"><?php echo mltr("application_token"); ?></label>
                        <p><?php echo mltr("application_token_note_1"); ?></p>
                        <p id="settings-application-token-p" style="font-size:15px"><?php echo mltr("application_token_note_2"); ?></p>
                        <p id="settings-application-token" style="display:none"></p>
                        <div style="display:block">
                            <button id="button-application-token-copy" type="button" class="btn btn-secondary" style="display:none;display:none" onclick="">Copy</button>
                            <button id="button-settings-disable-application-token" type="button" class="btn btn-danger" style="display:inline-block" onclick="DisableApplicationToken(firstop=true);"><?php echo mltr("disable"); ?></button>
                            <button id="button-settings-reset-application-token" type="button" class="btn btn-primary" style="display:inline-block" onclick="ResetApplicationToken(firstop=true);"><?php echo mltr("reset_token"); ?></button>
                        </div>
                        <hr>
                        <label for="settings-mfa" class="form-label"><?php echo mltr("multiple_factor_authentication"); ?></label>
                        <p><?php echo mltr("multiple_factor_authentication_note"); ?></p>
                        <button id="button-settings-mfa-disable" type="button" class="btn btn-danger" onclick="DisableMFAShow();" style="display:none"><?php echo mltr("disable"); ?></button>
                        <button id="button-settings-mfa-enable" type="button" class="btn btn-primary" onclick="EnableMFAShow();" style="display:none"><?php echo mltr("enable"); ?></button>
                        <div class="member-only">
                            <hr>
                            <label for="settings-mfa" class="form-label"><?php echo mltr("leave_company"); ?></label>
                            <p><?php echo mltr("leave_company_note"); ?></p>
                            <button id="button-settings-resign" type="button" class="btn btn-danger" onclick="UserResignShow();">Resign</button>
                        </div>
                        <hr>
                        <label for="settings-mfa" class="form-label"><?php echo mltr("delete_account"); ?></label>
                        <p><?php echo mltr("delete_account_note_1"); ?></p>
                        <p class="member-only"><?php echo mltr("delete_account_note_2"); ?></p>
                        <button id="button-settings-delete-account" type="button" class="btn btn-danger" onclick="DeleteAccountShow();"><?php echo mltr("delete"); ?></button>
                    </div>
                    <div class="tab-pane fade" id="settings-sessions" role="tabpanel" aria-labelledby="settings-sessions-tab" tabindex="0">
                        <div id="table_session">
                            <table class="w-100">
                                <thead id="table_session_head">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th></th>
                                        <th><?php echo mltr("ip"); ?></th>
                                        <th><?php echo mltr("country"); ?></th>
                                        <th><?php echo mltr("login_time"); ?></th>
                                        <th><?php echo mltr("last_used"); ?></th>
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
                <h5><strong><span class="rect-20"><i class="fa-solid fa-bell"></i></span> <?php echo mltr("notifications"); ?></strong></h5>
                <div id="table_notification_list">
                    <table class="w-100">
                        <thead id="table_notification_list_head">
                            <tr>
                                <th scope="col"><?php echo mltr("content"); ?></th>
                                <th scope="col" style="width:180px"><?php echo mltr("time"); ?></th>
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
                &copy 2023 <a href="https://charlws.com" target="_blank">CharlesWithC</a>&nbsp;&nbsp;
            </div>
            <div style="width:49.5%;text-align:right;display:inline-block">
                <a href="https://drivershub.charlws.com/" target="_blank">CHub</a>
                &nbsp;&nbsp;
                <a href="https://patreon.com/charlws" target="_blank">Patreon <span class="badge" style="background:#DAA520;color:black;">Get Golden Name</span></a>
                &nbsp;&nbsp;
                <a href="https://discord.gg/KRFsymnVKm" target="_blank"><?php echo mltr("discord"); ?></a>
                &nbsp;&nbsp;
                <a href="https://wiki.charlws.com/" target="_blank"><?php echo mltr("wiki"); ?></a>
            </div>
        </section>
    </div>
</body>

</html>