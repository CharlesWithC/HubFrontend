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

    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/font.css">
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/index.css">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap">
    <link rel="stylesheet" href="https://drivershub-cdn.charlws.com/css/tailwind.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ol3/4.5.0/ol-debug.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.css" />

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
        integrity="sha512-894YE6QWD5I59HgZOGReFYm4dnWc1Qt5NtvYSaNcOP+u1T9qYdvdihz0PPSiiqn/+/3e7Jo4EaG7TubfWGUrMQ=="
        crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@5.11.0/main.min.js"></script>

    <script src="/config/<?php echo $domainpure ?>.js"></script>
    <?php
        if(stristr($path, 'beta')){
            echo '<script id="bundle_beta" src="https://drivershub-cdn.charlws.com/js/bundles/beta.js"></script>';
        } else {
            echo '<script id="bundle" src="https://drivershub-cdn.charlws.com/js/bundles/b83b74cd55422a31.js"></script>';
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
        .rounded-full {
            transition: background-color 1000ms linear;
            color: #555;
        }

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
        <nav class="lg:hidden py-6 px-6 bg-gray-800">
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
            <div class="navbar-backdrop fixed lg:hidden inset-0 bg-gray-800 opacity-10"></div>
            <nav
                class="fixed top-0 left-0 bottom-0 flex flex-col w-3/4 lg:w-80 sm:max-w-xs pt-6 pb-8 bg-gray-800 overflow-y-auto">
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
                                <span class="inline-block mr-3">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 3V19C3 20.1046 3.89543 21 5 21H21" stroke="#fff" stroke-width="2"
                                            stroke-miterlimit="5.75877" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M7 14L11 10L15 14L21 8" stroke="#fff" stroke-width="2"
                                            stroke-miterlimit="5.75877" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M18 8H21V11" stroke="#fff" stroke-width="2" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                    </svg> </span>
                                <span><?php echo $st->overview; ?></span>
                                <span class="inline-block ml-auto">
                                </span>
                            </a>
                        </li>

                        <?php
                            if(in_array("announcement", $enabled_plugins)){
                            echo '
                            <li>
                            <a id="AnnTabBtn" class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#AnnTab\', \'#AnnTabBtn\')">
                                <span class="inline-block mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                    class="bi bi-newspaper" viewBox="0 0 16 16">
                                    <path
                                    d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z" />
                                    <path
                                    d="M2 3h10v2H2V3zm0 3h4v3H2V6zm0 4h4v1H2v-1zm0 2h4v1H2v-1zm5-6h2v1H7V6zm3 0h2v1h-2V6zM7 8h2v1H7V8zm3 0h2v1h-2V8zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1z" />
                                </svg> </span>
                                <span>'.$st->announcements.'</span>
                                <span class="inline-block ml-auto">
                                </span>
                            </a>
                            </li>';}?>

                        <?php
                            if(in_array("downloads", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="DownloadsTabBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 rounded hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#DownloadsTab\', \'#DownloadsTabBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                        class="bi bi-download" viewBox="0 0 16 16">
                                        <path
                                            d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                        <path
                                            d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                    </svg> </span>
                                <span>'.$st->downloads.'</span>
                                <span class="inline-block ml-auto">
                                </span>
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
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-map" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd"
                                            d="M15.817.113A.5.5 0 0 1 16 .5v14a.5.5 0 0 1-.402.49l-5 1a.502.502 0 0 1-.196 0L5.5 15.01l-4.902.98A.5.5 0 0 1 0 15.5v-14a.5.5 0 0 1 .402-.49l5-1a.5.5 0 0 1 .196 0L10.5.99l4.902-.98a.5.5 0 0 1 .415.103zM10 1.91l-4-.8v12.98l4 .8V1.91zm1 12.98 4-.8V1.11l-4 .8v12.98zm-6-.8V1.11l-4 .8v12.98l4-.8z" />
                                    </svg> </span>
                                <span>'.$st->map.'</span>
                                <span class="inline-block ml-auto">
                                </span>
                            </a>
                        </li>';}?>

                        <li>
                            <a id="DeliveryBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Delivery', '#DeliveryBtn')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-truck" viewBox="0 0 16 16">
                                        <path
                                            d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z">
                                        </path>
                                    </svg>
                                </span>
                                <span><?php echo $st->deliveries ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("division", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="DivisionBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Division\', \'#DivisionBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        viewBox="0 0 640 512">
                                        <path
                                            d="M32 32C49.67 32 64 46.33 64 64V96H149.2L64 266.3V448C64 465.7 49.67 480 32 480C14.33 480 0 465.7 0 448V64C0 46.33 14.33 32 32 32V32zM309.2 288H234.8L330.8 96H405.2L309.2 288zM458.8 96H533.2L437.2 288H362.8L458.8 96zM202.8 96H277.2L181.2 288H106.8L202.8 96zM576 117.7V64C576 46.33 590.3 32 608 32C625.7 32 640 46.33 640 64V448C640 465.7 625.7 480 608 480C590.3 480 576 465.7 576 448V288H490.8L576 117.7z" />
                                    </svg>
                                </span>
                                <span>'.$st->divisions.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>';}?>

                        <?php
                            if(in_array("event", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="EventBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Event\', \'#EventBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-card-checklist" viewBox="0 0 16 16">
                                        <path
                                            d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                        <path
                                            d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" />
                                    </svg> </span>
                                <span>'.$st->events.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
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
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="feather feather-users">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg> </span>
                                <span><?php echo $st->members; ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>

                        <li>
                            <a id="LeaderboardBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Leaderboard', '#LeaderboardBtn')">
                                <span class="inline-block mr-3">
                                    <svg width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M15 21H9V12.6C9 12.2686 9.26863 12 9.6 12H14.4C14.7314 12 15 12.2686 15 12.6V21Z"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M20.4 21H15V18.1C15 17.7686 15.2686 17.5 15.6 17.5H20.4C20.7314 17.5 21 17.7686 21 18.1V20.4C21 20.7314 20.7314 21 20.4 21Z"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M9 21V16.1C9 15.7686 8.73137 15.5 8.4 15.5H3.6C3.26863 15.5 3 15.7686 3 16.1V20.4C3 20.7314 3.26863 21 3.6 21H9Z"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M10.8056 5.11325L11.7147 3.1856C11.8314 2.93813 12.1686 2.93813 12.2853 3.1856L13.1944 5.11325L15.2275 5.42427C15.4884 5.46418 15.5923 5.79977 15.4035 5.99229L13.9326 7.4917L14.2797 9.60999C14.3243 9.88202 14.0515 10.0895 13.8181 9.96099L12 8.96031L10.1819 9.96099C9.94851 10.0895 9.67568 9.88202 9.72026 9.60999L10.0674 7.4917L8.59651 5.99229C8.40766 5.79977 8.51163 5.46418 8.77248 5.42427L10.8056 5.11325Z"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg> </span>
                                <span><?php echo $st->leaderboard; ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("ranking", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="RankingBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#Ranking\', \'#RankingBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="icon icon-tabler icon-tabler-steering-wheel" width="18" height="18"
                                        viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                        stroke-linecap="round" stroke-linejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <circle cx="12" cy="12" r="9" />
                                        <circle cx="12" cy="12" r="2" />
                                        <line x1="12" y1="14" x2="12" y2="21" />
                                        <line x1="10" y1="12" x2="3.25" y2="10" />
                                        <line x1="14" y1="12" x2="20.75" y2="10" />
                                    </svg> </span>
                                <span>'.$st->rankings.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
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
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-archive" viewBox="0 0 16 16">
                                        <path
                                            d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                                    </svg>
                                </span>
                                <span id="MyAppSpan">'.$st->my_applications.'</span>
                                <span class="inline-block ml-auto">
                                </span>
                            </a>
                        </li>

                        </li>
                        <li>
                            <a id="SubmitAppBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#SubmitApp\', \'#SubmitAppBtn\')">
                                <span class="inline-block mr-3">
                                    <svg width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2 12H5M8 12H5M5 12V9M5 12V15" stroke="currentColor"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M6.25 6L6.49485 5.72018C7.29167 4.80952 8.70833 4.80952 9.50515 5.72017L13.8476 10.683C14.5074 11.437 14.5074 12.563 13.8476 13.317L9.50515 18.2798C8.70833 19.1905 7.29167 19.1905 6.49485 18.2798L6.25 18"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M13 19L17.8844 13.3016C18.5263 12.5526 18.5263 11.4474 17.8844 10.6984L13 5"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                        <path
                                            d="M17 19L21.8844 13.3016C22.5263 12.5526 22.5263 11.4474 21.8844 10.6984L17 5"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg> </span>
                                <span>'.$st->submit_application.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
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
                                <span class="inline-block mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                    class="bi bi-newspaper" viewBox="0 0 16 16">
                                    <path
                                    d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5v-11zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5H12z" />
                                    <path
                                    d="M2 3h10v2H2V3zm0 3h4v3H2V6zm0 4h4v1H2v-1zm0 2h4v1H2v-1zm5-6h2v1H7V6zm3 0h2v1h-2V6zM7 8h2v1H7V8zm3 0h2v1h-2V8zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1zm-3 2h2v1H7v-1zm3 0h2v1h-2v-1z" />
                                </svg> </span>
                                <span>'.$st->announcements.'</span>
                                <span class="inline-block ml-auto">
                                </span>
                            </a>
                            </li>';}?>

                        <?php
                            if(in_array("event", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="StaffEventBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#StaffEvent\', \'#StaffEventBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-card-checklist" viewBox="0 0 16 16">
                                        <path
                                            d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13z" />
                                        <path
                                            d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0zM7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0z" />
                                    </svg> </span>
                                <span>'.$st->events.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>';}?>

                        <?php
                            if(in_array("division", $enabled_plugins)){
                            echo '
                            <li>
                            <a id="StaffDivisionBtn" class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#StaffDivision\', \'#StaffDivisionBtn\')">
                                <span class="inline-block mr-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                    viewBox="0 0 640 512">
                                    <path
                                    d="M32 32C49.67 32 64 46.33 64 64V96H149.2L64 266.3V448C64 465.7 49.67 480 32 480C14.33 480 0 465.7 0 448V64C0 46.33 14.33 32 32 32V32zM309.2 288H234.8L330.8 96H405.2L309.2 288zM458.8 96H533.2L437.2 288H362.8L458.8 96zM202.8 96H277.2L181.2 288H106.8L202.8 96zM576 117.7V64C576 46.33 590.3 32 608 32C625.7 32 640 46.33 640 64V448C640 465.7 625.7 480 608 480C590.3 480 576 465.7 576 448V288H490.8L576 117.7z" />
                                </svg>
                                </span>
                                <span>'.$st->divisions.'</span>
                                <span class="inline-block ml-auto">
                                <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                    xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                            </li>';}?>

                        <li>
                            <a id="StaffMemberBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#StaffMembers', '#StaffMemberBtn')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                        stroke-linejoin="round" class="feather feather-users">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg> </span>
                                <span><?php echo $st->members; ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>

                        <li>
                            <a id="AllUserBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#AllUsers', '#AllUserBtn')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path
                                            d="M14 14.252V22H4a8 8 0 0 1 10-7.748zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm6 4v-3h2v3h3v2h-3v3h-2v-3h-3v-2h3z" />
                                    </svg> </span>
                                <span><?php echo $st->users; ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>

                        <?php
                            if(in_array("application", $enabled_plugins)){
                            echo '
                        <li>
                            <a id="AllAppBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab(\'#AllApp\', \'#AllAppBtn\')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-archive" viewBox="0 0 16 16">
                                        <path
                                            d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z" />
                                    </svg>
                                </span>
                                <span>'.$st->applications.'</span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>';}?>
                        <li>
                            <a id="AuditLogBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#AuditLog', '#AuditLogBtn')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor"
                                        class="bi bi-terminal" viewBox="0 0 16 16">
                                        <path
                                            d="M6 9a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3A.5.5 0 0 1 6 9zM3.854 4.146a.5.5 0 1 0-.708.708L4.793 6.5 3.146 8.146a.5.5 0 1 0 .708.708l2-2a.5.5 0 0 0 0-.708l-2-2z" />
                                        <path
                                            d="M2 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H2zm12 1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h12z" />
                                    </svg> </span>
                                <span><?php echo $st->audit_log ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>
                        <li>
                            <a id="AdminBtn"
                                class="flex items-center pl-3 py-3 pr-4 text-gray-50 hover:bg-gray-900 tabbtns"
                                style="cursor: pointer" onclick="ShowTab('#Admin', '#AdminBtn')">
                                <span class="inline-block mr-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                        fill="currentColor">
                                        <path
                                            d="M17,11c0.34,0,0.67,0.04,1,0.09V6.27L10.5,3L3,6.27v4.91c0,4.54,3.2,8.79,7.5,9.82c0.55-0.13,1.08-0.32,1.6-0.55 C11.41,19.47,11,18.28,11,17C11,13.69,13.69,11,17,11z" />
                                        <path
                                            d="M17,13c-2.21,0-4,1.79-4,4c0,2.21,1.79,4,4,4s4-1.79,4-4C21,14.79,19.21,13,17,13z M17,14.38c0.62,0,1.12,0.51,1.12,1.12 s-0.51,1.12-1.12,1.12s-1.12-0.51-1.12-1.12S16.38,14.38,17,14.38z M17,19.75c-0.93,0-1.74-0.46-2.24-1.17 c0.05-0.72,1.51-1.08,2.24-1.08s2.19,0.36,2.24,1.08C18.74,19.29,17.93,19.75,17,19.75z" />
                                    </svg> </span>
                                <span><?php echo $st->administrator ?></span>
                                <span class="inline-block ml-auto">
                                    <svg class="text-gray-400 w-3 h-3" viewbox="0 0 10 6" fill="none"
                                        xmlns="http://www.w3.org/2000/svg"></svg></span>
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
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
                                <span class="inline-block mr-4">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        xmlns="http://www.w3.org/2000/svg" id="todarksvg">
                                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z"
                                            fill="currentColor" />
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                                            fill="currentColor" />
                                    </svg>
                                    <svg style="color: white;display:none" width="18" height="18" viewBox="0 0 24 24"
                                        fill="none" id="tolightsvg" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z"
                                            fill="white"></path>
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4V8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16V20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z"
                                            fill="white"></path>
                                    </svg>
                                </span>
                            </a>
                            <a id="logout" style="cursor: pointer;margin-top:11px" onclick="Logout()">
                                <span class="inline-block mr-4">
                                    <svg class="text-gray-600 w-5 h-5" viewbox="0 0 14 18" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M0.333618 8.99996C0.333618 9.22097 0.421416 9.43293 0.577696 9.58922C0.733976 9.7455 0.945938 9.83329 1.16695 9.83329H7.49195L5.57528 11.7416C5.49718 11.8191 5.43518 11.9113 5.39287 12.0128C5.35057 12.1144 5.32879 12.2233 5.32879 12.3333C5.32879 12.4433 5.35057 12.5522 5.39287 12.6538C5.43518 12.7553 5.49718 12.8475 5.57528 12.925C5.65275 13.0031 5.74492 13.0651 5.84647 13.1074C5.94802 13.1497 6.05694 13.1715 6.16695 13.1715C6.27696 13.1715 6.38588 13.1497 6.48743 13.1074C6.58898 13.0651 6.68115 13.0031 6.75862 12.925L10.0919 9.59163C10.1678 9.51237 10.2273 9.41892 10.2669 9.31663C10.3503 9.11374 10.3503 8.88618 10.2669 8.68329C10.2273 8.581 10.1678 8.48755 10.0919 8.40829L6.75862 5.07496C6.68092 4.99726 6.58868 4.93563 6.48716 4.89358C6.38564 4.85153 6.27683 4.82988 6.16695 4.82988C6.05707 4.82988 5.94826 4.85153 5.84674 4.89358C5.74522 4.93563 5.65298 4.99726 5.57528 5.07496C5.49759 5.15266 5.43595 5.2449 5.3939 5.34642C5.35185 5.44794 5.33021 5.55674 5.33021 5.66663C5.33021 5.77651 5.35185 5.88532 5.3939 5.98683C5.43595 6.08835 5.49759 6.18059 5.57528 6.25829L7.49195 8.16663H1.16695C0.945938 8.16663 0.733976 8.25442 0.577696 8.4107C0.421416 8.56698 0.333618 8.77895 0.333618 8.99996ZM11.1669 0.666626H2.83362C2.17058 0.666626 1.53469 0.930018 1.06585 1.39886C0.59701 1.8677 0.333618 2.50358 0.333618 3.16663V5.66663C0.333618 5.88764 0.421416 6.0996 0.577696 6.25588C0.733976 6.41216 0.945938 6.49996 1.16695 6.49996C1.38797 6.49996 1.59993 6.41216 1.75621 6.25588C1.91249 6.0996 2.00028 5.88764 2.00028 5.66663V3.16663C2.00028 2.94561 2.08808 2.73365 2.24436 2.57737C2.40064 2.42109 2.6126 2.33329 2.83362 2.33329H11.1669C11.388 2.33329 11.5999 2.42109 11.7562 2.57737C11.9125 2.73365 12.0003 2.94561 12.0003 3.16663V14.8333C12.0003 15.0543 11.9125 15.2663 11.7562 15.4225C11.5999 15.5788 11.388 15.6666 11.1669 15.6666H2.83362C2.6126 15.6666 2.40064 15.5788 2.24436 15.4225C2.08808 15.2663 2.00028 15.0543 2.00028 14.8333V12.3333C2.00028 12.1123 1.91249 11.9003 1.75621 11.744C1.59993 11.5878 1.38797 11.5 1.16695 11.5C0.945938 11.5 0.733976 11.5878 0.577696 11.744C0.421416 11.9003 0.333618 12.1123 0.333618 12.3333V14.8333C0.333618 15.4963 0.59701 16.1322 1.06585 16.6011C1.53469 17.0699 2.17058 17.3333 2.83362 17.3333H11.1669C11.83 17.3333 12.4659 17.0699 12.9347 16.6011C13.4036 16.1322 13.6669 15.4963 13.6669 14.8333V3.16663C13.6669 2.50358 13.4036 1.8677 12.9347 1.39886C12.4659 0.930018 11.83 0.666626 11.1669 0.666626Z"
                                            fill="currentColor"></path>
                                    </svg></span>
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
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                                            <path fill-rule="evenodd"
                                                d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"
                                                fill="#382CDD"></path>
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->live; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->now; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="livedriver">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"
                                            fill="currentColor" class="bi bi-clock" viewBox="0 0 16 16">
                                            <path
                                                d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                                            <path
                                                d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                                        </svg>
                                    </span><span><span id="livedriverdt"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-steering-wheel" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <circle cx="12" cy="12" r="9" />
                                            <circle cx="12" cy="12" r="2" />
                                            <line x1="12" y1="14" x2="12" y2="21" />
                                            <line x1="10" y1="12" x2="3.25" y2="10" />
                                            <line x1="14" y1="12" x2="20.75" y2="10" />
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->drivers; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alldriver">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg width="18" height="10" viewbox="0 0 18 10" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M16.5 5.83333C16.3906 5.83339 16.2822 5.81188 16.181 5.77002C16.0799 5.72817 15.988 5.66678 15.9106 5.58939C15.8332 5.512 15.7719 5.42011 15.73 5.31897C15.6881 5.21784 15.6666 5.10945 15.6667 5V2.84505L10.4225 8.08916C10.3452 8.16656 10.2533 8.22796 10.1522 8.26985C10.0511 8.31175 9.94277 8.33331 9.83333 8.33331C9.7239 8.33331 9.61554 8.31175 9.51445 8.26985C9.41335 8.22796 9.3215 8.16656 9.24414 8.08916L6.50002 5.34505L2.08919 9.75583C1.93245 9.90975 1.72127 9.99555 1.50159 9.99456C1.28191 9.99356 1.07151 9.90586 0.91617 9.75052C0.760831 9.59518 0.673123 9.38478 0.672128 9.1651C0.671133 8.94542 0.756932 8.73424 0.910858 8.5775L5.91086 3.5775C5.98822 3.5001 6.08007 3.4387 6.18116 3.39681C6.28226 3.35492 6.39062 3.33335 6.50005 3.33335C6.60948 3.33335 6.71784 3.35492 6.81893 3.39681C6.92003 3.4387 7.01188 3.5001 7.08924 3.5775L9.83336 6.32161L14.4883 1.66666H12.3334C12.1123 1.66666 11.9004 1.57887 11.7441 1.42259C11.5878 1.2663 11.5 1.05434 11.5 0.833329C11.5 0.612315 11.5878 0.400352 11.7441 0.244073C11.9004 0.0877924 12.1123 -4.76837e-06 12.3334 -4.76837e-06H16.5C16.6095 -6.67572e-05 16.7179 0.0214453 16.819 0.063302C16.9201 0.105159 17.012 0.166539 17.0894 0.243935C17.1668 0.321329 17.2282 0.413218 17.2701 0.514352C17.3119 0.615484 17.3334 0.723876 17.3334 0.833329V5C17.3334 5.10945 17.3119 5.21784 17.2701 5.31897C17.2282 5.42011 17.1668 5.512 17.0894 5.58939C17.012 5.66678 16.9201 5.72817 16.819 5.77002C16.7179 5.81188 16.6095 5.83339 16.5 5.83333Z"
                                                fill="#17BB84"></path>
                                        </svg></span><span><span id="newdriver"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                                            <path
                                                d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                                                fill="#382CDD"></path>
                                        </svg></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alljob">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg width="18" height="10" viewbox="0 0 18 10" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M16.5 5.83333C16.3906 5.83339 16.2822 5.81188 16.181 5.77002C16.0799 5.72817 15.988 5.66678 15.9106 5.58939C15.8332 5.512 15.7719 5.42011 15.73 5.31897C15.6881 5.21784 15.6666 5.10945 15.6667 5V2.84505L10.4225 8.08916C10.3452 8.16656 10.2533 8.22796 10.1522 8.26985C10.0511 8.31175 9.94277 8.33331 9.83333 8.33331C9.7239 8.33331 9.61554 8.31175 9.51445 8.26985C9.41335 8.22796 9.3215 8.16656 9.24414 8.08916L6.50002 5.34505L2.08919 9.75583C1.93245 9.90975 1.72127 9.99555 1.50159 9.99456C1.28191 9.99356 1.07151 9.90586 0.91617 9.75052C0.760831 9.59518 0.673123 9.38478 0.672128 9.1651C0.671133 8.94542 0.756932 8.73424 0.910858 8.5775L5.91086 3.5775C5.98822 3.5001 6.08007 3.4387 6.18116 3.39681C6.28226 3.35492 6.39062 3.33335 6.50005 3.33335C6.60948 3.33335 6.71784 3.35492 6.81893 3.39681C6.92003 3.4387 7.01188 3.5001 7.08924 3.5775L9.83336 6.32161L14.4883 1.66666H12.3334C12.1123 1.66666 11.9004 1.57887 11.7441 1.42259C11.5878 1.2663 11.5 1.05434 11.5 0.833329C11.5 0.612315 11.5878 0.400352 11.7441 0.244073C11.9004 0.0877924 12.1123 -4.76837e-06 12.3334 -4.76837e-06H16.5C16.6095 -6.67572e-05 16.7179 0.0214453 16.819 0.063302C16.9201 0.105159 17.012 0.166539 17.0894 0.243935C17.1668 0.321329 17.2282 0.413218 17.2701 0.514352C17.3119 0.615484 17.3334 0.723876 17.3334 0.833329V5C17.3334 5.10945 17.3119 5.21784 17.2701 5.31897C17.2282 5.42011 17.1668 5.512 17.0894 5.58939C17.012 5.66678 16.9201 5.72817 16.819 5.77002C16.7179 5.81188 16.6095 5.83339 16.5 5.83333Z"
                                                fill="#17BB84"></path>
                                        </svg></span><span><span id="newjob"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="feather feather-map-pin">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                    </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->distance; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="alldistance">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg width="18" height="10" viewbox="0 0 18 10" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M16.5 5.83333C16.3906 5.83339 16.2822 5.81188 16.181 5.77002C16.0799 5.72817 15.988 5.66678 15.9106 5.58939C15.8332 5.512 15.7719 5.42011 15.73 5.31897C15.6881 5.21784 15.6666 5.10945 15.6667 5V2.84505L10.4225 8.08916C10.3452 8.16656 10.2533 8.22796 10.1522 8.26985C10.0511 8.31175 9.94277 8.33331 9.83333 8.33331C9.7239 8.33331 9.61554 8.31175 9.51445 8.26985C9.41335 8.22796 9.3215 8.16656 9.24414 8.08916L6.50002 5.34505L2.08919 9.75583C1.93245 9.90975 1.72127 9.99555 1.50159 9.99456C1.28191 9.99356 1.07151 9.90586 0.91617 9.75052C0.760831 9.59518 0.673123 9.38478 0.672128 9.1651C0.671133 8.94542 0.756932 8.73424 0.910858 8.5775L5.91086 3.5775C5.98822 3.5001 6.08007 3.4387 6.18116 3.39681C6.28226 3.35492 6.39062 3.33335 6.50005 3.33335C6.60948 3.33335 6.71784 3.35492 6.81893 3.39681C6.92003 3.4387 7.01188 3.5001 7.08924 3.5775L9.83336 6.32161L14.4883 1.66666H12.3334C12.1123 1.66666 11.9004 1.57887 11.7441 1.42259C11.5878 1.2663 11.5 1.05434 11.5 0.833329C11.5 0.612315 11.5878 0.400352 11.7441 0.244073C11.9004 0.0877924 12.1123 -4.76837e-06 12.3334 -4.76837e-06H16.5C16.6095 -6.67572e-05 16.7179 0.0214453 16.819 0.063302C16.9201 0.105159 17.012 0.166539 17.0894 0.243935C17.1668 0.321329 17.2282 0.413218 17.2701 0.514352C17.3119 0.615484 17.3334 0.723876 17.3334 0.833329V5C17.3334 5.10945 17.3119 5.21784 17.2701 5.31897C17.2282 5.42011 17.1668 5.512 17.0894 5.58939C17.012 5.66678 16.9201 5.72817 16.819 5.77002C16.7179 5.81188 16.6095 5.83339 16.5 5.83333Z"
                                                fill="#17BB84"></path>
                                        </svg></span><span><span id="newdistance"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                                            <path
                                                d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9H5.5zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518l.087.02z" />
                                            <path
                                                d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                            <path
                                                d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" />
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="allprofit">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg width="18" height="10" viewbox="0 0 18 10" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M16.5 5.83333C16.3906 5.83339 16.2822 5.81188 16.181 5.77002C16.0799 5.72817 15.988 5.66678 15.9106 5.58939C15.8332 5.512 15.7719 5.42011 15.73 5.31897C15.6881 5.21784 15.6666 5.10945 15.6667 5V2.84505L10.4225 8.08916C10.3452 8.16656 10.2533 8.22796 10.1522 8.26985C10.0511 8.31175 9.94277 8.33331 9.83333 8.33331C9.7239 8.33331 9.61554 8.31175 9.51445 8.26985C9.41335 8.22796 9.3215 8.16656 9.24414 8.08916L6.50002 5.34505L2.08919 9.75583C1.93245 9.90975 1.72127 9.99555 1.50159 9.99456C1.28191 9.99356 1.07151 9.90586 0.91617 9.75052C0.760831 9.59518 0.673123 9.38478 0.672128 9.1651C0.671133 8.94542 0.756932 8.73424 0.910858 8.5775L5.91086 3.5775C5.98822 3.5001 6.08007 3.4387 6.18116 3.39681C6.28226 3.35492 6.39062 3.33335 6.50005 3.33335C6.60948 3.33335 6.71784 3.35492 6.81893 3.39681C6.92003 3.4387 7.01188 3.5001 7.08924 3.5775L9.83336 6.32161L14.4883 1.66666H12.3334C12.1123 1.66666 11.9004 1.57887 11.7441 1.42259C11.5878 1.2663 11.5 1.05434 11.5 0.833329C11.5 0.612315 11.5878 0.400352 11.7441 0.244073C11.9004 0.0877924 12.1123 -4.76837e-06 12.3334 -4.76837e-06H16.5C16.6095 -6.67572e-05 16.7179 0.0214453 16.819 0.063302C16.9201 0.105159 17.012 0.166539 17.0894 0.243935C17.1668 0.321329 17.2282 0.413218 17.2701 0.514352C17.3119 0.615484 17.3334 0.723876 17.3334 0.833329V5C17.3334 5.10945 17.3119 5.21784 17.2701 5.31897C17.2282 5.42011 17.1668 5.512 17.0894 5.58939C17.012 5.66678 16.9201 5.72817 16.819 5.77002C16.7179 5.81188 16.6095 5.83339 16.5 5.83333Z"
                                                fill="#17BB84"></path>
                                        </svg></span><span><span id="newprofit"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard mb-6">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD;position:relative;top:4px" version="1.1" id="fuel"
                                            xmlns="http://www.w3.org/2000/svg" width="15" height="15"
                                            viewBox="0 0 18 18">
                                            <path
                                                d="M13,6L13,6v5.5c0,0.2761-0.2239,0.5-0.5,0.5S12,11.7761,12,11.5v-2C12,8.6716,11.3284,8,10.5,8H9V2c0-0.5523-0.4477-1-1-1H2 C1.4477,1,1,1.4477,1,2v11c0,0.5523,0.4477,1,1,1h6c0.5523,0,1-0.4477,1-1V9h1.5C10.7761,9,11,9.2239,11,9.5v2 c0,0.8284,0.6716,1.5,1.5,1.5s1.5-0.6716,1.5-1.5V5c0-0.5523-0.4477-1-1-1l0,0V2.49C12.9946,2.2178,12.7723,1.9999,12.5,2 c-0.2816,0.0047-0.5062,0.2367-0.5015,0.5184C11.9987,2.5289,11.9992,2.5395,12,2.55V5C12,5.5523,12.4477,6,13,6s1-0.4477,1-1 s-0.4477-1-1-1 M8,6.5C8,6.7761,7.7761,7,7.5,7h-5C2.2239,7,2,6.7761,2,6.5v-3C2,3.2239,2.2239,3,2.5,3h5C7.7761,3,8,3.2239,8,3.5 V6.5z"
                                                fill="#382CDD"></path>
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->fuel; ?></h3><span
                                        onclick="$('#statsTimeRange').fadeIn();"
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full"><?php echo $st->all; ?></span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="allfuel">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg width="18" height="10" viewbox="0 0 18 10" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M16.5 5.83333C16.3906 5.83339 16.2822 5.81188 16.181 5.77002C16.0799 5.72817 15.988 5.66678 15.9106 5.58939C15.8332 5.512 15.7719 5.42011 15.73 5.31897C15.6881 5.21784 15.6666 5.10945 15.6667 5V2.84505L10.4225 8.08916C10.3452 8.16656 10.2533 8.22796 10.1522 8.26985C10.0511 8.31175 9.94277 8.33331 9.83333 8.33331C9.7239 8.33331 9.61554 8.31175 9.51445 8.26985C9.41335 8.22796 9.3215 8.16656 9.24414 8.08916L6.50002 5.34505L2.08919 9.75583C1.93245 9.90975 1.72127 9.99555 1.50159 9.99456C1.28191 9.99356 1.07151 9.90586 0.91617 9.75052C0.760831 9.59518 0.673123 9.38478 0.672128 9.1651C0.671133 8.94542 0.756932 8.73424 0.910858 8.5775L5.91086 3.5775C5.98822 3.5001 6.08007 3.4387 6.18116 3.39681C6.28226 3.35492 6.39062 3.33335 6.50005 3.33335C6.60948 3.33335 6.71784 3.35492 6.81893 3.39681C6.92003 3.4387 7.01188 3.5001 7.08924 3.5775L9.83336 6.32161L14.4883 1.66666H12.3334C12.1123 1.66666 11.9004 1.57887 11.7441 1.42259C11.5878 1.2663 11.5 1.05434 11.5 0.833329C11.5 0.612315 11.5878 0.400352 11.7441 0.244073C11.9004 0.0877924 12.1123 -4.76837e-06 12.3334 -4.76837e-06H16.5C16.6095 -6.67572e-05 16.7179 0.0214453 16.819 0.063302C16.9201 0.105159 17.012 0.166539 17.0894 0.243935C17.1668 0.321329 17.2282 0.413218 17.2701 0.514352C17.3119 0.615484 17.3334 0.723876 17.3334 0.833329V5C17.3334 5.10945 17.3119 5.21784 17.2701 5.31897C17.2282 5.42011 17.1668 5.512 17.0894 5.58939C17.012 5.66678 16.9201 5.72817 16.819 5.77002C16.7179 5.81188 16.6095 5.83339 16.5 5.83333Z"
                                                fill="#17BB84"></path>
                                        </svg></span><span><span id="newfuel"></span></span></span>
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
                        <span style="position:relative;top:3px;left:3px">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" style="color: #382CDD"
                                viewBox="0 0 24 24" fill="none">
                                <path fill="#382CDD" fill-rule="evenodd"
                                    d="M15.586 3a2 2 0 0 1 2.828 0L21 5.586a2 2 0 0 1 0 2.828L19.414 10 14 4.586 15.586 3zm-3 3-9 9A2 2 0 0 0 3 16.414V19a2 2 0 0 0 2 2h2.586A2 2 0 0 0 9 20.414l9-9L12.586 6z"
                                    clip-rule="evenodd" />
                            </svg> </span></a>
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
        <div class="px-4 mx-auto" style="padding:50px;padding-top:0;">
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->assign_roles; ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;padding:20px">
                    <div class="mb-6">
                        <?php echo $st->assign_roles_note; ?>
                        <br>
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->member_name; ?></label>
                        <input id="memberroleid" style="width:200px;display:inline"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded search-name"
                            name="field-name" rows="5" placeholder=""></input>
                        <button type="button" id="fetchRolesBtn"
                            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                            onclick="GetMemberRoles()"><?php echo $st->fetch_existing_roles; ?></button>
                    </div>
                    <span id="memberrolename" style="font-size:30px"></span>
                    <div class="mb-6" id="rolelist">

                    </div>

                    <button type="button" id="updateMemberRolesBtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="UpdateMemberRoles()"><?php echo $st->update; ?></button>
                </div>
            </div>
            <br>
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->update_member_points; ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <label class="block text-sm font-medium mb-2" for=""
                            style="display:inline"><?php echo $st->user_id; ?></label>
                        <input id="memberpntid" style="width:200px;display:inline"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
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
            <div class="py-8 px-6 mx-auto lg:ml-80 pt-4 bg-white shadow rounded">
                <div class="flex px-6 pb-4 border-b">
                    <h3 class="text-xl font-bold"><?php echo $st->dismiss; ?></h3>
                </div>
                <div class="p-4 overflow-x-auto" style="display: block;">
                    <div class="mb-6">
                        <p style="color:red"><?php echo $st->dismiss_note; ?></p>
                        <br>
                        <label class="block text-sm font-medium mb-2" for=""><?php echo $st->user_id; ?></label>
                        <input id="dismissUserID" style="width:200px"
                            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                            name="field-name" rows="5" placeholder=""></input>
                    </div>

                    <p><span id="memberdismissname" style="font-size:20px"></span></p>

                    <button type="button" id="dismissbtn"
                        class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                        onclick="DismissUser()"><?php echo $st->dismiss; ?></button>
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
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 576 512" width="18" height="18">
                                            <path fill="#382CDD"
                                                d="M576 136c0 22.09-17.91 40-40 40c-.248 0-.4551-.1266-.7031-.1305l-50.52 277.9C482 468.9 468.8 480 453.3 480H122.7c-15.46 0-28.72-11.06-31.48-26.27L40.71 175.9C40.46 175.9 40.25 176 39.1 176c-22.09 0-40-17.91-40-40S17.91 96 39.1 96s40 17.91 40 40c0 8.998-3.521 16.89-8.537 23.57l89.63 71.7c15.91 12.73 39.5 7.544 48.61-10.68l57.6-115.2C255.1 98.34 247.1 86.34 247.1 72C247.1 49.91 265.9 32 288 32s39.1 17.91 39.1 40c0 14.34-7.963 26.34-19.3 33.4l57.6 115.2c9.111 18.22 32.71 23.4 48.61 10.68l89.63-71.7C499.5 152.9 496 144.1 496 136C496 113.9 513.9 96 536 96S576 113.9 576 136z" />
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->driver_of_the_day; ?></h3>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="dotd" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><span id="dotddistance"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                                            <path
                                                d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                                                fill="#382CDD"></path>
                                        </svg></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="dalljob" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><span id="dtotdistance">-</span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                                            <path
                                                d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                                                fill="#382CDD"></path>
                                        </svg></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">24h</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="dprofit" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><?php echo $vtcname ?></span></span>
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
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 576 512" width="18" height="18">
                                            <path fill="#382CDD"
                                                d="M576 136c0 22.09-17.91 40-40 40c-.248 0-.4551-.1266-.7031-.1305l-50.52 277.9C482 468.9 468.8 480 453.3 480H122.7c-15.46 0-28.72-11.06-31.48-26.27L40.71 175.9C40.46 175.9 40.25 176 39.1 176c-22.09 0-40-17.91-40-40S17.91 96 39.1 96s40 17.91 40 40c0 8.998-3.521 16.89-8.537 23.57l89.63 71.7c15.91 12.73 39.5 7.544 48.61-10.68l57.6-115.2C255.1 98.34 247.1 86.34 247.1 72C247.1 49.91 265.9 32 288 32s39.1 17.91 39.1 40c0 14.34-7.963 26.34-19.3 33.4l57.6 115.2c9.111 18.22 32.71 23.4 48.61 10.68l89.63-71.7C499.5 152.9 496 144.1 496 136C496 113.9 513.9 96 536 96S576 113.9 576 136z" />
                                        </svg> </span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->driver_of_the_week; ?></h3>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="dotw" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><span id="dotwdistance"></span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                                            <path
                                                d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                                                fill="#382CDD"></path>
                                        </svg></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->delivered; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="walljob" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><span id="wtotdistance">-</span></span></span>
                            </div>
                        </div>
                        <div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="flex mb-2"><span class="inline-block mr-2">
                                        <svg style="color: #382CDD" xmlns="http://www.w3.org/2000/svg" width="18"
                                            height="18" fill="currentColor" class="bi bi-truck" viewBox="0 0 16 16">
                                            <path
                                                d="M0 3.5A1.5 1.5 0 0 1 1.5 2h9A1.5 1.5 0 0 1 12 3.5V5h1.02a1.5 1.5 0 0 1 1.17.563l1.481 1.85a1.5 1.5 0 0 1 .329.938V10.5a1.5 1.5 0 0 1-1.5 1.5H14a2 2 0 1 1-4 0H5a2 2 0 1 1-3.998-.085A1.5 1.5 0 0 1 0 10.5v-7zm1.294 7.456A1.999 1.999 0 0 1 4.732 11h5.536a2.01 2.01 0 0 1 .732-.732V3.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .294.456zM12 10a2 2 0 0 1 1.732 1h.768a.5.5 0 0 0 .5-.5V8.35a.5.5 0 0 0-.11-.312l-1.48-1.85A.5.5 0 0 0 13.02 6H12v4zm-9 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm9 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"
                                                fill="#382CDD"></path>
                                        </svg></span>
                                    <h3 class="text-sm text-gray-600"><?php echo $st->profit; ?></h3><span
                                        class="inline-block ml-auto px-2 py-1 text-xs text-gray-500 rounded-full">7d</span>
                                </div>
                                <h2 class="mb-2 text-3xl font-bold" id="wprofit" style="font-size:22px">-</h2>
                                <span class="text-xs text-green-500"><span class="inline-block mr-2">
                                        <svg style="position:relative;top:4px" xmlns="http://www.w3.org/2000/svg"
                                            class="icon icon-tabler icon-tabler-road-sign" width="18" height="18"
                                            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none"
                                            stroke-linecap="round" stroke-linejoin="round">
                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                            <path
                                                d="M10.5 20.4l-6.9 -6.9c-.781 -.781 -.781 -2.219 0 -3l6.9 -6.9c.781 -.781 2.219 -.781 3 0l6.9 6.9c.781 .781 .781 2.219 0 3l-6.9 6.9c-.781 .781 -2.219 .781 -3 0z" />
                                            <path d="M9 14v-2c0 -.59 .414 -1 1 -1h5" />
                                            <path d="M13 9l2 2l-2 2" />
                                        </svg>
                                    </span><span><?php echo $vtcname ?></span></span>
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
                                <input id="attendeeId" class="inputDefault inputInner" name="field-name" rows="5"
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
                    <label class="block text-sm font-medium mb-2" for="">Program will reload automatically after
                        config is updated, which might take up to 5 minutes.</label>
                    <label class="block text-sm font-medium mb-2" for="" style="color:red">Warning: Misconfiguration
                        may lead to API failing to start or function not working properly!</label>
                    <br>
                    <div>
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
                    <hr><br>
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
    <section id="footer">
        <div class="py-8 px-6 mx-auto lg:ml-80 pt-4">
            <div style="margin:0.5em;margin-top:auto;text-align:center" style="padding-bottom:10px">
                &copy 2022 <a href="https://charlws.com" target="_blank">CharlesWithC</a>
                <a href="https://drivershub.charlws.com" target="_blank">(CHub)</a>
                &nbsp;|&nbsp;
                <a href="https://discord.gg/wNTaaBZ5qd" target="_blank">Discord</a>
                &nbsp;|&nbsp;
                <a href="https://wiki.charlws.com/" target="_blank">Wiki</a>
                <br>
                <a href="/api" target="_blank">API</a>: <span id="apiversion">v?.?.?</span> <a href="https://drivershub.charlws.com/changelog" target="_blank">Changelog</a>
                &nbsp;|&nbsp;
                Web: v1.5.3 <a href="/changelog" target="_blank">Changelog</a>
                <br>
                Map: <a href="https://map.charlws.com" target="_blank">map.charlws.com</a>
                &nbsp;|&nbsp;
                <?php if($status != "") echo 'Status: <a href="https://'.$status.'/" target="_blank">'.$status.'</a>'; ?>
            </div>
        </div>
    </section>
</body>

</html>