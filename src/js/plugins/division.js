function loadDivisionList(){
    lastDivisionUpdate = parseInt(localStorage.getItem("divisionLastUpdate"));
    if (!isNumber(lastDivisionUpdate)) {
        lastDivisionUpdate = 0;
    }
    if (+new Date() - lastDivisionUpdate > 86400) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/division/list",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                d = data.response;
                localStorage.setItem("division", JSON.stringify(d));
                localStorage.setItem("divisionLastUpdate", + new Date());
                for (var i = 0; i < d.length; i++) {
                    $("#divisionList").append(
                        `<div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                            <div class="p-6 rounded bg-white">
                                <div class="mb-2">
                                    <h2 style="display:inline">${d[i].name}</h2>
                                    <div class="p-4 overflow-x-auto" style="display: block;max-height:60vh">
                                        <table class="table-auto w-full">
                                            <thead id="divisionTable${d[i].id}Head">
                                                <tr class="text-xs text-gray-500 text-left">
                                                    <th class="py-5 px-6 pb-3 font-medium">Name</th>
                                                    <th class="py-5 px-6 pb-3 font-medium">Points</th>
                                                </tr>
                                            </thead>
                                            <tbody id="divisionTable${d[i].id}">
                                                <tr class="text-sm">
                                                    <td class="py-5 px-6 font-medium">No Data</td>
                                                    <td class="py-5 px-6 font-medium"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>`);
                }
            }
        })
    } else {
        d = localStorage.getItem("division");
        d = JSON.parse(d);
        for (var i = 0; i < d.length; i++) {
            $("#divisionList").append(
                `<div class="md:w-1/2 lg:w-1/4 p-4 statscard" style="padding-top:0">
                    <div class="p-6 rounded bg-white">
                        <div class="mb-2">
                            <h2 style="display:inline">${d[i].name}</h2>
                            <div class="p-4 overflow-x-auto" style="display: block;max-height:60vh">
                                <table class="table-auto w-full">
                                    <thead id="divisionTable${d[i].id}Head">
                                        <tr class="text-xs text-gray-500 text-left">
                                            <th class="py-5 px-6 pb-3 font-medium">Name</th>
                                            <th class="py-5 px-6 pb-3 font-medium">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody id="divisionTable${d[i].id}">
                                        <tr class="text-sm">
                                            <td class="py-5 px-6 font-medium">No Data</td>
                                            <td class="py-5 px-6 font-medium"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>`);
        }
    }
}

