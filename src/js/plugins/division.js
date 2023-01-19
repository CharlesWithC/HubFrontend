division_placeholder_row = `
<div class="shadow p-3 mb-3 bg-dark rounded col card">
    <h5 class="card-title"><strong><span class="placeholder" style="width:150px"></span></strong></h5>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> <span class="placeholder" style="width:100px"></span></p>
    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> <span class="placeholder" style="width:120px"></span></p>
</div>`;

division_pending_row = `<tr>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:25%;"><span class="placeholder w-100"></span></td>
<td style="width:50%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadDivisionDeliveryList(noplaceholder = false) {
    if(!noplaceholder){
        $("#table_division_delivery_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_division_delivery_data").append(dlog_placeholder_row);
        }
    }
    InitPaginate("#table_division_delivery", "LoadDivisionDeliveryList();");
    page = parseInt($("#table_division_delivery_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/list?page=" + page + "&page_size=20&division=only",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            deliverylist = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < deliverylist.length; i++) {
                delivery = deliverylist[i];
                user = delivery.user;
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.division != "") dextra = `<span title='${mltr("validated_division_delivery")}'>` + SVG_VERIFIED + "</span>";

                dloguser = GetAvatar(user.userid, user.name, user.discordid, user.avatar);

                data.push([`<tr_style>color:${color}</tr_style>`, `${delivery.logid} ${dextra}`, `${dloguser}`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`, `<a class="clickable" onclick="ShowDeliveryDetail('${delivery.logid}')"><i class="fa-solid fa-folder-open"></i></a>`]);
            }

            PushTable("#table_division_delivery", data, total_pages, "LoadDivisionDeliveryList();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

async function LoadDivisionInfo(noplaceholder = false) {
    if (!noplaceholder) {
        $("#division-summary-list").children().remove();
        for (var i = 0; i < 3; i++) {
            $("#division-summary-list").append(division_placeholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/division",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            info = data.response;

            $("#division-summary-list").children().remove();
            for (var i = 0; i < info.length; i++) {
                divisionid = info[i].divisionid;
                divisionname = info[i].name;
                totaldrivers = TSeparator(info[i].total_drivers);
                totalpnt = TSeparator(info[i].total_points);
                $("#division-summary-list").append(`
                <div class="shadow p-3 mb-3 bg-dark rounded col card">
                    <h5 class="card-title"><strong>${divisionname}</strong></h5>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-user-group"></i></span> ${totaldrivers} Drivers</p>
                    <p class="card-text"><span class="rect-20"><i class="fa-solid fa-coins"></i></span> ${totalpnt} Points</p>
                </div>`);
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });
    LoadDivisionDeliveryList(noplaceholder = noplaceholder);
    while (1) {
        if (userPermLoaded) break;
        await sleep(100);
    }
    if (userPerm.includes("division") || userPerm.includes("admin")) {
        $("#division-pending-list").show();
        LoadPendingDivisionValidation();
    }
}

function GetDivisionInfo(logid) {
    LockBtn("#button-delivery-detail-division", mltr("checking"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?logid=" + logid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-delivery-detail-division");
            if (data.error) return AjaxError(data);

            divisionopt = "";
            for (var i = 0; i < Object.keys(divisions).length; i++) {
                divisionopt += `<option value="${divisions[Object.keys(divisions)[i]].id}" id="division-${divisions[Object.keys(divisions)[i]].id}">${divisions[Object.keys(divisions)[i]].name}</option>`;
            }
            if (divisionopt == "") return $("#delivery-detail-division").html(`<span style="color:red">${mltr("no_division_found")}</span>`);

            info = ``;
            if (data.response.status == "-1") {
                info += `
                <select class="form-select bg-dark text-white" id="select-division">
                    <option value="-1" selected>${mltr("select_division")}</option>
                    ${divisionopt}
                </select>`;
                info += `<button id="button-request-division-validation" type="button" class="btn btn-primary"  onclick="SubmitDivisionValidationRequest(${logid});">${mltr("request_validation")}</button>`;
                $("#delivery-detail-division").html(info);
            } else if ((userPerm.includes("division") || userPerm.includes("admin")) && data.response.status == "0") {
                info += `
                <p>${mltr("division_pending_validation")}</p>
                <label for="select-division" class="form-label">${mltr("divisions")}</label>
                <div class="mb-3">
                    <select class="form-select bg-dark text-white" id="select-division">
                        ${divisionopt}
                    </select>
                </div>
                <label for="validate-division-message" class="form-label">${mltr("message")}</label>
                <div class="input-group mb-3" style="height:100px;">
                    <textarea type="text" class="form-control bg-dark text-white" id="validate-division-message" placeholder="" style="height:100%"></textarea>
                </div>
                `;
                modalid = ShowModal(mltr('division_validation'), info, `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button>
                <button id="button-division-danger" type="button" class="btn btn-danger" onclick="UpdateDivision(${logid}, 2);">${mltr('reject')}</button>
                <button id="button-division-accept" type="button" class="btn btn-success" onclick="UpdateDivision(${logid}, 1);">${mltr('accept')}</button>`);
                InitModal("division_detail", modalid, top = true);
                $("#division-" + data.response.divisionid).prop("selected", true);
            } else {
                if (data.response.update_message == undefined) {
                    $("#delivery-detail-division").html(divisions[data.response.divisionid].name);
                } else {
                    info += divisions[data.response.divisionid].name + " ";
                    if (data.response.status == "0") info += "| " + mltr("pending_validation");
                    else if (data.response.status == "1") info += SVG_VERIFIED;
                    else if (data.response.status == "2") {
                        staff = data.response.update_staff;
                        staff = GetAvatar(staff.userid, staff.name, staff.discordid, staff.avatar);
                        info += `| ${mltr("rejected_by")} ` + staff;
                    }
                }
                if (userPerm.includes("division") || userPerm.includes("admin")) {
                    modalid = ShowModal(mltr('division_validation'), info, `
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('close')}</button>
                    <button id="button-division-revalidate" type="button" class="btn btn-primary" onclick="UpdateDivision(${logid}, 0);">${mltr('revalidate')}</button>`);
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
    divisionid = $("#select-division").find(":selected").val();
    if (divisionid == "-1") return toastNotification("error", "Error", mltr("invalid_division"), 5000, false);

    LockBtn("#button-request-division-validation", mltr("requesting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?divisionid=" + divisionid,
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid
        },
        success: async function (data) {
            UnlockBtn("#button-request-division-validation");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", mltr("request_submitted"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-request-division-validation");
            AjaxError(data);
        }
    });
}

function LoadPendingDivisionValidation() {
    InitPaginate("#table_division_pending", "LoadPendingDivisionValidation();");
    page = parseInt($("#table_division_pending_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    
    $("#table_division_pending_data").empty();
    for (var i = 0; i < 5; i++) {
        $("#table_division_pending_data").append(division_pending_row);
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/division/list/pending?page_size=20&page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);

            total_pages = data.response.total_pages;
            pending_division = data.response.list;
            data = [];

            for (i = 0; i < pending_division.length; i++) {
                delivery = pending_division[i];
                user = delivery.user;
                data.push([`${delivery.logid}`,`${divisions[delivery.divisionid].name}`,`${GetAvatar(user.userid, user.name, user.discordid, user.avatar)}`,`<a class="clickable" onclick="ShowDeliveryDetail(${delivery.logid})"><i class="fa-solid fa-folder-open"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="UpdateDivision(${delivery.logid}, 1, ${delivery.divisionid}, true)"><i class="fa-solid fa-check"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="UpdateDivision(${delivery.logid}, 2, ${delivery.divisionid}, true)"><i class="fa-solid fa-xmark"></i></a>&nbsp;&nbsp;<a class="clickable" onclick="UpdateDivision(${delivery.logid}, 0, ${delivery.divisionid}, true)"><i class="fa-solid fa-question"></i></a>`]);
            }

            PushTable("#table_division_pending", data, total_pages, "LoadPendingDivisionValidation();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function UpdateDivision(logid, status, divisionid = -1, force = false) {
    if (status >= 1 && divisionid == -1) {
        divisionid = $("#select-division").find(":selected").val();
        if (divisionid == "-1") return toastNotification("error", "Error", mltr("invalid_division"), 5000, false);
    }

    if (status == 1) {
        LockBtn("#button-division-accept", mltr("accepting"));
        $("#button-division-reject").attr("disabled", "disabled");
    } else if (status == 2) {
        LockBtn("#button-division-reject", mltr("rejecting"));
        $("#button-division-accept").attr("disabled", "disabled");
    } else if (status == 0) {
        LockBtn("#button-division-revalidate", mltr("requesting"));
    }

    message = $("#validate-division-message").val();
    if (message == undefined || message == null) message = "";

    $.ajax({
        url: api_host + "/" + dhabbr + "/division?divisionid=" + divisionid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            logid: logid,
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
            } else if (status == 0) {
                UnlockBtn("#button-division-revalidate");
            }
            if (data.error) return AjaxError(data);
            if(!force) GetDivisionInfo(logid);
            LoadPendingDivisionValidation();
            if (status == 1) {
                toastNotification("success", "Success", mltr("division_delivery_accepted"), 5000, false);
            } else if (status == 2) {
                toastNotification("success", "Success", mltr("division_delivery_rejected"), 5000, false);
            } else if (status == 0) {
                toastNotification("success", "Success", mltr("division_delivery_validation_status_updated_to_pending"), 5000, false);
            }
        },
        error: function (data) {
            if (status == 1) {
                UnlockBtn("#button-division-accept");
                $("#button-division-reject").removeAttr("disabled");
            } else if (status == 2) {
                UnlockBtn("#button-division-reject");
                $("#button-division-accept").removeAttr("disabled");
            } else if (status == 0) {
                UnlockBtn("#button-division-revalidate");
            }
            AjaxError(data);
        }
    });
}