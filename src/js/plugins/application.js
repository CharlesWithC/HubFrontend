applicationQuestions = {}
function PreserveApplicationQuestion(){
    for(var apptype = 1; apptype <= 100; apptype++){
        for(var i = 1 ; i <= 100 ; i++){
            if($("#application" + apptype + "Question" + i).length != 0){
                question = $("#application" + apptype + "Question" + i).html().replaceAll("\n"," ").replaceAll("  "," ");
                applicationQuestions["#application" + apptype + "Question" + i] = question;
            } else {
                continue;
            }
        }
    }
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

    if(!noplaceholder){
        $("#table_my_application_data").children().remove();
        for(var i = 0 ; i < 15 ; i ++){
            $("#table_my_application_data").append(my_application_placeholder_row);
        }
    }

    page = parseInt($("#table_my_application_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = ["Pending", "Accepted", "Declined"];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if(apptype == undefined) apptype = "Unknown";
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0)  closedat = "/";
                status = STATUS[application.status];
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar),`<a id="button-my-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid})">View Details</a>`]);
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

    if(!noplaceholder){
        $("#table_all_application_data").children().remove();
        for(var i = 0 ; i < 15 ; i ++){
            $("#table_all_application_data").append(all_application_placeholder_row);
        }
    }

    page = parseInt($('#table_all_application_page_input').val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/list?page=" + page + "&page_size=15&application_type=0&all_user=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            STATUS = ["Pending", "Accepted", "Declined"];

            applicationList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < applicationList.length; i++) {
                application = applicationList[i];
                apptype = applicationTypes[application.application_type];
                if(apptype == undefined) apptype = "Unknown";
                submit_time = getDateTime(application.submit_timestamp * 1000);
                update_time = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0)  closedat = "/";
                status = STATUS[application.status];
                creator = application.creator;
                staff = application.last_update_staff;

                color = "lightblue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                data.push([`${application.applicationid}`, GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar), `${apptype}`, `<span style="color:${color}">${status}</span>`, `${submit_time}`, `${submit_time}`, GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar),`<a id="button-all-application-${application.applicationid}" class="clickable" onclick="GetApplicationDetail(${application.applicationid}, true)">View Details</a>`]);
            }

            PushTable("#table_all_application", data, total_pages, "LoadAllApplicationList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("hrm") || userPerm.includes("admin")){
        $("#all-application-right-wrapper").show();
    }
}

function GetApplicationDetail(applicationid, staffmode = false) {
    LockBtn("#button-my-application-" + applicationid, "Loading...");
    LockBtn("#button-all-application-" + applicationid, "Loading...");
    
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/application?applicationid=" + applicationid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error){
                UnlockBtn("#button-my-application-" + applicationid);
                UnlockBtn("#button-all-application-" + applicationid);
                return AjaxError(data);
            }

            d = data.response.application.detail;
            discordid = data.response.application.creator.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastNotification("error", "Error", "Application has no data", 5000, false);
                
            apptype = applicationTypes[data.response.application_type];
            ret = "";
            for (i = 0; i < keys.length; i++){
                ret += `<p class="mb-1"><b>${keys[i]}</b></p><p>${d[keys[i]]}</p>`;
            }

            $.ajax({
                url: api_host + "/" + dhabbr + "/user?discordid=" + String(discordid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    info = "";
                    if (!data.error) {
                        d = data.response.user;
                        info += GenTableRow("Name", d.name);
                        info += GenTableRow("Email", d.email);
                        info += GenTableRow("Discord", discordid);
                        info += GenTableRow("TruckersMP", `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
                        info += GenTableRow("Steam", `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
                    }
                    bottom = "";
                    if (!staffmode) {
                        bottom = `
                            <label for="application-new-message" class="form-label">Message</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="Content of message to add to this application" style="height:160px"></textarea>
                            </div>`;
                        modalid = ShowModal("Application #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-application-new-message" type="button" class="btn btn-primary" onclick="AddMessageToApplication(${applicationid});">Update</button>`);
                        InitModal("my_application_detail", modalid);
                    } else {
                        bottom = `
                            <label for="application-new-message" class="form-label">Message</label>
                            <div class="input-group mb-3" style="height:calc(100% - 160px)">
                                <textarea type="text" class="form-control bg-dark text-white" id="application-new-message" placeholder="Content of message to add to this application" style="height:160px"></textarea>
                            </div>

                            <label for="application-new-status" class="form-label">Status</label>
                            <div class="mb-3">
                                <select class="form-select bg-dark text-white" id="application-new-status">
                                    <option selected>Select one from the list</option>
                                    <option value="0">Pending</option>
                                    <option value="1">Accepted</option>
                                    <option value="2">Declined</option>
                                </select>
                            </div>`;
                        modalid = ShowModal("Application #" + applicationid, `<div><table>${info}</table></div><br><div>${ret}</div><hr>${bottom}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-application-update-status" type="button" class="btn btn-primary" onclick="UpdateApplicationStatus(${applicationid});">Update</button>`);
                        InitModal("all_application_detail", modalid);
                    }
                    UnlockBtn("#button-all-application-" + applicationid);
                    UnlockBtn("#button-my-application-" + applicationid);
                }
            });
        },
        error: function (data) {
            UnlockBtn("#button-my-application-" + applicationid);
            UnlockBtn("#button-all-application-" + applicationid);
            AjaxError(data);
        }
    })
}

