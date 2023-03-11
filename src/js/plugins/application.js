applicationQuestions = {}
function PreserveApplicationQuestion() {
    for (var apptype = 1; apptype <= 100; apptype++) {
        for (var i = 1; i <= 100; i++) {
            if ($("#application" + apptype + "Question" + i).length != 0) {
                question = $("#application" + apptype + "Question" + i).html().replaceAll("\n", " ").replaceAll("  ", " ");
                applicationQuestions["#application" + apptype + "Question" + i] = question;
            } else {
                continue;
            }
        }
    }
}

function UpdatePendingApplicationBadge() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=1&page_size=1&status=0&application_type=0&all_user=1",
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {

            count = data.total_items;
            $("#pending-application-badge").remove();
            if (count > 0) {
                $("#button-all-application-tab").append(`<span class='badge' id="pending-application-badge" style="background-color:red">${count}</span>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

my_application_placeholder_row = `
<tr>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadUserApplicationList(noplaceholder = false) {
    InitPaginate("#table_my_application", "LoadUserApplicationList();");

    if (!noplaceholder) {
        $("#table_my_application_data").children().remove();
        for (var i = 0; i < 15; i++) {
            $("#table_my_application_data").append(my_application_placeholder_row);
        }
    }

    page = parseInt($("#table_my_application_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0",
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {

            STATUS = [mltr("pending"), mltr("accepted"), mltr("declined")];

            applicationList = data.list;
            total_pages = data.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if (apptype == undefined) apptype = mltr("unknown");
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) closedat = "/";
                status = STATUS[application.status];
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar), `<a id="button-my-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid})"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_my_application", data, total_pages, "LoadUserApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

all_application_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadAllApplicationList(noplaceholder = false) {
    InitPaginate("#table_all_application", "LoadAllApplicationList();");

    if (!noplaceholder) {
        $("#table_all_application_data").children().remove();
        for (var i = 0; i < 15; i++) {
            $("#table_all_application_data").append(all_application_placeholder_row);
        }
    }

    page = parseInt($('#table_all_application_page_input').val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0&all_user=1",
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {

            STATUS = [mltr("pending"), mltr("accepted"), mltr("declined")];

            applicationList = data.list;
            total_pages = data.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if (apptype == undefined) apptype = mltr("unknown");
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) closedat = "/";
                status = STATUS[application.status];
                creator = application.creator;
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar), `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar), `<a id="button-all-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid}, true)"><i class="fa-solid fa-folder-open"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="ForceUpdateApplicationStatus(${application.applicationid}, 1)"><i class="fa-solid fa-check"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="ForceUpdateApplicationStatus(${application.applicationid}, 2)"><i class="fa-solid fa-xmark"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="ForceUpdateApplicationStatus(${application.applicationid}, 0)"><i class="fa-solid fa-question"></i></a>`]);
            }

            PushTable("#table_all_application", data, total_pages, "LoadAllApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    while (1) {
        if (userPermLoaded) break;
        await sleep(100);
    }
    if (userPerm.includes("hrm") || userPerm.includes("admin")) {
        $("#all-application-right-wrapper").show();
    }
}

