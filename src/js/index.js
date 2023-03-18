const SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
const SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

default_text_color = "white";

token = localStorage.getItem("token");
authorizationHeader = {};
if (token != null) authorizationHeader = { "Authorization": "Bearer " + token };
userid = localStorage.getItem("userid");
isAdmin = false;
requireCaptcha = false;
highestrole = "Unknown Role";
highestroleid = 99999;
roles = SafeParse(localStorage.getItem("roles"));
rolelist = SafeParse(localStorage.getItem("role-list"));
specialRoles = SafeParse(localStorage.getItem("special-roles"));
rolecolor = SafeParse(localStorage.getItem("role-color"));
perms = SafeParse(localStorage.getItem("perms"));
positions = SafeParse(localStorage.getItem("positions"));
divisions = SafeParse(localStorage.getItem("divisions"));
applicationTypes = SafeParse(localStorage.getItem("application-types"));
userPerm = SafeParse(localStorage.getItem("user-perm"));
RANKING = SafeParse(localStorage.getItem("driver-ranks"));
RANKCLR = SafeParse(localStorage.getItem("driver-ranks-color"));
if (userPerm == null) userPerm = [];
user_language = localStorage.getItem("language");
if (user_language == null) user_language = "en";
setCookie("language", user_language);
user_distance = null;
shiftdown = false;
mfaenabled = false;
mfafunc = null;
allmembers = {};
profile_userid = -1;
modals = {};
modalName2ID = {};
callback_url = ""; // for oauth

var TSRadio;

function TSRPlay() {
    TSRadio = new Audio('https://oreo.truckstopradio.co.uk/radio/8000/radio.mp3');
    TSRadio.play();
    $("#tsr-control").attr("onclick", "TSRPause();");
    $("#tsr-control").html(`<i class="fa-solid fa-circle-pause" style="color:#2F8DF8;font-size:40px;"></i>`);
}

function TSRPause() {
    TSRadio.pause();
    $("#tsr-control").attr("onclick", "TSRPlay();");
    $("#tsr-control").html(`<i class="fa-solid fa-circle-play" style="color:#2F8DF8;font-size:40px;"></i>`);
}

function TSRUpdate() {
    $.ajax({
        url: "https://truckstopradio.co.uk/cache.php?url=https://panel.truckstopradio.co.uk/api/v1/song-history/now-playing",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            $("#tsr-song").html(data.song.title);
            $("#tsr-artist").html(data.song.artist);
            $("#tsr-spotify").attr("href", data.song.extraInfo.track.external_urls.spotify);
            $("#tsr-graphic").attr("src", data.song.graphic.medium);
        }
    });
}

