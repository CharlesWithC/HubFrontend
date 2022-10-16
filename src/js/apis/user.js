function UpdateBio() {
    GeneralLoad();
    LockBtn("#updateBioBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/bio",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": $("#biocontent").val()
        },
        success: function (data) {
            UnlockBtn("#updateBioBtn");
            if (data.error) return AjaxError(data);
            LoadUserProfile(localStorage.getItem("userid"));
            toastNotification("success", "Success!", "About Me updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateBioBtn");
            AjaxError(data);
        }
    });
}

function RenewApplicationToken() {
    GeneralLoad();
    LockBtn("#genAppTokenBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#genAppTokenBtn");
            if (data.error) return AjaxError(data);
            $("#userAppToken").html(data.response.token);
            toastNotification("success", "Success", "Application Token generated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#genAppTokenBtn");
            AjaxError(data);
        }
    });
}

function DisableApplicationToken() {
    GeneralLoad();
    LockBtn("#disableAppTokenBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#disableAppTokenBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Application Token Disabled!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#disableAppTokenBtn");
            AjaxError(data);
        }
    });
}

bannedUserList = {};

function LoadUserList() {
    GeneralLoad();
    InitPaginate("#table_pending_user_list", "LoadUserList();");
    page = parseInt($("#table_pending_user_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            userList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < userList.length; i++) {
                user = userList[i];
                bantxt = "Ban";
                bantxt2 = "";
                color = "";
                accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:grey">Accept as member</td>`;
                if (user.ban.is_banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUserList[user.discordid] = user.ban.ban_reason;
                else accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:lightgreen" id="UserAddBtn${user.discordid}" onclick="AddUser('${user.discordid}')">Accept as member</td>`;

                data.push([`<span style='color:${color}'>${user.discordid}</span>`, `<span style='color:${color}'>${user.name} ${bantxt2}</span>`, `<a style="cursor:pointer;color:red" onclick="banGo('${user.discordid}')">${bantxt}</a>`, `<button type="button" style="display:inline;padding:5px" id="UserInfoBtn${user.discordid}" 
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="GetUserDetail('${user.discordid}')">Details</button>`]);
            }

            PushTable("#table_pending_user_list", data, total_pages, "LoadUserList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function banGo(discordid) {
    $("#bandiscordid").val(discordid);
    document.getElementById("BanUserDiv").scrollIntoView();
}

function AddUser(discordid = -1) {
    if (discordid == "-1") {
        discordid = $("#adddiscordid").val();
        if (!isNumber(discordid)) {
            return toastNotification("error", "Error", "Please enter a valid discord id.", 5000, false);
        }
    } else {
        if ($("#UserAddBtn" + discordid).html() != "Confirm?") {
            $("#UserAddBtn" + discordid).html("Confirm?");
            $("#UserAddBtn" + discordid).css("color", "orange");
            return;
        }
    }
    GeneralLoad();
    LockBtn("#addUserBtn");
    LockBtn("#UserAddBtn" + discordid);
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
            UnlockBtn("#addUserBtn");
            UnlockBtn("#UserAddBtn" + discordid);
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000, false);
            LoadUserList();
        },
        error: function (data) {
            UnlockBtn("#addUserBtn");
            UnlockBtn("#UserAddBtn" + discordid);
            AjaxError(data);
        }
    })
}

function UpdateUserDiscordAccount() {
    GeneralLoad();
    LockBtn("#updateDiscordBtn");

    old_discord_id = $("#upd_old_id").val();
    new_discord_id = $("#upd_new_id").val();
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
            UnlockBtn("#updateDiscordBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User Discord Account Updated!", 5000, false);
            LoadUserList();
        },
        error: function (data) {
            UnlockBtn("#updateDiscordBtn");
            AjaxError(data);
        }
    })
}

function DeleteUserAccount() {
    GeneralLoad();
    LockBtn("#deleteUserBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#del_discord_id").val()
        },
        success: function (data) {
            UnlockBtn("#deleteUserBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User deleted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#deleteUserBtn");
            AjaxError(data);
        }
    })
}

function UnbindUserAccountConnections() {
    GeneralLoad();
    LockBtn("#unbindConnectionsBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/connections",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#unbind_discord_id").val()
        },
        success: function (data) {
            UnlockBtn("#unbindConnectionsBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User account connections unbound!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#unbindConnectionsBtn");
            AjaxError(data);
        }
    })
}

