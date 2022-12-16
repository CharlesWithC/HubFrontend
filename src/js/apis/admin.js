audit_log_placeholder_row = `
<tr>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:60%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadAuditLog(noplaceholder = false) {
    if (!noplaceholder) {
        $("#table_audit_log_data").children().remove();
        for (i = 0; i < 30; i++) {
            $("#table_audit_log_data").append(audit_log_placeholder_row);
        }
    }

    staff_userid = -1;
    if ($("#input-audit-log-staff").val() != "") {
        s = $("#input-audit-log-staff").val();
        staff_userid = s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1);
    }

    operation = $("#input-audit-log-operation").val();

    InitPaginate("#table_audit_log", "LoadAuditLog();")
    page = parseInt($("#table_audit_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    LockBtn("#button-audit-log-staff-search", "...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/audit?page=" + page + "&operation=" + operation + "&staff_userid=" + staff_userid,
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
                op = marked.parse(audit.operation).replaceAll("\n", "<br>").replaceAll("<p>", "").replaceAll("</p>", "").slice(0, -1);

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
custom_application = undefined;
custom_style = undefined;

function LoadConfiguration() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/config",
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

    $.ajax({
        url: "https://config.chub.page/" + dhabbr + "/config?domain=" + window.location.hostname,
        type: "GET",
        dataType: "json",
        success: function (data) {
            if (data.error) return AjaxError(data);
            webConfigData = data.response.config;
            $("#web-name").val(webConfigData.name);
            $("#web-distance-unit-"+webConfigData.distance_unit).prop("checked", true);
            $("#web-navio-company-id").val(webConfigData.navio_company_id);
            $("#web-slogan").val(webConfigData.slogan);
            $("#web-color").val(webConfigData.color);
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    $('#web-custom-application').on('change', function () {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            if(!fileReader.result.startsWith("data:text/html")){
                $('#web-custom-application').val("");
                custom_application = undefined;
                return toastNotification("error", "Error", mltr("you_must_selected_a_html_file"), 5000);
            }
            custom_application = atob(fileReader.result.replaceAll("data:text/html;base64,",""));
        };
        fileReader.readAsDataURL($('#web-custom-application').prop('files')[0]);
    });
    $('#web-custom-style').on('change', function () {
        var fileReader = new FileReader();
        fileReader.onload = function () {
            if(!fileReader.result.startsWith("data:text/css")){
                $('#web-custom-style').val("");
                custom_style = undefined;
                return toastNotification("error", "Error", mltr("you_must_selected_a_css_file"), 5000);
            }
            custom_style = atob(fileReader.result.replaceAll("data:text/css;base64,",""));
        };
        fileReader.readAsDataURL($('#web-custom-style').prop('files')[0]);
    });
}

function RevertConfig() {
    $("#json-config").val(JSON.stringify(backupConfig, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", mltr("config_reverted_to_after_last_reload"), 5000);
}

function ResetConfig() {
    $("#json-config").val(JSON.stringify(configData, null, 4,
        (_, value) =>
        typeof value === 'number' && value > 1e10 ?
        BigInt(value) :
        value));
    toastNotification("success", "Success", mltr("config_reset_to_before_editing"), 5000);
}

function UpdateConfig() {
    config = $("#json-config").val();
    try {
        config = JSON.parse(config);
    } catch {
        return toastNotification("error", "Error", mltr("failed_to_parse_config_make_sure_its_in_correct_json_format"), 5000, false);
    }
    if (config["navio_api_token"] == "") delete config["navio_api_token"];
    if (config["discord_client_secret"] == "") delete config["discord_client_secret"];
    if (config["discord_bot_token"] == "") delete config["discord_bot_token"];
    LockBtn("#button-save-config", mltr("saving"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/config",
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
            toastNotification("success", "Success", mltr("config_updated_reload_api_to_make_it_take_effect"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-save-config");
            AjaxError(data);
        }
    })
}

function ReloadAPIShow() {
    if (!mfaenabled) return toastNotification("error", "Error", mltr("mfa_must_be_enabled_to_reload_api"), 5000);
    mfafunc = ReloadServer;
    LockBtn("#button-reload-api-show", mltr("reloading"));
    setTimeout(function () {
        UnlockBtn("#button-reload-api-show");
        setTimeout(function () {
            ShowTab("#mfa-tab");
        }, 500);
    }, 1000);
}

function ReloadServer() {
    otp = $("#mfa-otp").val();
    $.ajax({
        url: api_host + "/" + dhabbr + "/reload",
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
            toastNotification("success", "Success", mltr("api_reloading"), 5000, false);
        },
        error: function (data) {
            reloadAPIMFA = false;
            ShowTab("#config-tab", "#button-config-tab");
            AjaxError(data);
        }
    })
}

function ResetCustomApplication(){
    LockBtn("#button-reset-custom-application", "...");
    
    $.ajax({
        url: "/default_application.html",
        type: "GET",
        success: function (data) {
            UnlockBtn("#button-reset-custom-application");
            custom_application = data;
            toastNotification("success", "Success", mltr("custom_application_reset_to_default"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-reset-custom-application");
            toastNotification("error", "Error", mltr("failed_to_reset_custom_application_unable_to_retrieve_default_application"), 5000);
        }
    })
}

function UpdateWebConfig() {
    LockBtn("#button-save-web-config", mltr("saving"));

    tipt = "";

    $.ajax({
        url: api_host + "/" + dhabbr + "/user/tip",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                UnlockBtn("#button-save-web-config");
                return AjaxError(data);
            }
            tipt = data.response.token;
            $.ajax({
                url: "https://config.chub.page/" + dhabbr + "/config?domain=" + window.location.hostname + "&api_host=" + api_host,
                type: "PATCH",
                dataType: "json",
                headers: {
                    "Authorization": "TemporaryIdentityProof " + tipt
                },
                data: {
                    config: JSON.stringify({"name": $("#web-name").val(), "distance_unit": $("#web-distance-unit").find(":selected").attr("value"), "navio_company_id": $("#web-navio-company-id").val(), "slogan": $("#web-slogan").val(), "color": $("#web-color").val()}),
                    logo_url: $("#web-logo-download-link").val(),
                    banner_url: $("#web-banner-download-link").val(),
                    application: custom_application,
                    style: custom_style
                },
                success: function (data) {
                    UnlockBtn("#button-save-web-config");
                    if (data.error) return AjaxError(data);
                    toastNotification("success", "Success", mltr("web_config_updated"), 5000, false);
                },
                error: function (data) {
                    UnlockBtn("#button-save-web-config");
                    AjaxError(data);
                }
            })
        },
        error: function (data) {
            UnlockBtn("#button-save-web-config");
            return AjaxError(data);
        }
    });
}