function AddMessageToApplication(applicationid) {
    message = $("#application-new-message").val();
    LockBtn("#button-application-new-message", "Updating...");
    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": applicationid,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#button-application-new-message");
            if (data.error) return AjaxError(data);
            GetApplicationDetail(applicationid);
            toastNotification("success", "Success!", "Message added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-new-message");
            AjaxError(data);
        }
    });
}

function UpdateApplicationStatus(applicationid) {
    appstatus = parseInt($("#application-new-status").find(":selected").val());
    if(!isNumber(appstatus)) return toastNotification("error", "Error", "Invalid application status!")
    message = $("#application-new-message").val();

    LockBtn("#button-application-update-status", "Updating...");

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/status",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": applicationid,
            "status": appstatus,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#button-application-update-status");
            if (data.error) return AjaxError(data);
            LoadAllApplicationList();
            toastNotification("success", "Success", "Application status updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-application-update-status");
            AjaxError(data);
        }
    })
}

function SubmitApplication() {
    LockBtn("#button-submit-application", "Submitting...");

    apptype = parseInt($("#application-type").find(":selected").attr("value"));
    data = {};
    for(var i = 1 ; i <= 100 ; i++){
        if($("#application" + apptype + "Question" + i).length != 0){
            question = applicationQuestions["#application" + apptype + "Question" + i];
            answerid = "application" + apptype + "Answer" + i;
            if($("#" + answerid).length != 0){ // can find by id => text input / textarea / select
                if(!$("#" + answerid).is(':visible')) continue;
                data[question] = $("#" + answerid).val();
            } else if($("input[name='"+answerid+"']").length != 0){ // can find by name => radio / checkbox
                if(!$("input[name='"+answerid+"']").is(':visible')) continue;
                answer = [];
                answert = $("input[name='"+answerid+"']:checked");
                for(var j = 0 ; j < answert.length ; j++){
                    answer.push(answert[j].value);
                }
                answer = answer.join(", ");
                data[question] = answer;
            } else {
                data[question] = "*Invalid application question: Answer element not found!*";
            }
        } else {
            continue;
        }
    }
    data = JSON.stringify(data);

    $.ajax({
        url: api_host + "/" + dhabbr + "/application",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "application_type": apptype,
            "data": data
        },
        success: function (data) {
            UnlockBtn("#button-submit-application");
            if(data.error) return AjaxError(data);
            toastNotification("success", "Success", "Application submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-submit-application");
            AjaxError(data);
        }
    });
}

function UpdateStaffPositionsShow(){
    content = `
    <div>
        <label class="form-label">Positions</label>
        <div class="input-group mb-2">
            <input id="application-staff-positions" type="text" class="form-control bg-dark text-white flexdatalist" aria-label="Positions" placeholder='Enter a position' multiple=''>
        </div>
    </div>`;
    modalid = ShowModal("Update Staff Positions", content, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-update-staff-positions" type="button" class="btn btn-primary" onclick="UpdateStaffPositions();">Update</button>`);
    InitModal("update_staff_positions", modalid);
    $('#application-staff-positions').flexdatalist({});
    $("#application-staff-positions").val(positions.join(","));
}

function UpdateStaffPositions() {
    LockBtn("#button-update-staff-positions", "Updating...");
    positionstxt = $("#application-staff-positions").val();

    $.ajax({
        url: api_host + "/" + dhabbr + "/application/positions",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "positions": positionstxt
        },
        success: function (data) {
            UnlockBtn("#button-update-staff-positions");
            if (data.error) return AjaxError(data);
            positions = positionstxt.split(",");
            localStorage.setItem("positions", JSON.stringify(positions));
            toastNotification("success", "Success!", "Staff positions updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-update-staff-positions");
            AjaxError(data);
        }
    })
}