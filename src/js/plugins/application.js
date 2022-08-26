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

    // After we've reached here, change the submit button text to "Submitting..."
    $("#submitAppBttn").html("Submitting...");

    // Disable the submit button
    $("#submitAppBttn").attr("disabled", "disabled");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "apptype": apptype,
            "data": data
        },
        success: function (data) {
            if (data.error == false) {
                // Un-disable the submit button
                $("#submitAppBttn").prop("disabled", false);
                $("#submitAppBttn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Success',
                    text: 'Your application has been submitted! Best of luck!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                })
            } else {
                // Un-disable the submit button
                $("#submitAppBttn").prop("disabled", false);
                $("#submitAppBttn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: `${data.descriptor}`,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
            }
        },
        error: function (data) {
            // Un-disable the submit button
            $("#submitAppBttn").prop("disabled", false);
            $("#submitAppBttn").html("Submit");

            // Trigger req swal.fire
            Swal.fire({
                title: 'Error',
                text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                icon: 'error',
                confirmButtonText: 'OK'
            })

            console.warn('Failed to submit application: ', JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText);
        }
    });
}
function loadMyApp(recurse = true) {
    page = parseInt($("#myapppage").val())
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/applications?page=" + page + "&apptype=0",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            $("#myappTable").empty();
            const applications = data.response.list;
            APPTYPE = ["", "Driver", "Staff", "LOA", "Division"];
            STATUS = ["Pending", "Accepted", "Declined"]
            if (applications.length == 0) {
                $("#myappTableHead").hide();
                $("#myappTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#myapppage").val(1);
                if (recurse) loadMyApp(recurse = false);
                return;
            }
            $("#myappTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#myapppage").val(1);
                if (recurse) loadMyApp(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#myapppage").val(1);
                page = 1;
            }
            $("#myapptotpages").html(totpage);
            $("#myAppTableControl").children().remove();
            $("#myAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#myapppage').val(1);loadMyApp();">1</button>`);
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
                onclick="$('#myapppage').val(${i});loadMyApp();">${i}</button>`);
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
                onclick="$('#myapppage').val(${totpage});loadMyApp();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                const application = applications[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                apptype = APPTYPE[application.apptype];
                creation = getDateTime(application.submitTimestamp * 1000);
                closedat = getDateTime(application.closedTimestamp * 1000);
                if (application.closedTimestamp == 0) {
                    closedat = "/";
                    console.log(closedat);
                }
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
              onclick="appDetail(${application.applicationid})">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function addAppMessage() {
    appid = $("#appmsgid").val();
    if (!isNumber(appid)) {
        toastFactory("error", "Error:", "Please enter a valid application ID.", 5000, false);
        return;
    }
    message = $("#appmsgcontent").val();
    $("#addAppMessageBtn").html("Adding...");
    $("#addAppMessageBtn").attr("disabled", "disabled");
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
            $("#addAppMessageBtn").html("Add");
            $("#addAppMessageBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                return toastFactory("success", "Success!", "Message added!", 5000, false);
            }
        },
        error: function (data) {
            $("#addAppMessageBtn").html("Add");
            $("#addAppMessageBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function loadAllApp(recurse = true) {
    page = parseInt($('#allapppage').val())
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/applications?page=" + page + "&apptype=0&showall=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            console.log(data);
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            $("#allappTable").empty();
            $("#totpages").html(Math.ceil(data.response.tot / 10));
            $("#allapppage").val(data.response.page);
            const applications = data.response.list;
            APPTYPE = ["", "Driver", "Staff", "LOA", "Division"];
            STATUS = ["Pending", "Accepted", "Declined"];
            if (applications.length == 0) {
                $("#allappTableHead").hide();
                $("#allappTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#allapppage").val(1);
                if (recurse) loadAllApp(recurse = false);
                return;
            }
            $("#allappTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#allapppage").val(1);
                if (recurse) loadAllApp(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#allapppage").val(1);
                page = 1;
            }
            $("#allapptotpages").html(totpage);
            $("#allAppTableControl").children().remove();
            $("#allAppTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#allapppage').val(1);loadAllApp();">1</button>`);
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
                onclick="$('#allapppage').val(${i});loadAllApp();">${i}</button>`);
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
                onclick="$('#allapppage').val(${totpage});loadAllApp();">${totpage}</button>`);
            }

            for (i = 0; i < applications.length; i++) {
                const application = applications[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                apptype = APPTYPE[application.apptype];
                creation = getDateTime(application.submitTimestamp * 1000);
                closedat = getDateTime(application.closedTimestamp * 1000);
                if (application.closedTimestamp == 0) {
                    closedat = "/";
                    console.log(closedat);
                }
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
              onclick="appDetail(${application.applicationid}, true)">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function appDetail(applicationid, staffmode = false) {
    $("#AllAppBtn" + applicationid).attr("disabled", "disabled");
    $("#AllAppBtn" + applicationid).html("Loading...");
    $("#MyAppBtn" + applicationid).attr("disabled", "disabled");
    $("#MyAppBtn" + applicationid).html("Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application?applicationid=" + applicationid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            d = data.response.detail;
            discordid = data.response.discordid;
            keys = Object.keys(d);
            if (keys.length == 0) {
                return toastFactory("error", "Error:", "Application has no data", 5000,
                    false);
            }
            APPTYPE = ["", "Driver", "Staff", "LOA", "Division"];
            apptype = APPTYPE[data.response.apptype];
            ret = "";
            for (i = 0; i < keys.length; i++) {
                ret += "<p style='text-align:left'><b>" + keys[i] + ":</b><br> " + d[keys[i]] + "</p><br>";
            }
            ret += "";

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
                                onclick="addAppMessage()">Add</button>`;
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
                                onclick="updateAppStatus()" id="updateAppStatusBtn">Update</button>
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
                    $("#AllAppBtn" + applicationid).removeAttr("disabled");
                    $("#AllAppBtn" + applicationid).html("Details");
                    $("#MyAppBtn" + applicationid).removeAttr("disabled");
                    $("#MyAppBtn" + applicationid).html("Details");
                }
            });
        },
        error: function (data) {
            $("#AllAppBtn" + applicationid).removeAttr("disabled");
            $("#AllAppBtn" + applicationid).html("Details");
            $("#MyAppBtn" + applicationid).removeAttr("disabled");
            $("#MyAppBtn" + applicationid).html("Details");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function updateAppStatus() {
    $("#updateAppStatusBtn").attr("disabled", true);
    $("#updateAppStatusBtn").html("Updating...");
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
            $("#updateAppStatusBtn").removeAttr("disabled");
            $("#updateAppStatusBtn").html("Update");
            if (data.error) return toastFactory("error", "Error:", data.descriptor,
                5000, false);
            else {
                loadAllApp();
                return toastFactory("success", "Application status updated.", data.response.message, 5000, false);
            }
        },
        error: function (data) {
            $("#updateAppStatusBtn").removeAttr("disabled");
            $("#updateAppStat usBtn").html("Update");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function updateStaffPosition() {
    $("#updateStaffPositionBtn").attr("disabled", true);
    $("#updateStaffPositionBtn").html("Updating...");
    positions = $("#staffposedit").val().replaceAll("\n", ",");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/positions",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "positions": positions
        },
        success: function (data) {
            $("#updateStaffPositionBtn").removeAttr("disabled");
            $("#updateStaffPositionBtn").html("Update");
            if (data.error) return toastFactory("error", "Error:", data.descriptor,
                5000, false);
            else {
                return toastFactory("success", "Success!", data.response.message, 5000, false);
            }
        },
        error: function (data) {
            $("#updateStaffPositionBtn").removeAttr("disabled");
            $("#updateStaffPositionBtn").html("Update");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}