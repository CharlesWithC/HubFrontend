function UpdateBio() {
    LockBtn("#button-settings-bio-save", mltr("saving"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/bio",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "bio": simplemde["#settings-bio"].value()
        }),
        success: function (data) {
            UnlockBtn("#button-settings-bio-save");
            toastNotification("success", "Success!", mltr("about_me_saved"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-settings-bio-save");
            AjaxError(data);
        }
    });
}

function GenerateApplicationToken(firstop = false) {
    LockBtn("#button-settings-generate-application-token", mltr("working"));

    if (mfaenabled) {
        otp = $("#mfa-otp").val();

        if (otp.length != 6) {
            mfafunc = GenerateApplicationToken;
            setTimeout(function () { UnlockBtn("#button-settings-generate-application-token"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                app_name: $("#application-token-app-name").val(),
                otp: otp,
            }),
            success: function (data) {
                UnlockBtn("#button-settings-generate-application-token");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                $("#settings-application-token").html(data.token);
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.token}")`);
                $("#application-token-new").show();
                toastNotification("success", "Success", mltr("application_token_generated"), 5000, false);
            },
            error: function (data) {
                if (firstop && data.status == 400) {
                    // failed due to auto try, then do mfa
                    mfafunc = GenerateApplicationToken;
                    setTimeout(function () { UnlockBtn("#button-settings-generate-application-token"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
                    return;
                }
                UnlockBtn("#button-settings-generate-application-token");
                AjaxError(data);
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
            }
        });
    }
    else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                app_name: $("#application-token-app-name").val()
            }),
            success: function (data) {
                UnlockBtn("#button-settings-generate-application-token");
                $("#settings-application-token").html(data.token);
                $("#button-application-token-copy").attr("onclick", `CopyButton("#button-application-token-copy", "${data.token}")`);
                $("#application-token-new").show();
                toastNotification("success", "Success", mltr("application_token_generated"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-generate-application-token");
                AjaxError(data);
            }
        });
    }
}

