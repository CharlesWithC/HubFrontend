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
    <link rel="icon" href="/images/logo.png" type="image/x-icon" />
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

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <?php
        echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/2faa8440ba166c01.js"></script>';
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

<body>
    <div class="d-flex flex-column flex-shrink-0 p-3 text-bg-dark sidebar" style="position:fixed;width:260px;height:100vh;">
        <div style="height:60px">
            <a href="#" onclick="ShowTab('#overview-tab', '#button-overview-tab')">
                <img src="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/banner.png" alt="Banner" width="100%">
            </a>
        </div>
        <hr>
        <div id="sidebar" style="height:calc(100% - 150px);">
            <ul class="nav nav-pills flex-column mb-auto">
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Information</strong></li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#overview-tab', '#button-overview-tab')" class="nav-link active" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-chart-column"></i></span>
                            Overview
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#announcement-tab', '#button-announcement-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            Announcements
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#downloads-tab', '#button-downloads-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-download"></i></span>
                            Downloads
                        </a>
                    </li>
                </div>
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Game</strong></li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#map-tab', '#button-map-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-map"></i></span>
                            Live Map
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#delivery-tab', '#button-delivery-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-truck"></i></span>
                            Deliveries
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#division-tab', '#button-division-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#event-tab', '#button-event-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                </div>
                <div class="member-only-tab" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Drivers</strong></li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#member-tab', '#button-member-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#leaderboard-tab', '#button-leaderboard-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span>
                            Leaderboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#ranking-tab', '#button-ranking-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-angles-up"></i></span>
                            Rankings
                        </a>
                    </li>
                </div>
                <div class="sidebar-application" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Applications</strong></li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#my-application-tab', '#button-my-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            My Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#submit-application-tab', '#button-submit-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                            Submit Application
                        </a>
                    </li>
                </div>
                <div id="sidebar-staff" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Staff</strong></li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-announcement-tab', '#button-staff-announcement-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            Announcements
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-division-tab', '#button-staff-division-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-event-tab', '#button-staff-event-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-application-tab', '#button-staff-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-user-tab', '#button-staff-user-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                            Users
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#staff-member-tab', '#button-staff-member-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#audit-tab', '#button-audit-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-terminal"></i></span>
                            Audit Log
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#" onclick="ShowTab('#config-tab', '#button-config-tab')" class="nav-link text-white" aria-current="page">
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
            <a href="#" class="text-white text-decoration-none"
                data-bs-toggle="dropdown" aria-expanded="false" style="padding:10px 5px;border-radius:5px;width:160px">
                <img id="sidebar-avatar" src="https://cdn.discordapp.com/avatars/873178118213472286/a_cb5bf8235227e32543d0aa1b516d8cab.gif" alt="" class="rounded-circle me-2"
                    width="30" height="30">
                <span style="display:inline-block;position:relative;top:10px;line-height:14px;">
                    <strong id="sidebar-username" style="max-width:100px;width:100px;overflow:hidden;display:inline-block;">CharlesWithC</strong>
                    <br>
                    <span style="font-size:12px;color:#ccc;max-width:100px;width:100px;overflow:hidden;max-height:14px;display:inline-block;"><span id="sidebar-userid" style="color:#ccc;">#0</span> | <span id="sidebar-role" style="color:#ccc;">Dragon</span></span>
                </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark text-small shadow" style="padding-top:0">
                <img id="sidebar-banner" src="https://drivershub.charlws.com/atm/member/banner?userid=0" alt="User Banner" style="border-radius:5px 5px 0 0"
                        width="566px" height="100px">
                <div style="padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);margin-top:10px;">
                    <strong>About Me</strong>
                    <p style="margin-bottom:0" id="sidebar-bio">A dragon who writes code</span>
                </div>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#">Sign out</a></li>
            </ul>
            <a href="#" class="text-white text-decoration-none" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-truck"></i></a>
            <a href="#" class="text-white text-decoration-none" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-gear"></i></a>
        </div>
    </div>
</body>

</html>