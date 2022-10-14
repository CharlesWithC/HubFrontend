function LoadDivisionList(){
    lastDivisionUpdate = parseInt(localStorage.getItem("divisionLastUpdate"));
    d = localStorage.getItem("division");
    if (!isNumber(lastDivisionUpdate) || d == null || d == undefined) {
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
                if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
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

function LoadDivisionInfo() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastNotification("error", "Error", data.descriptor, 5000, false);
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

            $("#table_division_delivery_data").empty();
            if (d.recent.length == 0) {
                $("#table_division_delivery_head").hide();
                $("#table_division_delivery_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
            } else {
                $("#table_division_delivery_head").show();
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
                    $("#table_division_delivery_data").append(`
            <tr class="text-sm" style="color:${color}">
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="ShowDeliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
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

function LoadPendingDivisionValidation() {
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
            if(Object.keys(DIVISION).length == 0) return toastNotification("error", "Error", "No division found.", 5000, false);
            $("#table_division_validation_data").empty();
            d = data.response;
            if (d.length == 0) {
                $("#table_division_validation_head").hide();
                $("#table_division_validation_data").append(`<tr><td style="color:#ccc"><i>No Data</i></td>`);
            } else {
                $("#table_division_validation_head").show();
                for (i = 0; i < d.length; i++) {
                    delivery = d[i];
                    $("#table_division_validation_data").append(`
            <tr class="text-sm">
            <td class="py-5 px-6 font-medium"><a onclick="ShowDeliveryDetail(${delivery.logid})" style="cursor:pointer">${delivery.logid}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='LoadUserProfile(${delivery.user.userid})'>${delivery.user.name}</a></td>
              <td class="py-5 px-6 font-medium">${DIVISION[delivery.divisionid]}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px" id="DeliveryInfoBtn${delivery.logid}" 
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="ShowDeliveryDetail('${delivery.logid}')">Details</button></td>
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
    LockBtn("#button-delivery-detail-division", "Checking...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-delivery-detail-division");
            if (data.error) return AjaxError(data);

            divisionopt = "";
            divisions = JSON.parse(localStorage.getItem("division"));
            for(var i = 0 ; i < divisions.length ; i++) {
                divisionopt += `<option value="${divisions[i].name.toLowerCase()}" id="division-${divisions[i].id}">${divisions[i].name}</option>`;
            }
            if(divisionopt == "") return $("#delivery-detail-division").html(`<span style="color:red">No division found</span>`);
            
            info = ``;
            if (data.response.status == "-1") {
                info += `
                <select class="form-select bg-dark text-white" id="select-division">
                    <option selected>Select Division</option>
                    ${divisionopt}
                </select>`;
                info += `<button id="button-request-division-validation" type="button" class="btn btn-primary"  onclick="SubmitDivisionValidationRequest(${logid});">Request Validation</button>`;
                $("#delivery-detail-division").html(info);
            } else if ((userPerm.includes("division") || userPerm.includes("admin")) && data.response.status == "0") {
                info += `
                <p>This delivery is pending division validation.</p>
                <label for="select-division" class="form-label">Division</label>
                <div class="mb-3">
                    <select class="form-select bg-dark text-white" id="select-division">
                        ${divisionopt}
                    </select>
                </div>
                <label for="validate-division-message" class="form-label">Message</label>
                <div class="input-group mb-3" style="height:100px;">
                    <textarea type="text" class="form-control bg-dark text-white" id="validate-division-message" placeholder="(Optional, a reason should be provided here if you need to reject the request)" style="height:100%"></textarea>
                </div>
                `;
                modalid = ShowModal(`Division Validation`, info, `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button id="button-division-danger" type="button" class="btn btn-danger" style="width:100px;" onclick="UpdateDivision(${logid}, 2);">Reject</button>
                <button id="button-division-accept" type="button" class="btn btn-success" style="width:100px;" onclick="UpdateDivision(${logid}, 1);">Accept</button>`);
                InitModal("division_detail", modalid, top = true);
                $("#division-" + data.response.divisionid).prop("selected", true);
            } else {
                DIVISION = {};
                divisions = JSON.parse(localStorage.getItem("division"));
                for(var i = 0 ; i < divisions.length ; i++) {
                    DIVISION[divisions[i].id] = divisions[i].name;
                }

                if (data.response.update_message == undefined) {
                    $("#delivery-detail-division").html(DIVISION[data.response.divisionid]);
                } else {
                    info += DIVISION[data.response.divisionid] + " ";
                    if (data.response.status == "0") info += "| Pending Validation";
                    else if (data.response.status == "1") info += SVG_VERIFIED;
                    else if (data.response.status == "2"){
                        staff = data.response.update_staff;
                        staff = GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar);
                        info += `| Rejected By ` + staff;
                    }
                }
                if (userPerm.includes("division") || userPerm.includes("admin")) {
                    modalid = ShowModal(`Division Validation`, info, `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button id="button-division-revalidate" type="button" class="btn btn-primary" style="width:100px;" onclick="UpdateDivision(${logid}, 0);">Revalidate</button>`);
                    InitModal("division_detail", modalid, top = true);
                } else {
                    $("#delivery-detail-division").html(info);
                }
            }
        },
        error: function (data) {
            UnlockBtn("#button-delivery-detail-division");
            errmsg = JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText;
            $("#delivery-detail-division").html(`<span style="color:red">${errmsg}</span>`);
        }
    });
}

function SubmitDivisionValidationRequest(logid) {
    division = $("#select-division").val();
    divisionid = "-1";
    divisions = JSON.parse(localStorage.getItem("division"));
    for(var i = 0 ; i < divisions.length ; i++) {
        if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
            divisionid = divisions[i].id;
            break;
        }
    }
    if(divisionid == "-1") return toastNotification("error", "Error", "Invalid division.", 5000, false);

    LockBtn("#button-request-division-validation", "Requesting...");

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
            UnlockBtn("#button-request-division-validation");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Request submitted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-request-division-validation");
            AjaxError(data);
        }
    });
}

function UpdateDivision(logid, status) {
    divisionid = "-1";
    if(status >= 1){
        division = $("#select-division").val();
        divisions = JSON.parse(localStorage.getItem("division"));
        for(var i = 0 ; i < divisions.length ; i++) {
            if(divisions[i].name.toLowerCase() == division.toLowerCase()) {
                divisionid = divisions[i].id;
                break;
            }
        }
        if(divisionid == "-1") return toastNotification("error", "Error", "Invalid division.", 5000, false);
    }

    if (status == 1) {
        LockBtn("#button-division-accept", "Accepting...");
        $("#button-division-reject").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#button-division-reject", "Rejecting...");
        $("#button-division-accept").attr("disabled", "disabled");
    } else if(status == 0){
        LockBtn("#button-division-revalidate", "Requesting...");
    }

    message = $("#validate-division-message").val();
    if (message == undefined || message == null) message = "";

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
            message: message
        },
        success: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if(status == 0){
                UnlockBtn("#button-division-revalidate");
            }
            if (data.error) return AjaxError(data);
            GetDivisionInfo(logid);
            if (status == 1) {
                toastNotification("success", "Success", "Division delivery accepted!", 5000, false);
            } else if (status == 2) {
                toastNotification("success", "Success", "Division delivery rejected!", 5000, false);
            } else if(status == 0){
                toastNotification("success", "Success", "Division delivery validation status updated to pending!", 5000, false);
            }
        },
        error: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if(status == 0){
                UnlockBtn("#button-division-revalidate");
            }
            AjaxError(data);
        }
    });
}