function GetApplicationDetail(applicationid, staffmode = false) {
    LockBtn("#button-my-application-" + applicationid, mltr("loading"));
    LockBtn("#button-all-application-" + applicationid, mltr("loading"));

    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/" + applicationid,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data.application;
            discordid = data.creator.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastNotification("error", "Error", mltr("application_has_no_data"), 5000, false);

            apptype = applicationTypes[data.application_type];
            ret = "";
            for (i = 0; i < keys.length; i++) {
                ret += `<p class="mb-1"><b>${keys[i]}</b></p><p>${d[keys[i]]}</p>`;
            }

            $.ajax({
                url: api_host + "/" + dhabbr + "/user?discordid=" + String(discordid),
                type: "GET",
                contentType: "application/json", processData: false,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    info = "";
                    d = data;
                    info += GenTableRow(mltr("name"), d.name);
                    info += GenTableRow(mltr("email"), d.email);
                    info += GenTableRow(mltr("discord"), discordid);
                    info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
                    info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
                    bottom = "";
                    if (!staffmode) {
                        bottom = `
                            <label for="application-new-message" class="form-label">${mltr("message")}</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                            </div>`;
                        modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-new-message" type="button" class="btn btn-primary" onclick="AddMessageToApplication(${applicationid});">${mltr("update")}</button>`);
                        InitModal("my_application_detail", modalid);
                    } else {
                        bottom = `
                            <label for="application-new-message" class="form-label">${mltr("message")}</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                            </div>

                            <label for="application-new-status" class="form-label">${mltr("status")}</label>
                            <div class="mb-3">
                                <select class="form-select bg-dark text-white" id="application-new-status">
                                    <option selected>${mltr("select_one_from_the_list")}</option>
                                    <option value="0">${mltr("pending")}</option>
                                    <option value="1">${mltr("accepted")}</option>
                                    <option value="2">${mltr("declined")}</option>
                                </select>
                            </div>`;
                        modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-update-status" type="button" class="btn btn-primary" onclick="UpdateApplicationStatus(${applicationid});">${mltr("update")}</button>`);
                        InitModal("all_application_detail", modalid);
                    }
                    UnlockBtn("#button-all-application-" + applicationid);
                    UnlockBtn("#button-my-application-" + applicationid);
                }
            });
        },
        error: function (data) {
            info = "";
            bottom = "";
            if (!staffmode) {
                bottom = `
                    <label for="application-new-message" class="form-label">${mltr("message")}</label>
                    <div class="input-group mb-3" style="height:calc(100% - 160px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                    </div>`;
                modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-new-message" type="button" class="btn btn-primary" onclick="AddMessageToApplication(${applicationid});">${mltr("update")}</button>`);
                InitModal("my_application_detail", modalid);
            } else {
                bottom = `
                    <label for="application-new-message" class="form-label">${mltr("message")}</label>
                    <div class="input-group mb-3" style="height:calc(100% - 160px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="${mltr("message_placeholder")}" style="height:160px"></textarea>
                    </div>

                    <label for="application-new-status" class="form-label">${mltr("status")}</label>
                    <div class="mb-3">
                        <select class="form-select bg-dark text-white" id="application-new-status">
                            <option selected>${mltr("select_one_from_the_list")}</option>
                            <option value="0">${mltr("pending")}</option>
                            <option value="1">${mltr("accepted")}</option>
                            <option value="2">${mltr("declined")}</option>
                        </select>
                    </div>`;
                modalid = ShowModal(mltr("application") + " #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-application-update-status" type="button" class="btn btn-primary" onclick="UpdateApplicationStatus(${applicationid});">${mltr("update")}</button>`);
                InitModal("all_application_detail", modalid);
            }
            UnlockBtn("#button-all-application-" + applicationid);
            UnlockBtn("#button-my-application-" + applicationid);
            AjaxError(data);
        }
    })
}

function AddMessageToApplication(applicationid) {
    message = $("#application-new-message").val();
    LockBtn("#button-application-new-message", mltr("updating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "applicationid": applicationid,
            "message": message
        }),
        success: function (data) {
            UnlockBtn("#button-application-new-message");
            GetApplicationDetail(applicationid);
            toastNotification("success", "Success!", mltr("message_added"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-new-message");
            AjaxError(data);
        }
    });
}

function ForceUpdateApplicationStatus(applicationid, appstatus) {
    $.ajax({
        url: api_host + "/" + dhabbr + `/application/${applicationid}/status`,
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "status": appstatus,
            "message": ""
        }),
        success: function (data) {
            LoadAllApplicationList();
            toastNotification("success", "Success", mltr("application_status_updated"), 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdateApplicationStatus(applicationid) {
    appstatus = parseInt($("#application-new-status").find(":selected").val());
    if (!isNumber(appstatus)) return toastNotification("error", "Error", mltr("invalid_application_status"))
    message = $("#application-new-message").val();

    LockBtn("#button-application-update-status", mltr("updating"));

    $.ajax({
        url: api_host + "/" + dhabbr + `/application/${applicationid}/status`,
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "status": appstatus,
            "message": message
        }),
        success: function (data) {
            UnlockBtn("#button-application-update-status");
            LoadAllApplicationList();
            toastNotification("success", "Success", mltr("application_status_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-update-status");
            AjaxError(data);
        }
    })
}

function SubmitApplication() {
    LockBtn("#button-submit-application", mltr("submitting"));
    $(".application-error").remove();

    apptype = parseInt($("#application-type").find(":selected").attr("value"));
    data = {};
    err = false;
    for (var i = 1; i <= 100; i++) {
        if ($("#application" + apptype + "Question" + i).length != 0) {
            question = applicationQuestions["#application" + apptype + "Question" + i];
            answerid = "application" + apptype + "Answer" + i;
            if ($("#" + answerid).length != 0) { // can find by id => text input / textarea / select
                if (!$("#" + answerid).is(':visible')) continue;
                data[question] = $("#" + answerid).val();
                min_length = $("#" + answerid).attr("min-length");
                if (isNumber(min_length)) {
                    if (data[question] != "" && data[question].length < Number(min_length)) {
                        $($("#" + answerid).parent()).after(`<p style='color:red' class='application-error'>This field must contain at least ${min_length} characters.</p>`);
                        err = true;
                    }
                }
            } else if ($("input[name='" + answerid + "']").length != 0) { // can find by name => radio / checkbox
                if (!$("input[name='" + answerid + "']").is(':visible')) continue;
                answer = [];
                answert = $("input[name='" + answerid + "']:checked");
                for (var j = 0; j < answert.length; j++) {
                    answer.push(answert[j].value);
                }
                answer = answer.join(", ");
                data[question] = answer;
            } else {
                data[question] = "*" + mltr("error_invalid_application_question") + "*";
            }
            if (data[question] == "") {
                $($("#" + answerid).parent()).after(`<p style='color:red' class='application-error'>This field must not be empty.</p>`);
                err = true;
            }
        } else {
            continue;
        }
    }
    if (err) {
        UnlockBtn("#button-submit-application");
        return;
    }
    data = JSON.stringify(data);

    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        data: JSON.stringify({
            "application_type": apptype,
            "data": data
        }),
        success: function (data) {
            UnlockBtn("#button-submit-application");
            toastNotification("success", "Success", mltr("application_submitted"), 5000, false);

            if ($("#check-application-enable-notification").prop("checked") == true) {
                EnableNotification("discord", mltr("discord"));
                EnableNotification("application", mltr("application"));
            }
        },
        error: function (data) {
            UnlockBtn("#button-submit-application");
            AjaxError(data);
        }
    });
}

function UpdateStaffPositionsShow() {
    content = `
    <div>
        <label class="form-label">Positions</label>
        <div class="input-group mb-2">
            <input id="application-staff-positions" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="${mltr("positions")}" placeholder='${mltr("enter_a_position")}' multiple=''>
        </div>
    </div>`;
    modalid = ShowModal(mltr("update_staff_positions"), content, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-update-staff-positions" type="button" class="btn btn-primary" onclick="UpdateStaffPositions();">${mltr("update")}</button>`);
    InitModal("update_staff_positions", modalid);
    $('#application-staff-positions').flexdatalist({});
    $("#application-staff-positions").val(positions.join(","));
}

function UpdateStaffPositions() {
    LockBtn("#button-update-staff-positions", mltr("updating"));
    positionstxt = $("#application-staff-positions").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/positions",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "positions": positionstxt
        }),
        success: function (data) {
            UnlockBtn("#button-update-staff-positions");
            positions = positionstxt.split(",");
            localStorage.setItem("positions", JSON.stringify(positions));
            toastNotification("success", "Success!", mltr("staff_positions_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-update-staff-positions");
            AjaxError(data);
        }
    })
}