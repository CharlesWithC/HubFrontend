dmapint = -1;
window.mapcenter = {}
window.autofocus = {}

function LoadDriverLeaderStatistics() {
    function AjaxLDLS(start, end, dottag) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?start_time=" + start + "&end_time=" + end + "&page=1&page_size=1",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                users = data.response.list;
                dottuser = users[0];
                discordid = dottuser.user.discordid;
                avatar = GetAvatarSrc(discordid, dottuser.user.avatar);
                distance = TSeparator(parseInt(dottuser.points.distance * distance_ratio));
                $("#dot" + dottag).html(GetAvatarImg(src, dottuser.user.userid, dottuser.user.name));
                $("#dot" + dottag + "distance").html(`(${distance}${distance_unit_txt})`);
            }
        });
    }
    driver_of_the_tag = ["d", "w"];
    for (var i = 0; i < driver_of_the_tag.length; i++) {
        dott = driver_of_the_tag[i];
        var start = new Date();
        if (dott == "d") start = new Date();
        else if (dott == "w") start = GetMonday(new Date());
        start.setHours(0, 0, 0, 0);
        start = +start + start.getTimezoneOffset() * 60000;
        start /= 1000;
        var end = +new Date() / 1000;
        start = parseInt(start);
        end = parseInt(end);
        AjaxLDLS(start, end, dott);
    }
}

