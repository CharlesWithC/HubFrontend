function DiscordSignIn(){
    window.location.href = api_host + "/" + dhabbr + "/auth/discord/redirect";
}

function SteamSignIn(){
    window.location.href = api_host + "/" + dhabbr + "/auth/steam/redirect";
}

function SteamValidate() {
    $("#auth-message-title").html("Account Connection");
    $("#auth-message-content").html("Validating steam login ...");
    ShowTab("#auth-message-tab");
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/steam",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "callback": sPageURL
        }),
        success: function (data) {
            $("#auth-message-content").html(mltr("steam_account_updated"));
            toastNotification("success", "Success", mltr("steam_account_updated"), 5000);
            setTimeout(function () {
                ShowTab("#settings-tab");
            }, 1000);
        },
        error: function (data) {
            $("#auth-message-content").html("Error: Invalid login");
            AjaxError(data);
        }
    });
}

function AuthValidate() {
    $("#auth-message-title").html("OAuth");
    $("#auth-message-content").html("Validating login ...");
    ShowTab("#auth-message-tab");

    message = getUrlParameter("message");
    if (message) {
        $("#auth-message-content").html("Error: " + message.replaceAll("+", " "));
        return toastNotification("error", "Error", message.replaceAll("+", " "), 5000);
    }

    token = getUrlParameter("token");
    mfa = getUrlParameter("mfa");

    if(mfa){
        mfafunc = OAuthMFA;
        localStorage.setItem("tipt", token);
        return ShowTab("#mfa-tab");
    }

    if (token) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token",
            type: "PATCH",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                newtoken = data.token;
                localStorage.setItem("token", newtoken);
                authorizationHeader = {"Authorization": "Bearer " + newtoken};
                ValidateToken();
                $(".tabs").removeClass("loaded");
                $("#auth-message-content").html(mltr("welcome_back"));
                toastNotification("success", "Success", mltr("welcome_back"), 5000);
                setTimeout(function () {
                    ShowTab("#overview-tab");
                }, 1000);
            },
            error: function (data) {
                $("#auth-message-content").html(ParseAjaxError(data));
                AjaxError(data);
            }
        });
    } else {
        ShowTab("#overview-tab", "#button-overview-tab");
    }
}

function OAuthMFA() {
    token = localStorage.getItem("tipt");
    if(token == null) return ShowTab("#overview-tab", "#button-overview-tab");

    otp = $("#mfa-otp").val();
    
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "POST",
        contentType: "application/json", processData: false,
        data: JSON.stringify({
            token: token,
            otp: otp
        }),
        success: function (data) {
            token = data.token;
            localStorage.setItem("token", token);
            authorizationHeader = {"Authorization": "Bearer " + token};
            localStorage.removeItem("tipt");
            ValidateToken();
            $(".tabs").removeClass("loaded");
            $("#auth-message-content").html(mltr("welcome_back"));
            toastNotification("success", "Success", mltr("welcome_back"), 5000);
            setTimeout(function () {
                ShowTab("#overview-tab");
            }, 1000);
        },
        error: function (data) {
            ShowTab("#signin-tab");
            AjaxError(data);
        }
    });
}

function UpdateTruckersMPID() {
    LockBtn("#button-settings-update-truckersmpid", mltr("updating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/truckersmp",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "truckersmpid": $("#settings-user-truckersmpid").val()
        }),
        success: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            toastNotification("success", "Success", mltr("truckersmp_account_updated"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            return AjaxError(data);
        }
    });
}

function UpdateSteamID() {
    window.location.href = api_host + "/" + dhabbr + "/auth/steam/redirect?connect_account=true";
}

var CaptchaCallback = function (hcaptcha_response) {
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/password",
        type: "POST",
        contentType: "application/json", processData: false,
        data: JSON.stringify({
            email: email,
            password: password,
            "h-captcha-response": hcaptcha_response
        }),
        success: function (data) {
            hcaptcha.reset();
            requireCaptcha = false;
            token = data.token;
            mfa = data.mfa;
            if (mfa) {
                localStorage.setItem("tip", token);
                localStorage.setItem("pending-mfa", +new Date());
                ShowTab("#mfa-tab");
            } else {
                localStorage.setItem("token", token);
                authorizationHeader = {"Authorization": "Bearer " + token};
                ValidateToken();
                $(".tabs").removeClass("loaded");
                toastNotification("success", "Success", mltr("welcome_back"), 5000);
                setTimeout(function () {
                    ShowTab("#overview-tab");
                }, 1000);
            }
        },
        error: function (data) {
            hcaptcha.reset();
            requireCaptcha = false;
            AjaxError(data);
            ShowTab("#signin-tab");
        }
    });
}

function ShowCaptcha() {
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    if (email == "" || password == "") {
        return toastNotification("warning", "", mltr("enter_email_and_password"), 3000, false);
    }
    LockBtn("#button-signin", `<span class="rect-20"><i class="fa-solid fa-right-to-bracket"></i></span> Logging in`);
    requireCaptcha = true;
    setTimeout(function () {
        UnlockBtn("#button-signin");
        setTimeout(function () {
            ShowTab("#captcha-tab");
        }, 500);
    }, 1000);
}

mfato = -1;

function MFAVerify() {
    otp = $("#mfa-otp").val();
    if (!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", mltr("invalid_otp"), 5000);
    LockBtn("#button-mfa-verify", mltr("verifying"));
    clearInterval(mfato);
    mfato = setTimeout(function () {
        // remove otp cache after 75 seconds (2.5 rounds)
        if (!$("#mfa-tab").is(":visible")) {
            $("#mfa-otp").val("");
        }
    }, 75000);
    if (mfafunc != null) return mfafunc();
    token = localStorage.getItem("tip");
    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        data: JSON.stringify({
            token: token,
            otp: otp
        }),
        success: function (data) {
            UnlockBtn("#button-mfa-verify");
            newtoken = data.token;
            localStorage.setItem("token", newtoken);
            authorizationHeader = {"Authorization": "Bearer " + newtoken};
            localStorage.removeItem("tip");
            localStorage.removeItem("pending-mfa");
            $(".tabs").removeClass("loaded");
            ValidateToken();
            toastNotification("success", "Success", mltr("welcome_back"), 5000);
            setTimeout(function () {
                ShowTab("#overview-tab");
            }, 1000);
        },
        error: function (data) {
            UnlockBtn("#button-mfa-verify");
            AjaxError(data);
        }
    });
}