function GetUserDetail(discordid) {
    GeneralLoad();
    LockBtn("#UserInfoBtn" + discordid, "Loading...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?discordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#UserInfoBtn" + discordid);
            if (data.error) return AjaxError(data);
            
            d = data.response;
            info = "";
            info += "<p style='text-align:left'><b>Name:</b> " + d.name + "</p>";
            info += "<p style='text-align:left'><b>Email:</b> " + d.email + "</p>";
            info += "<p style='text-align:left'><b>Discord ID:</b> " + discordid + "</p>";
            info += "<p style='text-align:left'><b>TruckersMP ID:</b> <a href='https://truckersmp.com/user/" +
                d.truckersmpid + "'>" + d.truckersmpid + "</a></p>";
            info += "<p style='text-align:left'><b>Steam ID:</b> <a href='https://steamcommunity.com/profiles/" +
                d.steamid + "'>" + d.steamid + "</a></p><br>";

            swalicon = "info";
            bantxt = "";
            if (Object.keys(bannedUserList).indexOf(discordid) != -1) {
                info += "<p style='text-align:left'><b>Ban Reason:</b> " + bannedUserList[discordid] + "</p>";
                swalicon = "error";
                bantxt = " (Banned)";
            }
                
            Swal.fire({
                title: d.name + bantxt,
                html: info,
                icon: swalicon,
                confirmButtonText: 'Close'
            })
        },
        error: function (data) {
            UnlockBtn("#UserInfoBtn" + discordid);
            AjaxError(data);
        }
    });
}

function BanUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid)) 
        return toastNotification("error", "Error", "Invalid discord id.", 5000, false);

    GeneralLoad();
    LockBtn("#banUserBtn");

    expire = -1;
    if ($("#banexpire").val() != "")
        expire = +new Date($("#banexpire").val()) / 1000;

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
            reason: $("#banreason").val()
        },
        success: function (data) {
            UnlockBtn("#banUserBtn");
            if (data.error) return AjaxError(data);
            LoadUserList();
            toastNotification("success", "Success", "User banned successfully.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#banUserBtn");
            AjaxError(data);
        }
    })
}

function UnbanUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid))
        return toastNotification("error", "Error", "Invalid discord id.", 5000, false);
    
    GeneralLoad();
    LockBtn("#unbanUserBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/unban",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: $("#bandiscordid").val()
        },
        success: function (data) {
            UnlockBtn("#unbanUserBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "User unbanned successfully.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#unbanUserBtn");
            AjaxError(data);
        }
    })
}

function UpdatePassword() {
    GeneralLoad();
    LockBtn("#resetPasswordBtn");

    if($("#passwordUpd").val() == ""){
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user/password",
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#resetPasswordBtn");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "Password login disabled", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#resetPasswordBtn");
                AjaxError(data);
            }
        });
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
            "password": $("#passwordUpd").val()
        },
        success: function (data) {
            UnlockBtn("#resetPasswordBtn");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#resetPasswordBtn");
            AjaxError(data);
        }
    })
}

function LoadUserSessions() {
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
                    opbtn = `<button type="button" style="display:inline;padding:5px" id="revokeTokenBtn-${sessions[i].hash}"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="RevokeToken('${sessions[i].hash}')">Revoke</button>`;
                else opbtn = `(Current)`;

                $("#table_session_data").append(`<tr class="text-sm">
                    <td class="py-5 px-6 font-medium">${sessions[i].ip}</td>
                    <td class="py-5 px-6 font-medium">${getDateTime(sessions[i].timestamp * 1000)}</td>
                    <td class="py-5 px-6 font-medium">${getDateTime((parseInt(sessions[i].timestamp) + 86400 * 7) * 1000)}</td>
                    <td class="py-5 px-6 font-medium">${opbtn}</td>
                </tr>`);
            }
        },
        error: function (data) {
            $("#userSessions").hide();
        }
    })
}

function RevokeToken(hsh) {
    if ($("#revokeTokenBtn-" + hsh).html() == "Revoke") {
        $("#revokeTokenBtn-" + hsh).html("Confirm?");
        $("#revokeTokenBtn-" + hsh).attr("background-color", "red");
        return;
    }

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
            LoadUserSessions();
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function revokeAllToken(){
    if ($("#revokeAllBtn").html() == "Revoke All") {
        $("#revokeAllBtn").html("Confirm?");
        $("#revokeAllBtn").attr("background-color", "red");
        return;
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/all",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            setTimeout(function(){ShowTab("#signin-tab", "#button-signin-tab");},1000);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}