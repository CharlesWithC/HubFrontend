function UpdateBio() {
    LockBtn("#button-settings-bio-save", mltr("saving"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/bio",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": simplemde["#settings-bio"].value()
        },
        success: function (data) {
            UnlockBtn("#button-settings-bio-save");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", mltr("about_me_saved"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-settings-bio-save");
            AjaxError(data);
        }
    });
}

function ResetApplicationToken(firstop = false) {
    LockBtn("#button-settings-reset-application-token", mltr("resetting"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = ResetApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-reset-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp,
            },
            success: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(data.response.token);
                $("#settings-application-token-p").hide();
                $("#settings-application-token").show();
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.response.token}")`);
                $("#button-application-token-copy").show();
                toastNotification("success", "Success", mltr("application_token_reset"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = ResetApplicationToken;
                    setTimeout(function(){UnlockBtn("#button-settings-reset-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-reset-application-token");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    }
    else{
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html(data.response.token);
                $("#settings-application-token-p").hide();
                $("#settings-application-token").show();
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.response.token}")`);
                toastNotification("success", "Success", mltr("application_token_reset"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                AjaxError(data);
            }
        });
    }
}

function DisableApplicationToken(firstop = false) {
    LockBtn("#button-settings-disable-application-token", mltr("disabling"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisableApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-disable-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html("Disabled");
                toastNotification("success", "Success", mltr("application_token_disabled"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = DisableApplicationToken;
                    setTimeout(function(){UnlockBtn("#button-settings-disable-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-disable-application-token");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html("Disabled");
                toastNotification("success", "Success", mltr("application_token_disabled"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                AjaxError(data);
            }
        });
    }
}

function UpdatePassword(firstop = false) {
    LockBtn("#button-settings-password-update", mltr("updating"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = UpdatePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-update");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                "password": $("#settings-password").val(),
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                $("#settings-password").val("");
                toastNotification("success", "Success", mltr("password_updated"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = UpdatePassword;
                    setTimeout(function(){UnlockBtn("#button-settings-password-update");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-password-update");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                "password": $("#settings-password").val()
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
                if (data.error) return AjaxError(data);
                $("#settings-password").val("");
                toastNotification("success", "Success", mltr("password_updated"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-update");
                AjaxError(data);
            }
        });
    }
}

function DisablePassword(firstop = false) {
    LockBtn("#button-settings-password-disable", mltr("disabling"));

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisablePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-disable");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: {
                otp: otp
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                if(firstop && data.status == 400){
                    // failed due to auto try, then do mfa
                    mfafunc = DisablePassword;
                    setTimeout(function(){UnlockBtn("#button-settings-password-disable");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
                    return;
                }
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    } else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
            }
        });
    }
}

function DisableMFAShow(){
    modalid = ShowModal(mltr('disable_mfa'), mltr('disable_mfa_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-disable-mfa" type="button" class="btn btn-danger" onclick="DisableMFA();">${mltr('disable')}</button>`);
    InitModal("disable_mfa", modalid);
}

function DisableMFA(){
    otp = $("#mfa-otp").val();
    
    if(otp.length != 6){
        mfafunc = DisableMFA;
        LockBtn("#button-staff-disable-mfa", mltr("disabling"));
        setTimeout(function(){UnlockBtn("#button-staff-disable-mfa");DestroyModal("disable_mfa");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
        return;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
            if (data.error) return AjaxError(data);
            $("#button-settings-mfa-disable").hide();
            $("#button-settings-mfa-enable").show();
            mfaenabled = false;
            toastNotification("success", "Success", mltr("mfa_disabled"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
}

mfasecret = "";
function EnableMFAShow(){
    mfasecret = RandomB32String(16);
    modalid = ShowModal(mltr('enable_mfa'), `<p>${mltr('enable_mfa_note')}</p><p>${mltr('secret')}: <b>${mfasecret}</b></p>
    <label for="mfa-enable-otp" class="form-label">OTP</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="mfa-enable-otp" placeholder="000 000">
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-enable-mfa" type="button" class="btn btn-primary" onclick="EnableMFA();">${mltr('enable')}</button>`);
    InitModal("enable_mfa", modalid);
}

function EnableMFA(){
    otp = $("#mfa-enable-otp").val();
    if(!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", mltr("invalid_otp"), 5000);
        
    LockBtn("#button-enable-mfa", mltr("enabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            secret: mfasecret,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-enable-mfa");
            if (data.error) AjaxError(data);
            $("#button-settings-mfa-disable").show();
            $("#button-settings-mfa-enable").hide();
            mfaenabled = true;
            DestroyModal("enable_mfa");
            toastNotification("success", "Success", mltr("mfa_enabled"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            AjaxError(data);
        }
    });
}

function UserResignShow(){
    modalid = ShowModal(mltr('leave_company'), mltr('leave_company_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-user-resign" type="button" class="btn btn-primary" onclick="UserResign();">${mltr('resign')}</button>`);
    InitModal("user_resign", modalid);
}

function UserResign() {
    LockBtn("#button-user-resign", mltr("resigning"));

    otp = $("#mfa-otp").val();
    if(mfaenabled){
        if(otp.length != 6){
            mfafunc = UserResign;
            setTimeout(function(){UnlockBtn("#button-user-resign");DestroyModal("user_resign");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/resign",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
            if (data.error) return AjaxError(data);
            modalid = ShowModal(mltr('you_have_left_the_company'), mltr('you_have_left_the_company_note'));
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
}

function LoadNotificationSettings(){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/settings",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#notifications-drivershub").removeAttr("disabled");
            $("#notifications-discord").removeAttr("disabled");
            $("#notifications-login").removeAttr("disabled");
            $("#notifications-dlog").removeAttr("disabled");
            $("#notifications-member").removeAttr("disabled");
            $("#notifications-application").removeAttr("disabled");
            $("#notifications-challenge").removeAttr("disabled");
            $("#notifications-division").removeAttr("disabled");
            $("#notifications-event").removeAttr("disabled");

            $("#notifications-drivershub").prop("checked", data.response.drivershub);
            $("#notifications-discord").prop("checked", data.response.discord);
            $("#notifications-login").prop("checked", data.response.login);
            $("#notifications-dlog").prop("checked", data.response.dlog);
            $("#notifications-member").prop("checked", data.response.member);
            $("#notifications-application").prop("checked", data.response.application);
            $("#notifications-challenge").prop("checked", data.response.challenge);
            $("#notifications-division").prop("checked", data.response.division);
            $("#notifications-event").prop("checked", data.response.event);
        }
    })
}

function EnableNotification(item, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/" + item + "/enable",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", name + " notification enabled!", 5000);
        }, error: function (data){
            AjaxError(data);
        }
    })
}

function DisableNotification(item, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/" + item + "/disable",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", name + " notification disabled!", 5000);
        }, error: function (data){
            AjaxError(data);
        }
    })
}

user_session_placeholder_row = `
<tr>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`

function LoadUserSessions(noplaceholder = false) {
    if(!noplaceholder){
        $("#table_session_data").empty();
        for(var i = 0 ; i < 10 ; i ++){
            $("#table_session_data").append(user_session_placeholder_row);
        }    
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/list?page_size=50",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#table_session_data").empty();
            sessions = data.response.list;
            for (var i = 0; i < sessions.length; i++) {
                if (sha256(localStorage.getItem("token")) != sessions[i].hash)
                    opbtn = `<button id="button-revoke-token-${sessions[i].hash}" type="button" class="btn btn-sm btn-danger" onclick="RevokeToken('${sessions[i].hash}')">Revoke</button>`;
                else opbtn = `(Current)`;

                $("#table_session_data").append(`<tr>
                    <td>${sessions[i].ip}</td>
                    <td>${sessions[i].country}</td>
                    <td>${getDateTime(sessions[i].create_timestamp * 1000)}</td>
                    <td>${timeAgo(new Date(sessions[i].last_used_timestamp * 1000))}</td>
                    <td>${opbtn}</td>
                </tr>`);
            }
        }
    })
}

function RevokeToken(hsh) {
    if ($("#button-revoke-token-" + hsh).html() == "Revoke") {
        $("#button-revoke-token-" + hsh).html("Confirm?");
        return;
    }

    LockBtn("#button-revoke-token-" + hsh, mltr("revoking"))

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/hash",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "hash": hsh
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            LoadUserSessions(noplaceholder = true);
            toastNotification("success", "Success", mltr("token_revoked"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

bannedUserList = {};

user_placeholder_row = `
<tr>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadUserList(noplaceholder = false) {
    InitPaginate("#table_pending_user_list", "LoadUserList();");
    page = parseInt($("#table_pending_user_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    if(!noplaceholder){
        $("#table_pending_user_list_data").children().remove();
        for (i = 0; i < 15; i++) {
            $("#table_pending_user_list_data").append(user_placeholder_row);
        }
    }

    name = $("#input-user-search").val();
    LockBtn("#button-user-list-search", "...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/list?page=" + page + "&page_size=15&name=" + name,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-user-list-search");
            if (data.error) return AjaxError(data);

            userList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                bantxt = "Ban";
                bantxt2 = "";
                color = "";
                if (user.ban.is_banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUserList[user.discordid] = user.ban.reason;

                userop = "";
                if(userPerm.includes("hrm") || userPerm.includes("admin")){
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.discordid}')">Show Details</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.discordid}', '${user.name}')">Accept As Member</a></li>
                            <li><a class="dropdown-item clickable" onclick="UpdateDiscordShow('${user.discordid}', '${user.name}')">Update Discord ID</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DisableUserMFAShow('${discordid}', '${name}')">Disable MFA</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${discordid}', '${name}')">Delete Connections</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="${bantxt}Show('${user.discordid}', '${user.name}')">${bantxt}</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteUserShow('${user.discordid}', '${user.name}')">Delete</a></li>
                        </ul>
                    </div>`;
                } else if(userPerm.includes("hr")){
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.discordid}')">Show Details</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.discordid}', '${user.name}')">Accept As Member</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red">${bantxt}</a></li>
                        </ul>
                    </div>`;
                }

                data.push([`<span style='color:${color}'>${GetAvatar(user.userid, user.name, user.discordid, user.avatar)} ${bantxt2}</span>`, `<span style='color:${color}'>${user.discordid}</span>`, userop]);
            }

            PushTable("#table_pending_user_list", data, total_pages, "LoadUserList();");
        },
        error: function (data) {
            UnlockBtn("#button-user-list-search");
            AjaxError(data);
        }
    })
}

function ShowUserDetail(discordid) {
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            
            d = data.response.user;
            info = "";
            info += GenTableRow(mltr("name"), d.name);
            info += GenTableRow(mltr("email"), d.email);
            info += GenTableRow(mltr("discord"), discordid);
            info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            if (Object.keys(bannedUserList).indexOf(discordid) != -1) {
                info += GenTableRow(mltr("ban_reason"), bannedUserList[discordid]);
            }
                
            modalid = ShowModal(d.name, `<table>${info}</table>`);
            InitModal("user_detail", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function AcceptAsMemberShow(discordid, name){
    modalid = ShowModal(mltr('accept_as_member'), `<p>${mltr('accept_as_member_note_1')}</p><p><i>${name} (>${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('accept_as_member_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-accept-as-member" type="button" class="btn btn-primary" onclick="AcceptAsMember('${discordid}');">${mltr('accept')}</button>`);
    InitModal("accept_as_member", modalid);
}

function AcceptAsMember(discordid) {
    LockBtn("#button-accept-as-member", mltr("accepting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/member",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-accept-as-member");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_accepted_as_member_user_id_") + data.response.userid, 5000, false);
            DestroyModal("accept_as_member");
        },
        error: function (data) {
            UnlockBtn("#button-accept-as-member");
            AjaxError(data);
        }
    })
}

function UpdateDiscordShow(discordid, name){
    modalid = ShowModal(mltr('update_discord_id'), `<p>${mltr('update_discord_id_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><label for="new-discord-id" class="form-label">${mltr('new_discord_id')}</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="new-discord-id" placeholder="">
    </div><br><p>${mltr('update_discord_id_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-update-discord" type="button" class="btn btn-primary" onclick="UpdateDiscord('${discordid}');">${mltr('update')}</button>`);
    InitModal("update_discord", modalid);
}

function UpdateDiscord(old_discord_id) {
    LockBtn("#button-update-discord", mltr("updating"));

    new_discord_id = $("#new-discord-id").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/discord",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            old_discord_id: old_discord_id,
            new_discord_id: new_discord_id
        },
        success: function (data) {
            UnlockBtn("#button-update-discord");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("users_discord_id_has_been_updated"), 5000, false);
            DestroyModal("update_discord");
        },
        error: function (data) {
            UnlockBtn("#button-update-discord");
            AjaxError(data);
        }
    })
}

function DisableUserMFAShow(discordid, name){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid="+discordid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data)
            mfa = data.response.user.mfa;
            if(!mfa){
                return toastNotification("error", "Error", mltr("user_hasnt_enabled_mfa"), 5000);
            }
            modalid = ShowModal(mltr('disable_mfa'), `<p>${mltr('disable_mfa_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('disable_mfa_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-staff-disable-mfa" type="button" class="btn btn-danger" onclick="StaffDisableMFA('${discordid}');">${mltr('disable')}</button>`);
            InitModal("disable_mfa", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function StaffDisableMFA(discordid) {
    LockBtn("#button-staff-disable-mfa", mltr("disabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/auth/mfa?discordid="+discordid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("users_mfa_disabled"), 5000, false);
            DestroyModal("disable_mfa");
        },
        error: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            AjaxError(data);
        }
    })
}

