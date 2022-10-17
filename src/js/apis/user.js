function UpdateBio() {
    LockBtn("#button-settings-bio-save", "Saving...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/bio",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": $("#settings-bio").val()
        },
        success: function (data) {
            UnlockBtn("#button-settings-bio-save");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", "About Me saved!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-settings-bio-save");
            AjaxError(data);
        }
    });
}

function ResetApplicationToken(firstop = false) {
    LockBtn("#button-settings-reset-application-token", "Resetting...");

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = ResetApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-reset-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: apidomain + "/" + vtcprefix + "/token/application",
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
                toastNotification("success", "Success", "Application Token reset!", 5000, false);
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
            url: apidomain + "/" + vtcprefix + "/token/application",
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
                toastNotification("success", "Success", "Application Token reset!", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-reset-application-token");
                AjaxError(data);
            }
        });
    }
}

function DisableApplicationToken(firstop = false) {
    LockBtn("#button-settings-disable-application-token", "Disabling...");

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisableApplicationToken;
            setTimeout(function(){UnlockBtn("#button-settings-disable-application-token");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }

        $.ajax({
            url: apidomain + "/" + vtcprefix + "/token/application",
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
                toastNotification("success", "Success", "Application Token disabled!", 5000, false);
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
            url: apidomain + "/" + vtcprefix + "/token/application",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                if (data.error) return AjaxError(data);
                $("#settings-application-token").html("Disabled");
                toastNotification("success", "Success", "Application Token disabled!", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-disable-application-token");
                AjaxError(data);
            }
        });
    }
}

function UpdatePassword(firstop = false) {
    LockBtn("#button-settings-password-update", "Updating...");

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = UpdatePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-update");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user/password",
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
                toastNotification("success", "Success", "Password updated!", 5000, false);
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
            url: apidomain + "/" + vtcprefix + "/user/password",
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
                toastNotification("success", "Success", "Password updated!", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-update");
                AjaxError(data);
            }
        });
    }
}

function DisablePassword(firstop = false) {
    LockBtn("#button-settings-password-disable", "Disabling...");

    if(mfaenabled){
        otp = $("#mfa-otp").val();

        if(otp.length != 6){
            mfafunc = DisablePassword;
            setTimeout(function(){UnlockBtn("#button-settings-password-disable");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user/password",
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
                toastNotification("success", "Success", "Password disabled!", 5000, false);
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
            url: apidomain + "/" + vtcprefix + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "Password disabled!", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
            }
        });
    }
}

function DisableMFAShow(){
    modalid = ShowModal(`Disable MFA`, `<p>Are you sure you want to disable MFA?</p><p>You will be able to login or enter sudo mode without MFA. This can put your account at risk.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-disable-mfa" type="button" class="btn btn-danger" onclick="DisableMFA();">Disable</button>`);
    InitModal("disable_mfa", modalid);
}

