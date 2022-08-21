levent = 1;
ldivision = 1;

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}

function loadDlog() {
    var start = new Date();
    start.setHours(0, 0, 0, 0);
    start = +start + start.getTimezoneOffset() * 60000;
    start /= 1000;
    var end = +new Date() / 1000;
    start = parseInt(start);
    end = parseInt(end);
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?starttime=" + start + "&endtime=" + end + "&page=1&pagelimit=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            users = data.response.list;
            driver_of_the_day = users[0];
            discordid = driver_of_the_day.discordid;
            avatar = driver_of_the_day.avatar;
            if (avatar != null) {
                if (avatar.startsWith("a_"))
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                else
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            } else {
                avatar = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/logo.png";
            }
            distance = TSeparator(parseInt(driver_of_the_day.distance * distance_ratio));
            $("#dotd").html(`<a style="cursor:pointer" onclick="loadProfile(${driver_of_the_day.userid})"><img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/` + vtcprefix + `/logo.png');"> <b>${driver_of_the_day.name}</b></a>`);
            $("#dotddistance").html(`Driven ${distance}${distance_unit_txt}`);
        }
    });
    var start = getMonday(new Date()); 
    start.setHours(0, 0, 0, 0);
    start = +start + start.getTimezoneOffset() * 60000;
    start /= 1000;
    var end = +new Date() / 1000;
    start = parseInt(start);
    end = parseInt(end);
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?starttime=" + start + "&endtime=" + end + "&page=1&pagelimit=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            users = data.response.list;
            driver_of_the_day = users[0];
            discordid = driver_of_the_day.discordid;
            avatar = driver_of_the_day.avatar;
            if (avatar != null) {
                if (avatar.startsWith("a_"))
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                else
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            } else {
                avatar = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/logo.png";
            }
            distance = TSeparator(parseInt(driver_of_the_day.distance * distance_ratio));
            $("#dotw").html(`<a style="cursor:pointer" onclick="loadProfile(${driver_of_the_day.userid})"><img src="${src}" style="width:20px;border-radius:100%;display:inline" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/` + vtcprefix + `/logo.png');"> <b>${driver_of_the_day.name}</b></a>`);
            $("#dotwdistance").html(`Driven ${distance}${distance_unit_txt}`);
        }
    });
}