// NOTE 2022 Wrapped
function Load2022Wrapped() {
    // export dlog / load dlog from cache
    w22dlog = localStorage.getItem("dlog-export-cache");
    w22cachetime = localStorage.getItem("dlog-export-cache-time");
    if (w22dlog == null || +new Date() - w22cachetime >= 3600000 && w22cachetime <= 1672531200000) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/dlog/export",
            type: "GET",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            data: JSON.stringify({
                start_time: 1640995200,
                end_time: 1672531199
            }),
            success: function (data) {
                w22dlog = data;
                localStorage.setItem("dlog-export-cache", w22dlog);
                localStorage.setItem("dlog-export-cache-time", +new Date());
            },
            error: function (data) {
                if (w22dlog == null) {
                    console.warn("Failed to export delivery log, unable to activate 2022 wrapped.");
                } else {
                    console.warn("Failed to export delivery log, using last export cache.");
                }
            }
        });
    }
    if (w22dlog == null) return;
    w22data = CSVToArray(w22dlog);

    firstdlog = null;
    longestdlog = null;
    longestmax = -1;
    firstcancel = null;
    mostdamage = null;
    damagemax = -1;
    firstchallenge = null;
    firstdivision = null;
    mostprofit = null;
    profitmax = -1;

    distancecount = 0;
    jobcount = 0;
    fuelcount = 0;
    eprofitcount = 0;
    aprofitcount = 0;
    destcount = {};
    routecount = {};
    truckcount = {};
    cargocount = {};
    for (var i = 0; i < w22data.length; i++) {
        w22d = w22data[i];
        if (w22d[7] != localStorage.getItem("userid")) continue;
        if (w22d[6] == "1" && firstdlog == null) firstdlog = w22d;
        if (w22d[6] == "1" && parseFloat(w22d[13]) > parseFloat(longestmax)) longestmax = w22d[13], longestdlog = w22d;
        if (w22d[6] == "0" && firstcancel == null) firstcancel = w22d;
        if (parseFloat(w22d[18]) > parseFloat(damagemax)) damagemax = w22d[18], mostdamage = w22d;
        if (w22d[6] == "1" && w22d[33] != undefined && firstdivision == null) firstdivision = w22d;
        if (w22d[6] == "1" && w22d[34] != undefined && firstchallenge == null) firstchallenge = w22d;
        if (w22d[6] == "1" && parseFloat(w22d[31]) > parseFloat(profitmax)) profitmax = w22d[31], mostprofit = w22d;
        if (w22d[6] != "1") continue;
        distancecount += parseFloat(w22d[13]);
        jobcount += 1;
        fuelcount += parseFloat(w22d[23]);
        if (w22d[2].startsWith("e")) eprofitcount += parseFloat(w22d[31]);
        else aprofitcount += parseFloat(w22d[31]);
        dest = w22d[12];
        if (destcount[dest] == undefined) destcount[dest] = 1; else destcount[dest] += 1;
        route = w22d[10] + " - " + w22d[12];
        if (routecount[route] == undefined) routecount[route] = 1; else routecount[route] += 1;
        truck = w22d[19] + " " + w22d[20];
        if (truckcount[truck] == undefined) truckcount[truck] = 1; else truckcount[truck] += 1;
        cargo = w22d[16];
        if (cargocount[cargo] == undefined) cargocount[cargo] = 1; else cargocount[cargo] += 1;
    }

    username = localStorage.getItem("name");
    discordid = localStorage.getItem("discordid");
    avatar = localStorage.getItem("avatar");
    join_timestamp = localStorage.getItem("join-timestamp");

    $("#22w-head").append(`<p style="font-size:40px;;"><b>Hey, ${username}</b></p>`);
    $("#22w-head").append(`<p>This is your 2022 wrapped.</p>`);
    $("#22w-avatar").attr("src", GetAvatarSrc(discordid, avatar));

    function GenTimelineItem(title, content, time, color) {
        return `
        <li class="timeline-item timeline-${color} mb-5" style="display:none">
            <h5 class="fw-bold">${title}</h5>
            <p class="text-muted mb-2 fw-bold">${getDateTime(time)}</p>
            <p>${content}</p>
        </li>`;
    }
    $("#22w-timeline").children().remove();
    $("#22w-timeline").append(GenTimelineItem("The Beginning", `You joined <b>${company_name}</b>.`, join_timestamp * 1000, "white"));

    timeline = {};
    if (firstdlog != null) {
        punit = "€";
        if (!firstdlog[2].startsWith("e")) punit = "$";
        timeline[parseInt(+new Date(firstdlog[3]) + "00")] = GenTimelineItem("First Delivery", `You made your first delivery carrying <b style="color:#2fc1f7">${firstdlog[16]}</b> from <b style="color:#2fc1f7">${firstdlog[9]}, ${firstdlog[10]}</b> to <b style="color:#2fc1f7">${firstdlog[11]}, ${firstdlog[12]}</b>. You drove <b style="color:#2fc1f7">${TSeparator(parseInt(firstdlog[13] * distance_ratio))}${distance_unit_txt}</b> and earned <b style="color:#2fc1f7">${punit}${TSeparator(parseInt(firstdlog[31]))}</b>.`, +new Date(firstdlog[3]), "green");
    }
    if (firstdivision != null) {
        punit = "€";
        if (!mostdamage[2].startsWith("e")) punit = "$";
        timeline[parseInt(+new Date(mostdamage[3]) + "01")] = GenTimelineItem("First Division Delivery", `You sent <b style="color:#2fc1f7">${mostdamage[16]}</b> from <b style="color:#2fc1f7">${mostdamage[9]}, ${mostdamage[10]}</b> to <b style="color:#2fc1f7">${mostdamage[11]}, ${mostdamage[12]}</b>. That is your first delivery accepted by division management team.`, +new Date(mostdamage[3]), "green");
    }
    if (firstchallenge != null) {
        punit = "€";
        if (!firstchallenge[2].startsWith("e")) punit = "$";
        timeline[parseInt(+new Date(firstchallenge[3]) + "02")] = GenTimelineItem("First Challenge Delivery", `You sent <b style="color:#2fc1f7">${firstchallenge[16]}</b> from <b style="color:#2fc1f7">${firstchallenge[9]}, ${firstchallenge[10]}</b> to <b style="color:#2fc1f7">${firstchallenge[11]}, ${firstchallenge[12]}</b>. That is your first delivery accepted by the challenge system.`, +new Date(firstchallenge[3]), "green");
    }
    if (longestdlog != null) {
        timeline[parseInt(+new Date(longestdlog[3]) + "10")] = GenTimelineItem("Well, it's far", `You drove <b style="color:#2fc1f7">${TSeparator(parseInt(longestdlog[13] * distance_ratio))}${distance_unit_txt}</b> carrying <b style="color:#2fc1f7">${longestdlog[16]}</b> from <b style="color:#2fc1f7">${longestdlog[9]}, ${longestdlog[10]}</b> to <b style="color:#2fc1f7">${longestdlog[11]}, ${longestdlog[12]}</b>. That is the longest job you've ever submitted.`, +new Date(longestdlog[3]), "yellow");
    }
    if (mostprofit != null) {
        punit = "€";
        if (!mostprofit[2].startsWith("e")) punit = "$";
        avgpft = parseFloat(parseInt(mostprofit[31]) / parseInt(mostprofit[13] * distance_ratio)).toPrecision(2);
        timeline[parseInt(+new Date(mostprofit[3]) + "11")] = GenTimelineItem("Wow, that's a lot!", `You drove <b style="color:#2fc1f7">${TSeparator(parseInt(mostprofit[13] * distance_ratio))}${distance_unit_txt}</b> carrying <b style="color:#2fc1f7">${mostprofit[16]}</b> from <b style="color:#2fc1f7">${mostprofit[9]}, ${mostprofit[10]}</b> to <b style="color:#2fc1f7">${mostprofit[11]}, ${mostprofit[12]}</b>. You earned <b style="color:#2fc1f7">${punit}${TSeparator(parseInt(firstdlog[31]))}</b>, that is <b style="color:#2fc1f7">${punit}${avgpft}/${distance_unit_txt}</b>.`, +new Date(mostprofit[3]), "yellow");
    }
    if (mostdamage != null) {
        timeline[parseInt(+new Date(mostdamage[3]) + "20")] = GenTimelineItem("Damm!", `You are sending <b style="color:#2fc1f7">${mostdamage[16]}</b> from <b style="color:#2fc1f7">${mostdamage[9]}, ${mostdamage[10]}</b> to <b style="color:#2fc1f7">${mostdamage[11]}, ${mostdamage[12]}</b>. But you crashed and the cargo is <b style="color:#2fc1f7">${parseFloat(mostdamage[18] * 100).toPrecision(2)}%</b> damaged.`, +new Date(mostdamage[3]), "red");
    }
    if (firstcancel != null) {
        punit = "€";
        if (!firstcancel[2].startsWith("e")) punit = "$";
        timeline[parseInt(+new Date(firstcancel[3]) + "00")] = GenTimelineItem("It's abandoned...", `This is the first time you cancelled a job. Never mind, it's OK that you take another job.`, +new Date(firstcancel[3]), "red");
    }
    timeline = sortDictByKey(timeline);
    keys = Object.keys(timeline);
    for (pair of timeline) {
        key = Object.keys(pair)[0];
        value = pair[key];
        $("#22w-timeline").append(`${value}`);
    }

    dt2023 = +new Date(1672531199680);
    if (+new Date() < 1672531199680) dt2023 = +new Date();

    eqcount = parseFloat(distancecount / 40075).toFixed(1);
    distancecount = TSeparator(parseInt(distancecount * distance_ratio));
    jobcount = TSeparator(jobcount);
    fuelcount = TSeparator(parseInt(fuelcount * fuel_ratio));
    eprofitcount = TSeparator(eprofitcount);
    aprofitcount = TSeparator(aprofitcount);
    maxdest = Object.entries(destcount).sort((a, b) => b[1] - a[1])[0][0];
    maxroute = Object.entries(routecount).sort((a, b) => b[1] - a[1])[0][0];
    maxtruck = Object.entries(truckcount).sort((a, b) => b[1] - a[1])[0][0];
    maxcargo = Object.entries(cargocount).sort((a, b) => b[1] - a[1])[0][0];
    content = `You completed a total of <b style="color:#2fc1f7">${jobcount}</b> jobs this year, consuming <b style="color:#2fc1f7">${fuelcount}${fuel_unit_txt}</b> fuel, resulting in a profit of <b style="color:#2fc1f7">€${eprofitcount}</b> and <b style="color:#2fc1f7">$${aprofitcount}</b>.<br>You traveled a distance of <b style="color:#2fc1f7">${distancecount}${distance_unit_txt}</b>, which is an impressive feat and equivalent to driving around the equator <b style="color:#2fc1f7">${eqcount} times</b>.<br>Your most preferred truck was <b style="color:#2fc1f7">${maxtruck}</b>, and the cargo <b style="color:#2fc1f7">${maxcargo}</b> was the most frequently transported.<br>The route <b style="color:#2fc1f7">${maxroute}</b> was driven the most, and the destination <b style="color:#2fc1f7">${maxdest}</b> received the most cargos.<br>Keep up the great work!`;
    $("#22w-timeline").append(GenTimelineItem("In 2022,", content, dt2023, "white"));

    distancecount = 0;
    jobcount = 0;
    fuelcount = 0;
    eprofitcount = 0;
    aprofitcount = 0;
    destcount = {};
    routecount = {};
    truckcount = {};
    cargocount = {};
    for (var i = 0; i < w22data.length; i++) {
        w22d = w22data[i];
        if (w22d[6] != "1") continue;
        distancecount += parseFloat(w22d[13]);
        jobcount += 1;
        fuelcount += parseFloat(w22d[23]);
        if (w22d[2].startsWith("e")) eprofitcount += parseFloat(w22d[31]);
        else aprofitcount += parseFloat(w22d[31]);
        dest = w22d[12];
        if (destcount[dest] == undefined) destcount[dest] = 1; else destcount[dest] += 1;
        route = w22d[10] + " - " + w22d[12];
        if (routecount[route] == undefined) routecount[route] = 1; else routecount[route] += 1;
        truck = w22d[19] + " " + w22d[20];
        if (truckcount[truck] == undefined) truckcount[truck] = 1; else truckcount[truck] += 1;
        cargo = w22d[16];
        if (cargocount[cargo] == undefined) cargocount[cargo] = 1; else cargocount[cargo] += 1;
    }
    eqcount = parseFloat(distancecount / 40075).toFixed(1);
    distancecount = TSeparator(parseInt(distancecount * distance_ratio));
    jobcount = TSeparator(jobcount);
    fuelcount = TSeparator(parseInt(fuelcount * fuel_ratio));
    eprofitcount = TSeparator(eprofitcount);
    aprofitcount = TSeparator(aprofitcount);
    maxdest = Object.entries(destcount).sort((a, b) => b[1] - a[1])[0][0];
    maxroute = Object.entries(routecount).sort((a, b) => b[1] - a[1])[0][0];
    maxtruck = Object.entries(truckcount).sort((a, b) => b[1] - a[1])[0][0];
    maxcargo = Object.entries(cargocount).sort((a, b) => b[1] - a[1])[0][0];
    content = `A total of <b style="color:#2fc1f7">${jobcount}</b> jobs were completed, consuming <b style="color:#2fc1f7">${fuelcount}${fuel_unit_txt}</b> fuel, resulting in a profit of <b style="color:#2fc1f7">€${eprofitcount}</b> and <b style="color:#2fc1f7">$${aprofitcount}</b>.<br>A distance of <b style="color:#2fc1f7">${distancecount}${distance_unit_txt}</b> was traveled, which is equivalent to driving around the equator <b style="color:#2fc1f7">${eqcount} times</b>.<br>The truck <b style="color:#2fc1f7">${maxtruck}</b> was the most preferred and the cargo <b style="color:#2fc1f7">${maxcargo}</b> was the most frequently transported.<br>The route <b style="color:#2fc1f7">${maxroute}</b> was driven the most, and the destination <b style="color:#2fc1f7">${maxdest}</b> received the most cargos.`;
    $("#22w-timeline").append("<div></div>"); // placeholder for longer fadeIn
    $("#22w-timeline").append(GenTimelineItem("What about the entire company?", content, dt2023, "white"));
    $("#22w-timeline").append("<div></div>"); // placeholder for longer fadeIn
    $("#22w-timeline").append(GenTimelineItem("Wait, it has not ended!", "We as CHub Team have something to show you!", dt2023, "white"));

    $("#sidebar-information").after(`<li class="nav-item">
        <a id="button-2022wrapped-tab" onclick="ShowTab('#2022wrapped-tab', '#button-2022wrapped-tab')" class="nav-link text-white clickable" aria-current="page">
            <span class="rect-20"><i class="fa-solid fa-gift"></i></span>
            2022 Wrapped
        </a>
    </li>`);

    if (curtab == "#2022wrapped-tab") {
        $(".nav-link").removeClass("active");
        $("#button-2022wrapped-tab").addClass("active");
    }
}

