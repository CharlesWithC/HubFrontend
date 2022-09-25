dmapint = -1;
window.mapcenter = {}
window.autofocus = {}

levent = 1;
ldivision = 1;
dets2 = 1;
dats = 1;

function LoadDriverLeaderStatistics() {
    driver_of_the_tag = ["d", "w"];
    for(var i = 0 ; i < driver_of_the_tag.length ; i++){
        dott = driver_of_the_tag[i];
        var start = new Date();
        if(dott == "d") start = new Date();
        else if(dott == "w") start = GetMonday(new Date()); 
        start.setHours(0, 0, 0, 0);
        start = +start + start.getTimezoneOffset() * 60000;
        start /= 1000;
        var end = +new Date() / 1000;
        start = parseInt(start);
        end = parseInt(end);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?start_time=" + start + "&end_time=" + end + "&page=1&page_size=1",
            type: "GET",
            dataType: "json",
            async: false,
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                users = data.response.list;
                dottuser = users[0];
                discordid = dottuser.discordid;
                avatar = GetAvatarSrc(discordid, dottuser.avatar);
                distance = TSeparator(parseInt(dottuser.distance * distance_ratio));
                $("#dot" + dott).html(GetAvatarImg(src, dottuser.userid, dottuser.name));
                $("#dot" + dott + "distance").html(`Driven ${distance}${distance_unit_txt}`);
            }
        });
    }
}