function loadDivision() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            d = data.response;
            info = d.statistics;
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].divisionid;
                divisionname = info[i].name;
                stats = info[i].drivers;
                tablename = "#divisionTable" + divisionid;
                $(tablename).empty();
                if (stats.length == 0) {
                    $(tablename).append(`
                <tr class="text-sm">
                  <td class="py-5 px-6 font-medium">No Data</td>
                  <td class="py-5 px-6 font-medium"></td>
                </tr>`);
                } else {
                    for (j = 0; j < stats.length; j++) {
                        $(tablename).append(`
                        <tr class="text-sm">
                        <td class="py-5 px-6 font-medium"><a style="cursor:pointer" onclick="LoadUserProfile(${stats[j].userid});">${stats[j].name}</a></td>
                        <td class="py-5 px-6 font-medium">${stats[j].points}</td>
                        </tr>`);
                    }
                }
            }

            $("#divisionDeliveryTable").empty();
            if (d.recent.length == 0) {
                $("#divisionDeliveryTableHead").hide();
                $("#divisionDeliveryTable").append(TableNoData(8));
            } else {
                $("#divisionDeliveryTableHead").show();
                for (i = 0; i < d.recent.length; i++) {
                    delivery = d.recent[i];
                    distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                    cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                    unittxt = "€";
                    if (delivery.unit == 2) unittxt = "$";
                    profit = TSeparator(delivery.profit);
                    color = "";
                    if (delivery.profit < 0) color = "grey";
                    dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";
                    $("#divisionDeliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass})</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function loadStaffDivision() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/list/pending",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            DIVISION = {};
            divisions = JSON.parse(localStorage.getItem("division"));
            for(var i = 0 ; i < divisions.length ; i++) {
                DIVISION[divisions[i].id] = divisions[i].name;
            }
            if(Object.keys(DIVISION).length == 0) return toastFactory("error", "Error:", "No division found.", 5000, false);
            $("#staffDisivionTable").empty();
            d = data.response;
            if (d.length == 0) {
                $("#staffDisivionTableHead").hide();
                $("#staffDisivionTable").append(TableNoData(3));
            } else {
                $("#staffDisivionTableHead").show();
                for (i = 0; i < d.length; i++) {
                    delivery = d[i];
                    $("#staffDisivionTable").append(`
            <tr class="text-sm">
            <td class="py-5 px-6 font-medium"><a onclick="deliveryDetail(${delivery.logid})" style="cursor:pointer">${delivery.logid}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${DIVISION[delivery.divisionid]}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="DeliveryInfoBtn${delivery.logid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="deliveryDetail('${delivery.logid}')">Details</button></td>
            </tr>`);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}
function GetDivisionInfo(logid) {
    GeneralLoad();
    LockBtn("#divisioninfobtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#divisioninfobtn");
            if (data.error) return AjaxError(data);

            info = `<div style="text-align:left">`;
            if (data.response.status == "-1") {
                divisionopt = "";
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    divisionopt += `<option value="${divisions[i].name.toLowerCase()}" id="division${divisions[i].id}">${divisions[i].name}</option>`;
                }
                if(divisionopt == "") return toastFactory("error", "Error:", "No division found.", 5000, false);
                info += `
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  ${divisionopt}
                </select>`;
                info += `<button type="button" style="float:right" id="divisionRequestBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="SubmitDivisionValidationRequest(${logid})">Request Division Validation</button>`;
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    showConfirmButton: false,
                    confirmButtonText: 'Close'
                });
            } else if (data.response.user_is_staff == true && data.response.status == "0") {
                divisionopt = "";
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    divisionopt += `<option value="${divisions[i].name.toLowerCase()}" id="division${divisions[i].id}">${divisions[i].name}</option>`;
                }
                if(divisionopt == "") return toastFactory("error", "Error:", "No division found.", 5000, false);
                info += `
                <p>This delivery is pending division validation.</p>
                <p>The division is selected by driver and changeable.</p>
                <p>A short reason should be provided if you'd reject it.</p>
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  ${divisionopt}
                </select>
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Reason: </h3>
                <textarea id="divisionReason"
                class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded" name="field-name"
                rows="5" placeholder=""></textarea>
                `;
                info += `<button type="button" style="float:right;background-color:green;margin:5px" id="divisionAcceptBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="updateDivision(${logid}, 1)">Accept</button>`;
                info += `<button type="button" style="float:right;background-color:red;margin:5px" id="divisionRejectBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="updateDivision(${logid}, 2)">Deny</button>`;
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    showConfirmButton: false,
                    confirmButtonText: 'Close'
                });
                $("#division" + data.response.divisionid).prop("selected", true);
            } else {
                DIVISION = {};
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    DIVISION[divisions[i].id] = divisions[i].name;
                }
                if(Object.keys(DIVISION).length == 0) return toastFactory("error", "Error:", "No division found.", 5000, false);
                if (data.response.update_reason == undefined) {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validated at " + getDateTime(parseInt(data.response.update_timestamp) * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                } else {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validation requested at " + getDateTime(data.response.request_timestamp * 1000) + "</p>";
                    if (data.response.status == "0") info += "<p>- Pending Validation</p>";
                    else if (data.response.status == "1")
                        info += "<p>Validated at " + getDateTime(parseInt(data.response.update_timestamp) * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                    else if (data.response.status == "2")
                        info += "<p>Denied at " + getDateTime(data.response.update_timestamp * 1000) +
                        " by <a onclick='LoadUserProfile(" + data.response.update_staff.userid + ");'>" + data.response.update_staff.name + "</a></p>";
                    if (data.response.update_reason != "")
                        info += "<p> - For reason " + data.response.update_reason + "</p>";
                }
                if (data.response.user_is_staff == true) {
                    info += `<button type="button" style="float:right;background-color:grey;margin:5px" id="divisionAcceptBtn"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="updateDivision(${logid}, 0)">Revalidate</button>`;
                }
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    confirmButtonText: 'Close'
                });
            }
        },
        error: function (data) {
            if (data.error) return AjaxError(data);
            AjaxError(data);
        }
    });
}

function SubmitDivisionValidationRequest(logid) {
    GeneralLoad();
    LockBtn("#divisionRequestBtn");

    division = $("#divisionSelect").val();
    divisionid = "-1";
    divisions = JSON.parse(localStorage.getItem("division"));
    for(var i = 0 ; i < divisions.length ; i++) {
        if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
            divisionid = divisions[i].id;
            break;
        }
    }
    if(divisionid == "-1") return toastFactory("error", "Error:", "Invalid division.", 5000, false);

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
            divisionid: divisionid
        },
        success: async function (data) {
            UnlockBtn("#divisionRequestBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#divisionRequestBtn");
            AjaxError(data);
        }
    });
}

function updateDivision(logid, status) {
    GeneralLoad();
    if (status <= 1) {
        LockBtn("#divisionAcceptBtn");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#divisionRejectBtn");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    }

    division = $("#divisionSelect").val();
    divisionid = "-1";
    divisions = JSON.parse(localStorage.getItem("division"));
    for(var i = 0 ; i < divisions.length ; i++) {
        if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
            divisionid = divisions[i].id;
            break;
        }
    }
    if(divisionid == "-1") return toastFactory("error", "Error:", "Invalid division.", 5000, false);
    reason = $("#divisionReason").val();
    if (reason == undefined || reason == null) reason = "";
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
            divisionid: divisionid,
            status: status,
            reason: reason
        },
        success: function (data) {
            UnlockBtn("#divisionAcceptBtn");
            UnlockBtn("#divisionRejectBtn");
            if (data.error) return AjaxError(data);
            GetDivisionInfo(logid);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#divisionAcceptBtn");
            UnlockBtn("#divisionRejectBtn");
            AjaxError(data);
        }
    });
}
