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

function SubmitApp() {
    GeneralLoad();
    LockBtn("#submitAppBttn");

    apptype = parseInt($("#appselect").find(":selected").attr("value"));
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
        url: apidomain + "/" + vtcprefix + "/application",
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
            UnlockBtn("#submitAppBttn");
            if(data.error) return AjaxError(data);
            toastFactory("success", "Success", "Application submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#submitAppBttn");
            AjaxError(data);
        }
    });
}
function LoadUserApplicationList(recurse = true) {
    GeneralLoad();

    page = parseInt($("#myapppage").val());
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#myappTable").empty();
            applications = data.response.list;
            STATUS = ["Pending", "Accepted", "Declined"]
            if (applications.length == 0) {
                $("#myappTableHead").hide();
                $("#myappTable").append(TableNoData(5));
                $("#myapppage").val(1);
                if (recurse) LoadUserApplicationList(recurse = false);
                return;
            }
            $("#myappTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#myapppage").val(1);
                if (recurse) LoadUserApplicationList(recurse = false);
                return;
            }
            $("#myapptotpages").html(totpage);
            $("#myAppTableControl").children().remove();
            $("#myAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#myapppage').val(1);LoadUserApplicationList();">1</button>`);
            if (page > 3) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#myapppage').val(${i});LoadUserApplicationList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#myAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#myapppage').val(${totpage});LoadUserApplicationList();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                application = applications[i];
                apptype = applicationTypes[application.application_type];
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) 
                    closedat = "/";
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                $("#myappTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">${application.applicationid}</td>
              <td class="py-5 px-6 font-medium">${apptype}</td>
              <td class="py-5 px-6 font-medium">${creation}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${status}</td>
              <td class="py-5 px-6 font-medium">${closedat}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="MyAppBtn${application.applicationid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetApplicationDetail(${application.applicationid})">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function AddMessageToApplication() {
    appid = $("#appmsgid").val();
    if (!isNumber(appid)) {
        toastFactory("error", "Error:", "Please enter a valid application ID.", 5000, false);
        return;
    }
    message = $("#appmsgcontent").val();
    LockBtn("#addAppMessageBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": appid,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#addAppMessageBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "Message added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#addAppMessageBtn");
            AjaxError(data);
        }
    });
}

function LoadAllApplicationList(recurse = true) {
    page = parseInt($('#allapppage').val());
    if (page == "" || page == undefined || page <= 0) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&application_type=0&all_user=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#allappTable").empty();
            $("#totpages").html(Math.ceil(data.response.total_items / 10));
            applications = data.response.list;
            STATUS = ["Pending", "Accepted", "Declined"];
            if (applications.length == 0) {
                $("#allappTableHead").hide();
                $("#allappTable").append(TableNoData(6));
                $("#allapppage").val(1);
                if (recurse) LoadAllApplicationList(recurse = false);
                return;
            }
            $("#allappTableHead").show();
            totpage = Math.ceil(data.response.total_items / 10);
            if (page > totpage) {
                $("#allapppage").val(1);
                if (recurse) LoadAllApplicationList(recurse = false);
                return;
            }
            $("#allapptotpages").html(totpage);
            $("#allAppTableControl").children().remove();
            $("#allAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#allapppage').val(1);LoadAllApplicationList();">1</button>`);
            if (page > 3) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#allapppage').val(${i});LoadAllApplicationList();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#allAppTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#allapppage').val(${totpage});LoadAllApplicationList();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                application = applications[i];
                apptype = applicationTypes[application.application_type];
                creation = getDateTime(application.submit_timestamp * 1000);
                closedat = getDateTime(application.update_timestamp * 1000);
                if (application.update_timestamp == 0) 
                    closedat = "/";
                status = STATUS[application.status];

                color = "blue";
                if (application.status == 1) color = "lightgreen";
                if (application.status == 2) color = "red";

                $("#allappTable").append(`
            <tr class="text-sm" id="AllApp${application.applicationid}">
              <td class="py-5 px-6 font-medium">${application.applicationid}</td>
              <td class="py-5 px-6 font-medium">${application.name}</td>
              <td class="py-5 px-6 font-medium">${apptype}</td>
              <td class="py-5 px-6 font-medium">${creation}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${status}</td>
              <td class="py-5 px-6 font-medium">${closedat}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="AllAppBtn${application.applicationid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetApplicationDetail(${application.applicationid}, true)">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function GetApplicationDetail(applicationid, staffmode = false) {
    GeneralLoad();
    LockBtn("#AllAppBtn" + applicationid, "Loading...");
    LockBtn("#MyAppBtn" + applicationid, "Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application?applicationid=" + applicationid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#AllAppBtn" + applicationid);
            UnlockBtn("#MyAppBtn" + applicationid);
            if (data.error) return AjaxError(data);

            d = data.response.detail;
            discordid = data.response.discordid;
            keys = Object.keys(d);
            if (keys.length == 0)
                return toastFactory("error", "Error:", "Application has no data", 5000, false);
                
            apptype = applicationTypes[data.response.application_type];
            ret = "";
            for (i = 0; i < keys.length; i++)
                ret += "<p style='text-align:left'><b>" + keys[i] + ":</b><br> " + d[keys[i]] + "</p><br>";

            $.ajax({
                url: apidomain + "/" + vtcprefix + "/user?discordid=" + String(discordid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
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
                    }
                    info += ret.replaceAll("\n", "<br>");
                    if (!staffmode) {
                        info += `
                            <hr>
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New message</h3>
                            <div class="mb-6" style="display:none">
                                <label class="block text-sm font-medium mb-2" for="">Application ID</label>
                                <input id="appmsgid" style="width:200px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder="Integar ID" value="${applicationid}"></input>
                            </div>
                                <textarea id="appmsgcontent"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder=""></textarea>
                    
                            <button type="button" id="addAppMessageBtn" style="float:right"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="AddMessageToApplication()">Add</button>`;
                    } else {
                        info += `
                            <hr>
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New message</h3>
                            <div class="mb-6" style="display:none">
                                <label class="block text-sm font-medium mb-2" for="">Application ID</label>
                                <input id="appstatusid" style="width:200px"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder="" value="${applicationid}"></input></div>
                    
                            <div class="mb-6">
                                <textarea id="appmessage"
                                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                                rows="5" placeholder=""></textarea></div>
                    
                            <div class="mb-6 relative" style="width:200px">
                            <h3 class="text-xl font-bold" style="text-align:left;margin:5px">New Status</h3>
                                <select id="appstatussel"
                                class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                                name="field-name">
                                <option value="0">Pending</option>
                                <option value="1">Accepted</option>
                                <option value="2">Declined</option>
                                </select>
                                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewbox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"></path>
                                </svg>
                                </div>
                            </div>
                    
                            <button type="button" style="float:right"
                                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                onclick="UpdateApplicationStatus()" id="updateAppStatusBtn">Update</button>
                            </div>
                        </div>`;
                    }
                    Swal.fire({
                        title: apptype + ' Application #' + applicationid,
                        html: info,
                        icon: 'info',
                        showConfirmButton: false,
                        confirmButtonText: 'Close'
                    })
                }
            });
        },
        error: function (data) {
            UnlockBtn("#AllAppBtn" + applicationid);
            UnlockBtn("#MyAppBtn" + applicationid);
            AjaxError(data);
        }
    })
}

function UpdateApplicationStatus() {
    GeneralLoad();
    LockBtn("#updateAppStatusBtn");

    appid = $("#appstatusid").val();
    appstatus = parseInt($("#appstatussel").find(":selected").val());
    message = $("#appmessage").val();

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/status",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "applicationid": appid,
            "status": appstatus,
            "message": message
        },
        success: function (data) {
            UnlockBtn("#updateAppStatusBtn");
            if (data.error) return AjaxError(data);
            LoadAllApplicationList();
            toastFactory("success", "Success", "Application status updated.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateAppStatusBtn");
            AjaxError(data);
        }
    })
}

function UpdateApplicationPositions() {
    GeneralLoad();
    LockBtn("#updateStaffPositionBtn");
    positions = $("#staffposedit").val().replaceAll("\n", ",");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/positions",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "positions": positions
        },
        success: function (data) {
            UnlockBtn("#updateStaffPositionBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateStaffPositionBtn");
            AjaxError(data);
        }
    })
}