leaderboard_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadLeaderboard(noplaceholder = false) {
    LockBtn("#button-leaderboard-options-update", btntxt = "...");

    page_size = parseInt($("#leaderboard-page-size").val());
    if (!isNumber(page_size)) page_size = 20;

    if (!noplaceholder) {
        $("#table_leaderboard_data").children().remove();
        for (i = 0; i < page_size; i++) {
            $("#table_leaderboard_data").append(leaderboard_placeholder_row);
        }
    }

    InitPaginate("#table_leaderboard", "LoadLeaderboard();");
    page = parseInt($("#table_leaderboard_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1,
        end_time = -1;
    if ($("#leaderboard-start-time").val() != "" && $("#leaderboard-end-time").val() != "") {
        start_time = +new Date($("#leaderboard-start-time").val()) / 1000;
        end_time = +new Date($("#leaderboard-end-time").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#leaderboard-speed-limit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    dets2 = $("#leaderboard-ets2").is(":checked");
    dats = $("#leaderboard-ats").is(":checked");
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    ldistance = $("#leaderboard-distance").is(":checked");
    lchallenge = $("#leaderboard-challenge").is(":checked");
    levent = $("#leaderboard-event").is(":checked");
    ldivision = $("#leaderboard-division").is(":checked");
    lmyth = $("#leaderboard-myth").is(":checked");
    limittype = ""
    if (ldistance == 1) limittype += "distance,";
    if (lchallenge == 1) limittype += "challenge,";
    if (levent == 1) limittype += "event,";
    if (ldivision == 1) limittype += "division,";
    if (lmyth == 1) limittype += "myth,";
    limittype = limittype.slice(0, -1);

    userstxt = $("#input-leaderboard-search").val();
    userst = userstxt.split(",");
    users = [];
    for (var i = 0; i < userst.length; i++) {
        s = userst[i];
        users.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    users = users.join(",");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?page=" + page + "&page_size=" + page_size + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&point_types=" + limittype + "&userids=" + users,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-leaderboard-options-update");
            if (data.error) return AjaxError(data);

            leaderboard = data.response.list;
            total_pages = data.response.total_pages;
            data = [];
            for (i = 0; i < leaderboard.length; i++) {
                user = leaderboard[i];
                distance = TSeparator(parseInt(user.points.distance * distance_ratio));
                data.push([`${TSeparator(user.points.rank)}`, `${GetAvatar(user.user.userid, user.user.name, user.user.discordid, user.user.avatar)}`, `${point2rank(parseInt(user.points.total_no_limit))} (#${TSeparator(user.points.rank_no_limit)})`, `${distance}`, `${TSeparator(user.points.challenge)}`, `${TSeparator(user.points.event)}`, `${TSeparator(user.points.division)}`, `${TSeparator(user.points.myth)}`, `${TSeparator(user.points.total)}`]);
            }
            PushTable("#table_leaderboard", data, total_pages, "LoadLeaderboard();");
        },
        error: function (data) {
            UnlockBtn("#button-leaderboard-options-update");
            AjaxError(data);
        }
    })
}

dlog_placeholder_row = `
<tr>
    <td style="width:5%;"><span class="placeholder w-100"></span></td>
    <td style="width:15%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
</tr>`;

function LoadDeliveryList(noplaceholder = false) {
    LockBtn("#button-delivery-log-options-update", btntxt = "...");

    page_size = parseInt($("#delivery-log-page-size").val());
    if (!isNumber(page_size)) page_size = 10;

    if (!noplaceholder) {
        $("#table_delivery_log_data").children().remove();
        for (i = 0; i < page_size; i++) {
            $("#table_delivery_log_data").append(dlog_placeholder_row);
        }
    }

    InitPaginate("#table_delivery_log", "LoadDeliveryList();");
    page = parseInt($("#table_delivery_log_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1,
        end_time = -1;
    if ($("#delivery-log-start-time").val() != "" && $("#delivery-log-end-time").val() != "") {
        start_time = +new Date($("#delivery-log-start-time").val()) / 1000;
        end_time = +new Date($("#delivery-log-end-time").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#delivery-log-speed-limit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    dets2 = $("#delivery-log-ets2").is(":checked");
    dats = $("#delivery-log-ats").is(":checked");
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    status = 0;
    delivered = $("#delivery-log-delivered").is(":checked");
    cancelled = $("#delivery-log-cancelled").is(":checked");
    if (delivered && !cancelled) status = 1;
    else if (!delivered && cancelled) status = 2;

    division = parseInt($("#delivery-log-division-id").val());
    if (!isNumber(division)) division = "include";

    challenge = parseInt($("#delivery-log-challenge-id").val());
    if (!isNumber(challenge)) challenge = "include";

    uid = parseInt($("#delivery-log-userid").val());
    if (!isNumber(uid) || uid < 0) {
        uid = "";
    } else {
        uid = "&userid=" + uid;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&page_size=" + page_size + "&division=" + division + "&challenge=" + challenge + "&status=" + status + uid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-delivery-log-options-update");
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
                if (delivery.division.divisionid != undefined) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";

                dloguser = GetAvatar(user.userid, user.name, user.discordid, user.avatar);
                if ($("#delivery-log-userid").val() == localStorage.getItem("userid")) dloguser = "Me";
                data.push([`<tr_style>color:${color}</tr_style>`, `${delivery.logid} ${dextra}`, `${dloguser}`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`, `<a class="clickable" onclick="ShowDeliveryDetail('${delivery.logid}')">View Details</a>`]);
            }

            PushTable("#table_delivery_log", data, total_pages, "LoadDeliveryList();");
        },
        error: function (data) {
            UnlockBtn("#button-delivery-log-options-update");
            AjaxError(data);
        }
    })
}

function ShowDeliveryLogExport() {
    modalid = ShowModal("Export Delivery Log", `
        <p>A csv table will be downloaded containing delivery logs of the selected date range.</p>
        <p><i>Rate limit: 3 downloads / hour</i></p>
        <label class="form-label">Date Range</label>
        <div class="input-group mb-2">
            <span class="input-group-text">From</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-start-time">
        </div>
        <div class="input-group mb-2">
            <span class="input-group-text">To</span>
            <input type="date" class="form-control bg-dark text-white" id="delivery-log-export-end-time">
        </div>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-delivery-log-export" type="button" class="btn btn-primary" onclick="DeliveryLogExport();">Export</button>`);
    InitModal("delivery_log_export", modalid);
}

function DeliveryLogExport() {
    var start_time = -1,
        end_time = -1;
    if ($("#delivery-log-export-start-time").val() != "" && $("#delivery-log-export-end-time").val() != "") {
        start_time = +new Date($("#delivery-log-export-start-time").val()) / 1000;
        end_time = +new Date($("#delivery-log-export-end-time").val()) / 1000 + 86400;
    }
    LockBtn("#button-delivery-log-export", "Exporting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/export",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            start_time: start_time,
            end_time: end_time
        },
        success: function (data) {
            UnlockBtn("#button-delivery-log-export");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success", "Delivery log exported!", 5000);
            FileOutput("export.csv", data);
        },
        error: function (data) {
            UnlockBtn("#button-delivery-log-export");
            AjaxError(data);
        }
    })
}

deliveryRoute = [];
rri = 0;
rrspeed = 10;
rrevents = [];
punit = "€";
curlogid = -1;
async function DeliveryRoutePlay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", "Please zoom & drag the map to activate it.", 5000, false);
    clearInterval(dmapint);
    dmapint = -999;
    lastevent = 0;
    window.mapcenter["dmap"] = [deliveryRoute[0][0], -deliveryRoute[0][1]];
    prew = 0;
    preh = 0;
    pred = 0;
    pret = 0;
    for (; rri < deliveryRoute.length; rri += Math.max(rrspeed - 50, 1)) {
        if (rrspeed <= 0) rrspeed = 1;
        if (rri < 0) rri = 0;
        if (rri >= deliveryRoute.length) rri = deliveryRoute.length - 1;
        window.mapcenter["dmap"] = [deliveryRoute[rri][0], -deliveryRoute[rri][1]];
        $("#delivery-detail-progress").css("width", (rri / deliveryRoute.length * 100).toFixed(4) + "%");
        $("#delivery-detail-progress").attr("aria-valuenow", (rri / deliveryRoute.length * 100).toFixed(4));
        dmapw = $("#dmap").width();
        dmaph = $("#dmap").height();
        if (prew != dmapw || preh != dmaph) {
            prew = dmapw;
            preh = dmaph;
            $(".dmap-player").remove();
            RenderPoint("dmap", 0, dmaph / 2, dmapw / 2, 5, nodetail = true, truckicon = true);
        }
        if (rri + 1 < deliveryRoute.length) {
            vx = Math.round((deliveryRoute[rri + 1][0] - deliveryRoute[rri][0]) * 100) / 100;
            vy = Math.round((deliveryRoute[rri + 1][1] - deliveryRoute[rri][1]) * 100) / 100;
            degree = Math.atan(vy / vx) / Math.PI * 180;
            if (!(vx == 0 && vy == 0)) {
                $(".dmap-player").css("rotate", parseInt(degree) + "deg");
                pred = degree;
                if (deliveryRoute[rri + 1][0] - deliveryRoute[rri][0] < 0) {
                    $(".dmap-player").css("transform", "scaleX(-1)");
                    pret = 1;
                } else {
                    $(".dmap-player").css("transform", "");
                    pret = 0;
                }
            } else {
                $(".dmap-player").css("rotate", parseInt(pred) + "deg");
                if (pret) {
                    $(".dmap-player").css("transform", "scaleX(-1)");
                } else {
                    $(".dmap-player").css("transform", "");
                }
            }
        } else {
            $(".dmap-player").css("rotate", parseInt(pred) + "deg");
            if (pret) {
                $(".dmap-player").css("transform", "scaleX(-1)");
            } else {
                $(".dmap-player").css("transform", "");
            }
        }

        x = deliveryRoute[Math.min(rri + 10, deliveryRoute.length - 1)][0];
        z = deliveryRoute[Math.min(rri + 10, deliveryRoute.length - 1)][1];
        for (var i = lastevent; i < rrevents.length; i++) {
            ex = rrevents[i].location.x;
            ez = rrevents[i].location.z;
            // distance of (x,z) and (ex,ez) <= 50, use euclid distance
            if (Math.sqrt(Math.pow(x - ex, 2) + Math.pow(z - ez, 2)) <= 50) {
                lastevent = i + 1;
                if (document.getElementById('delivery-detail-timeline-' + i) != null) {
                    document.getElementById('delivery-detail-timeline-' + i).scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                    $(".blink").removeClass("blink");
                    $('#delivery-detail-timeline-' + i).addClass("blink");
                }
            }
        }

        await sleep(500 / rrspeed);

        while (dmapint != -999) {
            await sleep(500);
            rri -= 1;
        }
    }

    $("#delivery-route-control").remove();
    $("#delivery-detail-progress").css("width", "100%");
    $("#delivery-detail-progress").attr("aria-valuenow", "100");
    setTimeout(function () {
        $(".dmap-player").remove();
        window.mapcenter["dmap"] = undefined;
        dmapint = setInterval(UpdateDeliveryRoutePoints, 500);
    }, 5000);
}

function ToggleRouteReplay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastNotification("error", "Error", "Please zoom & drag the map to activate it.", 5000, false);
    if (dmapint == -999) {
        dmapint = -2;
        $("#truck-svg").hide();
        $("#delivery-detail-route-replay-toggle").html(`<i class="fa-solid fa-play"></i>`);
    } else {
        $("#truck-svg").show();
        $("#delivery-detail-route-replay-toggle").html(`<i class="fa-solid fa-pause"></i>`);
        DeliveryRoutePlay();
    }
}

deliveryDetailTabPlaceholder = `
<div class="m-3">
    <h3 style="display:inline-block"><strong><span id="delivery-detail-title"><span class="placeholder" style="width:150px"></span></span></strong></h3>
    <h3 style="float:right"><span id="delivery-detail-user"><span class="placeholder" style="width:100px"></span></span></h3>
</div>
<div class="row m-3">
    <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
        <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-source-company"><span class="placeholder col-8"></span></span></b></p>
        <p><span id="delivery-detail-source-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
    </div>
    <div class="col-6 m-auto" style="text-align:center">
        <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-cargo"><span class="placeholder col-6"></span></span></p>
        <div class="progress" style="height:5px;margin:5px;">
            <div id="delivery-detail-progress" class="progress-bar progress-bar-striped" role="progressbar" style="width:0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <p style="font-size:15px;margin-bottom:0;"><span id="delivery-detail-distance"><span class="placeholder col-8"></span></span></p>
    </div>
    <div class="shadow p-3 bg-dark rounded col-3" style="text-align:center">
        <p style="font-size:25px;margin-bottom:0;"><b><span id="delivery-detail-destination-company"><span class="placeholder col-8"></span></span></b></p>
        <p><span id="delivery-detail-destination-city" style="font-size:15px;color:#aaa"><span class="placeholder col-4"></span></span></p>
    </div>
</div>
<div class="row m-3" style="height:500px">
    <div id="dmap" class="col-8 h-100" style="background-color:#484E66;padding:0;border-radius:5px">
    </div>
    <div class="col-4" style="padding-right:0;">
        <div id="delivery-detail-timeline-div" class="shadow p-5 bg-dark rounded" style="height:500px;overflow:auto;">
            <ul class="timeline" id="delivery-detail-timeline">
                <li class="timeline-item timeline-white mb-5">
                    <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                    <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                    <p><span class="placeholder" style="width:120px"></span></p>
                </li>
                <li class="timeline-item timeline-white mb-5">
                    <h5 class="fw-bold"><span class="placeholder" style="width:100px"></span></h5>
                    <p class="text-muted mb-2 fw-bold"><span class="placeholder" style="width:40px"></span></p>
                    <p><span class="placeholder" style="width:120px"></span></p>
                </li>
            </ul>
        </div>
    </div>
</div>`;

function UpdateDeliveryRoutePoints() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return;
    window.dmapRange = {};
    dmapRange["top"] = window.dn.previousExtent_[3];
    dmapRange["left"] = window.dn.previousExtent_[0];
    dmapRange["bottom"] = window.dn.previousExtent_[1];
    dmapRange["right"] = window.dn.previousExtent_[2];
    $(".dmap-player").remove();
    dmapxl = dmapRange["left"];
    dmapxr = dmapRange["right"];
    dmapyt = dmapRange["top"];
    dmapyb = dmapRange["bottom"];
    dmapw = $("#dmap").width();
    dmaph = $("#dmap").height();
    dscale = (dmapxr - dmapxl) / $("#dmap").width();
    ddpoints = dpoints;
    if (dscale >= 150 && i % 300 != 0) ddpoints = dpoints150;
    else if (dscale >= 30 && i % 100 != 0) ddpoints = dpoints30;
    else if (dscale >= 20 && i % 50 != 0) ddpoints = dpoints20;
    else if (dscale >= 10 && i % 10 != 0) ddpoints = dpoints10;
    for (var i = 0; i < ddpoints.length; i++) {
        x = ddpoints[i][0];
        z = -ddpoints[i][1];
        if (x > dmapxl && x < dmapxr && z > dmapyb && z < dmapyt) {
            rx = (x - dmapxl) / (dmapxr - dmapxl) * dmapw;
            rz = (z - dmapyt) / (dmapyb - dmapyt) * dmaph;
            RenderPoint("dmap", 0, rz, rx, 5, nodetail = true);
        }
    }
}

currentDeliveryLog = {};

function ShowDeliveryDetail(logid) {
    $(".tabs").hide();
    $("#delivery-detail-tab").html(deliveryDetailTabPlaceholder);
    $("#delivery-detail-tab").show();

    curlogid = logid;
    window.autofocus["dmap"] = -2;
    rri = 0;
    rrspeed = 10;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog?logid=" + String(logid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) {
                ShowTab("#delivery-tab", "#button-delivery-tab");
                return AjaxError(data);
            }

            window.history.pushState("", "", '/delivery/' + logid);

            d = data.response.dlog;
            currentDeliveryLog = d;
            user = d.user;
            distance = TSeparator(parseInt(d.distance * distance_ratio)) + distance_unit_txt;
            $("#delivery-detail-title").html(`Delivery #${logid} <a class="clickable" onclick="MoreDeliveryDetail()"><span class="rect-20"><i class="fa-solid fa-circle-info"></i></span></a>`);
            $("#delivery-detail-user").html(GetAvatar(user.userid, user.name, user.discordid, user.avatar));

            d = d.detail;
            tp = d.type;
            d = d.data.object;

            start_time = +new Date(d.start_time);
            stop_time = +new Date(d.stop_time);
            duration = "";
            if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone

            cargo = d.cargo.name;
            cargo_mass = TSeparator(parseInt(d.cargo.mass * weight_ratio)) + weight_unit_txt;

            source_company = "Unknown company";
            source_city = "Unknown city";
            destination_company = "Unknown company";
            destination_city = "Unknown city";
            source_company_id = "";
            destination_company_id = "";
            if (d.source_company != null) source_company = d.source_company.name, source_company_id = d.source_company.unique_id;
            if (d.source_city != null) source_city = d.source_city.name;
            if (d.destination_company != null) destination_company = d.destination_company.name, destination_company_id = d.destination_company.unique_id;
            if (d.destination_city != null) destination_city = d.destination_city.name;

            $("#delivery-detail-source-company").html(source_company);
            $("#delivery-detail-source-city").html(source_city);
            $("#delivery-detail-destination-company").html(destination_company);
            $("#delivery-detail-destination-city").html(destination_city);
            $("#delivery-detail-cargo").html(`${cargo} (${cargo_mass})`);
            $("#delivery-detail-distance").html(`${distance}<br>${duration}`);

            punit = "€";
            if (!d.game.short_name.startsWith("e")) punit = "$";

            $("#delivery-detail-timeline").children().remove();
            ECOLOR = {
                "started": "green",
                "delivered": "green",
                "cancelled": "red",
                "fine": "yellow",
                "tollgate": "white",
                "ferry": "white",
                "train": "white",
                "collision": "yellow",
                "repair": "green",
                "refuel": "green",
                "teleport": "green",
                "speeding": "yellow"
            }

            function GenTimelineItem(e, idx, title, content) {
                $("#delivery-detail-timeline").append(`
                <li id="delivery-detail-timeline-${idx}" class="timeline-item timeline-${ECOLOR[e.type]} mb-5">
                    <h5 class="fw-bold">${title}</h5>
                    <p class="text-muted mb-2 fw-bold">${e.real_time}</p>
                    <p>${content}</p>
                </li>`);
            }

            rrevents = d.events;
            for (i = 0; i < rrevents.length; i++) {
                e = rrevents[i];
                meta = e.meta;
                if (e.type == "started") {
                    GenTimelineItem(e, i, `Job Started`, `From ${source_company}, ${source_city}`);
                } else if (e.type == "delivered") {
                    GenTimelineItem(e, i, `Job Delivered`, `To ${destination_company}, ${destination_city}<br>Earned ${punit}${TSeparator(meta.revenue)} & ${TSeparator(meta.earned_xp)} XP`);
                } else if (e.type == "cancelled") {
                    GenTimelineItem(e, i, `Job Cancelled`, `Penalty: ${punit}${TSeparator(meta.penalty)}`);
                } else if (e.type == "fine") {
                    if (meta.offence == "crash") {
                        GenTimelineItem(e, i, `Crash`, `Fined: ${punit}${TSeparator(meta.amount)}`);
                    } else if (meta.offence == "speeding") {
                        speed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                        speed_limit = TSeparator(parseInt(meta.speed_limit * distance_ratio)) + distance_unit_txt + "/h";
                        GenTimelineItem(e, i, `Speeding`, `Speed: ${speed} | Limit: ${speed_limit}<br>Fined: ${punit}${TSeparator(meta.amount)}`);
                    } else if (meta.offence == "wrong_way") {
                        GenTimelineItem(e, i, `Wrong Way`, `Fined: ${punit}${TSeparator(meta.amount)}`);
                    }
                } else if (e.type == "tollgate") {
                    GenTimelineItem(e, i, `Tollgate`, `Paid ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "ferry") {
                    GenTimelineItem(e, i, `Ferry`, `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "train") {
                    GenTimelineItem(e, i, `Train`, `${meta.source_name} -> ${meta.target_name}<br>Paid ${punit}${TSeparator(meta.cost)}`);
                } else if (e.type == "collision") {
                    damage = meta.wear_engine + meta.wear_chassis + meta.wear_transmission + meta.wear_cabin + meta.wear_wheels;
                    GenTimelineItem(e, i, `Collision`, `Truck Damage: ${(damage*100).toFixed(2)}%`);
                } else if (e.type == "repair") {
                    GenTimelineItem(e, i, `Repair`, `Truck repaired.`);
                } else if (e.type == "refuel") {
                    fuel = TSeparator(parseInt(meta.amount * fuel_ratio)) + fuel_unit_txt;
                    GenTimelineItem(e, i, `Refuel`, `Refueled ${fuel} fuel.`);
                } else if (e.type == "teleport") {
                    GenTimelineItem(e, i, `Teleport`, `Teleported to another location.`);
                } else if (e.type == "speeding") {
                    speed = TSeparator(parseInt(meta.max_speed * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    speed_limit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio)) + distance_unit_txt + "/h";
                    GenTimelineItem(e, i, `Speeding`, `Speed: ${speed} | Limit: ${speed_limit}<br>Duration: ${meta.end-meta.start} seconds<br><i>Not fined</i>`);
                }
            }
            new SimpleBar($("#delivery-detail-timeline-div")[0]);
            document.getElementById('delivery-detail-timeline-0').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
            $("html, body").animate({
                scrollTop: 0
            }, "fast");

            dt = getDateTime(data.response.timestamp * 1000);

            telemetry = data.response.dlog.telemetry.split(";");
            basic = telemetry[0].split(",");
            tver = 1;
            if (basic[0].startsWith("v2")) tver = 2;
            else if (basic[0].startsWith("v3")) tver = 3;
            else if (basic[0].startsWith("v4")) tver = 4;
            else if (basic[0].startsWith("v5")) tver = 5;
            else if (basic[0].startsWith("v")) {
                $("#dmap").prepend(`
                <div style="position:absolute;z-index:10;padding:10px;">
                    <h5>Delivery Route <span style="color:red">Not Available</span></h5>
                    <p style="font-size:12px">Potential reasons: Navio Live not enabled, offline when driving</p>
                </div>`);
                return;
            }
            basic[0] = basic[0].slice(2);
            game = basic[0];
            mods = basic[1];
            route = telemetry.slice(1);
            dpoints = [];
            lastx = 0;
            lastz = 0;
            if (tver <= 4) {
                for (i = 0; i < route.length; i++) {
                    if (tver == 4) {
                        if (route[i].split(",") == 1 && route[i].startsWith("idle")) {
                            idlecnt = parseInt(route[i].split("e")[1]);
                            for (var j = 0; j < idlecnt; j++) {
                                dpoints.push([lastx, lastz]);
                            }
                            continue;
                        }
                    }
                    p = route[i].split(",");
                    if (p.length < 2) continue;
                    if (tver == 1) dpoints.push([p[0], p[2]]); // x, z
                    else if (tver == 2) dpoints.push([b62decode(p[0]), b62decode(p[1])]);
                    else if (tver >= 3) {
                        relx = b62decode(p[0]);
                        relz = b62decode(p[1]);
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                    }
                }
            } else if (tver == 5) {
                nroute = "";
                for (i = 0; i < route.length; i++) {
                    nroute += route[i] + ";";
                }
                route = nroute;
                for (var i = 0, j = 0; i < route.length; i++) {
                    x = route[i];
                    if (x == "^") {
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == "^") {
                                c = parseInt(route.substr(i + 1, j - i - 1));
                                for (k = 0; k < c; k++) {
                                    dpoints.push([lastx, lastz]);
                                }
                                break;
                            }
                        }
                        i = j;
                    } else if (x == ";") {
                        cx = 0;
                        cz = 0;
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == ",") {
                                cx = route.substr(i + 1, j - i - 1);
                                break;
                            }
                        }
                        i = j;
                        for (j = i + 1; j < route.length; j++) {
                            if (route[j] == ";") {
                                cz = route.substr(i + 1, j - i - 1);
                                break;
                            }
                        }
                        i = j;
                        if (cx == 0 && cz == 0) {
                            continue;
                        }
                        relx = b62decode(cx);
                        relz = b62decode(cz);
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                    } else {
                        st = "ZYXWVUTSRQPONMLKJIHGFEDCBA0abcdefghijklmnopqrstuvwxyz";
                        if (i + 1 >= route.length) break;
                        z = route[i + 1];
                        relx = st.indexOf(x) - 26;
                        relz = st.indexOf(z) - 26;
                        dpoints.push([lastx + relx, lastz + relz]);
                        lastx = lastx + relx;
                        lastz = lastz + relz;
                        i += 1;
                    }
                }
            }
            minx = 100000000000000;
            for (i = 0; i < dpoints.length; i++) {
                if (dpoints[i][0] < minx) minx = dpoints[i][0];
            }
            $("#dmap").children().remove();
            window.dn = {};
            window.mapcenter["dmap"] = undefined;
            if (game == 1 && (mods == "promod" || JSON.stringify(data.response).toLowerCase().indexOf("promod") != -1)) {
                LoadETS2PMap("dmap");
            } else if (game == 1) { // ets2
                LoadETS2Map("dmap");
            } else if (game == 2) { // ats
                LoadATSMap("dmap");
            } else {
                $("#dmap").prepend(`
                <div style="position:absolute;z-index:10;padding:10px;">
                    <h5>Delivery Route <span style="color:red">Not Available</span></h5>
                    <p style="font-size:12px">Potential reasons: Navio Live not enabled, offline when driving</p>
                </div>`);
                return;
            }
            $("#dmap").prepend(`
            <div style="position:absolute;z-index:10;padding:10px;">
                <h5>Delivery Route</h5>
                <div id="delivery-route-control">
                    <a class="clickable" onclick="rrspeed-=2"><i class="fa-solid fa-minus"></i></a>
                    <a class="clickable" onclick="rri-=100"><i class="fa-solid fa-backward"></i></a>&nbsp;&nbsp;
                    <a class="clickable" onclick="ToggleRouteReplay()" id="delivery-detail-route-replay-toggle"><i class="fa-solid fa-play"></i></a>&nbsp;&nbsp;
                    <a class="clickable" onclick="rri+=100"><i class="fa-solid fa-forward"></i></a>
                    <a class="clickable" onclick="rrspeed+=2"><i class="fa-solid fa-plus"></i></a>
                </div>
            </div>`);
            deliveryRoute = dpoints;
            $("#rp_tot").html(deliveryRoute.length);
            dpoints150 = dpoints.filter(function (el, i) {
                return i % 300 == 0;
            });
            dpoints30 = dpoints.filter(function (el, i) {
                return i % 100 == 0;
            });
            dpoints20 = dpoints.filter(function (el, i) {
                return i % 50 == 0;
            });
            dpoints10 = dpoints.filter(function (el, i) {
                return i % 10 == 0;
            });
            dpoints = dpoints.filter(function (el, i) {
                return i % 5 == 0;
            });
            window.dn = {};
            if (dmapint != -1) clearInterval(dmapint);
            dmapint = setInterval(UpdateDeliveryRoutePoints, 500);
        },
        error: function (data) {
            ShowTab("#delivery-tab", "#button-delivery-tab");
            AjaxError(data);
        }
    });
}

