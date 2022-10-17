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
                            <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${user.discordid}', '${user.name}')">Delete Connections</a></li>
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

function DeleteConnectionsShow(discordid, name){
    modalid = ShowModal(`Delete Connections`, `<p>Are you sure you want to unbind connections for:</p><p><i>${name} (Discord ID: ${discordid})</i></p><br><p>Their Steam and TruckersMP connection will be removed and can be bound to another account. They will no longer be able to login with Steam. Discord connection will not be affected.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-delete-connections" type="button" class="btn btn-primary" onclick="DeleteConnections('${discordid}');">Delete</button>`);
    InitModal("unbind_connections", modalid);
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
            DestroyModal("unbind_connections");
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