function UpdatePassword(firstop = false) {
    LockBtn("#button-settings-password-update", mltr("updating"));

    if (mfaenabled) {
        otp = $("#mfa-otp").val();

        if (otp.length != 6) {
            mfafunc = UpdatePassword;
            setTimeout(function () { UnlockBtn("#button-settings-password-update"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password",
            type: "PATCH",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                "password": $("#settings-password").val(),
                otp: otp
            }),
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                $("#settings-password").val("");
                toastNotification("success", "Success", mltr("password_updated"), 5000, false);
            },
            error: function (data) {
                if (firstop && data.status == 400) {
                    // failed due to auto try, then do mfa
                    mfafunc = UpdatePassword;
                    setTimeout(function () { UnlockBtn("#button-settings-password-update"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
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
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                "password": $("#settings-password").val()
            }),
            success: function (data) {
                UnlockBtn("#button-settings-password-update");
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

    if (mfaenabled) {
        otp = $("#mfa-otp").val();

        if (otp.length != 6) {
            mfafunc = DisablePassword;
            setTimeout(function () { UnlockBtn("#button-settings-password-disable"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/user/password/disable",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                otp: otp
            }),
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                ShowTab("#user-settings-tab", "from-mfa");
                mfafunc = null;
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                if (firstop && data.status == 400) {
                    // failed due to auto try, then do mfa
                    mfafunc = DisablePassword;
                    setTimeout(function () { UnlockBtn("#button-settings-password-disable"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
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
            url: api_host + "/" + dhabbr + "/user/password/disable",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#button-settings-password-disable");
                toastNotification("success", "Success", mltr("password_login_disabled"), 5000, false);
            },
            error: function (data) {
                UnlockBtn("#button-settings-password-disable");
                AjaxError(data);
            }
        });
    }
}

function DisableMFAShow() {
    modalid = ShowModal(mltr('disable_mfa'), mltr('disable_mfa_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-disable-mfa" type="button" class="btn btn-danger" onclick="DisableMFA();">${mltr('disable')}</button>`);
    InitModal("disable_mfa", modalid);
}

function DisableMFA() {
    otp = $("#mfa-otp").val();

    if (otp.length != 6) {
        mfafunc = DisableMFA;
        LockBtn("#button-staff-disable-mfa", mltr("disabling"));
        setTimeout(function () { UnlockBtn("#button-staff-disable-mfa"); DestroyModal("disable_mfa"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
        return;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa/disable",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            otp: otp
        }),
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
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
function EnableMFAShow() {
    mfasecret = RandomB32String(16);
    modalid = ShowModal(mltr('enable_mfa'), `<p>${mltr('enable_mfa_note')}</p><p>${mltr('secret')}: <b>${mfasecret}</b></p>
    <label for="mfa-enable-otp" class="form-label">${mltr('otp')}</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="mfa-enable-otp" placeholder="000 000">
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-enable-mfa" type="button" class="btn btn-primary" onclick="EnableMFA();">${mltr('enable')}</button>`);
    InitModal("enable_mfa", modalid);
}

function EnableMFA() {
    otp = $("#mfa-enable-otp").val();
    if (!isNumber(otp) || otp.length != 6)
        return toastNotification("error", "Error", mltr("invalid_otp"), 5000);

    LockBtn("#button-enable-mfa", mltr("enabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            secret: mfasecret,
            otp: otp
        }),
        success: function (data) {
            UnlockBtn("#button-enable-mfa");
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

function UserResignShow() {
    modalid = ShowModal(mltr('leave_company'), mltr('leave_company_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-user-resign" type="button" class="btn btn-primary" onclick="UserResign();">${mltr('resign')}</button>`);
    InitModal("user_resign", modalid);
}

function UserResign() {
    LockBtn("#button-user-resign", mltr("resigning"));

    otp = $("#mfa-otp").val();
    if (mfaenabled) {
        if (otp.length != 6) {
            mfafunc = UserResign;
            setTimeout(function () { UnlockBtn("#button-user-resign"); DestroyModal("user_resign"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
            return;
        }
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/resign",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            otp: otp
        }),
        success: function (data) {
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
            modalid = ShowModal(mltr('you_have_left_the_company'), mltr('you_have_left_the_company_note'));
        },
        error: function (data) {
            AjaxError(data);
            ShowTab("#user-settings-tab", "from-mfa");
            mfafunc = null;
        }
    });
}

function LoadNotificationSettings() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/settings",
        type: "GET",
        contentType: "application/json", processData: false,
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

            $("#notifications-drivershub").prop("checked", data.drivershub);
            $("#notifications-discord").prop("checked", data.discord);
            $("#notifications-login").prop("checked", data.login);
            $("#notifications-dlog").prop("checked", data.dlog);
            $("#notifications-member").prop("checked", data.member);
            $("#notifications-application").prop("checked", data.application);
            $("#notifications-challenge").prop("checked", data.challenge);
            $("#notifications-division").prop("checked", data.division);
            $("#notifications-event").prop("checked", data.event);
        }
    });
}

function EnableNotification(item, name) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/settings/" + item + "/enable",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            toastNotification("success", "Success", name + ` ${mltr('notification_enabled')}!`, 5000);
        }, error: function (data) {
            AjaxError(data);
        }
    });
}

function DisableNotification(item, name) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/settings/" + item + "/disable",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            toastNotification("success", "Success", name + ` ${mltr('notification_disabled')}!`, 5000);
        }, error: function (data) {
            AjaxError(data);
        }
    });
}

user_session_placeholder_row = `
<tr>
    <td style="width:40%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:25%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`;

bearerSession = [];
gslWorking = false;
function GetSessionList(page = 1) {
    if (gslWorking) return;
    gslWorking = true;
    $.ajax({
        url: api_host + "/" + dhabbr + "/token/list?page_size=250&page=" + page,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            sessions = data.list;
            for (var i = 0; i < sessions.length; i++) {
                if (sha256(localStorage.getItem("token")) != sessions[i].hash)
                    opbtn = `<button id="button-revoke-token-${sessions[i].hash}" type="button" class="btn btn-sm btn-danger" onclick="RevokeToken('${sessions[i].hash}')">${mltr('revoke')}</button>`;
                else opbtn = `(Current)`;

                browser_icon = ``;
                if (sessions[i].user_agent.indexOf("Chrome") != -1) browser_icon = `<i class="fa-brands fa-chrome"></i>`;
                else if (sessions[i].user_agent.indexOf("Firefox") != -1) browser_icon = `<i class="fa-brands fa-firefox"></i>`;
                else if (sessions[i].user_agent.indexOf("MSIE") != -1) browser_icon = `<i class="fa-brands fa-internet-explorer"></i>`;
                else if (sessions[i].user_agent.indexOf("Edge") != -1) browser_icon = `<i class="fa-brands fa-edge"></i>`;
                else if (sessions[i].user_agent.indexOf("Opera") != -1) browser_icon = `<i class="fa-brands fa-opera"></i>`;
                else if (sessions[i].user_agent.indexOf("Safari") != -1) browser_icon = `<i class="fa-brands fa-safari"></i>`;

                bearerSession.push(`<tr>
                    <td>${browser_icon}</td>
                    <td>${sessions[i].ip}</td>
                    <td>${sessions[i].country}</td>
                    <td>${getDateTime(sessions[i].create_timestamp * 1000)}</td>
                    <td>${timeAgo(new Date(sessions[i].last_used_timestamp * 1000))}</td>
                    <td>${opbtn}</td>
                </tr>`);
            }
            if (parseInt(data.total_pages) > page) {
                GetSessionList(page + 1);
            } else {
                gslWorking = false;
            }
        }
    });
}
appSession = [];
gatlWorking = false;
function GetApplicationTokenList(page = 1) {
    if (gatlWorking) return;
    gatlWorking = true;
    $.ajax({
        url: api_host + "/" + dhabbr + "/token/application/list?page_size=250&page=" + page,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            sessions = data.list;
            for (var i = 0; i < sessions.length; i++) {
                opbtn = `<button id="button-revoke-token-${sessions[i].hash}" type="button" class="btn btn-sm btn-danger" onclick="RevokeApplicationToken('${sessions[i].hash}')">${mltr('revoke')}</button>`;

                browser_icon = `<i class="fa-solid fa-link"></i>`;
                if (sessions[i].app_name.toLowerCase().includes("bot")) browser_icon = `<i class="fa-solid fa-robot"></i>`;

                appSession.push(`<tr>
                    <td>${browser_icon}</td>
                    <td>${sessions[i].app_name}</td>
                    <td><i>Application Token</i></td>
                    <td>${getDateTime(sessions[i].create_timestamp * 1000)}</td>
                    <td>${timeAgo(new Date(sessions[i].last_used_timestamp * 1000))}</td>
                    <td>${opbtn}</td>
                </tr>`);
            }
            if (parseInt(data.total_pages) > page) {
                GetApplicationTokenList(page + 1);
            } else {
                gatlWorking = false;
            }
        }
    });
}

async function LoadUserSessions(noplaceholder = false) {
    if (!noplaceholder) {
        $("#table_session_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_session_data").append(user_session_placeholder_row);
        }
    }

    bearerSession = [];
    appSession = [];

    GetSessionList();
    GetApplicationTokenList();
    while (gslWorking || gatlWorking) await sleep(100);
    $("#table_session_data").empty();
    for (let i = 0; i < bearerSession.length; i++) {
        $("#table_session_data").append(bearerSession[i]);
    }
    for (let i = 0; i < appSession.length; i++) {
        $("#table_session_data").append(appSession[i]);
    }
}

function RevokeToken(hsh) {
    if ($("#button-revoke-token-" + hsh).html() == mltr("revoke")) {
        $("#button-revoke-token-" + hsh).html(mltr("confirm") + "?");
        return;
    }

    LockBtn("#button-revoke-token-" + hsh, mltr("revoking"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/hash",
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "hash": hsh
        }),
        success: function (data) {
            LoadUserSessions(noplaceholder = true);
            toastNotification("success", "Success", mltr("token_revoked"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function RevokeApplicationToken(hsh) {
    if ($("#button-revoke-token-" + hsh).html() == mltr("revoke")) {
        $("#button-revoke-token-" + hsh).html(mltr("confirm") + "?");
        return;
    }

    LockBtn("#button-revoke-token-" + hsh, mltr("revoking"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/token/application",
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "hash": hsh
        }),
        success: function (data) {
            LoadUserSessions(noplaceholder = true);
            toastNotification("success", "Success", mltr("token_revoked"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
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
    page = parseInt($("#table_pending_user_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    if (!noplaceholder) {
        $("#table_pending_user_list_data").children().remove();
        for (i = 0; i < 15; i++) {
            $("#table_pending_user_list_data").append(user_placeholder_row);
        }
    }

    name = $("#input-user-search").val();
    LockBtn("#button-user-list-search", "...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/list?page=" + page + "&page_size=15&query=" + name,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-user-list-search");

            userList = data.list;
            total_pages = data.total_pages;
            data = [];

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                bantxt = mltr("ban");
                banbtntxt = "Ban";
                bantxt2 = "";
                color = "";
                if (user.ban != null) color = "grey", bantxt = mltr("unban"), banbtntxt = "Unban", bantxt2 = "(" + mltr("banned") + ")", bannedUserList[user.discordid] = user.ban.reason;

                userop = "";
                if (userPerm.includes("hrm") || userPerm.includes("admin")) {
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.uid}')">${mltr("show_details")}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.uid}', '${convertQuotation1(user.name)}')">${mltr('accept_as_member')}</a></li>
                            <li><a class="dropdown-item clickable" onclick="UpdateProfile('${user.uid}')">${mltr('refresh_profile')}</a></li>
                            <li><a class="dropdown-item clickable" onclick="UpdateDiscordShow('${user.uid}', '${user.discordid}', '${convertQuotation1(user.name)}')">${mltr('update_discord_id')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DisableUserMFAShow('${user.uid}', '${convertQuotation1(name)}')">${mltr('disable_mfa')}</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${user.uid}', '${convertQuotation1(name)}')">${mltr('delete_connections')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="${banbtntxt}Show('${user.uid}', '${convertQuotation1(user.name)}')">${bantxt}</a></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteUserShow('${user.uid}', '${convertQuotation1(user.name)}')">${mltr('delete')}</a></li>
                        </ul>
                    </div>`;
                } else if (userPerm.includes("hr")) {
                    userop = `<div class="dropdown">
                        <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Manage
                        </a>
                        <ul class="dropdown-menu dropdown-menu-dark">
                            <li><a class="dropdown-item clickable" onclick="ShowUserDetail('${user.uid}')">${mltr("show_details")}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" onclick="AcceptAsMemberShow('${user.uid}', '${convertQuotation1(user.name)}')">${mltr('accept_as_member')}</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item clickable" style="color:red" onclick="${banbtntxt}Show('${user.uid}', '${convertQuotation1(user.name)}')">${bantxt}</a></li>
                        </ul>
                    </div>`;
                }

                data.push([`<span style='color:${color}'>${user.uid}</span>`, `<span style='color:${color}'>${GetAvatar(user.userid, user.name, user.discordid, user.avatar)} ${bantxt2}</span>`, `<span style='color:${color}'>${user.discordid}</span>`, userop]);
            }

            PushTable("#table_pending_user_list", data, total_pages, "LoadUserList();");
        },
        error: function (data) {
            UnlockBtn("#button-user-list-search");
            AjaxError(data);
        }
    });
}

function ShowUserDetail(uid) {
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/profile?uid=" + String(uid),
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {

            d = data;
            info = "";
            info += GenTableRow("UID", d.uid);
            info += GenTableRow(mltr("name"), d.name);
            info += GenTableRow(mltr("email"), d.email);
            info += GenTableRow(mltr("discord"), d.discordid);
            info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            if (Object.keys(bannedUserList).indexOf(uid) != -1) {
                info += GenTableRow(mltr("ban_reason"), bannedUserList[uid]);
            }

            modalid = ShowModal(d.name, `<table>${info}</table>`);
            InitModal("user_detail", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function AcceptAsMemberShow(uid, name) {
    modalid = ShowModal(mltr('accept_as_member'), `<p>${mltr('accept_as_member_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p><br><p>${mltr('accept_as_member_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-accept-as-member" type="button" class="btn btn-primary" onclick="AcceptAsMember('${uid}');">${mltr('accept')}</button>`);
    InitModal("accept_as_member", modalid);
}

function AcceptAsMember(uid) {
    LockBtn("#button-accept-as-member", mltr("accepting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid + "/accept",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-accept-as-member");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("user_accepted_as_member_user_id_") + data.userid, 5000, false);
            DestroyModal("accept_as_member");
        },
        error: function (data) {
            UnlockBtn("#button-accept-as-member");
            AjaxError(data);
        }
    });
}

function UpdateDiscordShow(uid, discordid, name) {
    modalid = ShowModal(mltr('update_discord_id'), `<p>${mltr('update_discord_id_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${discordid})</i></p><br><label for="new-discord-id" class="form-label">${mltr('new_discord_id')}</label>
    <div class="input-group mb-3">
        <input type="text" class="form-control bg-dark text-white" id="new-discord-id" placeholder="">
    </div><br><p>${mltr('update_discord_id_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-update-discord" type="button" class="btn btn-primary" onclick="UpdateDiscord('${uid}');">${mltr('update')}</button>`);
    InitModal("update_discord", modalid);
}

function UpdateDiscord(uid) {
    LockBtn("#button-update-discord", mltr("updating"));

    new_discord_id = $("#new-discord-id").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid + "/discord",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            discordid: new_discord_id
        }),
        success: function (data) {
            UnlockBtn("#button-update-discord");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("users_discord_id_has_been_updated"), 5000, false);
            DestroyModal("update_discord");
        },
        error: function (data) {
            UnlockBtn("#button-update-discord");
            AjaxError(data);
        }
    });
}

function DisableUserMFAShow(uid, name) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/profile?uid=" + uid,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            mfa = data.mfa;
            if (!mfa) {
                return toastNotification("error", "Error", mltr("user_hasnt_enabled_mfa"), 5000);
            }
            modalid = ShowModal(mltr('disable_mfa'), `<p>${mltr('disable_mfa_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p><br><p>${mltr('disable_mfa_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-staff-disable-mfa" type="button" class="btn btn-danger" onclick="StaffDisableMFA('${uid}');">${mltr('disable')}</button>`);
            InitModal("disable_mfa", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function StaffDisableMFA(uid) {
    LockBtn("#button-staff-disable-mfa", mltr("disabling"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/mfa/disable?uid=" + uid,
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            toastNotification("success", "Success", mltr("users_mfa_disabled"), 5000, false);
            DestroyModal("disable_mfa");
        },
        error: function (data) {
            UnlockBtn("#button-staff-disable-mfa");
            AjaxError(data);
        }
    });
}

function DeleteConnectionsShow(uid, name) {
    modalid = ShowModal(mltr('delete_connections'), `<p>${mltr('delete_connections_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p><br><p>${mltr('delete_connections_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-connections" type="button" class="btn btn-primary" onclick="DeleteConnections('${uid}');">${mltr('delete')}</button>`);
    InitModal("account_connections", modalid);
}

function DeleteConnections(uid) {
    LockBtn("#button-delete-connections", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid + "/connections",
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-connections");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("users_account_connections_unbound"), 5000, false);
            DestroyModal("account_connections");
        },
        error: function (data) {
            UnlockBtn("#button-delete-connections");
            AjaxError(data);
        }
    });
}

function BanShow(uid, name) {
    modalid = ShowModal(mltr('ban_user'), `<p>${mltr('ban_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p><br><p>${mltr('ban_user_note_2')}</p><br><label for="new-discord-id" class="form-label">${mltr('ban_until')}</label>
    <div class="input-group mb-3">
        <input type="date" class="form-control bg-dark text-white" id="ban-until">
    </div>
    <label for="ban-reason" class="form-label">${mltr('reason')}</label>
    <div class="input-group mb-3" style="height:calc(100% - 160px)">
        <textarea type="text" class="form-control bg-dark text-white" id="ban-reason" placeholder="" rows="3"></textarea>
    </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-ban-user" type="button" class="btn btn-danger" onclick="BanUser('${uid}');">${mltr('ban')}</button>`);
    InitModal("ban_user", modalid);
}

function BanUser(uid) {
    LockBtn("#button-ban-user", mltr("banning"));

    expire = -1;
    if ($("#ban-until").val() != "")
        expire = +new Date($("#ban-until").val()) / 1000;
    reason = $("#ban-reason").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid + "/ban",
        type: "PUT",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            uid: uid,
            expire: expire,
            reason: reason
        }),
        success: function (data) {
            UnlockBtn("#button-ban-user");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("user_banned"), 5000, false);
            DestroyModal("ban_user");
        },
        error: function (data) {
            UnlockBtn("#button-ban-user");
            AjaxError(data);
        }
    });
}