function DisableMFA(){
    otp = $("#mfa-otp").val();
    
    if(otp.length != 6){
        mfafunc = DisableMFA;
        LockBtn("#button-staff-disable-mfa", "Disabling...");
        setTimeout(function(){UnlockBtn("#button-staff-disable-mfa");DestroyModal("disable_mfa");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
        return;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
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
            toastNotification("success", "Success", "MFA disabled!", 5000, false);
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
    modalid = ShowModal(`Enable MFA`, `<p>Please download a MFA application that supports TOTP like Authy, Google Authenticator. Type in the secret in the app and enter the generated TOTP in the input box.</p><p>Secret: <b>${mfasecret}</b></p>
    <label for="mfa-enable-otp" class="form-label">OTP</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="mfa-enable-otp" placeholder="000 000">
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-enable-mfa" type="button" class="btn btn-primary" onclick="EnableMFA();">Enable</button>`);
    InitModal("enable_mfa", modalid);
}

function EnableMFA(){
    otp = $("#mfa-enable-otp").val();
    if(!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", "Invalid OTP!", 5000);
        
    LockBtn("#button-enable-mfa", "Enabling...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
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
            toastNotification("success", "Success", "MFA Enabled.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            AjaxError(data);
        }
    });
}

function UserResignShow(){
    modalid = ShowModal(`Leave Company`, `<p>Are you sure you want to leave the company?</p><p>Your delivery log will be erased and you will be removed from Navio company. This <b>cannot</b> be undone.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-user-resign" type="button" class="btn btn-primary" onclick="UserResign();">Resign</button>`);
    InitModal("user_resign", modalid);
}

function UserResign() {
    LockBtn("#button-user-resign", "Resigning...");

    otp = $("#mfa-otp").val();
    if(mfaenabled){
        if(otp.length != 6){
            mfafunc = UserResign;
            setTimeout(function(){UnlockBtn("#button-user-resign");DestroyModal("user_resign");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
            return;
        }
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/resign",
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
            modalid = ShowModal(`You have left the company`, `<p>You have successfully resigned from the company. We are sad to see you leave. We wish you the best in your future career!</p>`);
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
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
        url: apidomain + "/" + vtcprefix + "/token/all",
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
                    <td>${getDateTime(sessions[i].timestamp * 1000)}</td>
                    <td>${getDateTime((parseInt(sessions[i].timestamp) + 86400 * 7) * 1000)}</td>
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

    LockBtn("#button-revoke-token-" + hsh, "Revoking...")

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/hash",
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
            toastNotification("success", "Success", "Token revoked!", 5000, false);
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
        url: apidomain + "/" + vtcprefix + "/user/list?page=" + page + "&page_size=15&name=" + name,
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
                if (user.ban.is_banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUserList[user.discordid] = user.ban.ban_reason;

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
        url: apidomain + "/" + vtcprefix + "/user?discordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            
            d = data.response;
            info = "";
            info += GenTableRow("Name", d.name);
            info += GenTableRow("Email", d.email);
            info += GenTableRow("Discord", discordid);
            info += GenTableRow("TruckersMP", `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            info += GenTableRow("Steam", `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            if (Object.keys(bannedUserList).indexOf(discordid) != -1) {
                info += GenTableRow("Ban Reason", bannedUserList[discordid]);
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
    modalid = ShowModal(`Accept As Member`, `<p>Are you sure you want to accept this user as member?</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><p>They will be automatically added to Navio company and receive a Direct Message in Discord from Drivers Hub Bot regarding that they have been accepted.`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-accept-as-member" type="button" class="btn btn-primary" onclick="AcceptAsMember('${discordid}');">Accept</button>`);
    InitModal("accept_as_member", modalid);
}

function AcceptAsMember(discordid) {
    LockBtn("#button-accept-as-member", "Accepting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member",
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
            toastNotification("success", "Success", "User accepted as member. User ID: " + data.response.userid, 5000, false);
            DestroyModal("accept_as_member");
        },
        error: function (data) {
            UnlockBtn("#button-accept-as-member");
            AjaxError(data);
        }
    })
}

function UpdateDiscordShow(discordid, name){
    modalid = ShowModal(`Update Discord ID`, `<p>You are updating Discord ID for:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><label for="new-discord-id" class="form-label">New Discord ID</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="new-discord-id" placeholder="997847494933368923">
    </div><br><p>A new account in Drivers Hub will be created with new Discord account and data will be migrated automatically. The old account will be deleted. The user will have to login with new Discord account.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-update-discord" type="button" class="btn btn-primary" onclick="UpdateDiscord('${discordid}');">Update</button>`);
    InitModal("update_discord", modalid);
}

function UpdateDiscord(old_discord_id) {
    LockBtn("#button-update-discord", "Updating...");

    new_discord_id = $("#new-discord-id").val();

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/discord",
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
            toastNotification("success", "Success", "User's Discord ID has been updated!", 5000, false);
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
        url: apidomain + "/" + vtcprefix + "/user?discordid="+discordid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data)
            mfa = data.response.mfa;
            if(!mfa){
                return toastNotification("error", "Error", "User hasn't enabled MFA!", 5000);
            }
            modalid = ShowModal(`Disable MFA`, `<p>Are you sure you want to disable MFA for:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><p>They will be able to login or enter sudo mode without MFA. This can put their account at risk. Do not disable MFA for a user who didn't request it.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-staff-disable-mfa" type="button" class="btn btn-danger" onclick="StaffDisableMFA('${discordid}');">Disable</button>`);
            InitModal("disable_mfa", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function StaffDisableMFA(discordid) {
    LockBtn("#button-staff-disable-mfa", "Disabling...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa?discordid="+discordid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User's MFA disabled!", 5000, false);
            DestroyModal("disable_mfa");
        },
        error: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            AjaxError(data);
        }
    })
}

function DeleteConnectionsShow(discordid, name){
    modalid = ShowModal(`Delete Connections`, `<p>Are you sure you want to delete account connections for:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><p>Their Steam and TruckersMP connection will be removed and can be bound to another account. They will no longer be able to login with Steam. Discord connection will not be affected.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-delete-connections" type="button" class="btn btn-primary" onclick="DeleteConnections('${discordid}');">Delete</button>`);
    InitModal("account_connections", modalid);
}

function DeleteConnections(discordid) {
    LockBtn("#button-delete-connections", "Deleting...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/connections",
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
            toastNotification("success", "Success", "User's account connections unbound!", 5000, false);
            DestroyModal("account_connections");
        },
        error: function (data) {
            UnlockBtn("#button-delete-connections");
            AjaxError(data);
        }
    })
}

function BanShow(discordid, name){
    modalid = ShowModal(`Ban User`, `<p>Are you sure you want to ban this user:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><p>They will not be allowed to login. Their existing data will not be affected.</p><br><label for="new-discord-id" class="form-label">Ban Until</label>
    <div class="input-group mb-3">
        <input type="date" class="form-control bg-dark text-white" id="ban-until">
    </div>
    <label for="ban-reason" class="form-label">Reason</label>
    <div class="input-group mb-3" style="height:calc(100% - 160px)">
        <textarea type="text" class="form-control bg-dark text-white" id="ban-reason" placeholder="Reason for the ban" rows="3"></textarea>
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-ban-user" type="button" class="btn btn-danger" onclick="BanUser('${discordid}');">Ban</button>`);
    InitModal("ban_user", modalid);
}

function BanUser(discordid) {
    LockBtn("#button-ban-user", "Banning...");

    expire = -1;
    if ($("#ban-until").val() != "")
        expire = +new Date($("#ban-until").val()) / 1000;
    reason = $("#ban-reason").val();

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/ban",
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
            toastNotification("success", "Success", "User banned!", 5000, false);
            DestroyModal("ban_user");
        },
        error: function (data) {
            UnlockBtn("#button-ban-user");
            AjaxError(data);
        }
    })
}

function UnbanShow(discordid, name){
    modalid = ShowModal(`Unban User`, `<p>Are you sure you want to unban this user:</p><p><i>${name} (Discord ID: ${discordid})</i></p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-unban-user" type="button" class="btn btn-success" onclick="UnbanUser('${discordid}');">Unban</button>`);
    InitModal("unban_user", modalid);
}

function UnbanUser(discordid) {
    LockBtn("#button-unban-user", "Unbanning...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/unban",
        type: "PUT",
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
            toastNotification("success", "Success", "User unbanned!", 5000, false);
            DestroyModal("unban_user");
        },
        error: function (data) {
            UnlockBtn("#button-unban-user");
            AjaxError(data);
        }
    })
}

function DeleteUserShow(discordid, name){
    modalid = ShowModal(`Delete User`, `<p>Are you sure you want to delete this user:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br>The account will be deleted and their connection with TruckersMP and Steam will be deleted. They will have to login with Discord to register again.`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-delete-user" type="button" class="btn btn-danger" onclick="DeleteUser('${discordid}');">Delete</button>`);
    InitModal("delete_user", modalid);
}

function DeleteUser(discordid) {
    LockBtn("#button-delete-user", "Deleting...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            UnlockBtn("#button-delete-user");
            if (data.error) return AjaxError(data);
            LoadUserList(noplaceholder=true);
            toastNotification("success", "Success", "User deleted!", 5000, false);
            DestroyModal("delete_user");
        },
        error: function (data) {
            UnlockBtn("#button-delete-user");
            AjaxError(data);
        }
    })
}