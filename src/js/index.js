SVG_VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
SVG_LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

userid = localStorage.getItem("userid");
token = localStorage.getItem("token");
isAdmin = false;
highestrole = 99999;
roles = JSON.parse(localStorage.getItem("roles"));
rolelist = JSON.parse(localStorage.getItem("rolelist"));
perms = JSON.parse(localStorage.getItem("perms"));
positions = JSON.parse(localStorage.getItem("positions"));
applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
isdark = parseInt(localStorage.getItem("darkmode"));

function Logout(){
    token = localStorage.getItem("token")
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }
    });
}

function InitRankingDisplay(){
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

function InitResizeHandler(){
    setInterval(function () {
        if ($("#overview-tab").width() / 3 <= 300) {
            if ($("#overview-tab").width() / 2 <= 300) $(".statscard").css("width", "100%");
            else $(".statscard").css("width", "50%");
        } else $(".statscard").css("width", "33%");
    }, 10);
}

function InitPhoneView(){
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

function InitInputHandler(){
    $('#searchname').keydown(function (e) {
        if (e.which == 13) LoadMemberList();
    });
    $('#dend,#dspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadDeliveryList();
    });
    $('#udend,#udspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadUserDeliveryList();
    });
    $('#lbend,#lbspeedlimit').keydown(function (e) {
        if (e.which == 13) LoadLeaderboard();
    });
    $('#memberroleid').keydown(function (e) {
        if (e.which == 13) GetMemberRoles();
    });
    $('#appselect').on('change', function () {
        var value = $(this).val();
        $(".apptabs").hide();
        $("#Application" + value).show();
        $("#submitAppBttn").show();
    });
    $('#application4Answer1').on('change', function () {
        var value = $(this).val();
        $(".divisiontabs").hide();
        $("#division-tab" + value).show();
    });
}

function InitDistanceUnit() {
    distance_unit = localStorage.getItem("distance_unit");
    if (distance_unit == "imperial") {
        $(".distance_unit").html("Mi");
        distance_unit_txt = "Mi";
        fuel_unit_txt = "Gal";
        weight_unit_txt = "Lb";
        distance_ratio = 0.621371;
        fuel_ratio = 0.2641720524;
        weight_ratio = 2.2046226218488;
        $("#imperialbtn").css("background-color", "none");
        $("#metricbtn").css("background-color", "#293039");
    } else {
        $(".distance_unit").html("Km");
        distance_unit = "metric";
        distance_unit_txt = "Km";
        fuel_unit_txt = "L";
        weight_unit_txt = "Lb";
        distance_ratio = 1;
        fuel_ratio = 1;
        weight_ratio = 1;
        $("#metricbtn").css("background-color", "none");
        $("#imperialbtn").css("background-color", "#293039");
    }
}

function InitLeaderboardTimeRange(){
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
    firstDay = new Date(+firstDay - offset);
    date = new Date(+date - offset);
    $("#lbstart").val(firstDay.toISOString().substring(0, 10));
    $("#lbend").val(date.toISOString().substring(0, 10));
}