function Show2022Wrapped() {
    w22tlonshow = 0;
    w22tlint = setInterval(function () {
        if (w22tlonshow >= $("#22w-timeline").children().length) {
            setTimeout(function () {
                $("#2022wrapped-left").animate({
                    width: "66.6666%"
                }, 1000);
                $("html, body").animate({
                    scrollTop: 0
                }, 1200);
                setTimeout(function () {
                    $("#2022wrapped-left").addClass("col-7");
                    $("#2022wrapped-left").attr("style", "");
                    $("#2022wrapped-right").fadeIn();
                    $($("#2022wrapped-left").children()[0]).css("margin", "");
                    $($("#2022wrapped-left").children()[0]).addClass("m-1");
                    $("#22w-timeline").children().last().remove();
                }, 1100);
            }, 1500);
            clearInterval(w22tlint);
            return;
        }
        $($("#22w-timeline").children()[w22tlonshow]).fadeIn();
        $("html, body").animate({
            scrollTop: $($("#22w-timeline").children()[w22tlonshow]).offset().top - $(window).height() / 2
        }, 3000);
        w22tlonshow += 1;
    }, 3000);
}

function Logout() {
    token = localStorage.getItem("token");
    $.ajax({
        url: api_host + "/" + dhabbr + "/token",
        type: "DELETE",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    localStorage.removeItem("token");
    $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
    $("#button-user-profile").attr("data-bs-toggle", "");
    $("#user-profile-dropdown").hide();
    $("#sidebar-username").html(mltr("guest"));
    $("#sidebar-userid").html(mltr("login_first"));
    $("#sidebar-role").html(mltr("loner"));
    $("#sidebar-avatar").attr("src", "https://charlws.com/me.gif");
    $("#sidebar-application").hide();
    $("#sidebar-staff").hide();
    NonMemberMode();
    localStorage.removeItem("roles");
    localStorage.removeItem("name");
    localStorage.removeItem("highest-role");
    localStorage.removeItem("discordid");
    localStorage.removeItem("userid");
    ShowTab("#signin-tab", "#button-signin-tab");
}

simplebarINIT = ["#sidebar", "#table_mini_leaderboard", "#table_new_driver", "#table_online_driver", "#table_delivery_log", "#table_division_delivery", "#table_leaderboard", "#table_my_application", "#notification-dropdown-wrapper"];
simplemde = { "#settings-bio": undefined, "#announcement-new-content": undefined, "#downloads-new-description": undefined, "#downloads-edit-description": undefined, "#challenge-new-description": undefined, "#challenge-edit-description": undefined, "#event-new-description": undefined, "#event-edit-description": undefined };
// tooltipINIT = ["#api-hex-color-tooltip", "#api-logo-link-tooltip", "#api-require-truckersmp-tooltip", "#api-privacy-tooltip", "#api-in-guild-check-tooltip", "#api-delivery-log-channel-id-tooltip"];
tooltipINIT = [];
async function InitDefaultValues() {
    $("#mfa-otp").val("");
    $("textarea").val("");
    $("body").keydown(function (e) {
        if (e.which == 16) shiftdown = true;
    });
    $("body").keyup(function (e) {
        if (e.which == 16) shiftdown = false;
    });
    setTimeout(function () {
        $("#mfa-otp").on("input", function () {
            if ($("#mfa-otp").val().length == 6) {
                $("#mfa-otp").attr("disabled");
                MFAVerify();
            }
        });
    }, 50);
    $(".pageinput").val("1");
    setInterval(function () {
        $(".ol-unselectable").css("border-radius", "15px"); // map border
    }, 1000);
    $("#application-type-default").prop("selected", true);
    $("#statistics-chart-select-360d").prop("selected", true);
    $("#user-statistics-chart-select-360d").prop("selected", true);

    // for(i=0;i<tooltipINIT.length;i++) new bootstrap.Tooltip($(tooltipINIT[i]), {boundary: document.body});
    $('#input-leaderboard-search').flexdatalist({
        selectionRequired: 1,
        minLength: 1,
        limitOfValues: 10
    });
    $('#input-audit-log-staff').flexdatalist({
        selectionRequired: 1,
        minLength: 1,
        limitOfValues: 1
    });
    InitSearchByName();
    $("#input-audit-log-staff-flexdatalist").css("border-radius", "0.375rem 0 0 0.375rem");
}

function InitRankingDisplay() {
    if (RANKING != undefined && RANKING != null && RANKING != []) {
        rankpnt = Object.keys(RANKING);
        for (var i = 0; i < Math.ceil(rankpnt.length / 8); i++) {
            ranktable = `<table class="table-auto" style="display:inline">
            <thead>
              <tr class="text-xs text-gray-500 text-left">
                <th class="py-5 px-6 pb-3 font-medium">Rank</th>
                <th class="py-5 px-6 pb-3 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>`;
            for (var j = 0; j < 8; j++) {
                if (rankpnt[i * 8 + j] == undefined) break;
                ranktable += `<tr class="text-sm">
                    <td class="py-5 px-6 font-medium">${RANKING[rankpnt[i * 8 + j]]}</td>
                    <td class="py-5 px-6 font-medium">${rankpnt[i * 8 + j]}</td>
                </tr>`;
            }
            ranktable += `</tbody></table>`;
            $("#ranktable").append(ranktable);
        }
    }
}

function InitResizeHandler() {
    setInterval(function () {
        if ($("#overview-tab").width() / 3 <= 300) {
            if ($("#overview-tab").width() / 2 <= 300) $(".statscard").css("width", "100%");
            else $(".statscard").css("width", "50%");
        } else $(".statscard").css("width", "33%");
    }, 10);
}

function InitPhoneView() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
        t = $("div");
        for (i = 0; i < t.length; i++) {
            st = $(t[i]).attr("style");
            if (st == undefined) continue;
            st = st.replaceAll("padding:50px", "padding:5px");
            $(t[i]).attr("style", st);
        }
        $("#hometableftcontainer").css("width", "100%");
    }
}

