function DiscordSignIn(){
    window.location.href = apidomain + "/" + vtcprefix + "/auth/discord/redirect";
}

function SteamSignIn(){
    window.location.href = apidomain + "/" + vtcprefix + "/auth/steam/redirect";
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
        url: apidomain + "/" + vtcprefix + "/user/steam",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "callback": sPageURL
        },
        success: function (data) {
            if (data.error){
                $("#auth-message-content").html("Error: Invalid login");
                return AjaxError(data);
            }
            $("#auth-message-content").html("Steam account updated!");
            toastNotification("success", "Success", "Steam account updated!", 5000);
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
            url: apidomain + "/" + vtcprefix + "/token",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if(data.error){
                    $("#auth-message-content").html(ParseAjaxError(data));
                    return AjaxError(data);
                }
                newtoken = data.response.token;
                localStorage.setItem("token", newtoken);
                ValidateToken();
                $(".tabs").removeClass("loaded");
                $("#auth-message-content").html("Welcome back!");
                toastNotification("success", "Success", "Welcome back!", 5000);
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
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
        type: "POST",
        dataType: "json",
        data: {
            token: token,
            otp: otp
        },
        success: function (data) {
            if(data.error){
                ShowTab("#signin-tab");
                return AjaxError(data);
            }
            token = data.response.token;
            localStorage.setItem("token", token);
            localStorage.removeItem("tipt");
            ValidateToken();
            $(".tabs").removeClass("loaded");
            $("#auth-message-content").html("Welcome back!");
            toastNotification("success", "Success", "Welcome back!", 5000);
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
    LockBtn("#button-settings-update-truckersmpid", "Updating...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/truckersmp",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "truckersmpid": $("#settings-user-truckersmpid").val()
        },
        success: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "TruckersMP account updated!", 5000);
        },
        error: function (data) {
            UnlockBtn("#button-settings-update-truckersmpid");
            return AjaxError(data);
        }
    });
}

function UpdateSteamID() {
    window.location.href = apidomain + "/" + vtcprefix + "/auth/steam/redirect?connect_account=true";
}

var CaptchaCallback = function (hcaptcha_response) {
    email = $("#signin-email").val();
    password = $("#signin-password").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/password",
        type: "POST",
        dataType: "json",
        data: {
            email: email,
            password: password,
            "h-captcha-response": hcaptcha_response
        },
        success: function (data) {
            hcaptcha.reset();
            requireCaptcha = false;
            if (!data.error) {
                token = data.response.token;
                mfa = data.response.mfa;
                if (mfa) {
                    localStorage.setItem("tip", token);
                    localStorage.setItem("pending-mfa", +new Date());
                    ShowTab("#mfa-tab");
                } else {
                    localStorage.setItem("token", token);
                    ValidateToken();
                    $(".tabs").removeClass("loaded");
                    toastNotification("success", "Success", "Welcome back!", 5000);
                    setTimeout(function () {
                        ShowTab("#overview-tab");
                    }, 1000);
                }
            } else {
                AjaxError(data);
                ShowTab("#signin-tab");
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
        return toastNotification("warning", "", "Enter email and password.", 3000, false);
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
        return toastNotification("error", "Error", "Invalid OTP!", 5000);
    LockBtn("#button-mfa-verify", "Verifying...");
    mfato = setTimeout(function () {
        // remove otp cache after 75 seconds (2.5 rounds)
        if (!$("#mfa-tab").is(":visible")) {
            $("#mfa-otp").val("");
        }
    }, 75000);
    if (mfafunc != null) return mfafunc();
    token = localStorage.getItem("tip");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            token: token,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-mfa-verify");
            if (data.error == true) AjaxError(data);
            newtoken = data.response.token;
            localStorage.setItem("token", newtoken);
            localStorage.removeItem("tip");
            localStorage.removeItem("pending-mfa");
            $(".tabs").removeClass("loaded");
            ValidateToken();
            toastNotification("success", "Success", "Welcome back!", 5000);
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