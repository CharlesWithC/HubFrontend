audit_log_placeholder_row = `
<tr>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:60%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadAuditLog(noplaceholder = false) {
    if(!noplaceholder){
        $("#table_audit_log_data").children().remove();
        for (i = 0; i < 30; i++) {
            $("#table_audit_log_data").append(audit_log_placeholder_row);
        }
    }

    staff_userid = -1;
    if($("#input-audit-log-staff").val()!=""){
        s = $("#input-audit-log-staff").val();
        staff_userid = s.substr(s.lastIndexOf("(")+1,s.lastIndexOf(")")-s.lastIndexOf("(")-1);
    }

    operation = $("#input-audit-log-operation").val();

    InitPaginate("#table_audit_log", "LoadAuditLog();")
    page = parseInt($("#table_audit_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    
    LockBtn("#button-audit-log-staff-search", "...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/audit?page=" + page + "&operation=" + operation + "&staff_userid=" + staff_userid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-audit-log-staff-search");
            if (data.error) return AjaxError(data);

            auditLog = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < auditLog.length; i++) {
                audit = auditLog[i];
                dt = getDateTime(audit.timestamp * 1000);
                op = parseMarkdown(audit.operation).replace("\n", "<br>");

                data.push([`${audit.user.name}`, `${dt}`, `${op}`]);
            }

            PushTable("#table_audit_log", data, total_pages, "LoadAuditLog();");
        },
        error: function (data) {
            UnlockBtn("#button-audit-log-staff-search");
            AjaxError(data);
        }
    })
}

configData = {};
backupConfig = {};

function LoadConfiguration() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/config",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            configData = data.response.config;
            backupConfig = data.response.backup;

            $("#json-config").val(JSON.stringify(configData, null, 4,
                (_, value) =>
                typeof value === 'number' && value > 1e10 ?
                BigInt(value) :
                value));
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    // webdomain = apidomain.replaceAll("https://", "https://web.");
    // $.ajax({
    //     url: webdomain + "/" + vtcprefix + "/config?domain=" + window.location.hostname,
    //     type: "GET",
    //     dataType: "json",
    //     success: function (data) {
    //         if (data.error) return AjaxError(data);
    //         webConfigData = data.response.config;
    //         webConfigKeys = Object.keys(webConfigData);
    //         for (var i = 0; i < webConfigKeys.length; i++) {
    //             key = webConfigKeys[i];
    //             $("#webconfig_" + key).val(webConfigData[key]);
    //         }
    //     },
    //     error: function (data) {
    //         AjaxError(data);
    //     }
    // });
}

function RevertConfig(){
    $("#json-config").val(JSON.stringify(backupConfig, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", "Config reverted to after last reload.", 5000);
}

function ResetConfig(){
    $("#json-config").val(JSON.stringify(configData, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", "Config reset to before editing.", 5000);
}

function UpdateConfig(){
    config = $("#json-config").val();
    try {
        config = JSON.parse(config);
    } catch {
        return toastNotification("error", "Error", "Failed to parse config! Make sure it's in correct JSON Format!", 5000, false);
    }
    if (config["navio_api_token"] == "") delete config["navio_api_token"];
    if (config["discord_client_secret"] == "") delete config["discord_client_secret"];
    if (config["discord_bot_token"] == "") delete config["discord_bot_token"];
    LockBtn("#button-save-config", "Saving...");
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
            UnlockBtn("#button-save-config");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Config updated! Reload API to make it take effect!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-save-config");
            AjaxError(data);
        }
    })
}

function ReloadAPIShow(){
    if(!mfaenabled) return toastNotification("error", "Error", "MFA must be enabled to reload API!", 5000);
    mfafunc = ReloadServer;
    LockBtn("#button-reload-api-show", `Reloading...`);
    setTimeout(function(){UnlockBtn("#button-reload-api-show");setTimeout(function(){ShowTab("#mfa-tab");},500);},1000);
}

function ReloadServer() {
    otp = $("#mfa-otp").val();
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
            reloadAPIMFA = false;
            ShowTab("#config-tab", "#button-config-tab");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "API reloading...", 5000, false);
        },
        error: function (data) {
            reloadAPIMFA = false;
            ShowTab("#config-tab", "#button-config-tab");
            AjaxError(data);
        }
    })
}

function UpdateWebConfig() {
    if($("#webconfig_apptoken").val().length != 36){
        return toastNotification("error", "Error", "Invalid application token!");
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
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#updateWebConfigBtn").html("Update");
            $("#updateWebConfigBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}