function InitInputHandler() {
    $('#application-type').on('change', function () {
        var value = $(this).val();
        $(".application-tab").hide();
        $("#Application" + value).show();
        $("#submitAppBttn").show();
    });
    $('#application4Answer1').on('change', function () {
        var value = $(this).val();
        $(".divisiontabs").hide();
        $("#division-tab" + value).show();
    });
    $("#input-member-search").on("keydown", function (e) {
        if (e.which == 13) {
            LoadMemberList(noplaceholder = true);
        }
    });
    $("#input-user-search").on("keydown", function (e) {
        if (e.which == 13) {
            LoadUserList(noplaceholder = true);
        }
    });
    $("#signin-email").keypress(function (e) {
        if (e.which == 13) {
            if ($("#signin-password").val() == "") {
                $("#signin-password").focus();
            } else {
                ShowCaptcha();
            }
        }
    });
    $("#signin-password").keypress(function (e) {
        if (e.which == 13) {
            ShowCaptcha();
        }
    });
    $("#toggleLoginPassword").click(function () {
        let passwordInput = $("#signin-password");
        let passwordType = passwordInput.attr("type");
        if (passwordType === "password") {
            passwordInput.attr("type", "text");
            $("#toggleLoginPassword").removeClass("fa-eye").addClass("fa-eye-slash");
        } else {
            passwordInput.attr("type", "password");
            $("#toggleLoginPassword").removeClass("fa-eye-slash").addClass("fa-eye");
        }
    });
}

function InitDistanceUnit() {
    distance_unit = localStorage.getItem("distance-unit");
    if (distance_unit == "imperial") {
        $(".distance_unit").html("mi");
        distance_unit_txt = "mi";
        fuel_unit_txt = "gal";
        weight_unit_txt = "lb";
        distance_ratio = 0.621371;
        fuel_ratio = 0.2641720524;
        weight_ratio = 2.2046226218488;
        $("#imperialbtn").css("background-color", "none");
        $("#metricbtn").css("background-color", "#293039");
        $("#settings-distance-unit-metric").removeClass("active");
        $("#settings-distance-unit-imperial").addClass("active");
    } else {
        $(".distance_unit").html("km");
        distance_unit = "metric";
        distance_unit_txt = "km";
        fuel_unit_txt = "l";
        weight_unit_txt = "kg";
        distance_ratio = 1;
        fuel_ratio = 1;
        weight_ratio = 1;
        $("#metricbtn").css("background-color", "none");
        $("#imperialbtn").css("background-color", "#293039");
        $("#settings-distance-unit-imperial").removeClass("active");
        $("#settings-distance-unit-metric").addClass("active");
    }
}

function InitLeaderboardTimeRange() {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
    firstDay = new Date(+firstDay - offset);
    date = new Date(+date - offset);
    $("#lbstart").val(firstDay.toISOString().slice(0, -1).substring(0, 10));
    $("#lbend").val(date.toISOString().slice(0, -1).substring(0, 10));
}

function fetchAllUsers(page = 1) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page_size=250&page=" + page,
            type: "GET",
            contentType: "application/json",
            processData: false,
            headers: authorizationHeader,
            success: async function (data) {
                l = data.list;

                for (var i = 0; i < l.length; i++) {
                    allmembers[l[i].userid] = l[i].name;
                    $("#all-member-datalist").append(`<option value="${l[i].name} (${l[i].userid})">${l[i].name} (${l[i].userid})</option>`);
                }

                if (page < data.total_pages) {
                    fetchAllUsers(page + 1)
                        .then(resolve)
                        .catch(reject);
                } else {
                    resolve();
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error(
                    "Error fetching users from page " + page + ": " + errorThrown
                );
                reject(errorThrown);
            },
        });
    });
}

function InitSearchByName() {
    fetchAllUsers()
        .then(() => {
            $(".search-name").flexdatalist({
                selectionRequired: true,
                minLength: 1
            });
            $(".search-name-mul").flexdatalist({
                selectionRequired: 1,
                minLength: 1
            });
        })
        .catch((error) => {
            console.error("Error fetching users: " + error);
        });
}

eventsCalendar = undefined;
curtab = "#overview-tab";
loadworking = false;

