function loadAuditLog(recurse = true) {
    page = parseInt($("#auditpages").val());
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auditlog?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#auditTable").empty();
            const audits = data.response.list;

            if (audits.length == 0) {
                $("#auditTableHead").hide();
                $("#auditTable").append(`
        <tr class="text-sm">
          <td class="py-5 px-6 font-medium">No Data</td>
          <td class="py-5 px-6 font-medium"></td>
          <td class="py-5 px-6 font-medium"></td>
        </tr>`);
                $("#auditpages").val(1);
                if (recurse) loadAuditLog(recurse = false);
                return;
            }
            $("#auditTableHead").show();
            totpage = Math.ceil(data.response.tot / 30);
            if (page > totpage) {
                $("#auditpages").val(1);
                if (recurse) loadAuditLog(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#auditpages").val(1);
                page = 1;
            }
            $("#audittotpages").html(totpage);
            $("#auditTableControl").children().remove();
            $("#auditTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#auditpages').val(1);loadAuditLog();">1</button>`);
            if (page > 3) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#auditpages').val(${i});loadAuditLog();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#auditTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#auditpages').val(${totpage});loadAuditLog();">${totpage}</button>`);
            }

            for (i = 0; i < audits.length; i++) {
                audit = audits[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = parseMarkdown(audit.operation).replace("\n", "<br>");
                $("#auditTable").append(`
        <tr class="text-sm">
          <td class="py-5 px-6 font-medium">${audit.user}</td>
          <td class="py-5 px-6 font-medium">${op}</td>
          <td class="py-5 px-6 font-medium">${dt}</td>
        </tr>`);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load audit log. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function updateBio() {
    bio = $("#biocontent").val();
    $("#updateBioBtn").html("Updating...");
    $("#updateBioBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/bio",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": bio
        },
        success: function (data) {
            $("#updateBioBtn").html("Update");
            $("#updateBioBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                loadProfile(localStorage.getItem("userid"));
                return toastFactory("success", "Success!", "About Me updated!", 5000, false);
            }
        },
        error: function (data) {
            $("#updateBioBtn").html("Update");
            $("#updateBioBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to update About Me. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function genNewAppToken() {
    GeneralLoad();
    $("#genAppTokenBtn").html("Working...");
    $("#genAppTokenBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#genAppTokenBtn").html("Reset Token");
            $("#genAppTokenBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#userAppToken").html(data.response.token);
            return toastFactory("success", "Success", "Application Token generated!", 5000, false);
        },
        error: function (data) {
            $("#genAppTokenBtn").html("Reset Token");
            $("#genAppTokenBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to generate app token. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}
bannedUser = {};

function loadUsers(recurse = true) {
    page = parseInt($("#pupages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/users?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#usersTable").empty();
            const users = data.response.list;

            if (users.length == 0) {
                $("#usersTableHead").hide();
                $("#usersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#pupages").val(1);
                if (recurse) loadUsers(recurse = false);
                return;
            }
            $("#usersTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#pupages").val(1);
                if (recurse) loadUsers(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#pupages").val(1);
                page = 1;
            }
            $("#putotpages").html(totpage);
            $("#usersTableControl").children().remove();
            $("#usersTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#pupages').val(1);loadUsers();">1</button>`);
            if (page > 3) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#pupages').val(${i});loadUsers();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#usersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#pupages').val(${totpage});loadUsers();">${totpage}</button>`);
            }

            for (i = 0; i < users.length; i++) {
                const user = users[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                bantxt = "Ban";
                bantxt2 = "";
                color = "";
                accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:grey">Accept as member</td>`;
                if (user.banned) color = "grey", bantxt = "Unban", bantxt2 = "(Banned)", bannedUser[user.discordid] = user.banreason;
                else accept = `<td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:lightgreen" id="UserAddBtn${user.discordid}" onclick="addUser('${user.discordid}')">Accept as member</td>`;
                $("#usersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium" style='color:${color}'>${user.discordid}</td>
              <td class="py-5 px-6 font-medium" style='color:${color}'>${user.name} ${bantxt2}</td>
              ${accept}
              <td class="py-5 px-6 font-medium"><a style="cursor:pointer;color:red" onclick="banGo('${user.discordid}')">${bantxt}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="UserInfoBtn${user.discordid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="userDetail('${user.discordid}')">Details</button></td>
            </tr>`)
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(`Failed to load users. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function banGo(discordid) {
    $("#bandiscordid").val(discordid);
    document.getElementById("BanUserDiv").scrollIntoView();
}

function addUser(discordid = -1) {
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
    $("#addUserBtn").html("Working...");
    $("#addUserBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/add",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            $("#addUserBtn").html("Add");
            $("#addUserBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            toastFactory("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000,
                false);
            loadUsers();
        },
        error: function (data) {
            $("#addUserBtn").html("Add");
            $("#addUserBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to add user. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function updateDiscord() {
    old_discord_id = $("#upd_old_id").val();
    new_discord_id = $("#upd_new_id").val();
    $("#updateDiscordBtn").html("Working...");
    $("#updateDiscordBtn").attr("disabled", "disabled");
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
            $("#updateDiscordBtn").html("Update");
            $("#updateDiscordBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            toastFactory("success", "Success", "User Discord Account Updated!", 5000,
                false);
            loadUsers();
        },
        error: function (data) {
            $("#updateDiscordBtn").html("Update");
            $("#updateDiscordBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to update user Discord account. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function deleteUser() {
    discordid = $("#del_discord_id").val();
    $("#deleteUserBtn").html("Working...");
    $("#deleteUserBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/delete",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            $("#deleteUserBtn").html("Delete");
            $("#deleteUserBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            toastFactory("success", "Success", "User deleted!", 5000,
                false);
            loadUsers();
        },
        error: function (data) {
            $("#deleteUserBtn").html("Delete");
            $("#deleteUserBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to delete user. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function unbindConnections(){
    discordid = $("#unbind_discord_id").val();
    $("#unbindConnectionsBtn").html("Working...");
    $("#unbindConnectionsBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/unbind",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            $("#unbindConnectionsBtn").html("Unbind");
            $("#unbindConnectionsBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            toastFactory("success", "Success", "User account connections unbound!", 5000,
                false);
            loadUsers();
        },
        error: function (data) {
            $("#unbindConnectionsBtn").html("Unbind");
            $("#unbindConnectionsBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to unbind user account connections. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function userDetail(discordid) {
    $("#UserInfoBtn" + discordid).attr("disabled", "disabled");
    $("#UserInfoBtn" + discordid).html("Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?qdiscordid=" + String(discordid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            info = "";
            if (!data.error) {
                d = data.response;
                info += "<p style='text-align:left'><b>Name:</b> " + d.name + "</p>";
                info += "<p style='text-align:left'><b>Email:</b> " + d.email + "</p>";
                info += "<p style='text-align:left'><b>Discord ID:</b> " + discordid + "</p>";
                info +=
                    "<p style='text-align:left'><b>TruckersMP ID:</b> <a href='https://truckersmp.com/user/" +
                    d.truckersmpid + "'>" + d.truckersmpid + "</a></p>";
                info +=
                    "<p style='text-align:left'><b>Steam ID:</b> <a href='https://steamcommunity.com/profiles/" +
                    d.steamid + "'>" + d.steamid + "</a></p><br>";
                if (Object.keys(bannedUser).indexOf(discordid) != -1) info += "<p style='text-align:left'><b>Ban Reason:</b> " + bannedUser[discordid] + "</p>";
            }
            bantxt = "";
            if (Object.keys(bannedUser).indexOf(discordid) != -1) bantxt = " (Banned)";
            if (bantxt == "") {
                Swal.fire({
                    title: d.name + bantxt,
                    html: info,
                    icon: 'info',
                    confirmButtonText: 'Close'
                })
            } else {
                Swal.fire({
                    title: d.name + bantxt,
                    html: info,
                    icon: 'error',
                    confirmButtonText: 'Close'
                })
            }
            $("#UserInfoBtn" + discordid).removeAttr("disabled");
            $("#UserInfoBtn" + discordid).html("Details");
        },
        error: function (data) {
            $("#UserInfoBtn" + discordid).attr("disabled", "disabled");
            $("#UserInfoBtn" + discordid).html("Loading...");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load user details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function banUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid)) {
        return toastFactory("error", "Error:", "Please enter a valid discord id.", 5000, false);
    }
    expire = -1;
    if ($("#banexpire").val() != "") {
        expire = +new Date($("#banexpire").val()) / 1000;
    }
    reason = $("#banreason").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/ban",
        type: "POST",
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
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            loadUsers();
            toastFactory("success", "Success", "User banned successfully.", 5000, false);
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to ban user. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function unbanUser() {
    discordid = $("#bandiscordid").val();
    if (!isNumber(discordid)) {
        return toastFactory("error", "Error:", "Please enter a valid discord id.", 5000, false);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/unban",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            discordid: discordid
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            toastFactory("success", "Success", "User unbanned successfully.", 5000, false);
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to unban user. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

configData = {};

function isJSONNumber(obj) {
    return obj !== undefined && obj !== null && obj.constructor == Number;
}

function isString(obj) {
    return obj !== undefined && obj !== null && obj.constructor == String;
}

function loadConfig() {
    newConfigData = JSON.parse($("#config").val());
    keys = Object.keys(newConfigData);
    for (i = 0; i < keys.length; i++) {
        $("#config_" + keys[i]).val(newConfigData[keys[i]]);
        if(keys[i] == "truckersmp_bind" || keys[i] == "in_guild_check") $("#config_" + keys[i]).val(String(newConfigData[keys[i]]));
        else if(keys[i] == "welcome_role_change") $("#config_welcome_role_change_txt").val(newConfigData[keys[i]].join(", "));
        else if(keys[i] == "delivery_post_gifs") $("#config_delivery_post_gifs_txt").val(newConfigData[keys[i]].join("\n"));
        else if(keys[i] == "ranks"){
            d = newConfigData[keys[i]];
            txt = "";
            for(j = 0; j < d.length; j++){
                txt += d[j].distance + ", " + d[j].name + ", " + d[j].discord_role_id + "\n";
            }
            $("#config_ranks_txt").val(txt);
        }
        else if(keys[i] == "application_types"){
            d = newConfigData[keys[i]];
            txt = "";
            for(j = 0; j < d.length; j++){
                txt += d[j].id + ", " + d[j].name + ", " + d[j].discord_role_id + ", " + d[j].staff_role_id.join('|') + ", " + d[j].message + ", " + d[j].webhook + ", " + d[j].note + "\n";
            }
            $("#config_application_types_txt").val(txt);
        }
        else if(keys[i] == "divisions"){
            d = newConfigData[keys[i]];
            txt = "";
            for(j = 0; j < d.length; j++){
                txt += d[j].id + ", " + d[j].name + ", " + d[j].point + ", " + d[j].role_id + "\n";
            }
            $("#config_divisions_txt").val(txt);
        }
        else if(keys[i] == "perms"){
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for(j = 0; j < d.length; j++){
                txt += d[j] + ": " + newConfigData[keys[i]][d[j]].join(", ") + "\n";
            }
            $("#config_perms_txt").val(txt);
        }
        else if(keys[i] == "roles"){
            d = Object.keys(newConfigData[keys[i]]);
            txt = "";
            for(j = 0; j < d.length; j++){
                txt += d[j] + ", " + newConfigData[keys[i]][d[j]]+ "\n";
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
            for(var i = 0 ; i < webConfigKeys.length ; i++){
                key = webConfigKeys[i];
                $("#webconfig_" + key).val(webConfigData[key]);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load config. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
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
                  typeof value === 'number' && value > 1e10
                    ? BigInt(value)
                    : value));

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
                if($("#config_truckersmp_bind").val() == "true") configData[configitem] = true;
                else configData[configitem] = false;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_in_guild_check").on('input', function () {
                configitem = "in_guild_check";
                if($("#config_in_guild_check").val() == "true") configData[configitem] = true;
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
                for(j = 0; j < v.length; j++){
                    t = v[j].split(",");
                    if(t.length != 3) continue;
                    d.push({"distance": t[0].replaceAll(" ", ""), "name": t[1], "discord_role_id": t[2].replaceAll(" ", "")});
                }
                configData["ranks"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });
            
            $("#config_application_types_txt").on('input', function () {
                d = [];
                v = $("#config_application_types_txt").val().split("\n");
                for(j = 0; j < v.length; j++){
                    t = v[j].split(",");
                    if(t.length != 7) continue;
                    d.push({"id": t[0].replaceAll(" ", ""), "name": t[1], "discord_role_id": t[2].replaceAll(" ", ""), "staff_role_id": t[3].replaceAll(" ", "").split("|"), "message": t[4], "webhook": t[5], "note": t[6]});
                }
                configData["application_types"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });
            
            $("#config_divisions_txt").on('input', function () {
                d = [];
                v = $("#config_divisions_txt").val().split("\n");
                for(j = 0; j < v.length; j++){
                    t = v[j].split(",");
                    if(t.length != 4) continue;
                    d.push({"id": t[0].replaceAll(" ", ""), "name": t[1], "point": t[2].replaceAll(" ", ""), "role_id": t[3].replaceAll(" ", "")});
                }
                configData["divisions"] = d;
                $("#config").val(JSON.stringify(configData, null, 4));
            });
            
            $("#config_perms_txt").on('input', function () {
                d = {};
                v = $("#config_perms_txt").val().split("\n");
                for(j = 0; j < v.length; j++){
                    t = v[j].split(":");
                    if(t.length != 2) continue;
                    perm_name = t[0].replaceAll(" ", "");
                    perm_role_t = t[1].replaceAll(" ", "").split(",");
                    perm_role = [];
                    for(k = 0; k < perm_role_t.length; k++){
                        if(perm_role_t[k] == "") continue;
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
                for(j = 0; j < v.length; j++){
                    t = v[j].split(",");
                    if(t.length != 2) continue;
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
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load config. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function UpdateWebConfig() {
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
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to update config. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
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
                  typeof value === 'number' && value > 1e10
                    ? BigInt(value)
                    : value)
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
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to update config. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function ReloadServer() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/reload",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to reload server. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function resetPassword(){
    $("#resetPasswordBtn").html("Updating...");
    $("#resetPasswordBtn").attr("disabled", "disabled");
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
            $("#resetPasswordBtn").html("Update");
            $("#resetPasswordBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#resetPasswordBtn").html("Update");
            $("#resetPasswordBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to reload server. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}