function loadLeaderboard(recurse = true) {
    page = parseInt($("#lpages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    GeneralLoad();
    $("#loadLeaderboardBtn").html("...");
    $("#loadLeaderboardBtn").attr("disabled", "disabled");
    starttime = -1;
    endtime = -1;
    if ($("#lbstart").val() != "" && $("#lbend").val() != "") {
        starttime = +new Date($("#lbstart").val()) / 1000;
        endtime = +new Date($("#lbend").val()) / 1000 + 86400;
    }
    speedlimit = parseInt($("#lbspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0;
    speedlimit /= distance_ratio;
    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) starttime = 1, endtime = 2;
    if (levent) $("#levent").css("background-color", "skyblue");
    else $("#levent").css("background-color", "");
    if (ldivision) $("#ldivision").css("background-color", "skyblue");
    else $("#ldivision").css("background-color", "");
    limittype = "distance,myth,"
    if(levent == 1) limittype += "event,";
    if(ldivision == 1) limittype += "division,";
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?page=" + page + "&speedlimit=" + parseInt(speedlimit) + "&starttime=" + starttime + "&endtime=" + endtime + "&game=" + game + "&limittype=" + limittype,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#loadLeaderboardBtn").html("Go");
            $("#loadLeaderboardBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#leaderboardTable").empty();
            const leaderboard = data.response.list;

            if (leaderboard.length == 0) {
                $("#leaderboardTableHead").hide();
                $("#leaderboardTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#lpages").val(1);
                if (recurse) loadLeaderboard(recurse = false);
                return;
            }
            $("#leaderboardTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#lpages").val(1);
                if (recurse) loadLeaderboard(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#lpages").val(1);
                page = 1;
            }
            $("#ltotpages").html(totpage);
            $("#leaderboardTableControl").children().remove();
            $("#leaderboardTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#lpages').val(1);loadLeaderboard();">1</button>`);
            if (page > 3) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#lpages').val(${i});loadLeaderboard();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#leaderboardTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#lpages').val(${totpage});loadLeaderboard();">${totpage}</button>`);
            }

            for (i = 0; i < leaderboard.length; i++) {
                user = leaderboard[i];
                userid = user.userid;
                name = user.name;
                distance = TSeparator(parseInt(user.distance * distance_ratio));
                discordid = user.discordid;
                avatar = user.avatar;
                totalpnt = TSeparator(parseInt(user.total));
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/logo.png";
                }
                $("#leaderboardTable").append(`<tr class="text-sm">
              <td class="py-5 px-6 font-medium">
                #${user.rank} <a style="cursor: pointer" onclick="loadProfile(${userid})"><img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/` + vtcprefix + `/logo.png');"> ${name}</a></td>
                <td class="py-5 px-6">${point2rank(parseInt(user.total_no_limit))} (#${user.rank_no_limit})</td>
                <td class="py-5 px-6">${distance}</td>
                <td class="py-5 px-6">${user.event}</td>
                <td class="py-5 px-6">${user.division}</td>
                <td class="py-5 px-6">${user.myth}</td>
              <td class="py-5 px-6">${totalpnt}</td>
            </tr>`);
            }
        },
        error: function (data) {
            $("#loadLeaderboardBtn").html("Go");
            $("#loadLeaderboardBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load leaderboard. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

dets2 = 1;
dats = 1;

function loadDelivery(recurse = true) {
    page = parseInt($("#dpages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    GeneralLoad();
    $("#loadDeliveryBtn").html("...");
    $("#loadDeliveryBtn").attr("disabled", "disabled");
    starttime = -1;
    endtime = -1;
    if ($("#dstart").val() != "" && $("#dend").val() != "") {
        starttime = +new Date($("#dstart").val()) / 1000;
        endtime = +new Date($("#dend").val()) / 1000 + 86400;
    }
    speedlimit = parseInt($("#dspeedlimit").val());
    if (!isNumber(speedlimit)) speedlimit = 0;
    speedlimit /= distance_ratio;
    game = 0;
    if (dets2 && !dats) game = 1;
    else if (!dets2 && dats) game = 2;
    else if (!dets2 && !dats) game = -1;
    $(".dgame").css("background-color", "");
    if (game == 0) $(".dgame").css("background-color", "skyblue");
    else $(".dgame" + game).css("background-color", "skyblue");
    if (!dets2 && !dats) starttime = 1, endtime = 2;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlogs?page=" + page + "&speedlimit=" + parseInt(speedlimit) + "&starttime=" + starttime + "&endtime=" + endtime + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#loadDeliveryBtn").html("Go");
            $("#loadDeliveryBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#deliveryTable").empty();
            const deliveries = data.response.list;

            if (deliveries.length == 0) {
                $("#deliveryTableHead").hide();
                $("#deliveryTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#dpages").val(1);
                if (recurse) loadDelivery(recurse = false);
                return;
            }
            $("#deliveryTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#dpages").val(1);
                if (recurse) loadDelivery(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#dpages").val(1);
                page = 1;
            }
            $("#dtotpages").html(totpage);
            $("#deliveryTableControl").children().remove();
            $("#deliveryTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#dpages').val(1);loadDelivery();">1</button>`);
            if (page > 3) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#dpages').val(${i});loadDelivery();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#deliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#dpages').val(${totpage});loadDelivery();">${totpage}</button>`);
            }

            for (i = 0; i < deliveries.length; i++) {
                const delivery = deliveries[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000) + "t";
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + VERIFIED + "</span>";
                $("#deliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
            <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick='loadProfile(${delivery.userid})'>${delivery.name}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass})</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
            }
        },
        error: function (data) {
            $("#loadDeliveryBtn").html("Go");
            $("#loadDeliveryBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load delivery log. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
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
                for (var i = 0; i < d.trailers.length; i++) {
                    trailer += d.trailers[i].license_plate + " | ";
                }
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
                $("#ddcol3").append(`<p>Trailer <i>${trailer.slice(0,-3)}</i></p>`);

                dt = getDateTime(data.response.timestamp * 1000);

                $("#dlogdriver").html(`<a style='cursor:pointer' onclick='loadProfile(${userid})'>${name}</a>`);
                if (tp == "job.cancelled") {
                    $("#dlogid").html(`${logid} (Cancelled)`);
                } else {
                    $("#dlogid").html(`${logid}
                    <button type="button" style="display:inline;padding:5px" id="divisioninfobtn"
              class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
              onclick="divisionInfo(${logid})">Division</button>`);
                }
                $("#dlogdistance").html(parseInt(data.response.loggeddistance * distance_ratio));
                $("#dlogtime").html(dt);
                if (tp == "job.delivered") {
                    extra = "";
                    if (auto_park == "1") extra += "Auto Park | ";
                    if (auto_load == "1") extra += "Auto Load | ";
                    if (extra != "") {
                        $("#dlogextra").remove();
                        $("#dlogbasic").append(`<p id="dlogextra"><b>${extra.slice(0, -3)}</b></p>`);
                        // $("#dlogbasic").append(`<tr class="text-sm">
                        //     <td class="py-5 px-6 font-medium">Tags</td>
                        //     <td class="py-5 px-6 font-medium">${extra.slice(0, -3)}</td></tr>`);
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
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load delivery log details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`
            );
            console.log(data);
        }
    });
}

curprofile = -1;

function loadUserDelivery(recurse = true) {
    page = parseInt($("#udpages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    GeneralLoad();
    $("#loadUserDeliveryBtn").html("...");
    $("#loadUserDeliveryBtn").attr("disabled", "disabled");
    starttime = -1;
    endtime = -1;
    if ($("#udstart").val() != "" && $("#udend").val() != "") {
        starttime = +new Date($("#udstart").val()) / 1000;
        endtime = +new Date($("#udend").val()) / 1000 + 86400;
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
    if (!dets2 && !dats) starttime = 1, endtime = 2;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlogs?quserid=" + curprofile + "&speedlimit=" + parseInt(speedlimit) + "&page=" + page + "&starttime=" + starttime + "&endtime=" + endtime + "&game=" + game,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#loadUserDeliveryBtn").html("Go");
            $("#loadUserDeliveryBtn").removeAttr("disabled");
            if (data.userDeliveryTable) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#userDeliveryTable").empty();
            const deliveries = data.response.list;

            if (deliveries.length == 0) {
                $("#userDeliveryTableHead").hide();
                $("#userDeliveryTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#udpages").val(1);
                if (recurse) loadUserDelivery(recurse = false);
                return;
            }
            $("#userDeliveryTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#udpages").val(1);
                if (recurse) loadUserDelivery(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#udpages").val(1);
                page = 1;
            }
            $("#udtotpages").html(totpage);
            $("#userDeliveryTableControl").children().remove();
            $("#userDeliveryTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#udpages').val(1);loadUserDelivery();">1</button>`);
            if (page > 3) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#udpages').val(${i});loadUserDelivery();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#userDeliveryTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#udpages').val(${totpage});loadUserDelivery();">${totpage}</button>`);
            }

            for (i = 0; i < deliveries.length; i++) {
                const delivery = deliveries[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                distance = TSeparator(parseInt(delivery.distance * distance_ratio));
                cargo_mass = parseInt(delivery.cargo_mass / 1000);
                unittxt = "€";
                if (delivery.unit == 2) unittxt = "$";
                profit = TSeparator(delivery.profit);
                color = "";
                if (delivery.profit < 0) color = "grey";
                dextra = "";
                if (delivery.isdivision == true) dextra = "<span title='Validated Division Delivery'>" + VERIFIED + "</span>";
                $("#userDeliveryTable").append(`
            <tr class="text-sm" style="color:${color}">
            <td class="py-5 px-6 font-medium"><a style='cursor:pointer' onclick="deliveryDetail('${delivery.logid}')">${delivery.logid} ${dextra}</a></td>
              <td class="py-5 px-6 font-medium">${delivery.source_company}, ${delivery.source_city}</td>
              <td class="py-5 px-6 font-medium">${delivery.destination_company}, ${delivery.destination_city}</td>
              <td class="py-5 px-6 font-medium">${distance}${distance_unit_txt}</td>
              <td class="py-5 px-6 font-medium">${delivery.cargo} (${cargo_mass}t)</td>
              <td class="py-5 px-6 font-medium">${unittxt}${profit}</td>
            </tr>`);
            }
        },
        error: function (data) {
            $("#loadUserDeliveryBtn").html("Go");
            $("#loadUserDeliveryBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load delivery log. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function exportDLog() {
    start_time = +new Date($("#export_start_date").val());
    end_time = +new Date($("#export_end_date").val());
    if (isNaN(start_time) || isNaN(end_time)) {
        start_time = -1000;
        end_time = -1000;
    }
    start_time = start_time / 1000;
    end_time = end_time / 1000;
    $("#exportDLogBtn").html("Working...");
    $("#exportDLogBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/export",
        type: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            starttime: start_time,
            endtime: end_time
        },
        success: function (data) {
            download("export.csv", data);
            $("#exportDLogBtn").html("Export");
            $("#exportDLogBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
        },
        error: function (data) {
            $("#exportDLogBtn").html("Export");
            $("#exportDLogBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor ? JSON.parse(data.responseText).descriptor : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to export delivery log. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}