async function ShowTab(tabname, btnname) {
    $(".modal").fadeOut();
    $(".modal-backdrop").fadeOut();
    setTimeout(function () { $(".modal").remove(); $(".modal-backdrop").remove(); }, 1000);
    loadworking = true;
    curtab = tabname;
    clearInterval(dmapint);
    dmapint = -1;
    $("#map,#dmap,#pmap,#amap").children().remove();
    $(".tabs").hide();
    $(tabname).show();
    if (tabname == "#user-delivery-tab") {
        $("#delivery-tab").show();
    }
    loaded = $(tabname).hasClass("loaded");
    $(tabname).addClass("loaded");
    $(".nav-link").removeClass("active");
    if (btnname != "#ProfileTabBtn") {
        $(btnname).addClass("active");
    }
    if (tabname == "#map-tab") {
        window.history.pushState("", "", '/map');
        document.title = mltr("live_map") + " - " + company_name;
        window.autofocus["map"] = -2;
        window.autofocus["amap"] = -2;
        window.autofocus["pmap"] = -2;
        LoadETS2Map();
        LoadETS2PMap();
        LoadATSMap();
    }
    if (tabname == "#ProfileTab") {
        if (isNumber(btnname)) userid = btnname;
        else userid = localStorage.getItem("userid");
        if (String(userid) == localStorage.getItem("userid")) window.history.pushState("", "", '/member/@me');
        else window.history.pushState("", "", '/member/' + userid);
        document.title = mltr("member") + " - " + company_name;
        $("#UserBanner").show();
        $("#UserBanner").attr("src", "https://" + window.location.hostname + "/banner/" + userid);
        $("#UserBanner").attr("onclick", `CopyBannerURL("${userid}");`);
        $("#UserBanner").attr("oncontextmenu", `CopyBannerURL("${userid}");`);
        LoadUserProfile(userid);
    }
    if (tabname == "#notification-tab") {
        window.history.pushState("", "", '/notification');
        document.title = mltr("notifications") + " - " + company_name;
        LoadNotificationList(noplaceholder = loaded);
    }
    // NOTE 2022 Wrapped
    if (tabname == "#2022wrapped-tab") {
        window.history.pushState("", "", '/2022wrapped');
        document.title = "2022 Wrapped - " + company_name;
        if (!loaded) Show2022Wrapped();
    }
    if (tabname == "#overview-tab") {
        window.history.pushState("", "", '/');
        document.title = mltr("overview") + " - " + company_name;
        LoadStats(noplaceholder = loaded);
        if (!loaded) {
            $("#statistics-chart-select").change(function () {
                chartscale = parseInt($(this).val());
                LoadChart();
            });
        }
    }
    if (tabname == "#signin-tab") {
        if (localStorage.getItem("token") != null && localStorage.getItem("token").length == 36) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        window.history.pushState("", "", '/login');
        document.title = mltr("login") + " - " + company_name;
    }
    if (tabname == "#captcha-tab") {
        if (!requireCaptcha) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#captcha-tab", "#button-captcha-tab");`);
        window.history.pushState("", "", '/captcha');
        document.title = mltr("captcha") + " - " + company_name;
    }
    if (tabname == "#mfa-tab") {
        $("#mfa-otp").val("");
        $("#mfa-otp").removeAttr("disabled");
        clearTimeout(mfato);
        UnlockBtn("#button-mfa-verify");
        pmfa = localStorage.getItem("pending-mfa");
        if (mfafunc != null) pmfa = +new Date();
        if (pmfa == null || (+new Date() - parseInt(pmfa)) > 600000) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        window.history.pushState("", "", '/mfa');
        document.title = mltr("mfa") + " - " + company_name;
    }
    if (tabname == "#announcement-tab") {
        window.history.pushState("", "", '/announcement');
        LoadAnnouncement(noplaceholder = loaded);
        document.title = mltr("announcements") + " - " + company_name;
    }
    if (tabname == "#downloads-tab") {
        window.history.pushState("", "", '/downloads');
        LoadDownloads(noplaceholder = loaded);
        document.title = mltr("downloads") + " - " + company_name;
    }
    if (tabname == "#delivery-tab") {
        window.history.pushState("", "", '/delivery');
        document.title = mltr("delivery") + " - " + company_name;
        $("#delivery-log-userid").val("");
        $("#company-statistics").show();
        $("#button-delivery-export").show();
        $("#user-statistics").hide();
        if (!loaded) {
            LoadDriverLeaderStatistics();
            LoadStats(true);
        }
        $("#delivery-tab").removeClass("last-load-user");
        if (!$("#delivery-tab").hasClass("last-load-company")) {
            LoadDeliveryList();
        } else {
            LoadDeliveryList(noplaceholder = loaded);
        }
        $("#delivery-tab").addClass("last-load-company");
    }
    if (tabname == "#user-delivery-tab") {
        userid = btnname;
        profile_userid = userid;
        if (String(userid) == localStorage.getItem("userid")) window.history.pushState("", "", '/member/@me');
        else window.history.pushState("", "", '/member/' + userid);
        document.title = mltr("member") + " - " + company_name;
        $("#company-statistics").hide();
        $("#button-delivery-export").hide();
        $("#user-statistics").show();
        $("#delivery-tab").removeClass("last-load-company");
        if (!$("#delivery-tab").hasClass("last-load-user") || $("#delivery-tab").attr("last-load-userid") != userid) {
            LoadDeliveryList();
            LoadChart(userid);
        } else {
            LoadDeliveryList(noplaceholder = loaded);
        }
        $("#delivery-tab").addClass("last-load-user");
        $("#delivery-tab").attr("last-load-userid", userid);
    }
    if (tabname == "#challenge-tab") {
        window.history.pushState("", "", '/challenge');
        document.title = mltr("challenges") + " - " + company_name;
        LoadChallenge(noplaceholder = loaded);
    }
    if (tabname == "#division-tab") {
        window.history.pushState("", "", '/division');
        document.title = mltr("divisions") + " - " + company_name;
        LoadDivisionInfo(noplaceholder = loaded);
    }
    if (tabname == "#event-tab") {
        window.history.pushState("", "", '/event');
        document.title = mltr("events") + " - " + company_name;
        LoadEvent(noplaceholder = loaded);
    }
    if (tabname == "#member-tab") {
        window.history.pushState("", "", '/member');
        document.title = mltr("members") + " - " + company_name;
        if (!loaded) {
            LoadXOfTheMonth();
        }
        LoadMemberList(noplaceholder = loaded);
    }
    if (tabname == "#leaderboard-tab") {
        window.history.pushState("", "", '/leaderboard');
        document.title = mltr("leaderboard") + " - " + company_name;
        LoadLeaderboard(noplaceholder = loaded);
    }
    if (tabname == "#ranking-tab") {
        window.history.pushState("", "", '/ranking');
        document.title = mltr("rankings") + " - " + company_name;
        if (!loaded) LoadRanking();
    }
    if (tabname == "#submit-application-tab") {
        window.history.pushState("", "", '/application/new');
        document.title = mltr("new_application") + " - " + company_name;
    }
    if (tabname == "#my-application-tab") {
        window.history.pushState("", "", '/application/my');
        document.title = mltr("my_applications") + " - " + company_name;
        LoadUserApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#all-application-tab") {
        window.history.pushState("", "", '/application/all');
        document.title = mltr("all_applications") + " - " + company_name;
        LoadAllApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#manage-user-tab") {
        window.history.pushState("", "", '/manage/user');
        document.title = mltr("pending_users") + " - " + company_name;
        LoadUserList(noplaceholder = loaded);
        if (!loaded) {
            $(document).on('keydown', function (e) {
                if (e.ctrlKey && e.altKey && e.keyCode === 85) {
                    discordid = prompt("Enter Discord ID to unban:");
                    if (!isNumber(discordid)) {
                        alert("Discord ID must be an integer!");
                        return;
                    }
                    UnbanUser(discordid);
                }
            });
        }
    }
    if (tabname == "#audit-tab") {
        window.history.pushState("", "", '/audit');
        document.title = mltr("audit_log") + " - " + company_name;
        LoadAuditLog(noplaceholder = loaded);
    }
    if (tabname == "#config-tab") {
        window.history.pushState("", "", '/config');
        document.title = mltr("configuration") + " - " + company_name;
        LoadConfiguration();
        $("#config-subtab").children().removeClass("active");
        $("#config-subtab").children().removeClass("show");
        $("#config-api-json-tab").click();
        // if(!loaded){
        //     setInterval(function(){
        //         if($("#config-api-tab").hasClass("active") && $($("#config-api-control").parent()).attr("id") == "config-api-json"){
        //             $("#config-api-control").appendTo("#config-api");
        //         } else if($("#config-api-json-tab").hasClass("active") && $($("#config-api-control").parent()).attr("id") == "config-api"){
        //             $("#config-api-control").appendTo("#config-api-json");
        //         }
        //     })
        // }
    }
    if (tabname == "#user-settings-tab") {
        window.history.pushState("", "", '/settings');
        document.title = mltr("settings") + " - " + company_name;
        LoadNotificationSettings();
        LoadUserSessions();
        if (!loaded) {
            $("#notifications-drivershub").on("change", function () {
                if ($("#notifications-drivershub").prop("checked")) {
                    EnableNotification("drivershub", mltr("drivers_hub"));
                } else {
                    DisableNotification("drivershub", mltr("drivers_hub"));
                }
            });
            $("#notifications-discord").on("change", function () {
                if ($("#notifications-discord").prop("checked")) {
                    EnableNotification("discord", mltr("discord"));
                } else {
                    DisableNotification("discord", mltr("discord"));
                }
            });
            $("#notifications-login").on("change", function () {
                if ($("#notifications-login").prop("checked")) {
                    EnableNotification("login", mltr("login"));
                } else {
                    DisableNotification("login", mltr("login"));
                }
            });
            $("#notifications-dlog").on("change", function () {
                if ($("#notifications-dlog").prop("checked")) {
                    EnableNotification("dlog", mltr("delivery_log"));
                } else {
                    DisableNotification("dlog", mltr("delivery_log"));
                }
            });
            $("#notifications-member").on("change", function () {
                if ($("#notifications-member").prop("checked")) {
                    EnableNotification("member", mltr("member"));
                } else {
                    DisableNotification("member", mltr("member"));
                }
            });
            $("#notifications-application").on("change", function () {
                if ($("#notifications-application").prop("checked")) {
                    EnableNotification("application", mltr("application"));
                } else {
                    DisableNotification("application", mltr("application"));
                }
            });
            $("#notifications-challenge").on("change", function () {
                if ($("#notifications-challenge").prop("checked")) {
                    EnableNotification("challenge", mltr("challenge"));
                } else {
                    DisableNotification("challenge", mltr("challenge"));
                }
            });
            $("#notifications-division").on("change", function () {
                if ($("#notifications-division").prop("checked")) {
                    EnableNotification("division", mltr("division"));
                } else {
                    DisableNotification("division", mltr("division"));
                }
            });
            $("#notifications-event").on("change", function () {
                if ($("#notifications-event").prop("checked")) {
                    EnableNotification("event", mltr("event"));
                } else {
                    DisableNotification("event", mltr("event"));
                }
            });
        }
        $("#settings-subtab").children().removeClass("active");
        $("#settings-subtab").children().removeClass("show");
        if (btnname != "from-mfa") {
            $("#settings-general-tab").click();
        } else {
            $("#settings-security-tab").click();
        }
    }
}

