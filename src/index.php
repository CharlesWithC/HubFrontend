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
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/index.css">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap">
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/tailwind.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ol3/4.5.0/ol-debug.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.css" />

    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/fontawesome.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/brands.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/regular.min.css" rel="stylesheet">
    <link href="https://drivershub-cdn.charlws.com/assets/fontawesome/css/solid.min.css" rel="stylesheet">

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.css"/>
    <script src="https://cdn.jsdelivr.net/npm/simplebar@latest/dist/simplebar.min.js"></script>

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/assets/flexdatalist/jquery.flexdatalist.min.css"/>
    <script src="https://drivershub-cdn.charlws.com/assets/flexdatalist/jquery.flexdatalist.min.js"></script>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <?php
        if(stristr($path, 'beta')){
            echo '<script id="bundle_beta" src="https://drivershub-cdn.charlws.com/js/bundles/beta.js"></script>';
        } else {
            echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/6b8537b1a252b226.js"></script>';
        }
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
        .bg-indigo-500 {background-color: <?php echo $vtccolor ?>;}
        .bg-indigo-500:hover {background-color: <?php echo $vtccolordark ?>;}
        .rect-20 {width:20px;height:20px;margin-right:6px;}
        .rect-32 {width:32px;height:32px;margin-right:5px;}
        .flexdatalist-alias {width:200px;display:inline-block;}
    </style>
    <?php 
    if(file_exists('/var/hub/cdn/assets/'.$vtcabbr.'/style.css')){
        echo "<style>".file_get_contents('/var/hub/cdn/assets/'.$vtcabbr.'/style.css')."</style>";
    }
    ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-7EDVTC3J2E"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-7EDVTC3J2E');
    </script>
</head>