function UnbanShow(uid, name) {
    modalid = ShowModal(mltr('unban_user'), `<p>${mltr('unban_user_note')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-unban-user" type="button" class="btn btn-success" onclick="UnbanUser('${uid}');">${mltr('unban')}</button>`);
    InitModal("unban_user", modalid);
}

function UnbanUser(uid) {
    LockBtn("#button-unban-user", mltr("unbanning"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid + "/ban",
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-unban-user");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("user_unbanned"), 5000, false);
            DestroyModal("unban_user");
        },
        error: function (data) {
            UnlockBtn("#button-unban-user");
            AjaxError(data);
        }
    });
}

function DeleteUserShow(uid, name) {
    modalid = ShowModal(mltr('delete_user'), `<p>${mltr('delete_user_note_1')}</p><p><i>${name} (${mltr('discord_id')}: ${uid})</i></p><br><p>${mltr('delete_user_note_2')}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-user" type="button" class="btn btn-danger" onclick="DeleteUser('${uid}');">${mltr('delete')}</button>`);
    InitModal("delete_user", modalid);
}

function DeleteUser(uid) {
    LockBtn("#button-delete-user", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid,
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-user");
            LoadUserList(noplaceholder = true);
            toastNotification("success", "Success", mltr("user_deleted"), 5000, false);
            DestroyModal("delete_user");
        },
        error: function (data) {
            UnlockBtn("#button-delete-user");
            AjaxError(data);
        }
    });
}