function UpdateRolesOnDisplay() {
    rolestxt = [];
    for (i = 0; i < roles.length; i++) {
        rolestxt.push(rolelist[roles[i]]);
    }
    hrole = rolestxt[0];
    localStorage.setItem("highest-role", hrole);

    if (hrole == undefined || hrole == "undefined") hrole = mltr("loner");
    $("#sidebar-role").html(hrole);
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        roleids[i] = parseInt(roleids[i]);
    }
    userPerm = GetUserPermission();
    ShowStaffTabs();
}

function LoadCache(force) {
    if (force) localStorage.removeItem("cache-expire");
    rolelist = SafeParse(localStorage.getItem("role-list"));
    specialRoles = SafeParse(localStorage.getItem("special-roles"));
    perms = SafeParse(localStorage.getItem("perms"));
    positions = SafeParse(localStorage.getItem("positions"));
    applicationTypes = SafeParse(localStorage.getItem("application-types"));
    divisions = SafeParse(localStorage.getItem("divisions"));
    RANKING = SafeParse(localStorage.getItem("driver-ranks"));
    RANKCLR = SafeParse(localStorage.getItem("driver-ranks-color"));

    if (positions != undefined && positions != null) {
        positionstxt = "";
        for (var i = 0; i < positions.length; i++) {
            positionstxt += positions[i] + "\n";
            $("#sa-select").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
        }
        positionstxt = positionstxt.slice(0, -1);
    } else {
        positions = [];
    }

    $.ajax({
        url: "https://config.chub.page/roles",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            specialRoles = data.response;
            localStorage.setItem("special-roles", JSON.stringify(specialRoles));
        }
    });

    cacheExpire = parseInt(localStorage.getItem("cache-expire"));
    if (!(rolelist != undefined && perms != null && perms != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined && divisions != undefined && RANKING != undefined && RANKCLR != undefined))
        cacheExpire = 0;
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/application/positions",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                positions = data;
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/roles",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                roles = data;
                rolelist = {};
                rolecolor = {};
                for (var i = 0; i < roles.length; i++) {
                    rolelist[roles[i].id] = roles[i].name;
                    rolecolor[roles[i].id] = roles[i].color;
                }
                localStorage.setItem("role-list", JSON.stringify(rolelist));
                localStorage.setItem("role-color", JSON.stringify(rolecolor));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/application/types",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                d = data;
                applicationTypes = {};
                for (var i = 0; i < d.length; i++)
                    applicationTypes[parseInt(d[i].applicationid)] = d[i].name;
                localStorage.setItem("application-types", JSON.stringify(applicationTypes));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/perms",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                perms = data;
                localStorage.setItem("perms", JSON.stringify(perms));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/ranks",
            type: "GET",
            contentType: "application/json",
            success: function (data) {
                d = data;
                RANKING = {};
                RANKCLR = {};
                for (i = 0; i < d.length; i++) {
                    RANKING[parseInt(d[i]["points"])] = d[i]["name"];
                    RANKCLR[parseInt(d[i]["points"])] = d[i]["color"];
                    if (RANKCLR[parseInt(d[i]["points"])] == undefined) RANKCLR[parseInt(d[i]["points"])] = default_text_color;
                }
                localStorage.setItem("driver-ranks", JSON.stringify(RANKING));
                localStorage.setItem("driver-ranks-color", JSON.stringify(RANKCLR));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/division/list",
            type: "GET",
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data;
                divisions = {};
                for (i = 0; i < d.length; i++) {
                    divisions[d[i].id] = d[i];
                }
                localStorage.setItem("divisions", JSON.stringify(divisions));
            },
            error: function (data) {
                divisions = {}; // no division plugin
                localStorage.setItem("divisions", JSON.stringify(divisions));
            }
        });
        localStorage.setItem("cache-expire", +new Date() + 86400000);
    }
}

function ClearCache() {
    localStorage.removeItem("cache-expire");
    localStorage.removeItem("no-tsr");
    toastNotification("success", "Success", "Local cache cleared!", 5000);
    setTimeout(function () { window.location.reload(); }, 500);
}

userPermLoaded = false;