function InitDarkMode(){
    localStorage.setItem("darkmode", "1"); // NOTE
    isdark = parseInt(localStorage.getItem("darkmode"));
    if (localStorage.getItem("darkmode") == undefined) isdark = 1;
    if (localStorage.getItem("darkmode") == "1") {
        $("body").css("background-color", "#2F3136");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.1);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888}
            th > .fc-scrollgrid-sync-inner {background-color: #444}
            a:hover {color: white}
            .flexdatalist-results {background-color:#57595D};
            a {color: #ccc}</style>`);
        $("#darkmode-svg").html(`<i class="fa-solid fa-sun"></i>`);
        Chart.defaults.color = "white";
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
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
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
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

function InitSearchByName(){
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list/all",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return;
            l = data.response.list;
            for (var i = 0; i < l.length; i++) {
                $("#all_member_datalist").append(`<option value="${l[i].name} (${l[i].userid})">${l[i].name} (${l[i].userid})</option>`);
            }
            $(".search-name").flexdatalist({
                selectionRequired: true,
                minLength: 1,
                limitOfValues: 1
           });
        }
    });

    lastnamesearch = 0;
    lnsto = 0;

    function SearchName(eid) {
        if ($("#" + eid + "_datalist").length == 0) {
            $("#" + eid).attr("list", eid + "_datalist");
            $("#" + eid).after("<datalist id='" + eid + "_datalist'></datalist>");
        }
        datalist = "#" + eid + "_datalist";
        content = $("#" + eid).val();
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=highest_role&order=desc&name=" + content,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                $(datalist).children().remove();
                if (d.length == 0) {
                    $(datalist).append("<option value='No Data'>");
                    return;
                }
                for (var i = 0; i < d.length; i++) {
                    $(datalist).append("<option value='" + d[i].name + "' id='" + eid + "_datalist_" + d[i].userid + "'>");
                }
            }
        });
    }
    $(".search-name-old").on('input', function () {
        if (+new Date() - lastnamesearch < 1000) return;
        lastnamesearch = +new Date();
        eid = $(this).attr("id");
        SearchName(eid);
        clearTimeout(lnsto);
        lnsto = setTimeout(function () {
            SearchName(eid)
        }, 1000);
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
        setTimeout(async function () {
            while ($("#loading").width() != 0) await sleep(50);
            LoadETS2Map();
            LoadETS2PMap();
            LoadATSMap();
        }, 50);
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
    if (tabname == "#overview-tab") {
        window.history.pushState("", "", '/beta');
        if(!loaded) LoadStats();
    }
    if (tabname == "#announcement-tab") {
        window.history.pushState("", "", '/announcement');
        if(!loaded) LoadAnnouncement();
    }
    if (tabname == "#staff-announcement-tab") {
        window.history.pushState("", "", '/staff/announcement');
    }
    if (tabname == "#downloads-tab") {
        window.history.pushState("", "", '/downloads');
        if(!loaded) LoadDownloads();
    }
    if (tabname == "#submit-application-tab") {
        window.history.pushState("", "", '/application/submit');
        $("#driverappsel").attr("selected", "selected");
    }
    if (tabname == "#my-application-tab") {
        window.history.pushState("", "", '/application/my');
        LoadUserApplicationList();
    }
    if (tabname == "#button-staff-application") {
        window.history.pushState("", "", '/application/all');
        LoadAllApplicationList();
    }
    if (tabname == "#staff-user-tab") {
        window.history.pushState("", "", '/staff/user');
        LoadUserList();
    }
    if (tabname == "#member-tab") {
        window.history.pushState("", "", '/member');
        LoadXOfTheMonth();
        LoadMemberList();
    }
    if (tabname == "#staff-member-tab") {
        window.history.pushState("", "", '/staff/member');
        LoadMemberList();
    }
    if (tabname == "#delivery-tab") {
        window.history.pushState("", "", '/delivery');
        LoadDeliveryList();
        LoadDriverLeaderStatistics();
        LoadStats(true);
    }
    if (tabname == "#leaderboard-tab") {
        window.history.pushState("", "", '/leaderboard');
        LoadLeaderboard();
    }
    if (tabname == "#ranking-tab") {
        window.history.pushState("", "", '/ranking');
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?point_types=distance,event,division,myth&userids=" + userid,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                if (data.error == false) {
                    d = data.response.list[0];
                    rank = point2rank(d.total_no_limit);
                    $("#ranktotpoints").html(TSeparator(d.total_no_limit) + " - " + rank);
                    if ($("#sidebar-role").html() == "Driver")
                        $("#sidebar-role").html(rank);
                }
            }
        });
    }
    if (tabname == "#division-tab") {
        window.history.pushState("", "", '/division');
        LoadDivisionInfo();
    }
    if (tabname == "#staff-division-tab") {
        window.history.pushState("", "", '/staff/division');
        LoadPendingDivisionValidation();
    }
    if (tabname == "#event-tab") {
        window.history.pushState("", "", '/event');
        LoadEventInfo();
    }
    if (tabname == "#staff-event-tab") {
        window.history.pushState("", "", '/staff/event');
        setTimeout(function(){HandleAttendeeInput();},2000);
        LoadEventInfo();
    }
    if (tabname == "#audit-tab") {
        window.history.pushState("", "", '/audit');
        LoadAuditLog();
    }
    if (tabname == "#config-tab") {
        window.history.pushState("", "", '/admin');
        loadAdmin();
    }
}