function DeleteConnectionsShow(discordid, name){
    modalid = ShowModal(mltr('delete_connections'), `<p>${mltr('delete_connections_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('delete_connections_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-connections" type="button" class="btn btn-primary" onclick="DeleteConnections('${discordid}');">${mltr('delete')}</button>`);
    InitModal("account_connections", modalid);
}

function DeleteConnections(discordid) {
    LockBtn("#button-delete-connections", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/connections",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-delete-connections");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("users_account_connections_unbound"), 5000, false);
            DestroyModal("account_connections");
        },
        error: function (data) {
            UnlockBtn("#button-delete-connections");
            AjaxError(data);
        }
    })
}

function BanShow(discordid, name){
    modalid = ShowModal(mltr('ban_user'), `<p>${mltr('ban_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('ban_user_note_2')}</p><br><label for="new-discord-id" class="form-label">${mltr('ban_until')}</label>
    <div class="input-group mb-3">
        <input type="date" class="form-control bg-dark text-white" id="ban-until">
    </div>
    <label for="ban-reason" class="form-label">${mltr('reason')}</label>
    <div class="input-group mb-3" style="height:calc(100% - 160px)">
        <textarea type="text" class="form-control bg-dark text-white" id="ban-reason" placeholder="" rows="3"></textarea>
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-ban-user" type="button" class="btn btn-danger" onclick="BanUser('${discordid}');">${mltr('ban')}</button>`);
    InitModal("ban_user", modalid);
}