function GetUserPermission() {
    if (roles == undefined || perms.admin == undefined) return;
    userPerm = [];
    for (i = 0; i < roles.length; i++) {
        for (j = 0; j < Object.keys(perms).length; j++) {
            for (k = 0; k < perms[Object.keys(perms)[j]].length; k++) {
                if (perms[Object.keys(perms)[j]][k] == roles[i]) {
                    userPerm.push(Object.keys(perms)[j]);
                }
            }
        }
    }
    userPerm.push("user");
    userPermLoaded = true;
    localStorage.setItem("user-perm", JSON.stringify(userPerm));
    return userPerm;
}

function ShowStaffTabs() {
    t = SafeParse(JSON.stringify(userPerm));
    if (t == null) return;
    if (t.indexOf('user') != -1) t.splice(t.indexOf('user'), 1);
    if (t.indexOf('driver') != -1) t.splice(t.indexOf('driver'), 1);
    if (t.length > 0) {
        if (userPerm.includes("admin")) {
            $("#sidebar-staff").show();
            $("#button-all-application-tab").show();
            UpdatePendingApplicationBadge();
            $("#button-manage-user").show();
            $("#button-audit-tab").show();
            $("#button-config-tab").show();
        } else {
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#sidebar-staff").show();
                $("#button-all-application-tab").show();
                UpdatePendingApplicationBadge();
            }
            if (userPerm.includes("hr")) {
                $("#sidebar-staff").show();
                $("#button-manage-user").show();
            }
            if (userPerm.includes("audit")) {
                $("#sidebar-staff").show();
                $("#button-audit-tab").show();
            }
        }
    }
}

function NonMemberMode() {
    $("#sidebar-role").html(mltr("loner"));
    $("#overview-right-col").hide();
    $("#overview-left-col").removeClass("col-8");
    $("#overview-left-col").addClass("col");
    $(".member-only").hide();
    $(".non-member-only").show();
    $("#sidebar-staff").hide();
    let p = window.location.pathname;
    if (p.startsWith("/oauth")) {
        toastNotification("error", "Error", "You must login to authorize the application!", 5000);
        ShowTab("#signin-tab", "#button-signin-tab");
    }
}

function MemberMode() {
    $("#overview-right-col").show();
    $("#overview-left-col").addClass("col-8");
    $("#overview-left-col").removeClass("col");
    $(".member-only").show();
    $(".non-member-only").hide();
}

function PreValidateToken() {
    userid = localStorage.getItem("userid");
    name = localStorage.getItem("name");
    discordid = localStorage.getItem("discordid");
    avatar = localStorage.getItem("avatar");
    highestrole = localStorage.getItem("highest-role");
    highestroleid = localStorage.getItem("highest-role-id");

    if (userid == null || name == null) {
        $("#sidebar-username").html(`<span class="placeholder col-8"></span>`);
        $("#sidebar-userid").html(`<span class="placeholder col-2"></span>`);
        $("#sidebar-role").html(`<span class="placeholder col-6"></span>`);
        return;
    }
    $("#sidebar-username").html(name);
    $("#sidebar-userid").html("#" + userid);
    $("#sidebar-banner").attr("src", api_host + "/" + dhabbr + "/member/banner?userid=" + userid);
    $("#sidebar-avatar").attr("src", avatar);
    $("#sidebar-role").html(highestrole);

    ShowStaffTabs();
}

function ValidateToken() {
    token = localStorage.getItem("token");
    userid = localStorage.getItem("userid");

    if (token == null) {
        // Guest, not logged in, update elements
        $("#sidebar-application").hide();
        $("#sidebar-username").html(mltr("guest"));
        $("#sidebar-userid").html(mltr("login_first"));
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-profile").attr("data-bs-toggle", "");
        $("#user-profile-dropdown").hide();
        $("#button-user-delivery-tab").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-settings-tab").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        NonMemberMode();
        userPermLoaded = true;
        localStorage.removeItem("roles");
        localStorage.removeItem("name");
        localStorage.removeItem("highest-role");
        localStorage.removeItem("discordid");
        localStorage.removeItem("userid");
        return;
    }

    $("#sidebar-application").show();
    $("#button-user-profile").attr("onclick", ``);
    $("#button-user-profile").attr("data-bs-toggle", "dropdown");
    $("#user-profile-dropdown").css("display", "");
    $("#button-user-delivery-tab").attr("onclick", `LoadUserProfile(localStorage.getItem('userid'));`);
    $("#button-user-settings-tab").attr("onclick", `ShowTab('#user-settings-tab');`);

    if (userid != -1 && userid != null) {
        MemberMode();
        $("#sidebar-banner").show();
    } else {
        NonMemberMode();
    }

    // Validate token and get user information
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/profile",
        type: "GET",
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            $("#button-user-profile").attr("data-bs-toggle", "dropdown");
            $("#user-profile-dropdown").css("display", "");

            // User Information
            user = data;
            localStorage.setItem("roles", JSON.stringify(user.roles));
            localStorage.setItem("name", user.name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''));
            localStorage.setItem("avatar", user.avatar);
            localStorage.setItem("discordid", user.discordid);
            localStorage.setItem("userid", user.userid);
            localStorage.setItem("uid", user.uid);

            userid = user.userid;

            if (userid != -1 && userid != null) {
                // Logged in, and is member, show membersOnlyTabs
                MemberMode();
                $("#sidebar-banner").show();
            } else {
                // Logged in, not member, hide division and downloads
                NonMemberMode();
            }

            // Check if is member
            userid = user.userid;
            if (user.userid != -1) {
                $("#button-member-tab").show();
            }
            roles = user.roles.sort(function (a, b) {
                return a - b;
            });
            highestrole = rolelist[roles[0]];
            if (highestrole == undefined) highestrole = "Unknown Role";
            highestroleid = roles[0];
            localStorage.setItem("highest-role", highestrole);
            localStorage.setItem("highest-role-id", highestroleid);

            name = user.name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
            avatar = user.avatar;
            discordid = user.discordid;
            $("#sidebar-username").html(name);
            $("#sidebar-userid").html("#" + userid);
            $("#sidebar-bio").html(user.bio);
            simplemde["#settings-bio"].value(user.bio);
            $("#sidebar-banner").attr("src", api_host + "/" + dhabbr + "/member/banner?userid=" + userid);
            $("#sidebar-avatar").attr("src", avatar);

            mfaenabled = user.mfa;
            if (mfaenabled) {
                $("#button-settings-mfa-disable").show();
            } else {
                $("#button-settings-mfa-enable").show();
            }

            if(user.truckersmpid != null) $("#settings-user-truckersmpid").val(user.truckersmpid);
            if(user.steamid != null) $("#settings-user-steamid").val(user.steamid);
            if(user.discordid != null) $("#settings-user-discordid").val(user.discordid);

            UpdateRolesOnDisplay();
            LoadNotification();
            setInterval(function () {
                LoadNotification();
            }, 30000);

            if (!userPerm.includes("driver") && !userPerm.includes("admin")) {
                $("#sidebar-userid").html("##");
                NonMemberMode();
                return;
            }

            // NOTE 2022 Wrapped
            // Load2022Wrapped();

            $.ajax({
                url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + String(userid),
                type: "GET",
                contentType: "application/json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (data.list.length == 1) {
                        user_distance = data.list[0].points.distance;
                    } else {
                        user_distance = 0;
                    }
                }, error: function () {
                    user_distance = 0;
                }
            });

            $.ajax({
                url: api_host + "/" + dhabbr + "/user/language",
                type: "GET",
                contentType: "application/json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    user_language = data.language;
                    $("#api-language-" + user_language).prop("selected", true);
                    localStorage.setItem("language", user_language);
                    if (getCookie("language") && getCookie("language") != user_language) {
                        setCookie("language", user_language);
                        window.location.reload();
                    }
                    setCookie("language", user_language);
                }
            });
        },
        error: function (data) {
            // Invalid token, log out
            if (parseInt(data.status) == 401) { // Prevent connection issue (e.g. refresh)
                localStorage.removeItem("token");
                ShowTab("#signin-tab", "#button-signin-tab");
            }
        }
    });
}

