function SubmitApp() {
    apptype = $("#appselect").find(":selected").text();
    data = "";
    if (apptype == "Driver") {
        apptype = 1;

        q1 = $("#da-q1").val();
        q2 = $("#da-q2").val();
        q3 = $("#da-q3").val();
        q4 = $("#da-q4").val();


        // Check if any of the fields are empty
        if (q1 == "" || q2 == "" || q3 == "" || q4 == "") {
            toastFactory("warning", "Error", "You must fill in all the fields!", 5000, false);
            return;
        }


        // Checks for is in vtc and terms
        if ($("#in-another-vtc").prop("checked")) {
            toastFactory("warning", "Error", "You can only be in one VTC at a time!", 5000, false);
            return;
        }

        if (!$("#da-agree").prop("checked")) {
            toastFactory("warning", "Error", "You must agree to the terms and conditions!", 5000, false);
            return;
        }

        // Check if q1 is a vaild date
        const birthDate = new Date(q1);

        if (isNaN(birthDate.getTime())) {
            toastFactory("warning", "Error", "You must enter a valid date!", 5000, false);
            return;
        }

        // Check that q1 follows the MM/DD/YYYY format
        if (q1.length != 10) {
            toastFactory("warning", "Error", "You must enter a date in the MM/DD/YYYY format!", 5000, false);
            return;
        }

        // Check if they are at least 13 years old
        const today = new Date();

        if (today.getFullYear() - birthDate.getFullYear() < 13) {
            toastFactory("warning", "Error", "You must be at least 13 years old to apply!", 5000, false);
            return;
        }

        data = {
            "Birthday": q1,
            "How did you find us?": q2,
            "What are your interests?": q3,
            "Why do you want to be a part our VTC?": q4
        };
    } else if (apptype == "Staff") {
        apptype = 2;

        q1 = $("#sa-q1").val();
        q2 = $("#sa-q2").val();
        q3 = $("#sa-q3").val();
        q4 = $("#sa-q4").val();
        q5 = $("#sa-q5").val();
        pos = $("#sa-select").find(":selected").text();

        // Check if any of the fields are empty
        if (q1 == "" || q2 == "" || q3 == "" || q4 == "" || q5 == "") {
            toastFactory("warning", "Error", "You must fill in all the fields!", 5000, false);
            return;
        }

        if (!$("#sa-agree").prop("checked")) {
            toastFactory("warning", "Error", "You must agree to the terms and conditions!", 5000, false);
            return;
        }

        if (pos == "") {
            toastFactory("warning", "Error", "Please select a position! (If you've already selected, try clicking it again)", 5000, false);
            return;
        }

        data = {
            "Applying For": pos,
            "Birthday": q1,
            "Country & Time Zone": q2,
            "Summary": q3,
            "Why are you interested in joining the position you are applying for? What do you want to achieve?": q4,
            "Do you have a lot of time to dedicate to this position? ": q5
        }
    } else if (apptype == "LOA") {
        apptype = 3;
        q1 = $("#la-q1").val();
        q2 = $("#la-q2").val();
        q3 = $("#la-q3").val();
        q4 = $("#la-leave").find(":selected").text();

        // Check if any of the fields are empty
        if (q1 == "" || q2 == "" || q3 == "") {
            toastFactory("warning", "Error", "You must fill in all the fields!", 5000, false);
            return;
        }

        data = {
            "Start Date": q1,
            "End Date": q2,
            "Reason": q3,
            "Will they leave position or leave VTC?": q4
        }
    } else if (apptype == "Division") {
        apptype = 4;
        q1 = $("#dca-q1").val();
        q2 = $("#dca-q2").val();
        q3 = $("#dca-q3").val();
        q4 = $("#dca-q4").val();
        q5 = $("#dca-q5").val();

        // Check if any of the fields are empty
        if (q1 == "" || q2 == "" || q3 == "" || q4 == "" || q5 == "") {
            toastFactory("warning", "Error", "You must fill in all the fields!", 5000, false);
            return;
        }

        if (!$("#construction-read").prop("checked")) {
            toastFactory("warning", "Error", "You must first read the handbook!", 5000, false);
            return;
        }

        if (!$("#construction-agree").prop("checked")) {
            toastFactory("warning", "Error", "You can't join the division if you can't meet the monthly requirement!", 5000, false);
            return;
        }

        data = {
            "Why do you want to join the construction division?": q1,
            "Have you read over the full division handbook?": "Yes",
            "What is the biggest difference between hauling construction division loads compared to normal loads?": q2,
            "What is a flatbed trailer designed to haul?": q3,
            "After the first 50 miles, how often should you stop and check your load?": q4,
            "What is the only time when it is appropriate to stop on the shoulder of the road?": q5,
            "In the construction division, you are required to complete 5 deliveries of 95+ miles with construction loads per month. Do you agree to meet the monthly requirement?": "Yes"
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
                text: `ERROR_UNHANDLED`,
                icon: 'error',
                confirmButtonText: 'OK'
            })

            console.warn('Failed to submit application (Unhandled Error): ', data.descriptor ? data.descriptor :
                'No Error Descriptor - check cors?');
        }
    });
}
function loadMyApp(recurse = true) {
    page = parseInt($("#myapppage").val())
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&apptype=0",
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
            <tr class="text-xs">
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
                // <tr class="text-xs">
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
            <tr class="text-xs">
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
            toastFactory("error", "Error:", "Failed to receive API response.", 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            toastFactory("error", "Error:", "Failed to receive API response.", 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
}

function loadAllApp(recurse = true) {
    page = parseInt($('#allapppage').val())
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/application/list?page=" + page + "&apptype=0&showall=1",
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
            <tr class="text-xs">
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
                // <tr class="text-xs">
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
            <tr class="text-xs" id="AllApp${application.applicationid}">
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
            toastFactory("error", "Error:", "Failed to receive API response.", 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            d = data.response.data;
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
                url: apidomain + "/" + vtcprefix + "/user/info?qdiscordid=" + String(discordid),
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
            toastFactory("error", "Error:", "Failed to receive API response.", 5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
        type: "POST",
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
            toastFactory("error", "Error:", "Failed to receive API response.",
                5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
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
            toastFactory("error", "Error:", "Failed to receive API response.",
                5000,
                false);
            console.warn(
                `Failed to load applications. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}