function BanUser(discordid) {
    LockBtn("#button-ban-user", mltr("banning"));

    expire = -1;
    if ($("#ban-until").val() != "")
        expire = +new Date($("#ban-until").val()) / 1000;
    reason = $("#ban-reason").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/ban",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid,
            expire: expire,
            reason: reason
        },
        success: function (data) {
            UnlockBtn("#button-ban-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_banned"), 5000, false);
            DestroyModal("ban_user");
        },
        error: function (data) {
            UnlockBtn("#button-ban-user");
            AjaxError(data);
        }
    })
}

function UnbanShow(discordid, name){
    modalid = ShowModal(mltr('unban_user'), `<p>${mltr('unban_user_note')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-unban-user" type="button" class="btn btn-success" onclick="UnbanUser('${discordid}');">${mltr('unban')}</button>`);
    InitModal("unban_user", modalid);
}

function UnbanUser(discordid) {
    LockBtn("#button-unban-user", mltr("unbanning"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/ban",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-unban-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_unbanned"), 5000, false);
            DestroyModal("unban_user");
        },
        error: function (data) {
            UnlockBtn("#button-unban-user");
            AjaxError(data);
        }
    })
}

function DeleteUserShow(discordid, name){
    modalid = ShowModal(mltr('delete_user'), `<p>${mltr('delete_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><p>${mltr('delete_user_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-user" type="button" class="btn btn-danger" onclick="DeleteUser('${discordid}');">${mltr('delete')}</button>`);
    InitModal("delete_user", modalid);
}

