function LoadAuditLog() {
    GeneralLoad();
    InitPaginate("#table_audit_log", "LoadAuditLog();")
    page = parseInt($("#table_audit_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/audit?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            auditLog = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < auditLog.length; i++) {
                audit = auditLog[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = parseMarkdown(audit.operation).replace("\n", "<br>");

                data.push([`${audit.user.name}`, `${op}`, `${dt}`]);
            }

            PushTable("#table_audit_log", data, total_pages, "LoadAuditLog();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

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
            toastFactory("success", "Success!", "About Me updated!", 5000, false);
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
            toastFactory("success", "Success", "Application Token generated!", 5000, false);
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
            toastFactory("success", "Success", "Application Token Disabled!", 5000, false);
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
            return toastFactory("error", "Error:", "Please enter a valid discord id.", 5000, false);
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
            toastFactory("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000, false);
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
            toastFactory("success", "Success", "User Discord Account Updated!", 5000, false);
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
            toastFactory("success", "Success", "User deleted!", 5000, false);
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
            toastFactory("success", "Success", "User account connections unbound!", 5000, false);
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
        return toastFactory("error", "Error:", "Invalid discord id.", 5000, false);

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
            toastFactory("success", "Success", "User banned successfully.", 5000, false);
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
        return toastFactory("error", "Error:", "Invalid discord id.", 5000, false);
    
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
            toastFactory("success", "Success", "User unbanned successfully.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#unbanUserBtn");
            AjaxError(data);
        }
    })
}

configData = {};

function loadConfig() {
    newConfigData = JSON.parse($("#config").val());
    keys = Object.keys(newConfigData);
    for (i = 0; i < keys.length; i++) {
        $("#config_" + keys[i]).val(newConfigData[keys[i]]);
        if (keys[i] == "truckersmp_bind" || keys[i] == "in_guild_check") $("#config_" + keys[i]).val(String(newConfigData[keys[i]]));
        else if (keys[i] == "welcome_role_change") $("#config_welcome_role_change_txt").val(newConfigData[keys[i]].join(", "));
        else if (keys[i] == "delivery_post_gifs") $("#config_delivery_post_gifs_txt").val(newConfigData[keys[i]].join("\n"));
        else if (keys[i] == "ranks") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].distance + ", " + d[j].name + ", " + d[j].discord_role_id + "\n";
            }
            $("#config_ranks_txt").val(txt);
        } else if (keys[i] == "application_types") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].id + ", " + d[j].name + ", " + d[j].discord_role_id + ", " + d[j].staff_role_id.join('|') + ", " + d[j].message + ", " + d[j].webhook + ", " + d[j].note + "\n";
            }
            $("#config_application_types_txt").val(txt);
        } else if (keys[i] == "divisions") {
            d = newConfigData[keys[i]];
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j].id + ", " + d[j].name + ", " + d[j].point + ", " + d[j].role_id + "\n";
            }
            $("#config_divisions_txt").val(txt);
        } else if (keys[i] == "perms") {
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j] + ": " + newConfigData[keys[i]][d[j]].join(", ") + "\n";
            }
            $("#config_perms_txt").val(txt);
        } else if (keys[i] == "roles") {
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for (j = 0; j < d.length; j++) {
                txt += d[j] + ", " + newConfigData[keys[i]][d[j]] + "\n";
            }
            $("#config_roles_txt").val(txt);
        }
    }
    configData = newConfigData;
}