function InitLanguage() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/languages",
        type: "GET",
        contentType: "application/json",
        success: function (data) {
            languages = data.supported;
            for (var i = 0; i < languages.length; i++) {
                $("#api-language").append(`<option id="api-language-${languages[i]}" value="${languages[i]}">${LANG_CODE[languages[i]]}</option>`);
            }
            $("#api-language-" + user_language).prop("selected", true);
            $("#api-language").on('change', function () {
                user_language = $(this).val();
                $.ajax({
                    url: api_host + "/" + dhabbr + "/user/language",
                    type: "PATCH",
                    contentType: "application/json",
                    headers: {
                        "Authorization": "Bearer " + localStorage.getItem("token")
                    },
                    data: JSON.stringify({
                        language: user_language
                    }),
                    success: function (data) {
                        setCookie("language", user_language);
                        localStorage.setItem("language", user_language);
                        toastNotification("success", "Success", "Language Updated to: " + LANG_CODE[user_language], 5000);
                        setTimeout(function () { window.location.reload(); }, 500);
                    },
                    error: function (data) {
                        AjaxError(data);
                    }
                });
            });
        }
    });
}

async function PathDetect() {
    await sleep(100);
    let p = window.location.pathname;
    // NOTE 2022 Wrapped
    if (p == "/2022wrapped") ShowTab("#2022wrapped-tab", "#button-2022wrapped-tab");
    else if (p == "/overview") window.history.pushState("", "", '/');
    else if (p == "/") ShowTab("#overview-tab", "#button-overview-tab");
    else if (p == "/notification") ShowTab("#notification-tab");
    else if (p == "/login") ShowTab("#signin-tab", "#button-signin-tab");
    else if (p == "/captcha") ShowTab("#captcha-tab", "#button-captcha-tab");
    else if (p == "/mfa") ShowTab("#mfa-tab", "#button-mfa-tab");
    else if (p == "/announcement") ShowTab("#announcement-tab", "#button-announcement-tab");
    else if (p == "/downloads") ShowTab("#downloads-tab", "#button-downloads-tab");
    else if (p == "/map") ShowTab("#map-tab", "#button-map-tab");
    else if (p.startsWith("/delivery")) {
        if (getUrlParameter("logid")) {
            logid = getUrlParameter("logid");
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            ShowDeliveryDetail(logid);
            return;
        }
        if (p.split("/").length >= 3) {
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            ShowDeliveryDetail(p.split("/")[2]);
        } else ShowTab("#delivery-tab", "#button-delivery-tab");
    } else if (p == "/challenge") ShowTab("#challenge-tab", "#button-challenge-tab");
    else if (p == "/division") ShowTab("#division-tab", "#button-division-tab");
    else if (p == "/event") ShowTab("#event-tab", "#button-event-tab");
    else if (p == "/staff/event") ShowTab("#staff-event-tab", "#button-staff-event-tab");
    else if (p == "/member/@me") {
        LoadUserProfile(parseInt(localStorage.getItem("userid")));
    }
    else if (p.startsWith("/member")) {
        if (getUrlParameter("userid")) {
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#member-tab", "#button-member-tab");
    }
    else if (p == "/leaderboard") ShowTab("#leaderboard-tab", "#button-leaderboard-tab");
    else if (p == "/ranking") ShowTab("#ranking-tab", "#button-ranking-tab");
    else if (p == "/application/my") ShowTab("#my-application-tab", "#button-my-application-tab");
    else if (p == "/application/all") ShowTab("#all-application-tab", "#button-all-application-tab");
    else if (p == "/application/new" || p == "/apply") ShowTab("#submit-application-tab", "#button-submit-application-tab");
    else if (p == "/manage/user") ShowTab("#manage-user-tab", "#button-manage-user");
    else if (p == "/audit") ShowTab("#audit-tab", "#button-audit-tab");
    else if (p == "/config") ShowTab("#config-tab", "#button-config-tab");
    else if (p == "/settings") ShowTab("#user-settings-tab");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://cdn.chub.page/assets/" + dhabbr + "/" + filename;
    } else if (p.startsWith("/steamcallback")) {
        SteamValidate();
    } else if (p.startsWith("/connectDiscord")) {
        DiscordValidate();
    } else if (p.startsWith("/auth")) {
        AuthValidate();
    } else if (p.startsWith("/oauth")) {
        HandleOAuth();
        ShowTab("#oauth-tab");
    } else {
        ShowTab("#overview-tab", "#button-overview-tab");
        window.history.pushState("", "", '/');
    }
}

window.onpopstate = function (event) {
    PathDetect();
};

$(document).ready(async function () {
    if (localStorage.getItem("no-tsr") != "true") {
        setTimeout(function () { TSRUpdate(); }, 500);
        setInterval(TSRUpdate, 10000);
    } else {
        $("#tsr-card").remove();
    }
    for (i = 0; i < Object.keys(simplemde).length; i++) simplemde[Object.keys(simplemde)[i]] = new SimpleMDE({ element: $(Object.keys(simplemde)[i])[0] });
    $("[title='Toggle Fullscreen (F11)']").remove();
    $("[title='Toggle Side by Side (F9)']").remove(); for (i = 0; i < simplebarINIT.length; i++) new SimpleBar($(simplebarINIT[i])[0]);

    while (1) {
        if (language != undefined) break;
        await sleep(100);
    }
    while (1) {
        if (mltr("drivers_hub") != "") break;
        await sleep(100);
    }
    PreValidateToken();
    InitDefaultValues();
    PathDetect();
    LoadCache();
    InitPhoneView();
    InitDistanceUnit();
    InitRankingDisplay();
    InitLeaderboardTimeRange();
    InitInputHandler();
    InitResizeHandler();
    InitLanguage();
    PreserveApplicationQuestion();
    while (1) {
        rolelist = SafeParse(localStorage.getItem("role-list"));
        rolecolor = SafeParse(localStorage.getItem("role-color"));
        specialRoles = SafeParse(localStorage.getItem("special-roles"));
        perms = SafeParse(localStorage.getItem("perms"));
        positions = SafeParse(localStorage.getItem("positions"));
        applicationTypes = SafeParse(localStorage.getItem("application-types"));
        if (rolelist != undefined && rolecolor != null && perms != null && perms != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined && specialRoles != undefined) break;
        await sleep(100);
    }
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        $("#all-role-datalist").append(`<option value="${rolelist[roleids[i]]} (${roleids[i]})">${rolelist[roleids[i]]} (${roleids[i]})</option>`);;
    }
    positionstxt = "";
    for (var i = 0; i < positions.length; i++) {
        positionstxt += positions[i] + "\n";
        $("#application2Answer3").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
    }
    ValidateToken();
});