function UpdateRolesOnDisplay(){
    rolestxt = [];
    for (i = 0; i < roles.length; i++) {
        rolestxt.push(rolelist[roles[i]]);
    }
    hrole = rolestxt[0];
    localStorage.setItem("highestrole", hrole);

    if (hrole == undefined || hrole == "undefined") hrole = "Loner";
    $("#sidebar-role").html(hrole);
    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        roleids[i] = parseInt(roleids[i]);
    }
    ShowStaffTabs();
    for (var i = 0; i < roleids.length; i++) {
        if (roleids[i] <= highestrole)
            $("#rolelist").append(`<li><input disabled type="checkbox" id="role${roleids[i]}" name="assignrole" value="role${roleids[i]}"> <label for="role${roleids[i]}">${rolelist[roleids[i]]}</label></li>`);
        else
            $("#rolelist").append(`<li><input type="checkbox" id="role${roleids[i]}" name="assignrole" value="role${roleids[i]}"><label for="role${roleids[i]}">${rolelist[roleids[i]]}</label></li>`);
    }                
}

function LoadCache(){
    rolelist = JSON.parse(localStorage.getItem("rolelist"));
    perms = JSON.parse(localStorage.getItem("perms"));
    positions = JSON.parse(localStorage.getItem("positions"));
    applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
    
    if (positions != undefined && positions != null) {
        positionstxt = "";
        for (var i = 0; i < positions.length; i++) {
            positionstxt += positions[i] + "\n";
            $("#sa-select").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
        }
        positionstxt = positionstxt.slice(0, -1);
        $("#staffposedit").val(positionstxt);
    } else {
        positions = [];
    }

    cacheExpire = parseInt(localStorage.getItem("cacheExpire"));
    if(!(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined))
        cacheExpire = 0;
    if (!isNumber(cacheExpire)) cacheExpire = 0;
    if (cacheExpire <= +new Date()) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/roles",
            type: "GET",
            dataType: "json",
            success: function (data) {
                roles = data.response;
                rolelist = {};
                for(var i = 0 ; i < roles.length ; i++){
                    rolelist[roles[i].id] = roles[i].name;
                }
                localStorage.setItem("rolelist", JSON.stringify(rolelist));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/types",
            type: "GET",
            dataType: "json",
            success: function (data) {
                d = data.response;
                applicationTypes = {};
                for(var i = 0 ; i < d.length ; i++)
                    applicationTypes[parseInt(d[i].applicationid)] = d[i].name;
                localStorage.setItem("applicationTypes", JSON.stringify(applicationTypes));
            }
        });
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/perms",
            type: "GET",
            dataType: "json",
            success: function (data) {
                perms = data.response;
                localStorage.setItem("perms", JSON.stringify(perms));
            }
        });
        localStorage.setItem("cacheExpire", +new Date() + 86400000);
    }
}

function AnnouncementEventButtonValueUpdate() {
    setInterval(function () {
        title = $("#anntitle").val();
        content = $("#anncontent").val();
        annid = $("#annid").val();
        if (!$("#newAnnBtn").prop("disabled")) {
            if (isNumber(annid)) {
                if (title != "" || content != "") {
                    $("#newAnnBtn").html("Update Announcement");
                    $("#newAnnBtn").css("background-color", "lightgreen");
                } else {
                    $("#newAnnBtn").html("Delete Announcement");
                    $("#newAnnBtn").css("background-color", "red");
                }
            } else {
                $("#newAnnBtn").html("Create Announcement");
                $("#newAnnBtn").css("background-color", "blue");
            }
        } else {
            $("#newAnnBtn").html("Working...");
        }
    }, 100);
    setInterval(function () {
        title = $("#eventtitle").val();
        from = $("#eventfrom").val();
        to = $("#eventto").val();
        distance = $("#eventdistance").val();
        meetup_timestamp = $("#eventmeetup_timestamp").val();
        departure_timestamp = $("#eventdeparture_timestamp").val();
        eventid = $("#eventid").val();
        if (!$("#newEventBtn").prop("disabled")) {
            if (isNumber(eventid)) {
                if (title != "" || from != "" || to != "" || distance != "" || meetup_timestamp != "" || departure_timestamp != "") {
                    $("#newEventBtn").html("Update Event");
                    $("#newEventBtn").css("background-color", "lightgreen");
                } else {
                    $("#newEventBtn").html("Delete Event");
                    $("#newEventBtn").css("background-color", "red");
                }
            } else {
                $("#newEventBtn").html("Create Event");
                $("#newEventBtn").css("background-color", "blue");
            }
        } else {
            $("#newEventBtn").html("Working...");
        }
    }, 100);
}

