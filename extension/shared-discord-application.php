<?php
    $referer = $_SERVER['HTTP_REFERER'];
    $request_uri = $_SERVER['REQUEST_URI'];
    $parsed_url = parse_url($request_uri);
    $query_string = '';
    if(isset($parsed_url['query'])) {
        $query_string = $parsed_url['query'];
    }

    if(str_starts_with($query_string, "domain=")){
        // redirect to discord
        parse_str($query_string, $query_params);
        $domain = $query_params["domain"];
        setcookie('domain', $domain, time() + 86400, '/');
        header('Location: https://discord.com/api/oauth2/authorize?client_id=1120997206938361877&redirect_uri=https%3A%2F%2Fshared-discord-application.chub.page%2Fdiscord-auth&response_type=code&scope=identify%20email%20role_connections.write');
    } else if($referer != "" && isset($_COOKIE['domain'])){
        // redirect to drivers hub
        $domain = $_COOKIE['domain'];
        header('Location: https://'.$domain.'/discord-auth?'.$query_string);
    } else {
        header('Location: https://drivershub.charlws.com/');
    }
?>