function DeleteUser(discordid) {
    LockBtn("#button-delete-user", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user?discordid="+discordid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", mltr("user_deleted"), 5000, false);
            DestroyModal("delete_user");
        },
        error: function (data) {
            UnlockBtn("#button-delete-user");
            AjaxError(data);
        }
    })
}

function DeleteAccountShow(){
    modalid = ShowModal(mltr('delete_account'), mltr('delete_account_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-account" type="button" class="btn btn-danger" onclick="DeleteAccount();">${mltr('delete')}</button>`);
    InitModal("delete_account", modalid);
}

function DeleteAccount(discordid) {
    LockBtn("#button-delete-account", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-account");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("account_deleted_goodbye"), 5000, false);
            Logout();
            DestroyModal("delete_account");
        },
        error: function (data) {
            UnlockBtn("#button-delete-account");
            AjaxError(data);
        }
    })
}

function LoadNotification(){
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            d = data.response.list;
            $("#notification-dropdown").children().remove();
            for(i = 0 ; i < d.length ; i++){
                style="";
                if(d[i].read) style="color:grey"
                $("#notification-dropdown").append(`
                <div>
                    <p style="margin-bottom:0px;${style}">${marked.parse(d[i].content).replaceAll("\n","<br>").replaceAll("<p>","").replaceAll("</p>","").slice(0,-1)}</p>
                    <p class="text-muted" style="margin-bottom:5px">${timeAgo(new Date(d[i].timestamp*1000))}</p>
                </div>`);
            }
        }
    });

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?status=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            cnt = data.response.total_items;
            if(cnt > 0 && cnt <= 99){
                $("#notification-pop").show();
                $("#unread-notification").html(cnt);
            } else if (cnt >= 100){
                $("#notification-pop").show();
                $("#unread-notification").html("99+");
            }
        }
    });
}

notification_placerholder_row = `
<tr>
    <td style="width:calc(100% - 180px);"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadNotificationList(noplaceholder = false){
    InitPaginate("#table_notification_list", "LoadNotificationList();");
    page = parseInt($("#table_notification_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if(!noplaceholder){
        $("#table_notification_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_notification_list_data").append(notification_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?page_size=30&page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) return AjaxError(data);
            
            notificationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < notificationList.length; i++) {
                notification = notificationList[i];

                data.push([`${marked.parse(notification.content).replaceAll("\n","<br>").replaceAll("<p>","").replaceAll("</p>","").slice(0,-1)}`, timeAgo(new Date(notification.timestamp * 1000))]);
            }

            PushTable("#table_notification_list", data, total_pages, "LoadNotificationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function NotificationsMarkAllAsRead(){
    if($("#unread-notification").html()=="") return;
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/status?notificationids=all",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "read": "true"
        },
        success: function (data) {
            $("#notification-pop").hide();
            $("#unread-notification").html("");
        }
    });
}