function MoreDeliveryDetail() {
    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    d = currentDeliveryLog;
    info = "<table>";
    distance = TSeparator(parseInt(d.distance * distance_ratio)) + distance_unit_txt;
    distance_org = d.distance;

    start_time = +new Date(d.start_time);
    stop_time = +new Date(d.stop_time);
    duration = "N/A";
    if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone
    if (d.detail.type == "job.delivered") {
        t = d.detail.data.object;
        auto_park = t.events[t.events.length - 1].meta.auto_park;
        auto_load = t.events[t.events.length - 1].meta.auto_load;
        extra = "";
        if (auto_park == "1") extra += `<span class="badge text-bg-primary">Auto Park</span>&nbsp;&nbsp;`;
        if (auto_load == "1") extra += `<span class="badge text-bg-primary">Auto Load</span>`;
        info += GenTableRow("Log ID", d.logid + "&nbsp;&nbsp;" + extra);
    } else {
        info += GenTableRow("Log ID", d.logid);
    }
    info += GenTableRow("Navio ID", d.detail.data.object.id);
    info += GenTableRow("Time Submitted", getDateTime(d.timestamp * 1000));
    info += GenTableRow("Time Spent", duration);
    isdelivered = false;
    if (d.detail.type == "job.delivered") {
        isdelivered = true;
        info += GenTableRow("Status", "<span style='color:lightgreen'>Delivered</span>");
    } else if (d.detail.type == "job.cancelled") {
        info += GenTableRow("Status", "<span style='color:red'>Cancelled</span>");
    }
    if (d.telemetry != "") {
        info += GenTableRow("Delivery Route", "<span style='color:lightgreen'>Available</span>");
    } else {
        info += GenTableRow("Delivery Route", "<span style='color:red'>Unavailable</span>");
    }
    info += GenTableRow("Division", `<span id="delivery-detail-division"><button id="button-delivery-detail-division" type="button" class="btn btn-primary"  onclick="GetDivisionInfo(${d.logid});">Check</button></span>`);

    info += GenTableRow("&nbsp;", "&nbsp;");
    info += GenTableRow("Driver", GetAvatar(d.user.userid, d.user.name, d.user.discordid, d.user.avatar));

    d = d.detail.data.object;

    source_company = "Unknown company";
    source_city = "Unknown city";
    destination_company = "Unknown company";
    destination_city = "Unknown city";
    source_company_id = "";
    destination_company_id = "";
    if (d.source_company != null) source_company = d.source_company.name, source_company_id = d.source_company.unique_id;
    if (d.source_city != null) source_city = d.source_city.name;
    if (d.destination_company != null) destination_company = d.destination_company.name, destination_company_id = d.destination_company.unique_id;
    if (d.destination_city != null) destination_city = d.destination_city.name;
    info += GenTableRow("Source Company", `${source_company} <span style="color:grey">(${source_company_id})</span>`);
    info += GenTableRow("Source City", `${source_city} <span style="color:grey">(${d.source_city.unique_id})</span>`);
    info += GenTableRow("Destination Company", `${destination_company} <span style="color:grey">(${destination_company_id})</span>`);
    info += GenTableRow("Destination City", `${destination_city} <span style="color:grey">(${d.destination_city.unique_id})</span>`);
    info += GenTableRow("Logged Distance", distance);
    if (isdelivered) {
        distance2 = d.events[d.events.length - 1].meta.distance;
        distance2_org = d.events[d.events.length - 1].meta.distance
        distance2 = TSeparator(parseInt(distance2 * distance_ratio)) + distance_unit_txt;
        info += GenTableRow("Reported Distance", distance2);
        revenue = TSeparator(d.events[d.events.length - 1].meta.revenue);
    } else {
        penalty = TSeparator(d.events[d.events.length - 1].meta.penalty);
    }
    distance3 = d.planned_distance;
    distance3 = TSeparator(parseInt(distance3 * distance_ratio)) + distance_unit_txt;
    info += GenTableRow("Planned Distance", distance3);

    info += GenTableRow("&nbsp;", "&nbsp;");
    cargo = d.cargo.name;
    cargo_mass = TSeparator(parseInt(d.cargo.mass * weight_ratio)) + weight_unit_txt;
    info += GenTableRow("Cargo", `${cargo} <span style="color:grey">(${d.cargo.unique_id})</span>`);
    damage_color = "lightgreen";
    if (d.cargo.damage >= 0.03) damage_color = "yellow";
    if (d.cargo.damage >= 0.1) damage_color = "red";
    info += GenTableRow("Cargo Mass", cargo_mass);
    info += GenTableRow("Cargo Damage", `<span style="color:${damage_color}">${(d.cargo.damage * 100).toPrecision(2)}%`);
    truck = d.truck.brand.name + " " + d.truck.name;
    truck_brand_id = d.truck.brand.unique_id;
    license_plate = d.truck.license_plate;
    trailer = "";
    trs = "";
    if (d.trailers.length > 1) trs = "s";
    for (var i = 0; i < d.trailers.length; i++) trailer += d.trailers[i].license_plate + " | ";
    trailer = trailer.slice(0, -3);
    info += GenTableRow("Truck", truck);
    info += GenTableRow("Truck Plate", license_plate);
    info += GenTableRow("Trailer Plate", trailer);

    info += GenTableRow("&nbsp;", "&nbsp;");
    fuel_used_org = d.fuel_used;
    fuel_used = TSeparator(parseInt(d.fuel_used * fuel_ratio)) + fuel_unit_txt;
    info += GenTableRow("Fuel", fuel_used);
    if (isdelivered) {
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance2_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    } else {
        avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
    }
    info += GenTableRow("Avg. Fuel", avg_fuel);
    info += GenTableRow("AdBlue", d.adblue_used);
    top_speed = parseInt(d.truck.top_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    average_speed = parseInt(d.truck.average_speed * 3.6 * distance_ratio) + distance_unit_txt + "/h";
    info += GenTableRow("Max. Speed", top_speed);
    info += GenTableRow("Avg. Speed", average_speed);

    info += GenTableRow("&nbsp;", "&nbsp;");
    punit = "€";
    if (!d.game.short_name.startsWith("e")) punit = "$";
    offence = 0;
    for (var i = 0; i < d.events.length; i++) {
        if (d.events[i].type == "fine") {
            offence += parseInt(d.events[i].meta.amount);
        }
    }
    offence = -offence;
    offence = TSeparator(offence);
    if (isdelivered) {
        info += GenTableRow("Revenue", `${punit}${revenue}`);
    } else {
        info += GenTableRow("Penalty", `${punit}${penalty}`);
    }
    info += GenTableRow("Offence", `${punit}${offence}`);

    info += GenTableRow("&nbsp;", "&nbsp;");
    if (d.is_special == true) {
        info += GenTableRow("Is Special Transport?", "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow("Is Special Transport?", "No");
    }
    if (d.is_late == true) {
        info += GenTableRow("Is Late?", "<span style='color:red'>Yes</span>");
    } else {
        info += GenTableRow("Is Late?", "<span style='color:lightgreen'>No</span>");
    }
    if (d.game.had_police_enabled == true) {
        info += GenTableRow("Had Police Enabled?", "<span style='color:lightgreen'>Yes</span>");
    } else {
        info += GenTableRow("Had Police Enabled?", "<span style='color:red'>No</span>");
    }

    MARKET = {
        "cargo_market": "Cargo Market",
        "freight_market": "Freight Market",
        "quick_job": "Quick Job",
        "external_contracts": "External Contracts"
    };
    mkt = "Unknown";
    if (Object.keys(MARKET).includes(d.market)) mkt = MARKET[d.market];
    info += GenTableRow("Market", mkt);
    mode = "Single Player";
    if (d.multiplayer != null) {
        mode = "Multiplayer";
        if (d.multiplayer.type == "truckersmp") {
            mode = "TruckersMP";
        } else if (d.multiplayer.type == "scs_convoy") {
            mode = "SCS Convoy";
        }
    }
    info += GenTableRow("Mode", mode);

    info += "</table>";

    modalid = ShowModal(`Delivery Log`, info);
    InitModal("delivery_log_detail", modalid);
}