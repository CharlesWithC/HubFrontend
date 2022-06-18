function loadAuditLog(recurse = true) {
    page = parseInt($("#auditpages").val())
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
        <tr class="text-xs">
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
        <tr class="text-xs">
          <td class="py-5 px-6 font-medium">${audit.user}</td>
          <td class="py-5 px-6 font-medium">${op}</td>
          <td class="py-5 px-6 font-medium">${dt}</td>
        </tr>`);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000, false);
            console.warn(
                `Failed to load audit log. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to update About Me. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
}

function genNewAppToken() {
    GeneralLoad();
    $("#genAppTokenBtn").html("Working...");
    $("#genAppTokenBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/apptoken",
        type: "POST",
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to generate app token. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
        url: apidomain + "/" + vtcprefix + "/user/list?page=" + page,
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
            <tr class="text-xs">
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
                // <tr class="text-xs">
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
            <tr class="text-xs">
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000, false);
            console.warn(`Failed to load users. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}

function banGo(discordid) {
    $("#bandiscordid").val(discordid);
    document.getElementById("BanUserDiv").scrollIntoView();
}

function addUser(discordid = -1) {
    if (discordid == -1) {
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
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/add",
        type: "POSt",
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
            toastFactory("success", "Success", "User added successfully. User ID: " + data.response.userid, 5000,
                false);
            loadUsers();
        },
        error: function (data) {
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to add user. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}

function userDetail(discordid) {
    $("#UserInfoBtn" + discordid).attr("disabled", "disabled");
    $("#UserInfoBtn" + discordid).html("Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/info?qdiscordid=" + String(discordid),
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to load user details. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
        type: "POSt",
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to ban user. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to unban user. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
    }
    if (newConfigData["hexcolor"] != configData["hexcolor"]) {
        hexcolor = $("#config_hexcolor").val();
        intcolor = parseInt(hexcolor.replace("#", "0x"), 16);
        $("#config_intcolor").val(intcolor);
        configData["intcolor"] = parseInt(intcolor);
    } else if (newConfigData["intcolor"] != configData["intcolor"]) {
        intcolor = parseInt($("#config_intcolor").val());
        hexcolor = intcolor.toString(16);
        $("#config_hexcolor").val(hexcolor);
        configData["hexcolor"] = hexcolor;
    }
    configData = newConfigData;
}

numberItem = [];

function loadAdmin() {
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

            numberItem = [];
            configData = data.response.config;
            keys = Object.keys(configData);
            for (i = 0; i < keys.length; i++) {
                if (isJSONNumber(configData[keys[i]])) {
                    numberItem.push(keys[i]);
                }
            }

            $("#config").val(JSON.stringify(configData, null, 4));

            loadConfig();

            $('#config_hexcolor').on('input', function () {
                hexcolor = $("#config_hexcolor").val();
                intcolor = parseInt(hexcolor.replace("#", "0x"), 16);
                $("#config_intcolor").val(intcolor);
                configData["intcolor"] = parseInt(intcolor);
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $('#config_intcolor').on('input', function () {
                intcolor = parseInt($("#config_intcolor").val());
                hexcolor = intcolor.toString(16);
                $("#config_hexcolor").val(hexcolor);
                configData["hexcolor"] = hexcolor;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $(".configFormData").on('input', function () {
                inputid = $(this).attr('id');
                configitem = inputid.replaceAll("config_", "");
                val = $(this).val();
                if (numberItem.indexOf(configitem) != -1) {
                    val = +val;
                }
                configData[configitem] = val;
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config_distance_unit").on('change', function () {
                configitem = "distance_unit";
                configData[configitem] = $("#config_distance_unit").val();
                $("#config").val(JSON.stringify(configData, null, 4));
            });

            $("#config").on('input', function () {
                loadConfig();
            });
        },
        error: function (data) {
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to load config. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
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
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            config: JSON.stringify(config)
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to update config. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            toastFactory("error", "Error:", "Likely API error, probably server is offline or ran into a bug.", 5000,
                false);
            console.warn(
                `Failed to reload server. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}