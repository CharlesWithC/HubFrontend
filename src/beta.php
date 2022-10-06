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

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <?php
        echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/0ca9bae464f4d21c.js"></script>';
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

<body style="width:100vw;overflow-x:hidden">
    <div class="d-flex flex-column flex-shrink-0 p-3 text-bg-dark sidebar" style="position:fixed;top:0;left:0;width:260px;height:100vh;z-index:99;">
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
                        <a id="button-overview-tab" href="#" onclick="ShowTab('#overview-tab', '#button-overview-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-chart-column"></i></span>
                            Overview
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-announcement-tab" href="#" onclick="ShowTab('#announcement-tab', '#button-announcement-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            Announcements
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-downloads-tab" href="#" onclick="ShowTab('#downloads-tab', '#button-downloads-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-download"></i></span>
                            Downloads
                        </a>
                    </li>
                </div>
                <div style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Game</strong></li>
                    <li class="nav-item">
                        <a id="button-map-tab" href="#" onclick="ShowTab('#map-tab', '#button-map-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-map"></i></span>
                            Live Map
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-delivery-tab" href="#" onclick="ShowTab('#delivery-tab', '#button-delivery-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-truck"></i></span>
                            Deliveries
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-division-tab" href="#" onclick="ShowTab('#division-tab', '#button-division-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-event-tab" href="#" onclick="ShowTab('#event-tab', '#button-event-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                </div>
                <div class="member-only-tab" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Drivers</strong></li>
                    <li class="nav-item">
                        <a id="button-member-tab" href="#" onclick="ShowTab('#member-tab', '#button-member-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-leaderboard-tab" href="#" onclick="ShowTab('#leaderboard-tab', '#button-leaderboard-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span>
                            Leaderboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-ranking-tab" href="#" onclick="ShowTab('#ranking-tab', '#button-ranking-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-angles-up"></i></span>
                            Rankings
                        </a>
                    </li>
                </div>
                <div class="sidebar-application" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Applications</strong></li>
                    <li class="nav-item">
                        <a id="button-my-application-tab" href="#" onclick="ShowTab('#my-application-tab', '#button-my-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            My Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-submit-application-tab" href="#" onclick="ShowTab('#submit-application-tab', '#button-submit-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                            Submit Application
                        </a>
                    </li>
                </div>
                <div id="sidebar-staff" style="margin:5px 0;">
                    <li><strong style="color:darkgrey">Staff</strong></li>
                    <li class="nav-item">
                        <a id="button-staff-announcement-tab" href="#" onclick="ShowTab('#staff-announcement-tab', '#button-staff-announcement-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                            Announcements
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-division-tab" href="#" onclick="ShowTab('#staff-division-tab', '#button-staff-division-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                            Divisions
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-event-tab" href="#" onclick="ShowTab('#staff-event-tab', '#button-staff-event-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                            Events
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-application-tab" href="#" onclick="ShowTab('#staff-application-tab', '#button-staff-application-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                            Applications
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-user-tab" href="#" onclick="ShowTab('#staff-user-tab', '#button-staff-user-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                            Users
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-staff-member-tab" href="#" onclick="ShowTab('#staff-member-tab', '#button-staff-member-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                            Members
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-audit-tab" href="#" onclick="ShowTab('#audit-tab', '#button-audit-tab')" class="nav-link text-white" aria-current="page">
                            <span class="rect-20"><i class="fa-solid fa-terminal"></i></span>
                            Audit Log
                        </a>
                    </li>
                    <li class="nav-item">
                        <a id="button-config-tab" href="#" onclick="ShowTab('#config-tab', '#button-config-tab')" class="nav-link text-white" aria-current="page">
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
                    <strong id="sidebar-username" style="max-width:100px;width:100px;overflow:hidden;display:inline-block;"><span class="placeholder col-8"></span></strong>
                    <br>
                    <span style="font-size:12px;color:#ccc;max-width:100px;width:100px;overflow:hidden;max-height:14px;display:inline-block;"><span id="sidebar-userid" style="color:#ccc;"><span class="placeholder col-2"></span></span> | <span id="sidebar-role" style="color:#ccc;"><span class="placeholder col-6"></span></span></span>
                </span>
            </a>
            <ul class="dropdown-menu dropdown-menu-dark text-small shadow" style="padding-top:0">
                <img id="sidebar-banner" src="" alt="User Banner" style="border-radius:5px 5px 0 0"
                        width="566px" height="100px">
                <div style="padding:var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);margin-top:10px;">
                    <strong>About Me</strong>
                    <p style="margin-bottom:0" id="sidebar-bio"><span class="placeholder col-8"></span>&nbsp;&nbsp;<span class="placeholder col-2"></span><br><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></span>
                </div>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="Logout()">Sign out</a></li>
            </ul>
            <a href="#" class="text-white text-decoration-none" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-truck"></i></a>
            <a href="#" class="text-white text-decoration-none" style="padding:10px 5px;border-radius:5px;"><i class="fa-solid fa-gear"></i></a>
        </div>
    </div>
    <div style="position:fixed;left:260px;top:0;width:calc(100% - 260px);height:60px;box-shadow:0 1px 2px 0 #111;background-color:#2F3136;z-index:98;">
        <strong id="topbar-message" style="position:fixed;left:280px;top:20px;"><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span> 0 Driver Trucking</strong>
        <strong style="position:fixed;right:20px;top:20px;">Drivers Hub</strong>
    </div>
    <div class="container" style="margin:20px;margin-left:280px;margin-top:80px;width:calc(100% - 300px);">
        <section id="overview-tab" class="tabs">
            <div class="row">
                <div class="col-8">
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
                            <table class="table_online_driver">
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
                <div class="col-4">
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span> Leaderboard</strong></h5>
                        <table class="table_mini_leaderboard">
                            <thead id="table_mini_leaderboard_head">
                                <tr>
                                    <th scope="col" style="width:40px"></th>
                                    <th scope="col" style="width:60%">Driver</th>
                                    <th scope="col" style="width:40%">Points</th>
                                </tr>
                            </thead>
                            <tbody id="table_mini_leaderboard_data" style="line-height:50px">
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
                    <div class="shadow p-3 m-3 bg-dark rounded col">
                        <h5><strong><span class="rect-20"><i class="fa-solid fa-user-plus"></i></span> New Members</strong></h5>
                        <table class="table_new_driver">
                            <thead id="table_new_driver_head">
                                <tr>
                                    <th scope="col" style="width:40px"></th>
                                    <th scope="col" style="width:60%">Name</th>
                                    <th scope="col" style="width:40%">Date</th>
                                </tr>
                            </thead>
                            <tbody id="table_new_driver_data" style="line-height:50px">
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
        </section>
        <section id="announcement-tab" class="tabs">
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