userPerm = [];
function GetUserPermission(){
    if(roles == undefined || perms.admin == undefined) return;
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
    return userPerm;
}

function ShowStaffTabs() {
    userPerm = GetUserPermission();
    if (userPerm.length > 0) {
        $("#sidebar-staff").show();
        $("#sidebar-staff a").hide();
        if (userPerm.includes("admin")) {
            $("#sidebar-staff a").show();
            $(".admin-only").show();
            $("#button-config-tab").show();
            AnnouncementEventButtonValueUpdate();
        } else {
            $(".admin-only").hide();
            if (userPerm.includes("event")) {
                $("#button-staff-event-tab").show();
                $("#button-staff-announcement-tab").show();
                AnnouncementEventButtonValueUpdate();
            }
            if (userPerm.includes("hr") || userPerm.includes("division")) {
                $("#button-staff-member-tab").show();
                $("#button-staff-application-tab").show();
            }
            if (userPerm.includes("hr")) {
                $("#button-staff-user").show();
            }
            if (userPerm.includes("division")) {
                $("#button-staff-division-tab").show();
            }
            if (userPerm.includes("audit")) {
                $("#button-audit-tab").show();
            }
        }
    }
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
        $("#sidebar-application a").attr("href", "/login");
        $("#ProfileTabBtn").attr("onclick", "window.location.href='/login'");
        $("#logout").hide();
        $("#header").prepend(`<a href='/login'>Login</a> <span style="color:orange">`);
        $("#button-division-tab").hide();
        $("#button-downloads-tab").hide();
        return;
    }

    if (userid != -1 && userid != null) {
        // Logged in, and is member, show membersOnlyTabs
        $(".member-only-tab").show();
    } else {
        // Logged in, not member, hide division and downloads
        $("#button-division-tab").hide();
        $("#button-downloads-tab").hide();
    }
    
    // Validate token and get user information
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                // Invalid token, log out
                localStorage.removeItem("token");
                window.location.href = "/login";
                return;
            }

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
            localStorage.setItem("roles", JSON.stringify(data.response.roles));
            localStorage.setItem("name", data.response.name);
            localStorage.setItem("avatar", data.response.avatar);
            localStorage.setItem("discordid", data.response.discordid);
            localStorage.setItem("userid", data.response.userid);

            // Check if is member
            userid = data.response.userid;
            if (data.response.userid != -1) {
                $("#button-member-tab").show();
            }
            roles = data.response.roles.sort(function (a, b) {
                return a - b
            });
            highestrole = roles[0];
            name = data.response.name;
            avatar = data.response.avatar;
            discordid = data.response.discordid;
            $("#sidebar-username").html(name);
            $("#sidebar-userid").html("#" + userid);
            $("#sidebar-bio").html(data.response.bio);
            $("#sidebar-banner").attr("src", "https://drivershub.charlws.com/" + vtcprefix + "/member/banner?userid=" + userid);
            if (avatar.startsWith("a_"))
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
            else
                $("#sidebar-avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");
            
            UpdateRolesOnDisplay();
        }, error: function(data){
            // Invalid token, log out
            if(parseInt(data.status) == 401){ // Prevent connection issue (e.g. refresh)
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        }
    });
}

