SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

default_text_color = "white";

userid = localStorage.getItem("userid");
token = localStorage.getItem("token");
isAdmin = false;
requireCaptcha = false;
highestrole = "Unknown Role";
highestroleid = 99999;
roles = SafeParse(localStorage.getItem("roles"));
rolelist = SafeParse(localStorage.getItem("role-list"));
rolecolor = SafeParse(localStorage.getItem("role-color"));
perms = SafeParse(localStorage.getItem("perms"));
positions = SafeParse(localStorage.getItem("positions"));
divisions = SafeParse(localStorage.getItem("divisions"));
applicationTypes = SafeParse(localStorage.getItem("application-types"));
userPerm = SafeParse(localStorage.getItem("user-perm"));
RANKING = SafeParse(localStorage.getItem("driver-ranks"));
RANKCLR = SafeParse(localStorage.getItem("driver-ranks-color"));
if (userPerm == null) userPerm = [];
isdark = parseInt(localStorage.getItem("darkmode"));
user_distance = null;
Chart.defaults.color = "white";
shiftdown = false;
mfaenabled = false;
mfafunc = null;
profile_userid = -1;
modals = {};
modalName2ID = {};

function Logout() {
    token = localStorage.getItem("token");
    $.ajax({
        url: api_host + "/" + dhabbr + "/token",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    localStorage.removeItem("token");
    $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
    $("#button-user-profile").attr("data-bs-toggle", "");
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

function InitRankingDisplay() {
    if (RANKING != []) {
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

function InitDarkMode() {
    localStorage.setItem("darkmode", "1"); // NOTE
    isdark = parseInt(localStorage.getItem("darkmode"));
    if (localStorage.getItem("darkmode") == undefined) isdark = 1;
    if (localStorage.getItem("darkmode") == "1") {
        $("body").css("background-color", "#2F3136");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr,strong {color: white;}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.1);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888}
            th > .fc-scrollgrid-sync-inner {background-color: #444}
            a:hover {color: white}
            .flexdatalist-results {background-color:#57595D};
            a {color: #ccc}</style>`);
        $("#darkmode-svg").html(`<i class="fa-solid fa-sun"></i>`);
    } else {
        $("head").append(`<style>.rounded-full {background-color: #ddd}</style>`);
    }
}

function ToggleDarkMode() {
    isdark = 0; // NOTE
    if (!isdark) {
        $("body").css("background-color", "#2F3136");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;}
            svg{}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.2);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888;}
            a:hover {color: white}
            .flexdatalist-results {background-color:#57595D};
            a: {color: #444}</style>`);
        Chart.defaults.color = "white";
        $("#darkmode-svg").html(`<i class="fa-solid fa-sun"></i>`);
    } else {
        $("body").css("background-color", "white");
        $("body").css("color", "");
        $("head").append(`<style id='convertbg2'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {}
            svg{}
            .text-gray-500,.text-gray-600 {}
            .bg-white {background-color: white;}
            .swal2-popup {background-color: white;}
            .rounded-full {background-color: #ddd;}
            a:hover {color: black}
            .flexdatalist-results {background-color:white};
            a {color: #ccc}</style>`);
        $("#darkmode-svg").html(`<i class="fa-solid fa-moon"></i>`);
        $("#convertbg2").remove();
        $("#convertbg").remove();
        Chart.defaults.color = "black";
        $("body").html($("body").html().replaceAll("skyblue", "#382CDD").replaceAll("lightgreen", "green"));
    }
    isdark = 1 - isdark;
    localStorage.setItem("darkmode", isdark);
    LoadStats();
}

function InitSearchByName() {
    $.ajax({
        url: api_host + "/" + dhabbr + "/member/list/all",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return;
            l = data.response.list;
            for (var i = 0; i < l.length; i++) {
                $("#all-member-datalist").append(`<option value="${l[i].name} (${l[i].userid})">${l[i].name} (${l[i].userid})</option>`);
            }
            $(".search-name").flexdatalist({
                selectionRequired: true,
                minLength: 1
            });
            $(".search-name-mul").flexdatalist({
                selectionRequired: 1,
                minLength: 1
            });
        }
    });
}

eventsCalendar = undefined;
curtab = "#overview-tab";
loadworking = false;
async function GeneralLoad() {
    if (loadworking) return;
    loadworking = true;
    if (isdark) $("#loading").css("border", "solid lightgreen 1px");
    else $("#loading").css("border", "solid green 1px");
    $("#loading").css("width", "50%");
    $("#loading").css("transition", "width: 0.1s");
    maxajax = 0;
    lastw = 0;
    while ($.active > 0) {
        maxajax = Math.max($.active + 1, maxajax);
        neww = parseInt(100 - $.active / maxajax * 100);
        $("#loading").css("width", `${neww}%`);
        await sleep(50);
    }
    neww = 100;
    $("#loading").css("width", `${neww}%`);
    neww = 1;
    $("#loading").css("width", `${neww}%`);
    $("#loading").css("border", "solid transparent 1px");
    loadworking = false;
}

async function ShowTab(tabname, btnname) {
    loadworking = true;
    // $("html, body").animate({
    //     scrollTop: 0
    // }, "slow");
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
        window.history.pushState("", "", '/member/' + userid);
        $("#UserBanner").show();
        $("#UserBanner").attr("src", "https://" + window.location.hostname + "/banner/" + userid);
        $("#UserBanner").attr("onclick", `CopyBannerURL("${userid}");`)
        $("#UserBanner").attr("oncontextmenu", `CopyBannerURL("${userid}");`)
        LoadUserProfile(userid);
    }
    if (tabname == "#notification-tab") {
        window.history.pushState("", "", '/notification');
        LoadNotificationList(noplaceholder = loaded);
    }
    if (tabname == "#overview-tab") {
        window.history.pushState("", "", '/');
        LoadStats(noplaceholder = loaded);
    }
    if (tabname == "#signin-tab") {
        if (localStorage.getItem("token") != null && localStorage.getItem("token").length == 36) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        window.history.pushState("", "", '/login');
    }
    if (tabname == "#captcha-tab") {
        if (!requireCaptcha) {
            ShowTab("#overview-tab", "#button-overview-tab");
            return;
        }
        $("#button-user-profile").attr("onclick", `ShowTab("#captcha-tab", "#button-captcha-tab");`);
        window.history.pushState("", "", '/captcha');
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
    }
    if (tabname == "#announcement-tab") {
        window.history.pushState("", "", '/announcement');
        LoadAnnouncement(noplaceholder = loaded);
    }
    if (tabname == "#downloads-tab") {
        window.history.pushState("", "", '/downloads');
        LoadDownloads(noplaceholder = loaded);
    }
    if (tabname == "#delivery-tab") {
        window.history.pushState("", "", '/delivery');
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
        window.history.pushState("", "", '/member/' + userid);
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
        LoadChallenge(noplaceholder = loaded);
    }
    if (tabname == "#division-tab") {
        window.history.pushState("", "", '/division');
        LoadDivisionInfo(noplaceholder = loaded);
    }
    if (tabname == "#event-tab") {
        window.history.pushState("", "", '/event');
        LoadEvent(noplaceholder = loaded);
    }
    if (tabname == "#member-tab") {
        window.history.pushState("", "", '/member');
        if (!loaded) {
            LoadXOfTheMonth();
        }
        LoadMemberList(noplaceholder = loaded);
    }
    if (tabname == "#leaderboard-tab") {
        window.history.pushState("", "", '/leaderboard');
        LoadLeaderboard(noplaceholder = loaded);
    }
    if (tabname == "#ranking-tab") {
        window.history.pushState("", "", '/ranking');
        if (!loaded) LoadRanking();
    }
    if (tabname == "#submit-application-tab") {
        window.history.pushState("", "", '/application/submit');
    }
    if (tabname == "#my-application-tab") {
        window.history.pushState("", "", '/application/my');
        LoadUserApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#all-application-tab") {
        window.history.pushState("", "", '/application/all');
        LoadAllApplicationList(noplaceholder = loaded);
    }
    if (tabname == "#manage-user-tab") {
        window.history.pushState("", "", '/manage/user');
        LoadUserList(noplaceholder = loaded);
    }
    if (tabname == "#audit-tab") {
        window.history.pushState("", "", '/audit');
        LoadAuditLog(noplaceholder = loaded);
    }
    if (tabname == "#config-tab") {
        window.history.pushState("", "", '/config');
        LoadConfiguration();
        $("#config-subtab").children().removeClass("active");
        $("#config-subtab").children().removeClass("show");
        $("#config-api-json-tab").click();
    }
    if (tabname == "#user-settings-tab") {
        window.history.pushState("", "", '/settings');
        LoadNotificationSettings();
        LoadUserSessions();
        if(!loaded){
            $("#notifications-drivershub").on("change", function(){
                if($("#notifications-drivershub").prop("checked")){
                    EnableNotification("drivershub", "Drivers Hub");
                } else {
                    DisableNotification("drivershub", "Drivers Hub");
                }
            });
            $("#notifications-discord").on("change", function(){
                if($("#notifications-discord").prop("checked")){
                    EnableNotification("discord", "Discord");
                } else {
                    DisableNotification("discord", "Discord");
                }
            });
            $("#notifications-event").on("change", function(){
                if($("#notifications-event").prop("checked")){
                    EnableNotification("event", "Event");
                } else {
                    DisableNotification("event", "Event");
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
    if(force) localStorage.removeItem("cache-expire");
    rolelist = SafeParse(localStorage.getItem("role-list"));
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

    cacheExpire = parseInt(localStorage.getItem("cache-expire"));
    if (!(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined && divisions != undefined && RANKING != undefined && RANKCLR != undefined))
        cacheExpire = 0;
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/roles",
            type: "GET",
            dataType: "json",
            success: function (data) {
                roles = data.response;
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
            dataType: "json",
            success: function (data) {
                d = data.response;
                applicationTypes = {};
                for (var i = 0; i < d.length; i++)
                    applicationTypes[parseInt(d[i].applicationid)] = d[i].name;
                localStorage.setItem("application-types", JSON.stringify(applicationTypes));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/perms",
            type: "GET",
            dataType: "json",
            success: function (data) {
                perms = data.response;
                localStorage.setItem("perms", JSON.stringify(perms));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/member/ranks",
            type: "GET",
            dataType: "json",
            success: function (data) {
                d = data.response;
                RANKING = {};
                RANKCLR = {};
                for (i = 0; i < d.length; i++) {
                    RANKING[parseInt(d[i]["distance"])] = d[i]["name"];
                    RANKCLR[parseInt(d[i]["distance"])] = d[i]["color"];
                    if(RANKCLR[parseInt(d[i]["distance"])] == undefined) RANKCLR[parseInt(d[i]["distance"])] = default_text_color;
                }
                localStorage.setItem("driver-ranks", JSON.stringify(RANKING));
                localStorage.setItem("driver-ranks-color", JSON.stringify(RANKCLR));
            }
        });
        $.ajax({
            url: api_host + "/" + dhabbr + "/division/list",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response;
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
    if(t.indexOf('user') != -1) t.splice(t.indexOf('user'),1);
    if(t.indexOf('driver') != -1) t.splice(t.indexOf('driver'),1);
    if (t.length > 0) {
        if (userPerm.includes("admin")) {
            $("#sidebar-staff").show();
            $("#button-all-application-tab").show();
            $("#button-manage-user").show();
            $("#button-audit-tab").show();
            $("#button-config-tab").show();
        } else {
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#sidebar-staff").show();
                $("#button-all-application-tab").show();
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
    $("#sidebar-banner").attr("src", "https://drivershub.charlws.com/" + dhabbr + "/member/banner?userid=" + userid);
    if (avatar.startsWith("a_"))
        $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
    else
        $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");
    $("#sidebar-role").html(highestrole);

    ShowStaffTabs();
}

function ValidateToken() {
    token = localStorage.getItem("token");
    userid = localStorage.getItem("userid");
    if (token == null) { // token does not exist
        localStorage.setItem("token", "guest");
        token = "guest";
    }

    if (token == "guest") {
        // Guest, not logged in, update elements
        $("#sidebar-application").hide();
        $("#sidebar-username").html(mltr("guest"));
        $("#sidebar-userid").html(mltr("login_first"));
        $("#button-user-profile").attr("onclick", `ShowTab("#signin-tab", "#button-signin-tab");`);
        $("#button-user-profile").attr("data-bs-toggle", "");
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
        url: api_host + "/" + dhabbr + "/user",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                // Invalid token, log out
                localStorage.removeItem("token");
                ShowTab("#signin-tab", "#button-signin-tab");
                return;
            }

            $("#button-user-profile").attr("data-bs-toggle", "dropdown");

            // X Drivers Trucking Info
            color = "green";
            if (isdark) color = "lightgreen";
            $("#header").prepend(`<p style="color:${color}"><svg style="color:${color};display:inline" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
            <path fill-rule="evenodd"
                d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"
                fill="${color}"></path>
            </svg>&nbsp;&nbsp;<span id="topbar-message" style="color:${color}"></span><span style="color:orange"></p>`);

            // User Information
            user = data.response.user;
            localStorage.setItem("roles", JSON.stringify(user.roles));
            localStorage.setItem("name", user.name.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, ''));
            localStorage.setItem("avatar", user.avatar);
            localStorage.setItem("discordid", user.discordid);
            localStorage.setItem("userid", user.userid);

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
                return a - b
            });
            highestrole = rolelist[roles[0]];
            if(highestrole == undefined) highestrole = "Unknown Role";
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
            $("#sidebar-banner").attr("src", "https://drivershub.charlws.com/" + dhabbr + "/member/banner?userid=" + userid);
            if (avatar.startsWith("a_"))
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
            else
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");

            mfaenabled = user.mfa;
            if (mfaenabled) {
                $("#button-settings-mfa-disable").show();
            } else {
                $("#button-settings-mfa-enable").show();
            }

            $("#settings-user-truckersmpid").val(user.truckersmpid);
            $("#settings-user-steamid").val(user.steamid);

            UpdateRolesOnDisplay();
            LoadNotification();
            setInterval(function () {
                LoadNotification();
            }, 30000);

            if (!userPerm.includes("driver") && !userPerm.includes("admin")) {
                $("#sidebar-userid").html("##");
                NonMemberMode();
            }

            $.ajax({
                url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + String(userid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (!data.error && data.response.list.length == 1) {
                        user_distance = data.response.list[0].points.distance;
                    } else {
                        user_distance = 0;
                    }
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

async function PathDetect() {
    await sleep(100);
    p = window.location.pathname;
    if (p == "/overview") window.history.pushState("", "", '/');
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
    else if (p.startsWith("/member")) {
        if (getUrlParameter("userid")) {
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#member-tab", "#button-member-tab");
    } else if (p == "/leaderboard") ShowTab("#leaderboard-tab", "#button-leaderboard-tab");
    else if (p == "/ranking") ShowTab("#ranking-tab", "#button-ranking-tab");
    else if (p == "/application/my") ShowTab("#my-application-tab", "#button-my-application-tab");
    else if (p == "/application/all") ShowTab("#all-application-tab", "#button-all-application-tab");
    else if (p == "/application/submit" || p == "/apply") ShowTab("#submit-application-tab", "#button-submit-application-tab");
    else if (p == "/manage/user") ShowTab("#manage-user-tab", "#button-manage-user");
    else if (p == "/audit") ShowTab("#audit-tab", "#button-audit-tab");
    else if (p == "/config") ShowTab("#config-tab", "#button-config-tab");
    else if (p == "/settings") ShowTab("#user-settings-tab");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://drivershub-cdn.charlws.com/assets/" + dhabbr + "/" + filename;
    } else if (p.startsWith("/steamcallback")) {
        SteamValidate();
    } else if (p.startsWith("/auth")) {
        AuthValidate();
    } else {
        ShowTab("#overview-tab", "#button-overview-tab");
        window.history.pushState("", "", '/');
    }
}

window.onpopstate = function (event) {
    PathDetect();
};

simplebarINIT = ["#sidebar", "#table_mini_leaderboard", "#table_new_driver", "#table_online_driver", "#table_delivery_log", "#table_division_delivery", "#table_leaderboard", "#table_my_application", "#notification-dropdown-wrapper"];
simplemde = {"#settings-bio": undefined, "#announcement-new-content": undefined, "#downloads-new-description": undefined, "#downloads-edit-description": undefined, "#challenge-new-description": undefined, "#challenge-edit-description": undefined, "#event-new-description": undefined, "#event-edit-description": undefined}
$(document).ready(async function () {
    while (1) {
        if(language != undefined) break;
        await sleep(100);
    }
    PreValidateToken();
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
    $("#input-audit-log-staff-flexdatalist").css("border-radius", "0.375rem 0 0 0.375rem");
    $("#application-type-default").prop("selected", true);
    setTimeout(function () {
        for (i = 0; i < simplebarINIT.length; i++) new SimpleBar($(simplebarINIT[i])[0]);
    }, 500);
    for (i = 0; i < Object.keys(simplemde).length; i++) simplemde[Object.keys(simplemde)[i]] = new SimpleMDE({element:$(Object.keys(simplemde)[i])[0]});
    $("[title='Toggle Fullscreen (F11)']").remove();
    $("[title='Toggle Side by Side (F9)']").remove();
    PathDetect();
    LoadCache();
    InitPhoneView();
    InitDistanceUnit();
    InitSearchByName();
    InitRankingDisplay();
    InitLeaderboardTimeRange();
    InitInputHandler();
    InitResizeHandler();
    PreserveApplicationQuestion();
    while (1) {
        rolelist = SafeParse(localStorage.getItem("role-list"));
        rolecolor = SafeParse(localStorage.getItem("role-color"));
        perms = SafeParse(localStorage.getItem("perms"));
        positions = SafeParse(localStorage.getItem("positions"));
        applicationTypes = SafeParse(localStorage.getItem("application-types"));
        if (rolelist != undefined && rolecolor != null && perms != null && perms.admin != undefined && positions != undefined && applicationTypes != undefined) break;
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