<body class="antialiased bg-body text-body font-body" style="overflow-x:hidden">
    <style>
        .tabbtns {
            transition: background-color 300ms linear;
        }

        .fc-daygrid-block-event {
            border-radius: 5px;
            margin-bottom: 3px;
            border-color: solid blue 3px;
        }
    </style>
    <div>
        <nav class="lg:hidden py-6 px-6" style="background-color:#2F3136;z-index:10000;">
            <div class="flex items-center justify-between">
                <a class="text-2xl text-white font-semibold" style="cursor: pointer"><img
                        src="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/banner.png" alt=""
                        width="200"></a>
                <button class="navbar-burger flex items-center rounded focus:outline-none">
                    <svg class="text-white bg-indigo-500 hover:bg-indigo-600 block h-8 w-8 p-2 rounded"
                        viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                        <title>Mobile menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg></button>
            </div>
        </nav>
        <div class="hidden lg:block navbar-menu relative z-50">
            <nav 
                class="fixed top-0 left-0 bottom-0 flex flex-col w-3/4 lg:w-80 sm:max-w-xs pt-6 pb-8">
                <div id="navbar" style="height:100%">
                <div class="flex w-full items-center px-6 pb-6 mb-6 lg:border-b border-gray-700">
                    <a class="text-xl text-white font-semibold" style="cursor: pointer"
                        onclick="ShowTab('#HomeTab', '#HomeTabBtn')"><img
                            src="https://drivershub-cdn.charlws.com/assets/<?php echo $vtcabbr ?>/banner.png" alt=""
                            width="100%"></a>
                </div>
                <div class="px-4 pb-6">
                    <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium font-bold"><?php echo $vtcname ?></h3>
                    <ul class="text-sm font-medium">
                        <li>
                            <a id="HomeTabBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns bg-indigo-500"
                                style="cursor: pointer" onclick="ShowTab('#HomeTab', '#HomeTabBtn')">
                                <span class="rect-20"><i class="fa-solid fa-chart-column"></i></span>
                                <span><?php echo $st->overview; ?></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("announcement", $enabled_plugins)){
                            echo '
                            <li>
                            <a id="AnnTabBtn" class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#AnnTab\', \'#AnnTabBtn\')">
                                <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                                <span>'.$st->announcements.'</span>
                            </a>
                            </li>';}?>

                        <?php
                            if(in_array("downloads", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="DownloadsTabBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#DownloadsTab\', \'#DownloadsTabBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-download"></i></span>
                                <span>'.$st->downloads.'</span>
                            </a>
                        </li>';}?>
                    </ul>
                </div>

                <div class="px-4 pb-6">
                    <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium font-bold"><?php echo $st->game ?></h3>
                    <ul class="text-sm font-medium">

                        <?php
                            if(in_array("livemap", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="MapBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Map\', \'#MapBtn\')">
                                <span class="rect-20"><i class="fa-regular fa-map"></i></span>
                                <span>'.$st->map.'</span>
                            </a>
                        </li>';}?>

                        <li>
                            <a id="DeliveryBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Delivery', '#DeliveryBtn')">
                                <span class="rect-20"><i class="fa-solid fa-truck"></i></span>
                                <span><?php echo $st->deliveries ?></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("division", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="DivisionBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Division\', \'#DivisionBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                                <span>'.$st->divisions.'</span>
                            </a>
                        </li>';}?>

                        <?php
                            if(in_array("event", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="EventBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Event\', \'#EventBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                                <span>'.$st->events.'</span>
                            </a>
                        </li>';}?>
                    </ul>
                </div>

                <div class="px-4 pb-6 memberOnlyTabs" style="display:none">
                    <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium font-bold"><?php echo $st->drivers; ?>
                    </h3>
                    <ul class="text-sm font-medium">
                        <li>
                            <a id="AllMemberBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#AllMembers', '#AllMemberBtn')">
                                <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                                <span><?php echo $st->members; ?></span>
                            </a>
                        </li>

                        <li>
                            <a id="LeaderboardBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Leaderboard', '#LeaderboardBtn')">
                                <span class="rect-20"><i class="fa-solid fa-ranking-star"></i></span>
                                <span><?php echo $st->leaderboard; ?></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("ranking", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="RankingBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Ranking\', \'#RankingBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-angles-up"></i></span>
                                <span>'.$st->rankings.'</span>
                            </a>
                        </li>';}?>
                    </ul>
                </div>

                <?php
                            if(in_array("application", $enabled_plugins)){
                            echo '
                <div class="px-4 pb-6" id="recruitment">
                    <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium font-bold">'.$st->applications.'</h3>
                    <ul class="text-sm font-medium">
                        <li>
                            <a id="MyAppBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#MyApp\', \'#MyAppBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                                <span id="MyAppSpan">'.$st->my_applications.'</span>
                            </a>
                        </li>

                        </li>
                        <li>
                            <a id="SubmitAppBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#SubmitApp\', \'#SubmitAppBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-envelope-open-text"></i></span>
                                <span>'.$st->submit_application.'</span>
                            </a>
                    </ul>
                </div>';}?>
                <div class="px-4 pb-6" id="stafftabs" style="display:none">
                    <h3 class="mb-2 text-xs uppercase text-gray-500 font-medium font-bold"><?php echo $st->staff; ?>
                    </h3>
                    <ul class="mb-8 text-sm font-medium">
                        <?php
                            if(in_array("announcement", $enabled_plugins)){
                            echo '
                            <li>
                            <a id="StaffAnnTabBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#StaffAnnTab\', \'#StaffAnnTabBtn\')">
                                <span class="rect-20"><i class="fa-regular fa-newspaper"></i></span>
                                <span>'.$st->announcements.'</span>
                            </a>
                            </li>';}?>

                        <?php
                            if(in_array("event", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="StaffEventBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#StaffEvent\', \'#StaffEventBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-calendar-days"></i></span>
                                <span>'.$st->events.'</span>
                            </a>
                        </li>';}?>

                        <?php
                            if(in_array("division", $enabled_plugins)){
                            echo '
                            <li>
                            <a id="StaffDivisionBtn" class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#StaffDivision\', \'#StaffDivisionBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-warehouse"></i></span>
                                <span>'.$st->divisions.'</span>
                            </a>
                            </li>';}?>

                        <li>
                            <a id="StaffMemberBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#StaffMembers', '#StaffMemberBtn')">
                                <span class="rect-20"><i class="fa-solid fa-user-group"></i></span>
                                <span><?php echo $st->members; ?></span>
                            </a>
                        </li>

                        <li>
                            <a id="AllUserBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#AllUsers', '#AllUserBtn')">
                                <span class="rect-20"><i class="fa-solid fa-user-clock"></i></span>
                                <span><?php echo $st->users; ?></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("application", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="AllAppBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#AllApp\', \'#AllAppBtn\')">
                                <span class="rect-20"><i class="fa-solid fa-envelopes-bulk"></i></span>
                                <span>'.$st->applications.'</span>
                            </a>
                        </li>';}?>
                        <li>
                            <a id="AuditLogBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#AuditLog', '#AuditLogBtn')">
                                <span class="rect-20"><i class="fa-solid fa-terminal"></i></span>
                                <span><?php echo $st->audit_log ?></span>
                            </a>
                        </li>
                        <li>
                            <a id="AdminBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Admin', '#AdminBtn')">
                                <span class="rect-20"><i class="fa-solid fa-screwdriver-wrench"></i></span>
                                <span><?php echo $st->administrator ?></span>
                            </a>
                        </li>
                    </ul>
                </div>
                </div>
            </nav>
        </div>

        <div>
        <section class="py-5 px-6 bg-white shadow mx-auto lg:ml-80">
            <nav class="relative">
                <div class="flex items-center" id="header">
                    <div class="lg:block" style="margin-left:auto;margin-right:0">
                        <div class="flex">
                            <div style="margin-top:4px">
                                <button type="button" style="display:inline;padding:5px" id="metricbtn"
                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-500 rounded transition duration-200"
                                    onclick="localStorage.setItem('distance_unit', 'metric');window.location.reload();"><?php echo $st->metric; ?></button>
                                <button type="button" style="display:inline;padding:4px" id="imperialbtn"
                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-500 rounded transition duration-200"
                                    onclick="localStorage.setItem('distance_unit', 'imperial');window.location.reload();"><?php echo $st->imperial; ?></button>
                            </div>
                            &nbsp;
                            &nbsp;
                            <a id="darkmode" style="cursor:pointer;margin-top:11px" onclick="ToggleDarkMode()">
                                <span class="rect-32" id="darkmode-svg"><i class="fa-solid fa-moon"></i></span>
                            </a>
                            <a id="logout" style="cursor: pointer;margin-top:11px" onclick="Logout()">
                                <span class="rect-32"><i class="fa-solid fa-right-from-bracket"></i></span>
                            </a>
                            <button id="ProfileTabBtn" class="flex" onclick="ShowTab('#ProfileTab', '#ProfileTabBtn')">
                                <div class="mr-3">
                                    <p id="name" class="text-sm" style="text-align:right"></p>
                                    <p id="role" class="text-sm text-gray-500" style="text-align:right"></p>
                                </div>
                                <div class="mr-2"><img id="avatar"
                                        class="w-10 h-10 rounded-full object-cover object-right" width="40"
                                        src="https://cdn.discordapp.com/avatars/873178118213472286/a_cb5bf8235227e32543d0aa1b516d8cab.gif"
                                        alt="" /></div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </section>
        <div id="loading" class="lg:ml-80"></div>
    </div>
    
    <section id="ProfileTab" class="py-8 tabs mx-auto lg:ml-80" style="display:none;margin-top:-40px">
        <div class="px-4 mx-auto">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 py-8 px-6">
                <div class="md:w-2/3 px-4 mb-4 md:mb-0">
                    <div class="px-6 pt-4 bg-white shadow rounded">
                        <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6 shadow rounded mb-6">
                            <div class="py-8 px-6 pt-4"
                                style="padding-top:0;margin-right:20px;width: calc(100% - 220px);float:left"
                                id="userProfileDetail">
                            </div>
                            <div class="py-8 px-6 pt-4 mb-6" style="width:170px;padding:10px;float:right">
                                <img id="UserProfileAvatar"
                                    onerror="$(this).attr('src','/images/logo.png');"
                                    style="border-radius: 100%;width:150px;border:solid <?php echo $vtccolor ?> 5px;">
                            </div>
                            <a style="cursor:pointer"><img id="UserBanner" onerror="$(this).hide();"
                                    style="border-radius:10px;width:100%;margin-top:10px;margin-bottom:20px;"></a>
                        </div>
                    </div>
                    <br>
                    <div class="py-8 px-6 pt-4 bg-white shadow rounded">
                        <h2><b>Statistics</b>
                            <div style="margin-left:auto;width:fit-content">
                                <a id="aucs1" onclick='chartscale=1;LoadChart()' style='cursor:pointer'><span id="ucs1"
                                        class="ucs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span></a>
                                <a id="aucs2" onclick='chartscale=2;LoadChart()' style='cursor:pointer'><span id="ucs2"
                                        class="ucs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span></a>
                                <a id="aucs3" onclick='chartscale=3;LoadChart()' style='cursor:pointer'><span id="ucs3"
                                        class="ucs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">30d</span></a>
                                |
                                <a id="aaddup1" onclick='addup=1-addup;LoadChart()' style='cursor:pointer'><span
                                        id="uaddup1"
                                        class="ucs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->sum; ?></span></a>
                            </div>
                        </h2>
                        <div class="p-4 overflow-x-auto" style="display: block;">
                            <canvas id="userStatisticsChart" width="100%" height="300px"></canvas>
                        </div>
                    </div>
                    <br>
                    <div class="py-8 px-6 pt-4 bg-white shadow rounded">
                        <div class="flex px-6 pb-4 border-b">
                            <h3 class="text-xl font-bold" style="margin-top:8px"><?php echo $st->delivery_log; ?></h3>
                            <div style="margin-left:auto">
                                <a onclick='dets2=1-dets2;LoadUserDeliveryList();' style='cursor:pointer'><span
                                        class="dgame dgame1 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ETS2</span></a>
                                <a onclick='dats=1-dats;LoadUserDeliveryList();' style='cursor:pointer'><span
                                        class="dgame dgame2 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ATS</span></a>
                                <input id="udspeedlimit"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="number" name="" style="width:150px;display:inline" placeholder="Speed Limit">
                                <span class="distance_unit">km</span>/h

                                <input id="udstart"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="date" name="" style="width:150px;display:inline" placeholder="">
                                <p style="display:inline">~</p>
                                <input id="udend"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="date" name="" style="width:150px;display:inline" placeholder="">
                                <button type="button" style="display:inline"
                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                    onclick="LoadUserDeliveryList()"
                                    id="loadUserDeliveryBtn"><?php echo $st->go; ?></button>
                            </div>
                        </div>
                        <div class="p-4 overflow-x-auto" style="display: block;" id="table_deliverylog_user">
                            <table class="table-auto w-full">
                                <thead id="table_deliverylog_user_head">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th class="py-5 px-6 pb-3 font-medium" style="width:100px">ID</th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->from; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->to; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->driven_distance; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->cargo; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->new_profit; ?></th>
                                    </tr>
                                </thead>
                                <tbody id="table_deliverylog_user_data">
                                    <tr class="text-sm">
                                        <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                <br>
                <div class="py-8 px-6 pt-4 bg-white shadow rounded" id="userSessions" style="display:none">
                    <div class="flex px-6 pb-4 border-b">
                        <h2><b><?php echo $st->sessions; ?></b></h2>
                        &nbsp;&nbsp;&nbsp;
                        <button type="button" style="display:inline;padding:2px;font-size:12px" id="revokeAllBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="revokeAllToken()">Revoke All Sessions</button>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;" id="table_session">
                        <table class="table-auto w-full">
                            <thead id="table_session_head">
                                <tr class="text-xs text-gray-500 text-left">
                                    <th class="py-5 px-6 pb-3 font-medium">IP</th>
                                    <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->login_time; ?></th>
                                    <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->expire_time; ?></th>
                                </tr>
                            </thead>
                            <tbody id="table_session_data">
                                <tr class="text-sm">
                                    <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="w-full md:w-1/3 px-4 mb-4 md:mb-0">
                <div class="py-8 px-6 pt-4 bg-white shadow rounded" id="Account">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->account; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <p><span id="profileRoles"></span></p><br>
                        <p><b>ID</b>: <span id="account_id"></span></p>
                        <p class="email_private"><b><?php echo $st->email; ?></b>: <span id="account_email"></span></p>
                        <p><b><?php echo $st->discord_id; ?></b>: <span id="account_discordid"></span></p>
                        <p><b><?php echo $st->steam_id; ?></b>: <span id="account_steamid"></span> <a
                                class="account_private" href="/auth?steamupdate=1" style='cursor:pointer'>Update</a></p>
                        <p><b><?php echo $st->truckersmp_id; ?></b>: <span id="account_truckersmpid"></span> <a
                                class="account_private" href="/auth?truckersmpupdate=1"
                                style='cursor:pointer'>Update</a></p>
                    </div>
                </div>
                <br>
                <div class="py-8 px-6 pt-4 bg-white shadow rounded" id="Statistics">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->statistics; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <p id="user_statistics"></p>
                    </div>
                </div>
                <br>
                <div class="py-8 px-6 pt-4 bg-white shadow rounded" id="UpdateAM" style="display:none">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->update_about_me; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <div class="mb-6">
                            <textarea id="biocontent" style="height:300px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea>
                        </div>

                        <button type="button"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdateBio()" id="updateBioBtn"><?php echo $st->update; ?></button>
                    </div>
                </div>
                <br>
                <div class="py-8 px-6 pt-4 bg-white shadow rounded" id="Security" style="display:none">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->security; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <h3><?php echo $st->password_login ?></h3>
                        <?php echo $st->password_login_note ?>
                        <button type="button"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdatePassword()" id="resetPasswordBtn"><?php echo $st->update ?></button>
                    </div>
                    <br>
                    <hr>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <h3><?php echo $st->external_application_authorization; ?></h3>
                        <label class="block text-sm font-medium mb-2"
                            for=""><b><?php echo $st->application_token; ?></b>: <span id="userAppToken"></span></label>
                        <label class="block text-sm font-medium mb-2"
                            for=""><i><?php echo $st->application_token_note; ?></i></label>
                        <button type="button"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="RenewApplicationToken()" id="genAppTokenBtn"><?php echo $st->reset_token; ?></button>
                        <button type="button"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="DisableApplicationToken()" id="disableAppTokenBtn">Disable</button>
                    </div>
                    <br>
                    <hr>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <h3><?php echo $st->leave_company; ?></h3>
                        <label class="block text-sm font-medium mb-2" for=""
                            style="color:red"><?php echo $st->resign_note; ?></label>
                        <button type="button"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UserResign()" id="resignBtn"><?php echo $st->resign; ?></button>
                    </div>
                </div>
            </div>
        </div>
        </div>
        </div>
    </section>

    <section id="HomeTab" class="py-8 tabs mx-auto lg:ml-80" style="display:none">
        <div class="px-4 mx-auto">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 py-8 px-6">
                <div class="md:w-2/3 px-4 mb-4 md:mb-0" id="hometableftcontainer">
                    <!-- <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6" id="HomeTabLeft">
                    </div> -->
                    <div id="statsTimeRange" style="width:100%;display:none">
                        <div style="margin-left:20px;margin-bottom:-10px">
                            <input id="stats_start"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                type="date" name="" style="width:150px;display:inline" placeholder="">
                            <p style="display:inline">~</p>
                            <input id="stats_end"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                type="date" name="" style="width:150px;display:inline" placeholder="">
                            <button type="button" style="display:inline"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="refreshStats()" id="refreshStatsBtn">Go</button>
                        </div>
                    </div>
                    <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6" style="width:100%;">
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-truck-fast"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->live; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->now; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="livedriver">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-regular fa-clock"></i></span><span><span id="livedriverdt"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-id-card"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->drivers; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alldriver">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span><span id="newdriver"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alljob">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span><span id="newjob"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-road"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->distance; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alldistance">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span><span id="newdistance"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="allprofit">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span><span id="newprofit"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard mb-6">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-gas-pump"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->fuel; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="allfuel">-</h2>
                                <span class="text-xs text-green-500"><span class="rect-20"><i class="fa-solid fa-arrow-trend-up"></i></span><span><span id="newfuel"></span></span></span>
                            </div>
                        </div>
                    </div>
                    <div class="py-8 px-6 pt-4 bg-white shadow rounded mb-6">
                        <h2><b><?php echo $st->statistics; ?></b>
                            <div style="margin-left:auto;width:fit-content">
                                <a onclick='chartscale=1;LoadChart()' style='cursor:pointer'><span id="cs1"
                                        class="cs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span></a>
                                <a onclick='chartscale=2;LoadChart()' style='cursor:pointer'><span id="cs2"
                                        class="cs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span></a>
                                <a onclick='chartscale=3;LoadChart()' style='cursor:pointer'><span id="cs3"
                                        class="cs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">30d</span></a>
                                |
                                <a onclick='addup=1-addup;LoadChart()' style='cursor:pointer'><span id="addup1"
                                        class="cs inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->sum; ?></span></a>
                            </div>
                        </h2>
                        <div class="p-4 overflow-x-auto" style="display: block;">
                            <canvas id="statisticsChart" width="100%" height="300px"></canvas>
                        </div>
                    </div>
                    <div class="py-8 px-6 pt-4 bg-white shadow rounded mb-6">
                        <h2><b>Online Drivers</b></h2>
                        <div class="p-4 overflow-x-auto" style="display: block;" id="table_online_driver">
                            <table class="table-auto w-full" style="margin-top:20px">
                                <thead id="table_online_driver_head" style="display:none">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->truck; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->cargo; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->speed; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->destination; ?></th>
                                    </tr>
                                </thead>
                                <tbody id="table_online_driver_data">
                                    <tr class="text-sm">
                                        <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="w-full md:w-1/3 px-4 mb-4 md:mb-0" id="HomeTabRight">
                    <div class="py-8 px-6 pt-4 bg-white shadow rounded mb-6">
                        <h2><b>Leaderboard</b></h2>
                        <div class="p-4 overflow-x-auto" style="display: block;" id="table_mini_leaderboard">
                            <table class="table-auto w-full" style="margin-top:20px">
                                <thead id="table_mini_leaderboard_head">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->points; ?></th>
                                    </tr>
                                </thead>
                                <tbody id="table_mini_leaderboard_data">
                                    <tr class="text-sm">
                                        <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="py-8 px-6 pt-4 bg-white shadow rounded  mb-6">
                        <canvas id="deliveryStatsChart" width="100%" height="100%"></canvas>
                    </div>

                    <div class="py-8 px-6 pt-4 bg-white shadow rounded  mb-6">
                        <h2><b><?php echo $st->new_members; ?></b></h2>
                        <div class="p-4 overflow-x-auto" style="display: block;" id="table_new_driver">
                            <table class="table-auto w-full" style="margin-top:20px">
                                <thead id="table_new_driver_head">
                                    <tr class="text-xs text-gray-500 text-left">
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name; ?></th>
                                        <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->join_date; ?></th>
                                    </tr>
                                </thead>
                                <tbody id="table_new_driver_data">
                                    <tr class="text-sm">
                                        <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <?php
        if(in_array("livemap", $enabled_plugins)){
        echo '
    <section id="Map" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4">
                <h2 style="position:relative;display:inline;top:30px;left:10px;z-index:1000;color:white">Euro Truck
                    Simulator 2
                </h2>
                <div id="map"
                    style="height: 80vh;width: 100%;margin:auto;display:block;background-color: #484E66;border-radius:15px">
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4">
                <h2 style="position:relative;display:inline;top:30px;left:10px;z-index:1000;color:white">ProMods Europe
                </h2>
                <div id="pmap"
                    style="height: 80vh;width: 100%;margin:auto;display:block;background-color: #484E66;border-radius:15px">
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4">
                <h2 style="position:relative;display:inline;top:30px;left:10px;z-index:1000;color:white">American Truck
                    Simulator</h2>
                <div id="amap"
                    style="height: 80vh;width: 100%;margin:auto;display:block;background-color: #484E66;border-radius:15px">
                </div>
            </div>
        </div>
    </section>';}?>


    <?php
        if(in_array("announcement", $enabled_plugins)){
        echo '
    <section id="AnnTab" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4">
                <div id="anns">

                </div>
            </div>
        </div>
    </section>';}?>

    <?php
        if(in_array("downloads", $enabled_plugins)){
        echo '
    <section id="DownloadsTab" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">'.$st->downloads.'</h3>
                    <a style="cursor:pointer;display:none;" onclick="toggleUpdateDownloads()" class="admin-only">
                        <span style="position:relative;top:3px;left:3px"><i class="fa-solid fa-pen-to-square"></i></span></a>
                </div>
                <div class="container px-4">
                    <div style="margin:20px" id="downloads">
                    </div>
                    <div style="margin:20px;height:65vh;display:none" id="downloadsedit">
                        <label class="block text-sm font-medium mb-2" for="">'.$st->markdown_auto_update.':</label>

                        <textarea id="downloadscontent" style="width:100%;height:60vh"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></textarea>
                        <button type="button" id="saveDownloadsBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdateDownloads()"><?php echo $st->update; ?></button>
                    </div>
                </div>
            </div>
        </div>
    </section>';}?>

    <?php
  if(in_array("announcement", $enabled_plugins)){
    echo '
  <section id="StaffAnnTab" class="py-8 tabs" style="display:none">
    <div style="padding:50px;padding-top:0;">
      <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded" id="newann">
        <div class="flex px-6 pb-4 border-b">
          <h3 class="text-xl font-bold">'.$st->manage_announcements.'</h3>
        </div>
        <div class="container px-4">
          <div style="margin:20px">
            '.$st->manage_announcements_note.'
            <br>
            <div class="mb-6">
              <label class="block text-sm font-medium mb-2" for="">'.$st->announcement_id.'</label>
              <input id="annid" class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                type="text" name="" style="width:200px;display:inline" placeholder="For updating / deleting">
              <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="FetchAnnouncement()" id="fetchAnnouncementBtn">'.$st->fetch_data.'</button>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium mb-2" for="">'.$st->title.'</label>
              <input id="anntitle"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" type="text"
                name="" placeholder=""></div>

            <div class="mb-6">
              <label class="block text-sm font-medium mb-2" for="">'.$st->content.'</label>
              <textarea id="anncontent"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                name="field-name" rows="5" placeholder=""></textarea></div>

            <div class="relative" style="width:200px">
              <label class="block text-sm font-medium mb-2 text-left" for="">'.$st->announcement_type.':</label>
              <select id="annselect"
                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                name="field-name">
                <option value="0">'.$st->information.'</option>
                <option value="1">'.$st->event.'</option>
                <option value="2">'.$st->warning.'</option>
                <option value="3">'.$st->critical.'</option>
                <option value="4">'.$st->resolved.'</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                </svg>
              </div>
            </div>

            <div class="mb-6">
              <div class="mb-1">
                <label class="block text-sm font-medium mb-2" for="" style="text-align: left;">Visibility:</label>
                <label>
                  <input type="radio" name="announcement-visibility" value="yes" checked id="annpvt-0">
                  <span class="annpvt-0">'.$st->public.'</span>
                </label>
              </div>
              <div>
                <label>
                  <input type="radio" name="announcement-visibility" value="yes" id="annpvt-1">
                  <span class="annpvt-1">'.$st->private.'</span>
                </label>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium mb-2" for="">'.$st->discord_channel_id.'</label>
              <input id="annchan"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" type="text"
                name="" placeholder="Leave empty if you don\'t want this announcement to be forwarded to Discord">
            </div>

            <div class="mb-6">
              <label class="block text-sm font-medium mb-2" for="">'.$st->discord_message_content.'</label>
              <input id="annmsg"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" type="text"
                name="" placeholder="Leave empty if you don\'t want this announcement to be forwarded to Discord">
            </div>

            <button type="button"
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="AnnouncementOp()" id="newAnnBtn">'.$st->create_announcement.'</button>
          </div>
        </div>
      </div>
    </div>
  </section>';
  }
  ?>

    <section id="AllMembers" class="py-8 tabs" style="display:none">
        <div class="px-4 mx-auto mx-auto lg:ml-80" id="x_of_the_month" style="display:none">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 pb-6 px-6">
                <div class="px-4 mb-4 md:mb-0" style="width:100%">
                    <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6">
                        <div class="md:w-1/2 lg:w-1/4 p-4" style="width:50%;padding-top:0" id="sotmdiv">
                            <div class="p-6 rounded bg-white" style="text-align:center">
                                <h2 class="mb-2 text-3xl font-bold" id="sotm" style="font-size:22px">-</h2>
                                <div class="mb-2">
                                    <h3 class="text-sm text-gray-600"><?php echo $st->staff_of_the_month;?></h3>
                                </div>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4" style="width:50%;padding-top:0" id="dotmdiv">
                            <div class="p-6 rounded bg-white" style="text-align:center">
                                <h2 class="mb-2 text-3xl font-bold" id="dotm" style="font-size:22px;">-</h2>
                                <div class="mb-2">
                                    <h3 class="text-sm text-gray-600"><?php echo $st->driver_of_the_month;?></h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px"><?php echo $st->members; ?></h3>
                    <div style="margin-left:auto">
                        <input id="searchname"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="text" name="" style="width:200px;display:inline" placeholder="Search By Name">
                        <button type="button" style="display:inline"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="LoadMemberList()" id="loadMemberListBtn"><?php echo $st->go; ?></button>
                    </div>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_member_list">
                    <table class="table-auto w-full">
                        <thead id="table_member_list_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium">ID</th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->highest_role; ?></th>
                            </tr>
                        </thead>
                        <tbody id="table_member_list_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <section id="StaffMembers" class="py-8 tabs" style="display:none">
        <div class="lg:ml-80 px-4 mx-auto flex flex-wrap -mx-4 -mb-4 md:mb-0 py-8 px-6">
            <div class="px-4 mb-4 md:mb-0" style="width:49.5%;display:inline-block">
                <div class="py-8 px-6 pt-4 bg-white shadow rounded">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->assign_roles; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;padding:20px">
                        <div class="mb-6">
                            <?php echo $st->assign_roles_note; ?>
                            <br>
                            <label class="block text-sm font-medium mb-2" for=""><?php echo $st->member; ?></label>
                            <input id="memberroleid" style="width:200px;display:inline" placeholder='Select one from list'
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded search-name" list="all_member_datalist" 
                                name="field-name" rows="5" placeholder=""></input>
                            <button type="button" id="fetchRolesBtn"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="GetMemberRoles()"><?php echo $st->fetch_existing_roles; ?></button>
                        </div>
                        <div class="mb-6" id="rolelist">

                        </div>

                        <button type="button" id="updateMemberRolesBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdateMemberRoles()"><?php echo $st->update; ?></button>
                    </div>
                </div>
            </div>
            <div class="px-4 mb-4 md:mb-0" style="width:49.5%;display:inline-block">
                <div class="py-8 px-6 pt-4 bg-white shadow rounded">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->update_member_points; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for=""
                                style="display:inline"><?php echo $st->member; ?></label>
                            <input id="memberpntid" style="width:200px;display:inline" placeholder='Select one from list'
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded search-name" list="all_member_datalist"
                                name="field-name" rows="5" placeholder=""></input>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for=""
                                style="display:inline"><?php echo $st->distance; ?>
                                (km)</label>
                            <input id="memberpntdistance" style="width:200px;display:inline"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></input>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for=""
                                style="display:inline"><?php echo $st->myth_points; ?></label>
                            <input id="memberpntmyth" style="width:200px;display:inline"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></input>
                        </div>

                        <button type="button" id="updateMemberPointsBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdateMemberPoints()"><?php echo $st->update; ?></button>
                    </div>
                </div>
                <br>
                <div class="py-8 px-6 pt-4 bg-white shadow rounded">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold"><?php echo $st->dismiss; ?></h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <div class="mb-6">
                            <p style="color:red"><?php echo $st->dismiss_note; ?></p>
                            <br>
                            <label class="block text-sm font-medium mb-2" for=""
                                style="display:inline"><?php echo $st->member; ?></label>
                            <input id="dismissUserID" style="width:200px;display:inline" placeholder='Select one from list'
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded search-name" list="all_member_datalist"
                                name="field-name" rows="5" placeholder=""></input>
                        </div>

                        <button type="button" id="dismissbtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="DismissUser()"><?php echo $st->dismiss; ?></button>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="Leaderboard" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px"><?php echo $st->leaderboard; ?></h3>
                    <div style="margin-left:auto">
                        <a onclick='dets2=1-dets2;LoadLeaderboard();' style='cursor:pointer'><span
                                class="dgame dgame1 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ETS2</span></a>
                        <a onclick='dats=1-dats;LoadLeaderboard();' style='cursor:pointer'><span
                                class="dgame dgame2 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ATS</span></a>
                        <a onclick='levent=1-levent;LoadLeaderboard();' style='cursor:pointer'><span id="levent"
                                class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->event; ?></span></a>
                        <a onclick='ldivision=1-ldivision;LoadLeaderboard();' style='cursor:pointer'><span
                                id="ldivision"
                                class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->division; ?></span></a>

                        <input id="lbspeedlimit"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="number" name="" style="width:150px;display:inline"
                            placeholder="<?php echo $st->speed_limit; ?>"> <span class="distance_unit">km</span>/h

                        <input id="lbstart"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="date" name="" style="width:150px;display:inline" placeholder="">
                        <p style="display:inline">~</p>
                        <input id="lbend"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="date" name="" style="width:150px;display:inline" placeholder="">
                        <button type="button" style="display:inline"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="LoadLeaderboard()" id="LoadLeaderboardBtn"><?php echo $st->go; ?></button>
                    </div>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_leaderboard">
                    <table class="table-auto w-full">
                        <thead id="table_leaderboard_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->rank; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->distance; ?> (<span
                                        class="distance_unit">km</span>)
                                </th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->event_points; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->division_points; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->myth_points; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->total_points; ?></th>
                            </tr>
                        </thead>
                        <tbody id="table_leaderboard_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        </div>
    </section>

    <?php
        if(in_array("ranking", $enabled_plugins)){
        echo '
    <section id="Ranking" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded" style="padding-bottom:80px">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px">'.$st->rankings.'</h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <p style="display:inline" style="font-size:20px">'.$st->your_points.': <span id="ranktotpoints">'.$st->fetching_data.'</span>
                    </p>
                    <button type="button" style="display:inline"
                        class="requestRoleBtn w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="GetDiscordRankRole()">'.$st->request_discord_role.'</button>
                    <br>
                    <div id="ranktable">

                    </div>
                </div>
            </div>
    </section>';}?>

    <section id="Delivery" class="py-8 tabs" style="display:none">
        <div class="px-4 mx-auto mx-auto lg:ml-80">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 pb-6 px-6">
                <div class="px-4 mb-4 md:mb-0" style="width:100%">
                    <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6">
                        <div style="width:100%">
                            <h3 class="text-xl font-bold"><?php echo $st->today_statistics; ?></h3>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-crown"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->driver_of_the_day; ?></h3>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" style="font-size:22px"><span id="dotd"></span> <span id="dotddistance" style="font-size:14px"></span></h2>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" style="font-size:22px"><span id="dalljob"></span> / <span id="dtotdistance"></span></h2>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="dprofit" style="font-size:22px">-</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="px-4 mx-auto mx-auto lg:ml-80">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 pb-6 px-6">
                <div class="px-4 mb-4 md:mb-0" style="width:100%">
                    <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6">
                        <div style="width:100%">
                            <h3 class="text-xl font-bold">This week's statistics</h3>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-crown"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->driver_of_the_week; ?></h3>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" style="font-size:22px"><span id="dotw"></span> <span id="dotwdistance" style="font-size:14px"></span></h2>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-truck-ramp-box"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" style="font-size:22px"><span id="walljob"></span> / <span id="wtotdistance"></span></h2>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="rect-20"><i class="fa-solid fa-money-check-dollar"></i></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="wprofit" style="font-size:22px">-</h2>
                            </div>
                        </div>
                        <br>
                        <p style="font-size:12px;width:100%;text-align:right"><i>* Time in UTC / Week start from
                                Monday</i></p>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px"><?php echo $st->delivery_log; ?></h3>
                    <div style="margin-left:auto">
                        <a onclick='dets2=1-dets2;LoadDeliveryList();' style='cursor:pointer'><span
                                class="dgame dgame1 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ETS2</span></a>
                        <a onclick='dats=1-dats;LoadDeliveryList();' style='cursor:pointer'><span
                                class="dgame dgame2 inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">ATS</span></a>
                        <input id="dspeedlimit"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="number" name="" style="width:150px;display:inline" placeholder="Speed Limit"> <span
                            class="distance_unit">km</span>/h

                        <input id="dstart"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="date" name="" style="width:150px;display:inline" placeholder="">
                        <p style="display:inline">~</p>
                        <input id="dend"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            type="date" name="" style="width:150px;display:inline" placeholder="">
                        <button type="button" style="display:inline"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="LoadDeliveryList()" id="loadDeliveryBtn">Go</button>
                    </div>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_deliverylog">
                    <table class="table-auto w-full">
                        <thead id="table_deliverylog_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium" style="width:100px">ID</th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->driver; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->from; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->to; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->driven_distance; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->cargo; ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->net_profit; ?></th>
                            </tr>
                        </thead>
                        <tbody id="table_deliverylog_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium"><?php echo $st->no_data; ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </div>
        <br>
        <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded memberOnlyTabs" style="display:none">
            <div class="flex px-6 pb-4 border-b">
                <h3 class="text-xl font-bold"><?php echo $st->export_delivery_log; ?></h3>
            </div>
            <div class="p-4 overflow-x-auto" style="display: block;">
                <?php echo $st->export_delivery_log_note ?>

                <br>

                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2" for=""><?php echo $st->start_date; ?></label>
                    <input id="export_start_date"
                        class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                        type="date" name="" style="width:200px;display:inline">
                </div>
                <div class="mb-6">
                    <label class="block text-sm font-medium mb-2" for=""><?php echo $st->end_date; ?></label>
                    <input id="export_end_date"
                        class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                        type="date" name="" style="width:200px;display:inline">
                </div>
                <button type="button"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="ExportDeliveryLog()" id="exportDLogBtn"><?php echo $st->export; ?></button>
            </div>
        </div>
        </div>
    </section>

    <section id="DeliveryDetailTab" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4" style="padding-bottom:80px">
                <div style="display:block;height:50vh">
                    <div style="float:left;width:58%">
                        <div id="dmap" style="height: 50vh;width:100%;background-color: #484E66;border-radius:15px">
                        </div>
                    </div>
                    <div style="display:inline;float:right;width:38%">
                        <div class="md:w-1/2 lg:w-1/4" style="padding-top:0">
                            <div class="rounded bg-white">
                                <div class="mb-2" style="padding:20px" id="dlogbasic">
                                    <h2><?php echo $st->delivery; ?> #<span id="dlogid">0</span></h2>
                                    <p><?php echo $st->by; ?> <i><span id="dlogdriver"></span></i></p>
                                    <p><?php echo $st->at; ?> <b><span id="dlogtime"></span></b></p>
                                    <p><?php echo $st->logged; ?> <b><span id="dlogdistance"></span></b><span
                                            class="distance_unit">km</span></p>
                                </div>
                            </div>
                        </div>
                        <br>
                        <div class="md:w-1/2 lg:w-1/4" style="padding-top:0">
                            <div class="rounded bg-white">
                                <div class="mb-2">
                                    <div style="padding:20px;" id="routereplayload">
                                        <p><?php echo $st->route_replay_loading; ?></p>
                                    </div>
                                    <div style="padding:20px;display:none" id="routereplaydiv">
                                        <h3><?php echo $st->route_replay; ?>: <span id="rp_pct">0</span>% (<span
                                                id="rp_cur">0</span> /
                                            <span id="rp_tot"></span>)
                                        </h3>
                                        <p>
                                            <button type="button" style="display:inline;padding:5px"
                                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                onclick="rri-=100">-100</button>
                                            <button type="button" style="display:inline;padding:5px"
                                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                onclick="rri-=50">-50</button>
                                            <button type="button" style="display:inline;padding:5px" id="rrplay"
                                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                onclick="rrplayswitch()"><?php echo $st->play; ?></button>
                                            <button type="button" style="display:inline;padding:5px"
                                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                onclick="rri+=50">+50</button>
                                            <button type="button" style="display:inline;padding:5px"
                                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                onclick="rri+=100">+100</button>

                                            <p><?php echo $st->speed; ?>:
                                                <button type="button" style="display:inline;padding:5px"
                                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                    onclick="rrspeed-=5">-5</button>
                                                <button type="button" style="display:inline;padding:5px"
                                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                    onclick="rrspeed-=1">-1</button>
                                                <button type="button" style="display:inline;padding:5px" id="rp_speed"
                                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200">20</button>
                                                <button type="button" style="display:inline;padding:5px"
                                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                    onclick="rrspeed+=1">+1</button>
                                                <button type="button" style="display:inline;padding:5px"
                                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                                    onclick="rrspeed+=5">+5</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <br>
                <div style="margin-bottom:100px">
                    <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0;float:left">
                        <div class="p-6 rounded bg-white">
                            <h2 style="font-size:20px" id="ddcol1t"><?php echo $st->from; ?></h2>
                            <div class="mb-2 ddcol" id="ddcol1">
                            </div>
                        </div>
                    </div>
                    <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0;float:left">
                        <div class="p-6 rounded bg-white">
                            <h2 style="font-size:20px" id="ddcol2t"><?php echo $st->to; ?></h2>
                            <div class="mb-2 ddcol" id="ddcol2">
                            </div>
                        </div>
                    </div>
                    <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0;float:left">
                        <div class="p-6 rounded bg-white">
                            <h2 style="font-size:20px" id="ddcol3t"><?php echo $st->vehicle; ?></h2>
                            <div class="mb-2 ddcol" id="ddcol3">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <?php
        if(in_array("division", $enabled_plugins)){
        echo '
    <section id="Division" class="py-8 tabs" style="display:none">
        <div class="px-4 mx-auto mx-auto lg:ml-80">
            <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 pb-6 px-6">
                <div class="px-4 mb-4 md:mb-0" style="width:100%">
                    <div class="flex flex-wrap -mx-4 -mb-4 md:mb-0 px-6" id="divisionList">
                    </div>
                </div>
            </div>
        </div>
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px">'.$st->recent_division_deliveries.'</h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_division_deliverylog">
                    <table class="table-auto w-full">
                        <thead id="table_division_deliverylog_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium" style="width:100px">ID</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->driver.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->from.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->to.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->driven_distance.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->cargo.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->net_profit.'</th>
                            </tr>
                        </thead>
                        <tbody id="table_division_deliverylog_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium">'.$st->no_data.'</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
    <section id="StaffDivision" class="py-8 tabs" style="display:none">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold" style="margin-top:8px">'.$st->pending_division_validation_deliveries.'</h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_division_validation">
                    <table class="table-auto w-full">
                        <thead id="table_division_validation_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium" style="width:100px">'.$st->delivery_id.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->driver.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->division.'</th>
                            </tr>
                        </thead>
                        <tbody id="table_division_validation_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium">'.$st->no_data.'</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
    </section>';}?>

    <?php
        if(in_array("event", $enabled_plugins)){
        echo '
        <section id="Event" class="py-8 tabs" style="display:none">
            <div style="padding:50px;padding-top:0;">
                <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold">'.$st->events_calendar.'</h3>
                    </div>
                    <br>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <div id="eventsCalendar"></div>
                    </div>
                </div>
                <br>
                <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold">'.$st->events_list.'</h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;" id="table_event_list">
                        <table class="table-auto w-full">
                            <thead id="table_event_list_head">
                                <tr class="text-xs text-gray-500 text-left">
                                    <th class="py-5 px-6 pb-3 font-medium" style="width:100px">ID</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->title.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->from.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->to.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->distance.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->meetup_time.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->departure_time.'</th>
                                    <th class="py-5 px-6 pb-3 font-medium">'.$st->voted.'</th>
                                </tr>
                            </thead>
                            <tbody id="table_event_list_data">
                                <tr class="text-sm">
                                    <td class="py-5 px-6 font-medium">'.$st->no_data.'</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>

        <section id="StaffEvent" class="py-8 tabs" style="display:none">
            <div style="padding:50px;padding-top:0;">
                <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                    <div class="container px-4">
                        <div class="flex px-6 pb-4 border-b">
                            <h3 class="text-xl font-bold">'.$st->manage_events.'</h3>
                        </div>
                        <div style="margin:20px">
                            '.$st->manage_events_note.'
                            <br>
                            <div class="mb-6">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->event_id.'</label>
                                <input id="eventid" style="width:200px;display:inline"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="'.$st->for_updating_or_deleting.'">
                                <button type="button" style="display:inline"
                                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                    onclick="FetchEvent()" id="fetchEventBtn">'.$st->fetch_data.'</button>
                            </div>

                            <div class="mb-6">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->title.'</label>
                                <input id="eventtitle"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="">
                            </div>

                            <div class="mb-6">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->truckersmp_link.'</label>
                                <input id="eventtruckersmp_link"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="">
                            </div>

                            <div class="mb-6" style="display:inline-block;width:33%">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->from.'</label>
                                <input id="eventfrom"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="">
                            </div>

                            <div class="mb-6" style="display:inline-block;width:33%">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->to.'</label>
                                <input id="eventto"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="">
                            </div>

                            <div class="mb-6" style="display:inline-block;width:33%">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->distance.'</label>
                                <input id="eventdistance"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="text" name="" placeholder="">
                            </div>

                            <br>
                            <div class="mb-6" style="display:inline-block;width:49%">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->meetup_local_time.' (AM / PM)</label>
                                <input id="eventmeetup_timestamp"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="datetime-local" name="" placeholder="">
                            </div>

                            <div class="mb-6" style="display:inline-block;width:49%">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->departure_local_time.' (AM / PM)</label>
                                <input id="eventdeparture_timestamp"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    type="datetime-local" name="" placeholder="">
                            </div>

                            <div class="mb-6">
                                <label class="block text-sm font-medium mb-2" for="">'.$st->image_links.'</label>
                                <textarea id="eventimgs"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                    name="field-name" rows="5" placeholder=""></textarea>
                            </div>

                            <div class="mb-6">
                                <div class="mb-1">
                                    <label class="block text-sm font-medium mb-2" for=""
                                        style="text-align: left;">'.$st->visibility.':</label>
                                    <label>
                                        <input type="radio" name="event-visibility" value="yes" checked id="eventpvt-0">
                                        <span class="eventpvt-0">'.$st->public.'</span>
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        <input type="radio" name="event-visibility" value="yes" id="eventpvt-1">
                                        <span class="eventpvt-1">'.$st->private.'</span>
                                    </label>
                                </div>
                            </div>

                            <button type="button"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="EventOp()" id="newEventBtn">'.$st->create_event.'</button>
                        </div>
                    </div>
                </div>
            </div>
            <div style="padding:50px;padding-top:0;">
                <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded" id="eventattendee">
                    <div class="flex px-6 pb-4 border-b">
                        <h3 class="text-xl font-bold">'.$st->update_event_attendees.'</h3>
                    </div>
                    <div class="p-4 overflow-x-auto" style="display: block;">
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">'.$st->event_id.'</label>
                            <input id="aeventid" style="width:200px;display:inline"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                type="text" name="" placeholder="">
                            <button type="button" style="display:inline"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="FetchEventAttendee()" id="fetchEventAttendeeBtn">'.$st->fetch_existing_attendees.'</button>
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">'.$st->event_points.'</label>
                            <input id="attendeePoints" style="width:200px;display:inline"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                type="text" name="" placeholder="">
                        </div>
                        <!-- <div class="mb-6">
                <label class="block text-sm font-medium mb-2" for="">'.$st->user_id.' ('.$st->separate_with_comma.')</label>
                <input id="attendeeId"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                rows="5" placeholder=""></input>
            </div> -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">'.$st->members.' ('.$st->hit_enter_to.')</label>
                            <div class="inputWrapper" id="attendeeIdWrap" style="background-color:rgba(255,255,255,0.2)">
                                <input id="attendeeId" class="inputDefault inputInner search-name-mul" name="field-name" rows="5"
                                    placeholder=""></input>
                            </div>
                        </div>

                        <button type="button" id="attendeeBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="UpdateEventAttendees()">'.$st->update.'</button>
                    </div>
                </div>
        </section>';}?>

    <?php
        if(in_array("application", $enabled_plugins)){
        echo '
    <section id="MyApp" class="py-8 tabs" style="display:none">
        <div style="padding:50px; padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">'.$st->my_applications.'</h3>
                </div>

                <div class="p-4 overflow-x-auto" style="display: block;" id="table_my_application">
                    <table class="table-auto w-full">
                        <thead id="table_my_application_head" style="display:none">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium">ID</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->type.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->submitted_at.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->status.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->last_staff_reply.'</th>
                            </tr>
                        </thead>
                        <tbody id="table_my_application_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium">'.$st->no_data.'</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <section id="SubmitApp" class="py-8 tabs" style="display: none;">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">'.$st->submit_application.'</h3>
                </div>

                <div class="p-4 overflow-x-auto" style="display: block;">
                '.$application_html.'
                <button type="button"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="SubmitApp()" id="submitAppBttn">'.$st->submit.'</button>
                </div>
            </div>
        </div>
    </section>

    <section id="AllApp" class="py-8 tabs" style="display: none;">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">'.$st->applications.'</h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_all_application">
                    <table class="table-auto w-full">
                        <thead id="table_all_application_head" style="display:none">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium">ID</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->applicant.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->type.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->submitted_at.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->status.'</th>
                                <th class="py-5 px-6 pb-3 font-medium">'.$st->last_staff_reply.'</th>
                            </tr>
                        </thead>
                        <tbody id="table_all_application_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium">'.$st->no_data.'</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded admin-only">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">'.$st->update_staff_positions.'</h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for="">'.$st->staff_positions.'</label>
                        <textarea id="staffposedit"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></textarea>
                    </div>

                    <button type="button" id="updateStaffPositionBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UpdateApplicationPositions()" id="updateAppStatusBtn">'.$st->update.'</button>
                </div>
            </div>
        </div>
    </section>';}?>

    <section id="AllUsers" class="py-8 tabs" style="display: none;">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->pending_users ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_pending_user_list">
                    <table class="table-auto w-full">
                        <thead id="table_pending_user_list_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->discord_id ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->name ?></th>
                            </tr>
                        </thead>
                        <tbody id="table_pending_user_list_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium"><?php echo $st->no_data ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded" id="BanUserDiv">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->ban_or_unban_user ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->discord_id ?></label>
                        <input id="bandiscordid" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->ban_expire_date ?></label>
                        <input id="banexpire" type="date" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->reason ?></label>
                        <textarea id="banreason"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder="<?php echo $st->reason_note ?>"></textarea>
                    </div>

                    <button type="button" id="banUserBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="BanUser()"><?php echo $st->ban ?></button>
                    <button type="button" style="background-color:lightgreen" id="unbanUserBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UnbanUser()"><?php echo $st->unban ?></button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->add_user ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <?php echo $st->add_user_note ?>
                        <br>
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->discord_id ?></label>
                        <input id="adddiscordid" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <button type="button" id="addUserBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="AddUser()"><?php echo $st->add ?></button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded admin-only">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->update_user_discord_account ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->old_discord_id ?></label>
                        <input id="upd_old_id" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->new_discord_id ?></label>
                        <input id="upd_new_id" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <button type="button" id="updateDiscordBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UpdateUserDiscordAccount()"><?php echo $st->update ?></button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded admin-only">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->unbind_connections ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->discord_id ?></label>
                        <input id="unbind_discord_id" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <button type="button" id="unbindConnectionsBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UnbindUserAccountConnections()"><?php echo $st->unbind ?></button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded admin-only">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->delete_user ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <?php echo $st->delete_user_note ?>

                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->discord_id ?></label>
                        <input id="del_discord_id" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <button type="button" id="deleteUserBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="DeleteUserAccount()"><?php echo $st->delete ?></button>
                </div>
            </div>
        </div>
    </section>

    <section id="AuditLog" class="py-8 tabs" style="display: none;">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->audit_log ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;" id="table_audit_log">
                    <table class="table-auto w-full">
                        <thead id="table_audit_log_head">
                            <tr class="text-xs text-gray-500 text-left">
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->user ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->log ?></th>
                                <th class="py-5 px-6 pb-3 font-medium"><?php echo $st->time ?></th>
                            </tr>
                        </thead>
                        <tbody id="table_audit_log_data">
                            <tr class="text-sm">
                                <td class="py-5 px-6 font-medium"><?php echo $st->no_data ?></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <section id="Admin" class="py-8 tabs" style="display: none;">
        <div style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">Web Config</h3>
                </div>
                <div class="mb-6" style="padding:20px">
                    <label class="block text-sm font-medium mb-2" for="">Webpage will update instantly, images might not
                        update instantly due to browser / CDN cache.</label>
                    <label class="block text-sm font-medium mb-2" for="" style="color:red">Web server and API server are
                        physically isolated so you must provide your application token to update config for
                        authorization. For safety purpose you are recommended to reset application token after this is
                        done.</label>
                    <br>
                    <div>
                        <h3 class="text-l font-bold">Company</h3>
                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">Name</label>
                            <input id="webconfig_vtc_name"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                name="text" rows="5" placeholder=""></input>
                        </div>
                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">HEX Color</label>
                            <input id="webconfig_vtc_color"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                type="text" name="" placeholder="">
                        </div>
                        <div class="relative" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2 text-left" for="">Distance Unit (Driver
                                Ranking)</label>
                            <select id="webconfig_company_distance_unit"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="metric">Metric</option>
                                <option value="imperial">Imperial</option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewbox="0 0 20 20">
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">Navio Company ID</label>
                            <input id="webconfig_navio_company_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                type="text" name="" placeholder="">
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Slogan</label>
                            <input id="webconfig_slogan"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                name="text" rows="5" placeholder=""></input>
                        </div>
                    </div>

                    <hr><br>

                    <div>
                        <h3 class="text-l font-bold">Assets (Input only if you want to update them)</h3>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Logo Download Link (File size must
                                <= 1 MB)</label> <input id="webconfig_logo_url"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                    type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Banner Download Link (File size
                                must <= 1 MB)</label> <input id="webconfig_banner_url"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                    type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Background Download Link (File size
                                must <= 4 MB)</label> <input id="webconfig_bg_url"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                    type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Team Update Banner Download Link (File
                                size
                                must
                                <= 1 MB)</label> <input id="webconfig_teamupdate_url"
                                    class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                                    type="text" name="" placeholder="">
                        </div>
                    </div>

                    <hr><br>
                    <h3 class="text-l font-bold">Advanced Customization</h3>

                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><b>Custom Style (CSS)</b></label>

                        <textarea id="webconfig_custom_style" style="width:100%;height:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                            name="field-name" rows="5" placeholder=""></textarea>
                    </div>
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""><b>Custom Application</b></label>
                        <label class="block text-sm font-medium mb-2" for="">1. Info</label>
                        <label class="block text-sm font-medium mb-2" for="">1.1. script, style tag are filtered
                            out.</label>
                        <label class="block text-sm font-medium mb-2" for="">1.2. To go back to default application,
                            leave the field empty.</label>
                        <label class="block text-sm font-medium mb-2" for="">1.3. If you haven't set up custom
                            application before, the text below is default application.</label>
                        <label class="block text-sm font-medium mb-2" for="">2. Basic Usage</label>
                        <label class="block text-sm font-medium mb-2" for="">2.1. You are free to code your own HTML
                            application.</label>
                        <label class="block text-sm font-medium mb-2" for="">2.2. Text input (e.g. date / text),
                            textarea, select, radio, checkbox are supported.</label>
                        <label class="block text-sm font-medium mb-2" for="">2.3. For text input, textarea, select,
                            assign them ID like "applicationNAnswerA" (N is application type, A is the ID of
                            question)</label>
                        <label class="block text-sm font-medium mb-2" for="">2.4. For radio, checkbox, assign them NAME
                            like "applicationNAnswerA" (e.g. application1Answer3)</label>
                        <label class="block text-sm font-medium mb-2" for="">2.5. You should add a "question" before the
                            answer box, assign it ID like "applicationNQuestionA" (A should be the same as the
                            answer's)</label>
                        <label class="block text-sm font-medium mb-2" for="">2.6. A maximum of 100 questions & answers
                            is supported.</label>
                        <label class="block text-sm font-medium mb-2" for="">3. Advanced Usage</label>
                        <label class="block text-sm font-medium mb-2" for="">3.1. You can create your own application
                            type, just add more "option" to #appselect (value is application ID). You also need to add
                            "div" with ID "ApplicationA" (A is ID) to make them display when user select an
                            application.</label>
                        <label class="block text-sm font-medium mb-2" for="">3.2. For staff application, a select with
                            ID "application2Answer3" is reserved to display open staff positions, updated in Staff -
                            Application.</label>
                        <label class="block text-sm font-medium mb-2" for="">3.3. For divisions, you can add divisions
                            by adding "option" to "application4Answer1". And like application type, add "div" with ID
                            "DivisionA" (A is ID) to make them display when user select a division.</label>

                        <textarea id="webconfig_custom_application" style="width:100%;height:300px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded webConfigFormData"
                            name="field-name" rows="5" placeholder=""></textarea>
                    </div>

                    <hr><br>

                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for="">Application Token (For
                            authorization)</label>
                        <input id="webconfig_apptoken" type="password"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="text" rows="5" placeholder=""></input>
                    </div>

                    <button type="button" style="float:right"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UpdateWebConfig()" id="updateWebConfigBtn">Update</button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">API Config</h3>
                </div>
                <div class="mb-6" style="padding:20px">
                    <label class="block text-sm font-medium mb-2" for="">Program will not reload automatically. You need to manually reload it.</label>
                    <label class="block text-sm font-medium mb-2" for="" style="color:red">Warning: Misconfiguration
                        may lead to API service failing to start or not working properly!</label>
                    <br>
                    <!-- <div>
                        <h3 class="text-l font-bold">Company</h3>

                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">Name</label>
                            <input id="config_vtc_name"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                name="text" rows="5" placeholder=""></input>
                        </div>

                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">HEX Color</label>
                            <input id="config_hex_color"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="relative" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2 text-left" for="">Distance Unit (Driver
                                Ranking)</label>
                            <select id="config_distance_unit"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="metric">Metric</option>
                                <option value="imperial">Imperial</option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewbox="0 0 20 20">
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z">
                                    </path>
                                </svg>
                            </div>
                        </div>

                        <div class="relative" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2 text-left" for="">Require TruckersMP
                                Account</label>
                            <select id="config_truckersmp_bind"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewbox="0 0 20 20">
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z">
                                    </path>
                                </svg>
                            </div>
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Logo Link</label>
                            <input id="config_vtc_logo_link"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Team Update Banner Link</label>
                            <input id="config_team_update_image_link"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Discord Server</h3>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Server ID</label>
                            <input id="config_guild_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="relative" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2 text-left" for="">Check if user is in
                                server?</label>
                            <select id="config_in_guild_check"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="true">Yes</option>
                                <option value="false">No</option>
                            </select>
                            <div
                                class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    viewbox="0 0 20 20">
                                    <path
                                        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Navio</h3>

                        <div class="mb-6" style="display:inline-block;width:73.5%">
                            <label class="block text-sm font-medium mb-2" for="">API Token (Leave empty to keep
                                unchanged)</label>
                            <input id="config_navio_api_token"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                name="text" rows="5" placeholder=""></input>
                        </div>

                        <div class="relative" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">Company ID</label>
                            <input id="config_navio_company_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                name="text" rows="5" placeholder=""></input>
                        </div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Delivery</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Delivery Log Channel ID</label>
                            <input id="config_delivery_log_channel_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Delivery Embed GIF (Separate with
                                line-break)</label>
                            <textarea id="config_delivery_post_gifs_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea>
                        </div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Discord Application</h3>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Client ID</label>
                            <input id="config_discord_client_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6" style="display:inline-block;width:49%">
                            <label class="block text-sm font-medium mb-2" for="">Client Secret (Leave empty to keep
                                unchanged)</label>
                            <input id="config_discord_client_secret"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">OAuth2 URL (Generated URL)</label>
                            <input id="config_discord_oauth2_url"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Callback URL (Redirect URL)</label>
                            <input id="config_discord_callback_url"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Bot Token (Leave empty to keep
                                unchanged)</label>
                            <input id="config_discord_bot_token"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">New Member</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Team Update Webhook</label>
                            <input id="config_webhook_teamupdate"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Team Update Message (Variable:
                                {mention})</label>
                            <input id="config_webhook_teamupdate_message"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Welcome Channel ID</label>
                            <input id="config_welcome_channel_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder="">
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Welcome Message (Variable:
                                {mention})</label>
                            <textarea id="config_welcome_message" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                name="field-name" rows="5" placeholder=""></textarea></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Welcome Message Image Link</label>
                            <input id="config_welcome_image_link"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Discord Role Update (Separate with
                                ',' | Prepend '+' to add role or '-' to remove role')</label>
                            <input id="config_welcome_role_change_txt"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                type="text" name="" placeholder=""></div>

                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Ranking</h3>

                        <div class="mb-6" style="display:inline-block;width:24.5%">
                            <label class="block text-sm font-medium mb-2" for="">Rank Up Channel ID</label>
                            <input id="config_rank_up_channel_id"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6" style="display:inline-block;width:74.5%">
                            <label class="block text-sm font-medium mb-2" for="">Rank Up Message</label>
                            <input id="config_rank_up_message"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Ranks (Separate ranks with
                                line-break / For each rank, separate distance, name, discord_role_id with
                                ',')</label>
                            <textarea id="config_ranks_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea></div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Application</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Webhook</label>
                            <input id="config_webhook_application"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Types (Separate types with
                                line-break / For each type, separate id, name, discord_role_id, staff_role_id (separate
                                with '|'), message, webhook, note with ',' /
                                ID 1~4 are reserved and name change will not take effect)</label>
                            <textarea id="config_application_types_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea></div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Division</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Webhook</label>
                            <input id="config_webhook_division"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Webhook Message (You can add
                                role-pings here)</label>
                            <textarea id="config_webhook_division_message" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                name="field-name" rows="5" placeholder=""></textarea></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Division (Separate divisions with
                                line-break / For each division, separate id, name, point, role_id with ',')</label>
                            <textarea id="config_divisions_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea></div>
                    </div>
                    <hr><br>
                    <div>
                        <h3 class="text-l font-bold">Permissions & Roles</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Permissions (Separate permissions
                                with line-break / For each permission, separate permission name and role ids with
                                ':', separate role ids with ',')</label>
                            <textarea id="config_perms_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea></div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Roles (Separate roles with
                                line-break / For each role, separate id, name with ',')</label>
                            <textarea id="config_roles_txt" style="width:100%;height:100px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name" rows="5" placeholder=""></textarea></div>
                    </div>
                    <hr><br> 
                    <div>
                        <h3 class="text-l font-bold">Audit Log</h3>

                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2" for="">Webhook</label>
                            <input id="config_webhook_audit"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded configFormData"
                                type="text" name="" placeholder=""></div>
                    </div>
                    <hr><br> -->
                    <h3 class="text-l font-bold">JSON Config Editor</h3>
                    <label class="block text-sm font-medium mb-2" for="">For advanced user who knows JSON format
                        well</label>
                    <textarea id="config" style="width:100%;height:400px"
                        class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                        name="field-name" rows="5" placeholder=""></textarea>
                    <br>
                    <button type="button" style="float:right"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UpdateConfig()" id="updateConfigBtn">Update</button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold">Reload</h3>
                </div>
                <div style="padding:20px">
                    <label class="block text-sm font-medium mb-2" for="">Only do this if you find the Drivers Hub
                        not functioning correctly.</label>
                    <label class="block text-sm font-medium mb-2" for="">The process may take up to 5 minutes and
                        API will be inaccessible during reload. Deliveries are not logged when API is
                        offline.</label>
                    <br>
                    <button type="button"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="ReloadServer()" id="reloadBtn">Reload</button>
                </div>
            </div>
        </div>
    </section>
    <datalist id="all_member_datalist" style="display:none">
        
    </datalist>
    <section id="footer">
        <div class="px-6 mx-auto lg:ml-80 pb-4">
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
        </div>
    </section>
</body>

</html>