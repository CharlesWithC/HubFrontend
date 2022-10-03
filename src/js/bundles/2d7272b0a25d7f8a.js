function LoginValidate() {
    token = localStorage.getItem("token");
    if (token == undefined) {
        return;
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error == false) {
                localStorage.setItem("token", token);
                if (data.response.truckersmpid > 0 && data.response.steamid > 0) {
                    window.location.href = "/";
                } else {
                    window.location.href = "/auth?token=" + token;
                }
            }
        }
    });
}

function SteamValidate() {
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
            if (data.error == false) {
                window.location.href = "/";
            } else {
                $("#msg").html(data.descriptor);
                $("#steamauth").show();
            }
        },
        error: function (data) {
            $("#msg").html(data.descriptor);
            $("#steamauth").show();
        }
    });
}

function ShowCaptcha() {
    email = $("#email").val();
    password = $("#password").val();
    if (email == "" || password == "") {
        return toastFactory("warning", "", "Enter email and password.", 3000, false);
    }
    $('#captcha').fadeIn();
}

function AuthValidate() {
    message = getUrlParameter("message");
    if (message) {
        $("#title").html("Error");
        $("#msg").html(message.replaceAll("+", " "));
        $("#msg").show();
        $("#loginbtn").show();
        return;
    }
    token = getUrlParameter("token");
    mfa = getUrlParameter("mfa");
    if(mfa){
        setTimeout(function(){
            otp = prompt("Please enter OTP for MFA:");
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
                    if (data.error == false) {
                        newtoken = data.response.token;
                        localStorage.setItem("token", newtoken);
                        window.location.href = "/auth";
                    } else {
                        $("#msg").html("Invalid token, please retry.");
                        $("#loginbtn").show();
                    }
                },
                error: function (data) {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            });
        }, 500);
        return;
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
                if (data.error == false) {
                    newtoken = data.response.token;
                    localStorage.setItem("token", newtoken);
                    window.location.href = "/auth";
                } else {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            },
            error: function (data) {
                $("#msg").html("Invalid token, please retry.");
                $("#loginbtn").show();
            }
        });
    } else {
        token = localStorage.getItem("token");
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error == false) {
                    if (data.response.truckersmpid > 0 && data.response.steamid > 0) {
                        window.location.href = "/";
                        $("#msg").html("You are being redirected to Drivers Hub.");
                    } else if (data.response.steamid <= 0) {
                        $("#title").html("Steam Connection<br>");
                        $("#title").css("font-size", "1.5em");
                        $("#msg").html(
                            "Connect to steam account to: <br><br> - Auto-connect TruckersMP account <br> - Auto-join Navio company"
                        );
                        $("#connect_steam").show();
                    } else if (data.response.truckersmpid <= 0) {
                        $("#title").html("TruckersMP Connection");
                        $("#title").css("font-size", "1.5em");
                        $("#msg").html(
                            "Enter TruckersMP User ID <br> (We'll check if it's connected to your Steam account)"
                        );
                        $("#connect_truckersmp").show();
                    }
                } else {
                    $("#msg").html("Invalid token, please retry.");
                    $("#loginbtn").show();
                }
            },
            error: function (data) {
                $("#msg").html("Invalid token, please retry.");
                $("#loginbtn").show();
            }
        });
    }
}

function TMPBind() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/truckersmp",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "truckersmpid": $("#truckersmpid").val()
        },
        success: function (data) {
            if (data.error == false) {
                $("#title").html("TruckersMP Connected");
                $("#msg").html("You are being redirected to Drivers Hub.");
                window.location.href = "/";
            } else {
                return toastFactory("error", "Error:", data.descriptor, 5000, false);
            }
        },
        error: function (data) {
            return toastFactory("error", "Error:", data.descriptor, 5000, false);
        }
    });
}