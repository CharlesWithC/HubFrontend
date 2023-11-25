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
        header('Location: https://www.patreon.com/oauth2/authorize?response_type=code&client_id=ob3CNQE8aSknRulY0Yvr_hDfwJHirclH_noqB_Hxhjd8W2FZ-9MwZJvNVFlZfPsV&redirect_uri=https://oauth.chub.page/patreon-auth&scope=users%20pledges-to-me');
    } else if($referer != "" && isset($_COOKIE['domain'])){
        // redirect to drivers hub
        $domain = $_COOKIE['domain'];
        header('Location: https://'.$domain.'/auth/patreon/callback?'.$query_string);
    } else {
        header('Location: https://drivershub.charlws.com/');
    }
?>