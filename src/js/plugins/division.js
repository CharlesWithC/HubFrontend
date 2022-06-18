function loadDivision() {
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
                                                <tr class="text-xs">
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
            },
            error: function (data) {
                toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
                console.warn(
                    `Failed to fetch divisions. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
                console.log(data);
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
                                        <tr class="text-xs">
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
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/info",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            const d = data.response;
            info = d.info;
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].id;
                divisionname = info[i].name;
                stats = info[i].stats;
                tablename = "#divisionTable" + divisionid;
                $(tablename).empty();
                if (stats.length == 0) {
                    $(tablename).append(`
                <tr class="text-xs">
                  <td class="py-5 px-6 font-medium">No Data</td>
                  <td class="py-5 px-6 font-medium"></td>
                </tr>`);
                } else {
                    for (j = 0; j < stats.length; j++) {
                        $(tablename).append(`
                        <tr class="text-xs">
                        <td class="py-5 px-6 font-medium"><a style="cursor:pointer" onclick="loadProfile(${stats[j].userid});">${stats[j].name}</a></td>
                        <td class="py-5 px-6 font-medium">${stats[j].points}</td>
                        </tr>`);
                    }
                }
            }

            $("#divisionDeliveryTable").empty();
            if (d.deliveries.length == 0) {
                $("#divisionDeliveryTableHead").hide();
                $("#divisionDeliveryTable").append(`
            <tr class="text-xs">
                <td class="py-5 px-6 font-medium">No Data</td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
            </tr>`);
            } else {
                $("#divisionDeliveryTableHead").show();
                for (i = 0; i < d.deliveries.length; i++) {
                    const delivery = d.deliveries[i];
                    distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                    cargo_mass = parseInt(delivery.cargo_mass / 1000);
                    unittxt = "€";
                    if (delivery.unit == 2) unittxt = "$";
                    profit = TSeparator(delivery.profit);
                    color = "";
                    if (delivery.profit < 0) color = "grey";
                    dtl =
                        `<td class="py-5 px-6 font-medium">
                    <button type="button" style="display:inline;padding:5px" id="DeliveryInfoBtn${delivery.logid}" 
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="deliveryDetail('${delivery.logid}')">Details</button></td>`;
                    dextra = "<span title='Validated Division Delivery'>" + VERIFIED + "</span>";
                    $("#divisionDeliveryTable").append(`
            <tr class="text-xs" style="color:${color}">
            <td class="py-5 px-6 font-medium">${delivery.logid} ${dextra}</td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='loadProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass}t)</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
              ${dtl}
            </tr>`);
                }
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
            console.warn(
                `Failed to load division. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}

function loadStaffDivision() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/validate",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            DIVISION = {
                1: "Construction",
                2: "Chilled",
                3: "ADR"
            };
            $("#staffDisivionTable").empty();
            d = data.response;
            if (d.length == 0) {
                $("#staffDisivionTableHead").hide();
                $("#staffDisivionTable").append(`
            <tr class="text-xs">
                <td class="py-5 px-6 font-medium">No Data</td>
                <td class="py-5 px-6 font-medium"></td>
                <td class="py-5 px-6 font-medium"></td>
            </tr>`);
            } else {
                $("#staffDisivionTableHead").show();
                for (i = 0; i < d.length; i++) {
                    const delivery = d[i];
                    $("#staffDisivionTable").append(`
            <tr class="text-xs">
            <td class="py-5 px-6 font-medium"><a onclick="deliveryDetail(${delivery.logid})" style="cursor:pointer">${delivery.logid}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='loadProfile(${delivery.userid})'>${delivery.name}</a></td>
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
            toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
            console.warn(
                `Failed to load division. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    })
}
function divisionInfo(logid) {
    $("#divisioninfobtn").html("Loading...");
    $("#divisioninfobtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/info?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            $("#divisioninfobtn").html("Division");
            $("#divisioninfobtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = `<div style="text-align:left">`;
            if (data.response.requestSubmitted == false) {
                info += `
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  <option value="construction">Construction</option>
                  <option value="chilled">Chilled</option>
                  <option value="adr">ADR</option>
                </select>`;
                info += `<button type="button" style="float:right" id="divisionRequestBtn"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="requestDivision(${logid})">Request Division Validation</button>`;
                info += "</div>";
                Swal.fire({
                    title: `Division Delivery #` + logid,
                    html: info,
                    icon: 'info',
                    showConfirmButton: false,
                    confirmButtonText: 'Close'
                });
            } else if (data.response.isstaff == true && data.response.status == 0) {
                info += `
                <p>This delivery is pending division validation.</p>
                <p>The division is selected by driver and changeable.</p>
                <p>A short reason should be provided if you'd reject it.</p>
                <h3 class="text-xl font-bold" style="text-align:left;margin:5px">Division: </h3>
                <select id="divisionSelect"
                  class="appearance-none block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
                  name="field-name">
                  <option value="construction" id="division1">Construction</option>
                  <option value="chilled" id="division2">Chilled</option>
                  <option value="adr" id="division3">ADR</option>
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
                DIVISION = {
                    1: "Construction",
                    2: "Chilled",
                    3: "ADR"
                };
                if (data.response.reason == undefined) {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validated at " + getDateTime(data.response.updatets * 1000) +
                        " by <a onclick='loadProfile(" + data.response.staffid + ");'>" + data.response.staffname + "</a></p>";
                } else {
                    info += "<p><b>Division</b>: " + DIVISION[data.response.divisionid] + "</p><br>";
                    info += "<p>Validation requested at " + getDateTime(data.response.requestts * 1000) + "</p>";
                    if (data.response.status == 0) info += "<p>- Pending Validation</p>";
                    else if (data.response.status == 1)
                        info += "<p>Validated at " + getDateTime(data.response.updatets * 1000) +
                        " by <a onclick='loadProfile(" + data.response.staffid + ");'>" + data.response.staffname + "</a></p>";
                    else if (data.response.status == 2)
                        info += "<p>Denied at " + getDateTime(data.response.updatets * 1000) +
                        " by <a onclick='loadProfile(" + data.response.staffid + ");'>" + data.response.staffname + "</a></p>";
                    if (data.response.reason != "")
                        info += "<p> - For reason " + data.response.reason + "</p>";
                }
                if (data.response.isstaff == true) {
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
            $("#divisioninfobtn").html("Division");
            $("#divisioninfobtn").removeAttr("disabled");
            toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
            console.warn(
                `Failed to load division information. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
}

function requestDivision(logid) {
    $("#divisionRequestBtn").html("Loading...");
    $("#divisionRequestBtn").attr("disabled", "disabled");
    division = $("#divisionSelect").val();
    divisionid = 0;
    if (division == "construction") divisionid = 1;
    else if (division == "chilled") divisionid = 2;
    else if (division == "adr") divisionid = 3;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/validate",
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
            $("#divisionRequestBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            $("#divisionRequestBtn").removeAttr("disabled");
            toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
            console.warn(
                `Failed to load division information. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
}

function updateDivision(logid, status) {
    if (status <= 1) {
        $("#divisionAcceptBtn").html("Working...");
        $("#divisionAcceptBtn").attr("disabled", "disabled");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    } else if (status == 2) {
        $("#divisionRejectBtn").html("Working...");
        $("#divisionAcceptBtn").attr("disabled", "disabled");
        $("#divisionRejectBtn").attr("disabled", "disabled");
    }
    division = $("#divisionSelect").val();
    divisionid = 0;
    if (division == "construction") divisionid = 1;
    else if (division == "chilled") divisionid = 2;
    else if (division == "adr") divisionid = 3;
    reason = $("#divisionReason").val();
    if (reason == undefined || reason == null) reason = "";
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/division/validate",
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
            $("#divisionAcceptBtn").removeAttr("disabled");
            $("#divisionRejectBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            toastFactory("success", "Success", data.response, 5000, false);
            divisionInfo(logid);
        },
        error: function (data) {
            $("#divisionAcceptBtn").removeAttr("disabled");
            $("#divisionRejectBtn").removeAttr("disabled");
            toastFactory("error", "Error:", "Please check the console for more info.", 5000, false);
            console.warn(
                `Failed to load division information. Error: ${data.descriptor ? data.descriptor : 'Unknown Error'}`);
            console.log(data);
        }
    });
}