function loadAdmin() {
    webdomain = apidomain.replaceAll("https://", "https://web.");
    $.ajax({
        url: webdomain + "/" + vtcprefix + "/config?domain=" + window.location.hostname,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.error) toastFactory("error", "Error:", data.descriptor, 5000, false);
            webConfigData = data.response.config;
            webConfigKeys = Object.keys(webConfigData);
            for (var i = 0; i < webConfigKeys.length; i++) {
                key = webConfigKeys[i];
                $("#webconfig_" + key).val(webConfigData[key]);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);

            configData = data.response.config;

            $("#config").val(JSON.stringify(configData, null, 4,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value));

            loadConfig();

            $(".configFormData").on('input', function () {
                inputid = $(this).attr('id');
                configitem = inputid.replaceAll("config_", "");
                val = $(this).val();
                configData[configitem] = val;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_distance_unit").on('input', function () {
                configitem = "distance_unit";
                configData[configitem] = $("#config_distance_unit").val();
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_truckersmp_bind").on('input', function () {
                configitem = "truckersmp_bind";
                if ($("#config_truckersmp_bind").val() == "true") configData[configitem] = true;
                else configData[configitem] = false;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_in_guild_check").on('input', function () {
                configitem = "in_guild_check";
                if ($("#config_in_guild_check").val() == "true") configData[configitem] = true;
                else configData[configitem] = false;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_welcome_role_change_txt").on('input', function () {
                txt = $("#config_welcome_role_change_txt").val();
                configData["welcome_role_change"] = txt.split(", ");
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_delivery_post_gifs_txt").on('input', function () {
                txt = $("#config_delivery_post_gifs_txt").val();
                configData["welcome_role_change"] = txt.split("\n");
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_ranks_txt").on('input', function () {
                d = [];
                v = $("#config_ranks_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 3) continue;
                    d.push({
                        "distance": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "discord_role_id": t[2].replaceAll(" ", "")
                    });
                }
                configData["ranks"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_application_types_txt").on('input', function () {
                d = [];
                v = $("#config_application_types_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 7) continue;
                    d.push({
                        "id": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "discord_role_id": t[2].replaceAll(" ", ""),
                        "staff_role_id": t[3].replaceAll(" ", "").split("|"),
                        "message": t[4],
                        "webhook": t[5],
                        "note": t[6]
                    });
                }
                configData["application_types"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_divisions_txt").on('input', function () {
                d = [];
                v = $("#config_divisions_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 4) continue;
                    d.push({
                        "id": t[0].replaceAll(" ", ""),
                        "name": t[1],
                        "point": t[2].replaceAll(" ", ""),
                        "role_id": t[3].replaceAll(" ", "")
                    });
                }
                configData["divisions"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_perms_txt").on('input', function () {
                d = {};
                v = $("#config_perms_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(":");
                    if (t.length != 2) continue;
                    perm_name = t[0].replaceAll(" ", "");
                    perm_role_t = t[1].replaceAll(" ", "").split(",");
                    perm_role = [];
                    for (k = 0; k < perm_role_t.length; k++) {
                        if (perm_role_t[k] == "") continue;
                        perm_role.push(parseInt(perm_role_t[k]));
                    }
                    d[perm_name] = perm_role;
                }
                configData["perms"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_roles_txt").on('input', function () {
                d = {};
                v = $("#config_roles_txt").val().split("\n");
                for (j = 0; j < v.length; j++) {
                    t = v[j].split(",");
                    if (t.length != 2) continue;
                    d[t[0]] = t[1];
                }
                configData["roles"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config").on('input', function () {
                loadConfig();
            });
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function UpdateWebConfig() {
    if($("#webconfig_apptoken").val().length != 36){
        return toastFactory("error", "Invalid application token!");
    }
    $("#updateWebConfigBtn").html("Working...");
    $("#updateWebConfigBtn").attr("disabled", "disabled");
    webdomain = apidomain.replaceAll("https://", "https://web.");
    $.ajax({
        url: webdomain + "/" + vtcprefix + "/config",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Application " + $("#webconfig_apptoken").val()
        },
        data: {
            domain: window.location.hostname,
            apidomain: apidomain.replaceAll("https://", ""),
            vtc_name: $("#webconfig_vtc_name").val(),
            vtc_color: $("#webconfig_vtc_color").val(),
            slogan: $("#webconfig_slogan").val(),
            company_distance_unit: $("#webconfig_company_distance_unit").val(),
            navio_company_id: $("#webconfig_navio_company_id").val(),
            logo_url: $("#webconfig_logo_url").val(),
            banner_url: $("#webconfig_banner_url").val(),
            bg_url: $("#webconfig_bg_url").val(),
            teamupdate_url: $("#webconfig_teamupdate_url").val(),
            custom_application: $("#webconfig_custom_application").val(),
            style: $("#webconfig_custom_style").val()
        },
        success: function (data) {
            $("#updateWebConfigBtn").html("Update");
            $("#updateWebConfigBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateWebConfigBtn").html("Update");
            $("#updateWebConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function UpdateConfig() {
    config = $("#config").val();
    try {
        config = JSON.parse(config);
    } catch {
        toastFactory("error", "Error:", "Failed to parse config! Make sure it's in correct JSON Format!", 5000, false);
        return;
    }
    if (config["navio_token"] == "") delete config["navio_token"];
    if (config["discord_client_secret"] == "") delete config["discord_client_secret"];
    if (config["bot_token"] == "") delete config["bot_token"];
    $("#updateConfigBtn").html("Working...");
    $("#updateConfigBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            config: JSON.stringify(config,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value)
        },
        success: function (data) {
            $("#updateConfigBtn").html("Update");
            $("#updateConfigBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateConfigBtn").html("Update");
            $("#updateConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function ReloadServer() {
    otp = $("#input-reload-otp").val();
    if(!isNumber(otp) || otp.length != 6){
        return toastFactory("error", "Error:", "Invalid OTP.", 5000, false);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/reload",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            otp: otp
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
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
                toastFactory("success", "Success", "Password login disabled", 5000, false);
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
            toastFactory("success", "Success", data.response, 5000, false);
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
            toastFactory("success", "Success", data.response, 5000, false);
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
            setTimeout(function(){window.location.href = "/login";},1000);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}