function LoadLeaderboard() {
    GeneralLoad();
    LockBtn("#LoadLeaderboardBtn", btntxt = "...");
    InitTable("#table_leaderboard", "LoadLeaderboard();");

    page = parseInt($("#table_leaderboard_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1, end_time = -1;
    if ($("#lbstart").val() != "" && $("#lbend").val() != "") {
        start_time = +new Date($("#lbstart").val()) / 1000;
        end_time = +new Date($("#lbend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#lbspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2; // no game selected, set time to none

    if (levent) $("#levent").css("background-color", "skyblue");
    else $("#levent").css("background-color", "");
    if (ldivision) $("#ldivision").css("background-color", "skyblue");
    else $("#ldivision").css("background-color", "");
    limittype = "distance,myth,"
    if(levent == 1) limittype += "event,";
    if(ldivision == 1) limittype += "division,";

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game + "&point_types=" + limittype,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#LoadLeaderboardBtn");
            if (data.error) return AjaxError(data);

            leaderboard = data.response.list;
            total_pages = data.response.total_pages;
            data = [];
            for (i = 0; i < leaderboard.length; i++){
                user = leaderboard[i];
                distance = TSeparator(parseInt(user.distance * distance_ratio)); 
                data.push([`#${user.rank} ${GetAvatar(user.userid, user.name, user.discordid, user.avatar)}`, `${point2rank(parseInt(user.total_no_limit))} (#${user.rank_no_limit})`, `${distance}`, `${user.event}`, `${user.division}`, `${user.myth}`, `${user.total}`]);
            }
            PushTable("#table_leaderboard", data, total_pages, "LoadLeaderboard();");
        },
        error: function (data) {
            UnlockBtn("#LoadLeaderboardBtn");
            AjaxError(data);
        }
    })
}

function LoadDeliveryList() {
    GeneralLoad();
    LockBtn("#loadDeliveryBtn", btntxt = "...");
    InitTable("#table_deliverylog", "LoadDeliveryList();");

    page = parseInt($("#table_deliverylog_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    
    var start_time = -1, end_time = -1;
    if ($("#dstart").val() != "" && $("#dend").val() != "") {
        start_time = +new Date($("#dstart").val()) / 1000;
        end_time = +new Date($("#dend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#dspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0; // make sure speedlimit is valid
    speedlimit /= distance_ratio; // convert to km/h

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;

    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?page=" + page + "&speed_limit=" + parseInt(speedlimit) + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#loadDeliveryBtn");
            if (data.error) return AjaxError(data);

            deliverylist = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < deliverylist.length; i++) {
                delivery = deliverylist[i];
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";

                data.push([`<tr_style>color:${color}</tr_style>`, `<a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a>`, `<a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a>`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`]);
            }

            PushTable("#table_deliverylog", data, total_pages, "LoadDeliveryList();");
        },
        error: function (data) {
            UnlockBtn("#loadDeliveryBtn");
            AjaxError(data);
        }
    })
}


function LoadUserDeliveryList() {
    GeneralLoad();
    LockBtn("#loadUserDeliveryBtn", btntxt = "...");
    InitTable("#table_deliverylog_user", "LoadUserDeliveryList();");

    page = parseInt($("#table_deliverylog_user_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    var start_time = -1, end_time = -1;
    if ($("#udstart").val() != "" && $("#udend").val() != "") {
        start_time = +new Date($("#udstart").val()) / 1000;
        end_time = +new Date($("#udend").val()) / 1000 + 86400;
    }

    speedlimit = parseInt($("#udspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0;
    speedlimit /= distance_ratio;

    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) start_time = 1, end_time = 2;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/list?userid=" + useridCurrentProfile + "&speed_limit=" + parseInt(speedlimit) + "&page=" + page + "&start_time=" + start_time + "&end_time=" + end_time + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#loadUserDeliveryBtn");
            if (data.error) return AjaxError(data);

            deliverylist = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < deliverylist.length; i++) {
                delivery = deliverylist[i];
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + SVG_VERIFIED + "</span>";

                data.push([`<tr_style>color:${color}</tr_style>`, `<a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a>`, `<a style='cursor:pointer' onclick='LoadUserProfile(${delivery.userid})'>${delivery.name}</a>`, `${delivery.source_company}, ${delivery.source_city}`, `${delivery.destination_company}, ${delivery.destination_city}`, `${distance}${distance_unit_txt}`, `${delivery.cargo} (${cargo_mass})`, `${unittxt}${profit}`]);
            }

            PushTable("#table_deliverylog_user", data, total_pages, "LoadUserDeliveryList();");
        },
        error: function (data) {
            UnlockBtn("#loadUserDeliveryBtn");
            AjaxError(data);
        }
    })
}

deliveryRoute = [];
rri = 0;
rrspeed = 20;
rrevents = [];
punit = "€";
curlogid = -1;
async function deliveryRoutePlay() {
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastFactory("error", "Error:", "Please zoom & drag the map to activate it.", 5000, false);
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
        $("#rp_speed").html(rrspeed);
        $("#rp_cur").html(rri + 1);
        $("#rp_pct").html(Math.round(rri / deliveryRoute.length * 100));
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

        x = deliveryRoute[rri][0];
        z = deliveryRoute[rri][1];
        for (var i = lastevent; i < rrevents.length; i++) {
            ex = rrevents[i].location.x;
            ez = rrevents[i].location.z;
            // distance of (x,z) and (ex,ez) <= 50, use euclid distance
            if (Math.sqrt(Math.pow(x - ex, 2) + Math.pow(z - ez, 2)) <= 50) {
                lastevent = i + 1;
                mt = $("#dmap").position().top;
                ml = $("#dmap").position().left;
                eventmsg = "";
                if (rrevents[i].type == "tollgate") {
                    cost = rrevents[i].meta.cost;
                    eventmsg = "Paid " + punit + TSeparator(cost) + " at toll gate.";
                } else if (rrevents[i].type == "refuel") {
                    amount = rrevents[i].meta.amount;
                    eventmsg = "Refueled " + TSeparator(parseInt(amount)) + "L of fuel.";
                } else if (rrevents[i].type == "collision") {
                    meta = rrevents[i].meta;
                    pct = parseFloat(meta.wear_engine) + parseFloat(meta.wear_chassis) + parseFloat(meta.wear_transmission) + parseFloat(meta.wear_cabin) + parseFloat(meta.wear_wheels);
                    eventmsg = "Collision!";
                    if (pct != NaN) eventmsg += " Damage: " + Math.round(pct * 1000) / 10 + "%";
                } else if (rrevents[i].type == "repair") {
                    eventmsg = "Truck repaired.";
                } else if (rrevents[i].type == "teleport") {
                    eventmsg = "Teleported.";
                } else if (rrevents[i].type == "fine") {
                    meta = rrevents[i].meta;
                    console.log(rrevents[i]);
                    finetype = meta.offence;
                    if (finetype == "speeding_camera") {
                        curspeed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio));
                        speedlimit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio));
                        eventmsg = `Captured by speeding camera<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "speeding") {
                        curspeed = TSeparator(parseInt(meta.speed * 3.6 * distance_ratio));
                        speedlimit = TSeparator(parseInt(meta.speed_limit * 3.6 * distance_ratio));
                        eventmsg = `Caught by police car for speeding<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "crash") {
                        eventmsg = `Crash<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "red_signal") {
                        eventmsg = `Red Signal Offence<br>Fined ` + punit + TSeparator(meta.amount);
                    } else if (finetype == "wrong_way") {
                        eventmsg = `Wrong Way<br>Fined ` + punit + TSeparator(meta.amount);
                    }
                } else if (rrevents[i].type == "speeding") {
                    meta = rrevents[i].meta;
                    curspeed = TSeparator(parseInt(parseInt(meta.max_speed) * 3.6 * distance_ratio));
                    speedlimit = TSeparator(parseInt(parseInt(meta.speed_limit) * 3.6 * distance_ratio));
                    eventmsg = `Speeding (No Fine)<br>${curspeed}${distance_unit_txt}/h (Speed Limit ${speedlimit}${distance_unit_txt}/h)`;
                } else if (rrevents[i].type == "ferry") {
                    meta = rrevents[i].meta;
                    eventmsg = `Ferry from ${meta.source_name} to ${meta.target_name}<br>Cost ${punit}${TSeparator(meta.cost)}`;
                }
                if (eventmsg != "") {
                    randomid = Math.random().toString(36).substring(7);
                    $(".rrevent").hide();
                    $("#dmap").append(`<a class="rrevent" id="rrevent-${randomid}" style='position:absolute;top:${mt+dmaph/2}px;left:${ml+dmapw/2}px;color:red;'>${eventmsg}</a>`);
                    setTimeout(function () {
                        $("#rrevent-" + randomid).fadeOut();
                    }, 3000);
                }
            }
        }

        await sleep(500 / rrspeed);

        while (dmapint != -999) {
            await sleep(500);
            rri -= 1;
        }
    }
    $("#rrplay").html("Replay");
    setTimeout(function () {
        $(".dmap-player").remove();
        window.mapcenter["dmap"] = undefined;
    }, 5000);
}

function rrplayswitch() {
    if ($("#rrplay").html() == "Replay") deliveryDetail(curlogid);
    if (window.dn == undefined || window.dn.previousExtent_ == undefined) return toastFactory("error", "Error:", "Please zoom & drag the map to activate it.", 5000, false);
    if (dmapint == -999) {
        dmapint = -2;
        $("#rrplay").html("Play");
    } else {
        $("#rrplay").html("Pause");
        deliveryRoutePlay(50);
    }
}

function deliveryDetail(logid) {
    curlogid = logid;
    window.autofocus["dmap"] = -2;
    $("#routereplaydiv").hide();
    $("#routereplayload").show();
    rri = 0;
    rrspeed = 20;
    $("#DeliveryInfoBtn" + logid).attr("disabled", "disabled");
    $("#DeliveryInfoBtn" + logid).html("Loading...");
    $("#rp_cur").html("0");
    $("#rp_tot").html("0");
    $("#rp_pct").html("0");
    $("#rrplay").html("Play");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog?logid=" + String(logid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#DeliveryInfoBtn" + logid).removeAttr("disabled");
            $("#DeliveryInfoBtn" + logid).html("Details");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            info = "";
            if (!data.error) {
                window.history.pushState("", "", '/delivery/' + logid);
                d = data.response;
                userid = d.userid;
                name = d.name;
                d = d.detail;
                tp = d.type;
                d = d.data.object;
                start_time = +new Date(d.start_time);
                stop_time = +new Date(d.stop_time);
                duration = "N/A";
                if (start_time > 86400 * 1000) duration = String((stop_time - start_time) / 1000).toHHMMSS(); // in case start time is 19700101 and timezone
                planned_distance = TSeparator(parseInt(d.planned_distance * distance_ratio)) + distance_unit_txt;
                fuel_used_org = d.fuel_used;
                fuel_used = TSeparator(parseInt(d.fuel_used * fuel_ratio)) + fuel_unit_txt;
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
                truck = d.truck.brand.name + " " + d.truck.name;
                truck_brand_id = d.truck.brand.unique_id;
                license_plate = d.truck.license_plate;
                top_speed = parseInt(d.truck.top_speed * 3.6 * distance_ratio);
                trailer = "";
                trs = "";
                if (d.trailers.length > 1) trs = "s";
                for (var i = 0; i < d.trailers.length; i++) trailer += d.trailers[i].license_plate + " | ";
                trailer = trailer.slice(0,-3);
                punit = "€";
                if (!d.game.short_name.startsWith("e")) punit = "$";
                rrevents = d.events;
                meta = d.events[d.events.length - 1].meta;
                if (tp == "job.delivered") {
                    revenue = TSeparator(meta.revenue);
                    earned_xp = meta.earned_xp;
                    cargo_damage = meta.cargo_damage;
                    distance = TSeparator(parseInt(meta.distance * distance_ratio)) + distance_unit_txt;
                    auto_park = meta.auto_park;
                    auto_load = meta.auto_load;
                    avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (meta.distance * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
                } else if (tp == "job.cancelled") {
                    distance = TSeparator(parseInt(d.driven_distance * distance_ratio)) + distance_unit_txt;
                    distance_org = d.driven_distance;
                    penalty = TSeparator(meta.penalty);
                    avg_fuel = TSeparator(parseInt((fuel_used_org * fuel_ratio) / (distance_org * distance_ratio) * 100)) + fuel_unit_txt + "/100" + distance_unit_txt;
                }

                $(".ddcol").children().remove();
                $(".ddcol").children().remove();
                $("#ddcol1t>img,#ddcol2t>img,#ddcol3t>img").remove();
                $("#ddcol1t").append(`<img style="display:inline" onerror="$(this).hide();" src="https://map.charlws.com/overlays/${source_company_id}.png">`);
                $("#ddcol2t").append(`<img style="display:inline" onerror="$(this).hide();" src="https://map.charlws.com/overlays/${destination_company_id}.png">`);
                $("#ddcol1").append(`<p><b>${source_company}</b>, ${source_city}</p>`);
                $("#ddcol1").append(`<p><b>${cargo}</b> <i>(${cargo_mass})</i></p>`);
                $("#ddcol1").append(`<p>Planned <b>${planned_distance}</b></p>`);
                $("#ddcol2").append(`<p><b>${destination_company}</b>, ${destination_city}</p>`);
                $("#ddcol2").append(`<p>Driven <b>${distance}</b></p>`);
                offence = 0;
                for (var i = 0; i < rrevents.length; i++) {
                    if (rrevents[i].type == "fine") {
                        offence += parseInt(rrevents[i].meta.amount);
                    }
                }
                offence = -offence;
                offence = TSeparator(offence);
                if (tp == "job.delivered") {
                    $("#ddcol2").append(`<p>Damage <b>${parseInt(cargo_damage * 100)}%</b> / XP <b>${earned_xp}</b></p>`);
                    $("#ddcol2").append(`<p>Profit <b>${revenue} ${punit}</b> / Offence <b>${offence} ${punit}</b></p>`);
                } else if (tp == "job.cancelled") {
                    $("#ddcol2").append(`<p>Damage <b>${parseInt(data.response.data.data.object.cargo.damage * 100)}%</b></p>`);
                    $("#ddcol2").append(`<p>Penalty <b>${penalty} ${punit}</b> / Offence <b>${offence} ${punit}</b></p>`);
                }
                $("#ddcol3").append(`<p>Max Speed <b>${top_speed} ${distance_unit_txt}/h</p>`);
                $("#ddcol3").append(`<p>Fuel Avg <b>${avg_fuel}</b> / Tot <b>${fuel_used}</b></p>`);
                $("#ddcol3").append(`<p>Truck <b>${truck}</b> (<i>${license_plate})</i></p>`);
                $("#ddcol3").append(`<p>Trailer <i>${trailer}</i></p>`);

                dt = getDateTime(data.response.timestamp * 1000);

                $("#dlogdriver").html(`<a style='cursor:pointer' onclick='LoadUserProfile(${userid})'>${name}</a>`);
                if (tp == "job.cancelled") {
                    $("#dlogid").html(`${logid} (Cancelled)`);
                } else {
                    $("#dlogid").html(`${logid}
                    <button type="button" style="display:inline;padding:5px" id="divisioninfobtn"
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="GetDivisionInfo(${logid})">Division</button>`);
                }
                $("#dlogdistance").html(parseInt(data.response.distance * distance_ratio));
                $("#dlogtime").html(dt);
                if (tp == "job.delivered") {
                    extra = "";
                    if (auto_park == "1") extra += "Auto Park | ";
                    if (auto_load == "1") extra += "Auto Load | ";
                    if (extra != "") {
                        $("#dlogextra").remove();
                        $("#dlogbasic").append(`<p id="dlogextra"><b>${extra.slice(0, -3)}</b></p>`);
                    }
                }

                $("#routereplayload").html("Route replay loading...");

                tabname = "#DeliveryDetailTab";
                $(".tabs").hide();
                $(tabname).show();
                setTimeout(function () {
                    telemetry = data.response.telemetry.split(";");
                    basic = telemetry[0].split(",");
                    tver = 1;
                    if (basic[0].startsWith("v2")) tver = 2;
                    else if (basic[0].startsWith("v3")) tver = 3;
                    else if (basic[0].startsWith("v4")) tver = 4;
                    else if (basic[0].startsWith("v5")) tver = 5;
                    else if (basic[0].startsWith("v")) {
                        return toastFactory("error", "Error:", "Unsupported telemetry data compression version", 5000, false);
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
                        for (i = 0, j = 0; i < route.length; i++) {
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
                                if (cx == 0 && cz == 0) continue;
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
                        $("#routereplayload").html("Route replay not available.");
                        return;
                    }
                    setTimeout(function () {
                        $("#routereplayload").hide();
                        $("#routereplaydiv").fadeIn();
                    }, 2000);
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
                    dmapint = setInterval(function () {
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
                    }, 500);
                }, 500);
            }
        },
        error: function (data) {
            ShowTab("#HomeTab", "#HomeTabBtn");
            $("#DeliveryInfoBtn" + logid).removeAttr("disabled");
            $("#DeliveryInfoBtn" + logid).html("Details");
            AjaxError(data);
        }
    });
}

function ExportDeliveryLog() {
    var start_time = -1, end_time = -1;
    if ($("#lbstart").val() != "" && $("#lbend").val() != "") {
        start_time = +new Date($("#export_start_date").val()) / 1000;
        end_time = +new Date($("#export_end_date")) / 1000 + 86400;
    }

    LockBtn("#exportDLogBtn");
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
            UnlockBtn("#exportDLogBtn");
            FileOutput("export.csv", data);
            if (data.error) return AjaxError(data);
        },
        error: function (data) {
            UnlockBtn("#exportDLogBtn");
            AjaxError(data);
        }
    })
}