function DeleteAccountShow() {
    uid = localStorage.getItem("uid");
    modalid = ShowModal(mltr('delete_account'), mltr('delete_account_note'), `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-delete-account" type="button" class="btn btn-danger" onclick="DeleteAccount(${uid});">${mltr('delete')}</button>`);
    InitModal("delete_account", modalid);
}

function DeleteAccount(uid) {
    LockBtn("#button-delete-account", mltr("deleting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/" + uid,
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delete-account");
            toastNotification("success", "Success", mltr("account_deleted_goodbye"), 5000, false);
            Logout();
            DestroyModal("delete_account");
        },
        error: function (data) {
            UnlockBtn("#button-delete-account");
            AjaxError(data);
        }
    });
}

function LoadNotification() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list",
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data.list;
            $("#notification-dropdown").children().remove();
            for (i = 0; i < d.length; i++) {
                style = "";
                if (d[i].read) style = "color:grey";
                $("#notification-dropdown").append(`
                <div>
                    <p style="margin-bottom:0px;${style}">${marked.parse(d[i].content).replaceAll("\n", "<br>").replaceAll("<p>", "").replaceAll("</p>", "").slice(0, -1)}</p>
                    <p class="text-muted" style="margin-bottom:5px">${timeAgo(new Date(d[i].timestamp * 1000))}</p>
                </div>`);
            }
        }
    });

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?status=0",
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            cnt = data.total_items;
            if (cnt > 0 && cnt <= 99) {
                $("#notification-pop").show();
                $("#unread-notification").html(cnt);
            } else if (cnt >= 100) {
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

function LoadNotificationList(noplaceholder = false) {
    InitPaginate("#table_notification_list", "LoadNotificationList();");
    page = parseInt($("#table_notification_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if (!noplaceholder) {
        $("#table_notification_list_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_notification_list_data").append(notification_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/list?page_size=30&page=" + page,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {

            notificationList = data.list;
            total_pages = data.total_pages;
            data = [];

            for (i = 0; i < notificationList.length; i++) {
                notification = notificationList[i];

                data.push([`${marked.parse(notification.content).replaceAll("\n", "<br>").replaceAll("<p>", "").replaceAll("</p>", "").slice(0, -1)}`, timeAgo(new Date(notification.timestamp * 1000))]);
            }

            PushTable("#table_notification_list", data, total_pages, "LoadNotificationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function NotificationsMarkAllAsRead() {
    if ($("#unread-notification").html() == "") return;
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/notification/all/status/1",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#notification-pop").hide();
            $("#unread-notification").html("");
        }
    });
}

function HandleOAuth() {
    oauth_callback_url = getUrlParameter("callback_url");
    app_id = getUrlParameter("app_id");
    try {
        oauth_callback_url = new URL(oauth_callback_url);
        $.ajax({
            url: `https://${app_id}.apps.chub.page/info`,
            type: "GET",
            contentType: "application/json", processData: false,
            success: function (data) {
                oauth_app_name = data.name;
                if (oauth_callback_url.host != data.callback_domain) {
                    $("#oauth-message-title").html("CHub OAuth");
                    $("#oauth-message-content").html("callback_url not valid");
                    return;
                }
                let badge = "";
                let extra = "";
                if (!["utilbot"].includes(app_id)) {
                    extra = `<br><br><span style='font-size:12px;color:grey'><b>${data.name}</b> is created by a 3rd-party developer. CHub is not affiliated with <b>${data.name}</b>.`;
                } else {
                    extra = `<br><br><span style='font-size:12px;color:grey'><b>${data.name}</b> is an official application created by CHub.`;
                    badge = `<span class="badge text-bg-primary" style="position:relative;font-size:12px;top:-6px;margin-left:10px;">Official</span>`;
                }
                $("#oauth-control-div").show();
                $("#oauth-message-title").html(`${data.name}${badge}`);
                $("#oauth-message-content").html(`wants to access your Drivers Hub account.<br><br>A new Application Token will be generated and sent to <b>${data.name}</b>. The application will be able to manage your account, but it won't be allowed to perform dangerous actions such as resigning as you.<br><br>About <b>${data.name}</b>:<br>${data.description}${extra}`);
            },
            error: function (data) {
                $("#button-oauth-authorize").hide();
                $("#oauth-control-div").show();
                $("#oauth-message-title").html(`CHub OAuth`);
                $("#oauth-message-content").html(`The application is not recognized. Refer to the <a href="https://github.com/charlws/OAuthApps" target="_blank">GitHub Repo</a> for more info on getting an application recognized.`);
            }
        });
    } catch (error) {
        $("#oauth-message-title").html("CHub OAuth");
        $("#oauth-message-content").html("callback_url is not valid");
    }
}

function OAuthAuthorize(firstop = false) {
    LockBtn("#button-oauth-authorize", mltr("working"));

    if (mfaenabled) {
        otp = $("#mfa-otp").val();

        if (otp.length != 6) {
            mfafunc = OAuthAuthorize;
            setTimeout(function () { UnlockBtn("#button-oauth-authorize"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
            return;
        }

        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                app_name: oauth_app_name,
                otp: otp,
            }),
            success: function (data) {
                ShowTab("#oauth-tab", "from-mfa");
                mfafunc = null;
                let searchParams = new URLSearchParams(oauth_callback_url.search);
                searchParams.set('discordid', localStorage.getItem("discordid"));
                searchParams.set('token', data.token);
                oauth_callback_url.search = searchParams.toString();
                window.location.href = oauth_callback_url.toString();
            },
            error: function (data) {
                if (firstop && data.status == 400) {
                    // failed due to auto try, then do mfa
                    mfafunc = OAuthAuthorize;
                    setTimeout(function () { UnlockBtn("#button-oauth-authorize"); setTimeout(function () { ShowTab("#mfa-tab"); }, 500); }, 1000);
                    return;
                }
                UnlockBtn("#button-oauth-authorize");
                AjaxError(data);
                ShowTab("#oauth-tab", "from-mfa");
                mfafunc = null;
            }
        });
    }
    else {
        $.ajax({
            url: api_host + "/" + dhabbr + "/token/application",
            type: "POST",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                app_name: oauth_app_name
            }),
            success: function (data) {
                let searchParams = new URLSearchParams(oauth_callback_url.search);
                searchParams.set('discordid', localStorage.getItem("discordid"));
                searchParams.set('token', data.token);
                oauth_callback_url.search = searchParams.toString();
                window.location.href = oauth_callback_url.toString();
            },
            error: function (data) {
                UnlockBtn("#button-oauth-authorize");
                AjaxError(data);
            }
        });
    }
}