function PathDetect() {
    p = window.location.pathname;
    if (p == "/overview") window.history.pushState("", "", '/beta');
    else if (p == "/") ShowTab("#overview-tab", "#button-overview-tab");
    else if (p == "/announcement") ShowTab("#announcement-tab", "#button-announcement-tab");
    else if (p == "/staff/announcement") ShowTab("#staff-announcement-tab", "#button-staff-announcement-tab");
    else if (p == "/downloads") ShowTab("#downloads-tab", "#button-downloads-tab");
    else if (p == "/map") ShowTab("#map-tab", "#button-map-tab");
    else if (p.startsWith("/delivery")) {
        if(getUrlParameter("logid")){
            logid = getUrlParameter("logid");
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            deliveryDetail(logid);
            return;
        }
        if (p.split("/").length >= 3) {
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#button-delivery-tab").addClass("bg-indigo-500");
            deliveryDetail(p.split("/")[2]);
        } else ShowTab("#delivery-tab", "#button-delivery-tab");
    } else if (p == "/division") ShowTab("#division-tab", "#button-division-tab");
    else if (p == "/staff/division") ShowTab("#staff-division-tab", "#button-staff-division-tab");
    else if (p == "/event") ShowTab("#event-tab", "#button-event-tab");
    else if (p == "/staff/event") ShowTab("#staff-event-tab", "#button-staff-event-tab");
    else if (p.startsWith("/member")) {
        if(getUrlParameter("userid")){
            userid = getUrlParameter("userid");
            LoadUserProfile(userid);
            return;
        }
        if (p.split("/").length >= 3) LoadUserProfile(parseInt(p.split("/")[2]));
        else ShowTab("#member-tab", "#button-member-tab");
    } else if (p == "/staff/member") {
        ShowTab("#staff-member-tab", "#button-staff-member-tab");
    } else if (p == "/leaderboard") ShowTab("#leaderboard-tab", "#button-leaderboard-tab");
    else if (p == "/ranking") ShowTab("#ranking-tab", "#button-ranking-tab");
    else if (p == "/application/my") ShowTab("#my-application-tab", "#button-my-application-tab");
    else if (p == "/application/all") ShowTab("#button-staff-application", "#button-staff-application-tab");
    else if (p == "/application/submit" || p == "/apply") ShowTab("#submit-application-tab", "#button-submit-application-tab");
    else if (p == "/staff/user") ShowTab("#staff-user-tab", "#button-staff-user");
    else if (p == "/audit") ShowTab("#audit-tab", "#button-audit-tab");
    else if (p == "/admin") ShowTab("#config-tab", "#button-config-tab");
    else if (p.startsWith("/images")) {
        filename = p.split("/")[2];
        window.location.href = "https://drivershub-cdn.charlws.com/assets/" + vtcprefix + "/" + filename;
    } else{
        ShowTab("#overview-tab", "#button-overview-tab");
        window.history.pushState("", "", '/beta');
    }
}

window.onpopstate = function (event){PathDetect();};

$(document).ready(async function () {
    $(".pageinput").val("1");
    setInterval(function () {
        $(".ol-unselectable").css("border-radius", "15px"); // map border
    }, 1000);
    setTimeout(function(){new SimpleBar($('#sidebar')[0]);},500);
    PathDetect();
    LoadCache();
    LoadDivisionList();
    InitDarkMode();
    InitPhoneView();
    InitDistanceUnit();
    InitSearchByName();
    InitRankingDisplay();
    InitLeaderboardTimeRange();
    InitInputHandler();
    InitResizeHandler();
    PreserveApplicationQuestion();
    while(1){
        rolelist = JSON.parse(localStorage.getItem("rolelist"));
        perms = JSON.parse(localStorage.getItem("perms"));
        positions = JSON.parse(localStorage.getItem("positions"));
        applicationTypes = JSON.parse(localStorage.getItem("applicationTypes"));
        if(rolelist != undefined && perms.admin != undefined && positions != undefined && applicationTypes != undefined) break;
        await sleep(100);
    }
    positionstxt = "";
    for (var i = 0; i < positions.length; i++) {
        positionstxt += positions[i] + "\n";
        $("#application2Answer3").append("<option value='" + positions[i].replaceAll("'", "\\'") + "'>" + positions[i] + "</option>");
    }
    positionstxt = positionstxt.slice(0, -1);
    $("#staffposedit").val(positionstxt);
    ValidateToken();
});