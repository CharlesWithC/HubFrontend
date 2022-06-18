VERIFIED = `<svg style="display:inline;position:relative;top:-1.5px;color:skyblue" width="18" height="18" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10.5213 2.62368C11.3147 1.75255 12.6853 1.75255 13.4787 2.62368L14.4989 3.74391C14.8998 4.18418 15.4761 4.42288 16.071 4.39508L17.5845 4.32435C18.7614 4.26934 19.7307 5.23857 19.6757 6.41554L19.6049 7.92905C19.5771 8.52388 19.8158 9.10016 20.2561 9.50111L21.3763 10.5213C22.2475 11.3147 22.2475 12.6853 21.3763 13.4787L20.2561 14.4989C19.8158 14.8998 19.5771 15.4761 19.6049 16.071L19.6757 17.5845C19.7307 18.7614 18.7614 19.7307 17.5845 19.6757L16.071 19.6049C15.4761 19.5771 14.8998 19.8158 14.4989 20.2561L13.4787 21.3763C12.6853 22.2475 11.3147 22.2475 10.5213 21.3763L9.50111 20.2561C9.10016 19.8158 8.52388 19.5771 7.92905 19.6049L6.41553 19.6757C5.23857 19.7307 4.26934 18.7614 4.32435 17.5845L4.39508 16.071C4.42288 15.4761 4.18418 14.8998 3.74391 14.4989L2.62368 13.4787C1.75255 12.6853 1.75255 11.3147 2.62368 10.5213L3.74391 9.50111C4.18418 9.10016 4.42288 8.52388 4.39508 7.92905L4.32435 6.41553C4.26934 5.23857 5.23857 4.26934 6.41554 4.32435L7.92905 4.39508C8.52388 4.42288 9.10016 4.18418 9.50111 3.74391L10.5213 2.62368Z" stroke="currentColor" stroke-width="1.5"/> <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/> </svg> `;
LOCKED = `<svg style="display:inline;position:relative;top:-1.5px;color:red" xmlns="http://www.w3.org/2000/svg" width="18" height="18" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><path d="M17,9V7c0-2.8-2.2-5-5-5S7,4.2,7,7v2c-1.7,0-3,1.3-3,3v7c0,1.7,1.3,3,3,3h10c1.7,0,3-1.3,3-3v-7C20,10.3,18.7,9,17,9z M9,7c0-1.7,1.3-3,3-3s3,1.3,3,3v2H9V7z M13,17c0,0.6-0.4,1-1,1s-1-0.4-1-1v-3c0-0.6,0.4-1,1-1s1,0.4,1,1V17z" fill="red"/></svg>`;

isAdmin = false;
perms = {};
rolelist = {};
dmapint = -1;
window.mapcenter = {}
window.autofocus = {}
highestrole = 99999;

distance_unit = localStorage.getItem("distance_unit");

isdark = parseInt(localStorage.getItem("darkmode"));
if (localStorage.getItem("darkmode") == undefined) isdark = 1;
rolelist = localStorage.getItem("rolelist");
if (rolelist != undefined && rolelist != null) {
    rolelist = JSON.parse(rolelist);
} else {
    rolelist = [];
}

positions = localStorage.getItem("positions");
if (positions != undefined && positions != null) {
    positions = JSON.parse(positions);
    positionstxt = "";
    for (var i = 0; i < positions.length; i++) {
        positionstxt += positions[i] + "\n";
        $("#sa-select").append("<option>" + positions[i] + "</option>");
    }
    positionstxt = positionstxt.slice(0, -1);
    $("#staffposedit").val(positionstxt);
} else {
    positions = [];
}

function DarkMode() {
    if (!isdark) {
        $("body").css("transition", "color 1000ms linear");
        $("body").css("transition", "background-color 1000ms linear");
        $("body").addClass("bg-gray-800");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;transition: color 1000ms linear;}
            svg{transition: color 1000ms linear;}
            .text-gray-500,.text-gray-600 {color: #ddd;transition: color 1000ms linear;}
            .bg-white {background-color: rgba(255, 255, 255, 0.2);transition: background-color 1000ms linear;}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888;}
            a:hover {color: white}</style>`);
        $("#todarksvg").hide();
        $("#tolightsvg").show();
        Chart.defaults.color = "white";
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
    } else {
        $("body").css("transition", "color 1000ms linear");
        $("body").css("transition", "background-color 1000ms linear");
        $("body").removeClass("bg-gray-800");
        $("body").css("color", "");
        $("head").append(`<style id='convertbg2'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {transition: color 1000ms linear;}
            svg{transition: color 1000ms linear;}
            .text-gray-500,.text-gray-600 {transition: color 1000ms linear;}
            .bg-white {background-color: white;transition: background-color 1000ms linear;}
            .swal2-popup {background-color: white;}
            .rounded-full {background-color: #ddd;}
            a:hover {color: black}</style>`);
        setTimeout(function () {
            $("#convertbg2").remove();
        }, 1000);
        $("#convertbg").remove();
        $("#todarksvg").show();
        $("#tolightsvg").hide();
        Chart.defaults.color = "black";
        $("body").html($("body").html().replaceAll("skyblue", "#382CDD").replaceAll("lightgreen", "green"));
    }
    isdark = 1 - isdark;
    localStorage.setItem("darkmode", isdark);
    loadStats();
}

token = localStorage.getItem("token");
$(".pageinput").val("1");

eventsCalendar = undefined;
curtab = "#HomeTab";

loadworking = false;
async function GeneralLoad() {
    if (loadworking) return;
    loadworking = true;
    if (isdark) $("#loading").css("border", "solid lightgreen 1px");
    else $("#loading").css("border", "solid green 1px");
    $("#loading").css("width", "50%");
    maxajax = 0;
    lastw = 0;
    while ($.active > 0) {
        maxajax = Math.max($.active + 1, maxajax);
        neww = parseInt(100 - $.active / maxajax * 100);
        while (neww > lastw) {
            lastw += 1;
            $("#loading").css("width", `${lastw}%`);
            await sleep(5);
        }
        await sleep(10);
    }
    neww = 100;
    while (neww > lastw) {
        lastw += 1;
        $("#loading").css("width", `${lastw}%`);
        await sleep(5);
    }
    neww = 1;
    while (neww < lastw) {
        lastw -= 5;
        $("#loading").css("width", `${lastw}%`);
        await sleep(1);
    }
    $("#loading").css("border", "solid transparent 1px");
    loadworking = false;
}

async function ShowTab(tabname, btnname) {
    loadworking = true;
    $("html, body").animate({
        scrollTop: 0
    }, "slow");
    curtab = tabname;
    clearInterval(dmapint);
    dmapint = -1;
    $("#map,#dmap,#pmap,#amap").children().remove();
    setTimeout(async function () {
        if (isdark) $("#loading").css("border", "solid lightgreen 1px");
        else $("#loading").css("border", "solid green 1px");
        $("#loading").css("width", "50%");
        maxajax = 0;
        lastw = 0;
        while ($.active > 0) {
            maxajax = Math.max($.active + 1, maxajax);
            neww = parseInt(100 - $.active / maxajax * 100);
            while (neww > lastw) {
                lastw += 1;
                $("#loading").css("width", `${lastw}%`);
                await sleep(5);
            }
            await sleep(10);
        }
        neww = 100;
        while (neww > lastw) {
            lastw += 1;
            $("#loading").css("width", `${lastw}%`);
            await sleep(5);
        }
        if (tabname == curtab) { // in case user switch tab too fast
            $(".tabs").hide();
            $(tabname).show();
        }
        neww = 1;
        while (neww < lastw) {
            lastw -= 5;
            $("#loading").css("width", `${lastw}%`);
            await sleep(1);
        }
        if (curtab != "#Event") {
            eventsCalendar = undefined;
            $("#eventsCalendar").children().remove();
            $("#eventsCalendar").attr("class", "");
        }
        $("#loading").css("border", "solid transparent 1px");
        loadworking = false;
    }, 10);
    $(".tabbtns").removeClass("bg-indigo-500");
    $(btnname).addClass("bg-indigo-500");
    if (tabname == "#Map") {
        if ($("#mapjs").length == 0) {
            $("head").append(`<script id='mapjs' src='/js/map/ets2map.js'></script>
            <script src='/js/map/ets2map_promods.js'></script>
            <script src='/js/map/atsmap.js'></script>
            <script src='/js/map/naviolive.js'></script>`);
        }
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
        if ($("#memberjs").length == 0) {
            $("head").append(`<script id='memberjs' src='/js/apis/member.js'></script>`);
        }
        if (isNumber(btnname)) userid = btnname;
        else userid = localStorage.getItem("userid");
        window.history.pushState("", "", '/member?userid=' + userid);
        loadProfile(userid);
    }
    if (tabname == "#HomeTab") {
        if ($("#overviewjs").length == 0) {
            $("head").append(`<script id='overviewjs' src='/js/apis/overview.js'></script>`);
        }
        window.history.pushState("", "", '/');
        loadStats();
    }
    if (tabname == "#AnnTab") {
        if ($("#announcementjs").length == 0) {
            $("head").append(`<script id='announcementjs' src='/js/plugins/announcement.js'></script>`);
        }
        window.history.pushState("", "", '/announcement');
        ch = $("#anns").children();
        ch.hide();
        for (var i = 0; i < ch.length; i++) {
            $(ch[i]).fadeIn();
            await sleep(200);
        }
    }
    if (tabname == "#StaffAnnTab") {
        if ($("#announcementjs").length == 0) {
            $("head").append(`<script id='announcementjs' src='/js/plugins/announcement.js'></script>`);
        }
        window.history.pushState("", "", '/staffannouncement');
    }
    if (tabname == "#DownloadsTab") {
        if ($("#downloads").length == 0) {
            $("head").append(`<script id='downloadsjs' src='/js/plugins/downloads.js'></script>`);
        }
        window.history.pushState("", "", '/downloads');
        loadDownloads();
    }
    if (tabname == "#SubmitApp") {
        if ($("#applicationjs").length == 0) {
            $("head").append(`<script id='applicationjs' src='/js/plugins/application.js'></script>`);
        }
        window.history.pushState("", "", '/submitapp');
        $("#driverappsel").attr("selected", "selected");
    }
    if (tabname == "#MyApp") {
        if ($("#applicationjs").length == 0) {
            $("head").append(`<script id='applicationjs' src='/js/plugins/application.js'></script>`);
        }
        window.history.pushState("", "", '/myapp');
        loadMyApp();
    }
    if (tabname == "#AllApp") {
        if ($("#applicationjs").length == 0) {
            $("head").append(`<script id='applicationjs' src='/js/plugins/application.js'></script>`);
        }
        window.history.pushState("", "", '/allapp');
        loadAllApp();
    }
    if (tabname == "#AllUsers") {
        if ($("#userjs").length == 0) {
            $("head").append(`<script id='userjs' src='/js/apis/user.js'></script>`);
        }
        window.history.pushState("", "", '/pendinguser');
        loadUsers();
    }
    if (tabname == "#AllMembers") {
        if ($("#memberjs").length == 0) {
            $("head").append(`<script id='memberjs' src='/js/apis/member.js'></script>`);
        }
        window.history.pushState("", "", '/member');
        loadMembers();
    }
    if (tabname == "#StaffMembers") {
        if ($("#memberjs").length == 0) {
            $("head").append(`<script id='memberjs' src='/js/apis/member.js'></script>`);
        }
        window.history.pushState("", "", '/staffmember');
        loadMembers();
    }
    if (tabname == "#Delivery") {
        if ($("#overviewjs").length == 0) {
            $("head").append(`<script id='overviewjs' src='/js/apis/overview.js'></script>`);
        }
        if ($("#dlogjs").length == 0) {
            $("head").append(`<script id='dlogjs"' src='/js/apis/dlog.js'></script>`);
        }
        window.history.pushState("", "", '/delivery');
        loadStats(true);
        loadDelivery();
    }
    if (tabname == "#Leaderboard") {
        if ($("#dlogjs").length == 0) {
            $("head").append(`<script id='dlogjs"' src='/js/apis/dlog.js'></script>`);
        }
        window.history.pushState("", "", '/leaderboard');
        loadLeaderboard();
    }
    if (tabname == "#Ranking") {
        if ($("#memberjs").length == 0) {
            $("head").append(`<script id='memberjs' src='/js/apis/member.js'></script>`);
        }
        window.history.pushState("", "", '/ranking');
    }
    if (tabname == "#Division") {
        if ($("#divisionjs").length == 0) {
            $("head").append(`<script id='divisionjs' src='/js/plugins/division.js'></script>`);
        }
        window.history.pushState("", "", '/division');
        loadDivision();
    }
    if (tabname == "#StaffDivision") {
        if ($("#divisionjs").length == 0) {
            $("head").append(`<script id='divisionjs' src='/js/plugins/division.js'></script>`);
        }
        window.history.pushState("", "", '/staffdivision');
        loadStaffDivision();
    }
    if (tabname == "#Event") {
        if ($("#eventjs").length == 0) {
            $("head").append(`<script id='eventjs' src='/js/plugins/event.js'></script>`);
        }
        window.history.pushState("", "", '/event');
        loadEvent();
    }
    if (tabname == "#StaffEvent") {
        if ($("#eventjs").length == 0) {
            $("head").append(`<script id='eventjs' src='/js/plugins/event.js'></script>`);
        }
        window.history.pushState("", "", '/staffevent');
        loadEvent();
    }
    if (tabname == "#AuditLog") {
        if ($("#userjs").length == 0) {
            $("head").append(`<script id='userjs' src='/js/apis/user.js'></script>`);
        }
        window.history.pushState("", "", '/audit');
        loadAuditLog();
    }
    if (tabname == "#Admin") {
        if ($("#userjs").length == 0) {
            $("head").append(`<script id='userjs' src='/js/apis/user.js'></script>`);
        }
        window.history.pushState("", "", '/admin');
        loadAdmin();
    }
}

function AnnEventBtn(){
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
        mts = $("#eventmts").val();
        dts = $("#eventdts").val();
        eventid = $("#eventid").val();
        if (!$("#newEventBtn").prop("disabled")) {
            if (isNumber(eventid)) {
                if (title != "" || from != "" || to != "" || distance != "" || mts != "" || dts != "") {
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

function ShowStaffTabs() {
    roles = JSON.parse(localStorage.getItem("roles"));
    perms = JSON.parse(localStorage.getItem("perms"));
    if (roles != undefined && perms.admin != undefined) {
        userPerm = [];
        for (i = 0; i < roles.length; i++) {
            for(j = 0 ; j < Object.keys(perms).length ; j++){
                if(["driver", "staff_of_the_month", "driver_of_the_month"].includes(Object.keys(perms)[j])) continue;
                for(k = 0 ; k < perms[Object.keys(perms)[j]].length ; k ++){
                    if(perms[Object.keys(perms)[j]][k] == roles[i]){
                        userPerm.push(Object.keys(perms)[j]);
                    }
                }
            }
        }
        if(userPerm.length > 0){
            $("#stafftabs").show();
            $("#stafftabs a").hide();
            if(userPerm.includes("admin")){
                $("#stafftabs a").show();
                $("#updateStaffPos").show();
                $("#downloadseditbtn").show();
                $("#AdminBtn").show();
                AnnEventBtn();
            } else {
                $("#updateStaffPos").hide();
                if(userPerm.includes("event")){
                    $("#StaffEventBtn").show();
                    $("#StaffAnnTabBtn").show();
                    AnnEventBtn();
                } if(userPerm.includes("hr") || userPerm.includes("division")){
                    $("#StaffMemberBtn").show();
                    $("#AllAppBtn").show();
                } if(userPerm.includes("hr")){
                    $("#AllUserBtn").show();
                } if(userPerm.includes("division")){
                    $("#StaffDivisionBtn").show();
                } if(userPerm.includes("audit")){
                    $("#AuditLogBtn").show();
                }
            }
        }
    }
}

function validate() {
    token = localStorage.getItem("token");
    userid = localStorage.getItem("userid");
    if (token == "guest") {
        $("#header").prepend(
            "<p style='color:orange'>Guest Mode - <a style='color:grey' href='/login'>Login</a></p>");
        return;
    }
    if (userid != -1 && isNumber(userid)) {
        $("#memberOnlyTabs").show();
    } else {
        $("#DivisionBtn").hide();
        $("#DownloadsTabBtn").hide();
    }
    $("#recruitment").show();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/validate",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
            if (data.response.extra == "steamauth") {
                $("#header").prepend(
                    "<p style='color:orange'>Steam not bound! You must bind it to become a member! <a style='color:grey' href='/auth'>Click here to bind it</a></p>");
            } else if (data.response.extra == "truckersmp") {
                $("#header").prepend(
                    "<p style='color:orange'>TruckersMP not bound! You must bind it to become a member! <a style='color:grey' href='/auth'>Click here to bind it</a></p>");
            } else {
                color = "green";
                if (isdark) color = "lightgreen";
                $("#header").prepend(`<p style="color:${color}"><svg style="color:${color};display:inline" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                fill="currentColor" class="bi bi-activity" viewBox="0 0 16 16">
                <path fill-rule="evenodd"
                  d="M6 2a.5.5 0 0 1 .47.33L10 12.036l1.53-4.208A.5.5 0 0 1 12 7.5h3.5a.5.5 0 0 1 0 1h-3.15l-1.88 5.17a.5.5 0 0 1-.94 0L6 3.964 4.47 8.171A.5.5 0 0 1 4 8.5H.5a.5.5 0 0 1 0-1h3.15l1.88-5.17A.5.5 0 0 1 6 2Z"
                  fill="${color}"></path>
              </svg>&nbsp;&nbsp;<span id="livedriver2" style="color:${color}"></span></p>`);
            }
        }
    });
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/info",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error == false) {
                localStorage.setItem("roles", JSON.stringify(data.response.roles));
                localStorage.setItem("name", data.response.name);
                localStorage.setItem("avatar", data.response.avatar);
                localStorage.setItem("discordid", data.response.discordid);
                localStorage.setItem("userid", data.response.userid);
                userid = data.response.userid;
                if (data.response.userid != -1) {
                    $("#AllMemberBtn").show();
                }
                roles = data.response.roles.sort();
                highestrole = roles[0];
                name = data.response.name;
                avatar = data.response.avatar;
                discordid = data.response.discordid;
                $("#name").html(name);
                if (avatar.startsWith("a_"))
                    $("#avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif");
                else
                    $("#avatar").attr("src", "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png");

                rolesLastUpdate = localStorage.getItem("rolesLastUpdate");
                if (rolesLastUpdate == null || rolesLastUpdate == undefined || parseInt(rolesLastUpdate) < (+new Date() - 86400)) {
                    $.ajax({
                        url: apidomain + "/" + vtcprefix + "/member/perms",
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            perms = data.response;
                            localStorage.setItem("perms", JSON.stringify(perms));
                            ShowStaffTabs();
                        }
                    });
                    $.ajax({
                        url: apidomain + "/" + vtcprefix + "/member/roles",
                        type: "GET",
                        dataType: "json",
                        success: function (data) {
                            rolelist = data.response;
                            rolestxt = [];
                            for (i = 0; i < roles.length; i++) {
                                rolestxt.push(rolelist[roles[i]]);
                            }
                            hrole = rolestxt[0];
                            for (i = 0; i < rolestxt.length && !isAdmin; i++) {
                                if (rolestxt[i].indexOf("Manager") != -1 || rolestxt[i].indexOf("Lead") != -1) {
                                    hrole = rolestxt[i];
                                    break;
                                }
                            }
                            localStorage.setItem("highestrole", hrole);
                            localStorage.setItem("rolelist", JSON.stringify(rolelist));
                            localStorage.setItem("rolesLastUpdate", (+new Date()).toString());
                            if (hrole == undefined || hrole == "undefined") hrole = "Loner";
                            $("#role").html(hrole);
                            roleids = Object.keys(rolelist);
                            for (var i = 0; i < roleids.length; i++) {
                                roleids[i] = parseInt(roleids[i]);
                            }
                            ShowStaffTabs();
                            if (highestrole >= 30) {
                                for (var i = 0; i < roleids.length; i++) {
                                    if (roleids[i] < 251 || roleids[i] > 253)
                                        $("#rolelist").append(`<li><input disabled type="checkbox" id="role` + roleids[i] +
                                            `" name="assignrole" value="role` + roleids[i] + `">
        <label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                                    else
                                        $("#rolelist").append(`<li><input type="checkbox" id="role` + roleids[i] +
                                            `" name="assignrole" value="role` + roleids[i] + `">
        <label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                                }
                            } else {
                                for (var i = 0; i < roleids.length; i++) {
                                    if (roleids[i] <= highestrole)
                                        $("#rolelist").append(`<li><input disabled type="checkbox" id="role` + roleids[i] +
                                            `" name="assignrole" value="role` + roleids[i] + `">
    <label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                                    else
                                        $("#rolelist").append(`<li><input type="checkbox" id="role` + roleids[i] +
                                            `" name="assignrole" value="role` + roleids[i] + `">
    <label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                                }
                            }
                        }
                    });
                } else {
                    rolestxt = [];
                    for (i = 0; i < roles.length; i++) {
                        rolestxt.push(rolelist[roles[i]]);
                    }
                    hrole = rolestxt[0];
                    for (i = 0; i < rolestxt.length && !isAdmin; i++) {
                        if (rolestxt[i].indexOf("Manager") != -1 || rolestxt[i].indexOf("Lead") != -1) {
                            hrole = rolestxt[i];
                            break;
                        }
                    }
                    localStorage.setItem("highestrole", hrole);
                    if (hrole == undefined || hrole == "undefined") hrole = "Loner";
                    $("#role").html(hrole);
                    roleids = Object.keys(rolelist);
                    for (var i = 0; i < roleids.length; i++) {
                        roleids[i] = parseInt(roleids[i]);
                    }
                    ShowStaffTabs();
                    if (highestrole >= 30) {
                        for (var i = 0; i < roleids.length; i++) {
                            if (roleids[i] < 251 || roleids[i] > 253)
                                $("#rolelist").append(`<li><input disabled type="checkbox" id="role` + roleids[i] +
                                    `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                            else
                                $("#rolelist").append(`<li><input type="checkbox" id="role` + roleids[i] +
                                    `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                        }
                    } else {
                        for (var i = 0; i < roleids.length; i++) {
                            if (roleids[i] <= highestrole)
                                $("#rolelist").append(`<li><input disabled type="checkbox" id="role` + roleids[i] +
                                    `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                            else
                                $("#rolelist").append(`<li><input type="checkbox" id="role` + roleids[i] +
                                    `" name="assignrole" value="role` + roleids[i] + `">
<label for="role` + roleids[i] + `">` + rolelist[roleids[i]] + `</label></li>`);
                        }
                    }
                }
                if (userid != -1) {
                    $.ajax({
                        url: apidomain + "/" + vtcprefix + "/member/info?userid=" + userid,
                        type: "GET",
                        dataType: "json",
                        headers: {
                            "Authorization": "Bearer " + token
                        },
                        success: function (data) {
                            if (data.error == false) {
                                d = data.response;
                                if (company_distance_unit == "imperial")
                                    points = parseInt(d.distance * 0.621371 + d.eventpnt + +d.divisionpnt);
                                else
                                    points = parseInt(d.distance + d.eventpnt + +d.divisionpnt);
                                rank = point2rank(points);
                                $("#ranktotpoints").html(TSeparator(points) + " - " + rank);
                                if ($("#role").html() == "Driver")
                                    $("#role").html(rank);
                            }
                        }
                    });
                }
            }
        }
    });
}

function PathDetect() {
    p = window.location.pathname;
    if (p == "/") ShowTab("#HomeTab", "#HomeTabBtn");
    else if (p == "/announcement") ShowTab("#AnnTab", "#AnnTabBtn");
    else if (p == "/staffannouncement") ShowTab("#StaffAnnTab", "#StaffAnnTabBtn");
    else if (p == "/downloads") ShowTab("#DownloadsTab", "#DownloadsTabBtn");
    else if (p == "/map") ShowTab("#Map", "#MapBtn");
    else if (p == "/delivery") {
        logid = getUrlParameter("logid");
        if (logid) {
            $(".tabbtns").removeClass("bg-indigo-500");
            $("#DeliveryBtn").addClass("bg-indigo-500");
            deliveryDetail(logid);
        } else ShowTab("#Delivery", "#DeliveryBtn");
    } else if (p == "/division") ShowTab("#Division", "#DivisionBtn");
    else if (p == "/staffdivision") ShowTab("#StaffDivision", "#StaffDivisionBtn");
    else if (p == "/event") ShowTab("#Event", "#EventBtn");
    else if (p == "/staffevent") ShowTab("#StaffEvent", "#StaffEventBtn");
    else if (p == "/member") {
        userid = getUrlParameter("userid");
        if (userid) loadProfile(parseInt(userid));
        else ShowTab("#AllMembers", "#AllMemberBtn");
    } else if (p == "/staffmember") {
        ShowTab("#StaffMembers", "#StaffMemberBtn");
    } else if (p == "/leaderboard") ShowTab("#Leaderboard", "#LeaderboardBtn");
    else if (p == "/ranking") ShowTab("#Ranking", "#RankingBtn");
    else if (p == "/myapp") ShowTab("#MyApp", "#MyAppBtn");
    else if (p == "/allapp") ShowTab("#AllApp", "#AllAppBtn");
    else if (p == "/submitapp") ShowTab("#SubmitApp", "#SubmitAppBtn");
    else if (p == "/pendinguser") ShowTab("#AllUsers", "#AllUserBtn");
    else if (p == "/audit") ShowTab("#AuditLog", "#AuditLogBtn");
    else if (p == "/admin") ShowTab("#Admin", "#AdminBtn");
    else ShowTab("#HomeTab", "#HomeTabBtn");
}

window.onpopstate = function (event) {
    PathDetect();
};

function loadDistanceUnit() {
    distance_unit = localStorage.getItem("distance_unit");
    if (distance_unit == "imperial") {
        $(".distance_unit").html("mi");
        distance_unit_txt = "mi";
        distance_ratio = 0.621371;
        $("#imperialbtn").css("background-color", "none");
        $("#metricbtn").css("background-color", "#293039");
    } else {
        $(".distance_unit").html("km");
        distance_unit = "metric";
        distance_ratio = 1;
        distance_unit_txt = "km";
        $("#metricbtn").css("background-color", "none");
        $("#imperialbtn").css("background-color", "#293039");
    }
}

$(document).ready(function () {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/version",
        type: "GET",
        dataType: "json",
        success: function (data) {
            $("#apiversion").html(data.response);
        }
    })

    loadDistanceUnit();
    if (localStorage.getItem("darkmode") == "1") {
        $("body").addClass("bg-gray-800");
        $("body").css("color", "white");
        $("head").append(`<style id='convertbg'>
            h1,h2,h3,p,span,text,label,input,textarea,select,tr {color: white;}
            .text-gray-500,.text-gray-600 {color: #ddd;}
            .bg-white {background-color: rgba(255, 255, 255, 0.1);}
            .swal2-popup {background-color: rgb(41 48 57)}
            .rounded-full {background-color: #888}
            th > .fc-scrollgrid-sync-inner {background-color: #444}
            a:hover {color: white}</style>`);
        $("#todarksvg").hide();
        $("#tolightsvg").show();
        Chart.defaults.color = "white";
        $("body").html($("body").html().replaceAll("text-green", "text-temp"));
        $("body").html($("body").html().replaceAll("#382CDD", "skyblue").replaceAll("green", "lightgreen"));
        $("body").html($("body").html().replaceAll("text-temp", "text-green"));
    } else {
        $("head").append(`<style>
            .rounded-full {background-color: #ddd}</style>`);
    }
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
    firstDay = new Date(+firstDay - offset);
    date = new Date(+date - offset);
    $("#lbstart").val(firstDay.toISOString().substring(0, 10));
    $("#lbend").val(date.toISOString().substring(0, 10));

    if (String(localStorage.getItem("token")).length != 36) {
        if (window.location.pathname != "/") localStorage.setItem("token", "guest");
        $("#DivisionBtn").hide();
        $("#DownloadsTabBtn").hide();
    }
    validate();
    if (window.location.pathname == "/overview") window.history.pushState("", "", '/');
    PathDetect();

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

    $('#searchname').keydown(function (e) {
        if (e.which == 13) loadMembers();
    });
    $('#dend,#dspeedlimit').keydown(function (e) {
        if (e.which == 13) loadDelivery();
    });
    $('#udend,#udspeedlimit').keydown(function (e) {
        if (e.which == 13) loadUserDelivery();
    });
    $('#lbend,#lbspeedlimit').keydown(function (e) {
        if (e.which == 13) loadLeaderboard();
    });
    $('#memberroleid').keydown(function (e) {
        if (e.which == 13) fetchRoles();
    });
    $('#attendeeId').keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            val = $("#attendeeId").val();
            if (val == "") return;
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/member/list?page=1&search=" + val,
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    d = data.response.list;
                    if (d.length == 0) {
                        return toastFactory("error", "Error:", "No member with name " + val + " found.", 5000, false);
                    }
                    userid = d[0].userid;
                    username = d[0].name;
                    if ($(`#attendeeid-${userid}`).length > 0) {
                        return toastFactory("error", "Error:", "Member already added.", 5000, false);
                    }
                    $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                        <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
                    $("#attendeeId").val("");
                },
                error: function (data) {
                    return toastFactory("error", "Error:", "Failed to get User ID", 5000, false);
                }
            })
        } else if (keyCode == 8) {
            e.preventDefault();
            val = $("#attendeeId").val();
            if (val != "") {
                $("#attendeeId").val(val.substring(0, val.length - 1));
                return;
            }
            ch = $("#attendeeIdWrap").children();
            ch[ch.length - 2].remove();
        }
    });

    function devwarn() {
        for (var i = 0; i < 3; i++) {
            setTimeout(function () {
                console.log("%cHold Up!", "color: #0000ff; font-size: 100px;");
                console.log(
                    "%cYou are likely to be hacked if anyone ask you to paste something here, or look for data in Local Storage!",
                    "color:red; font-size: 15px;");
                console.log(
                    "%cUnless you understand exactly what you are doing, close this window and stay safe.",
                    "font-size: 15px;");
                console.log(
                    "%cIf you do understand exactly what you are doing, you should come work with us, simply submit an application and we'll get back to you very soon",
                    "font-size: 15px;");
            }, 800 * i);
        }
    }
    //devwarn();
    $("body").keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 123) {
            devwarn();
        }
    });

    setInterval(function () {
        if ($("#HomeTab").width() / 3 <= 300) {
            if ($("#HomeTab").width() / 2 <= 300) {
                $(".statscard").css("width", "100%");
            } else {
                $(".statscard").css("width", "50%");
            }
        } else {
            $(".statscard").css("width", "33%");
        }
    }, 10);

    $("#pupages").val("1");
    $("#allapppage").val("1");
    $("#myapppage").val("1");

    $("#logout").click(function () {
        token = localStorage.getItem("token")
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user/revoke",
            type: "POST",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            },
            error: function (data) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        });
    });
    $('#downloadscontent').on('input', function () {
        UpdateDownloads();
    });
    $('#appselect').on('change', function () {
        var value = $(this).val();
        $(".apptabs").hide();
        if (value == "driver") {
            $("#DriverApp").show();
            $("#submitAppBttn").show();
        } else if (value == "staff") {
            $("#StaffApp").show();
            $("#submitAppBttn").show();
        } else if (value == "loa") {
            $("#LOAApp").show();
            $("#submitAppBttn").show();
        } else if (value == "division") {
            $("#DivisionApp").show();
            $("#submitAppBttn").hide();
        }
    });
    $('#divisionappselect').on('change', function () {
        var value = $(this).val();
        $(".divisiontabs").hide();
        if (value == "construction") {
            $("#ConstructionApp").show();
            $("#submitAppBttn").show();
        } else if (value == "chilled") {
            $("#submitAppBttn").hide();
            toastFactory("warning", "Error", "Division recruitment has not started yet!", 5000,
                false);
        } else if (value == "adr") {
            $("#submitAppBttn").hide();
            toastFactory("warning", "Error", "Division recruitment has not started yet!", 5000,
                false);
        } else {
            $("#submitAppBttn").hide();
        }
    });
    annpage = 2;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?page=1",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            ann = data.response.list;
            if (ann.length > 0) {
                a = ann[0];
                dt = getDateTime(a.timestamp * 1000);
                content = "<span style='font-size:10px;color:grey'><b>#" + a.aid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='loadProfile(" + a.byuserid + ")'><i>" + a.by + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.atype], a.title, content);
                $("#HomeTabLeft").append(banner.replaceAll("py-8 ", "pb-8 "));
            }
            for (i = 0; i < ann.length; i++) {
                a = ann[i];
                dt = getDateTime(a.timestamp * 1000);
                content = "<span style='font-size:10  px;color:grey'><b>#" + a.aid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='loadProfile(" + a.byuserid + ")'><i>" + a.by + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.atype], a.title, content);
                $("#anns").append(banner);
            }
        }
    });
    lastPositionsUpdate = parseInt(localStorage.getItem("positionsLastUpdate"));
    if (!isNumber(lastPositionsUpdate)) {
        lastPositionsUpdate = 0;
    }
    if (+new Date() - lastPositionsUpdate > 86400) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/application/positions",
            type: "GET",
            dataType: "json",
            success: function (data) {
                positions = data.response;
                positionstxt = "";
                for (var i = 0; i < positions.length; i++) {
                    positionstxt += positions[i] + "\n";
                    $("#sa-select").append("<option>" + positions[i] + "</option>");
                }
                positionstxt = positionstxt.slice(0, -1);
                $("#staffposedit").val(positionstxt);
                localStorage.setItem("positionsLastUpdate", +new Date());
                localStorage.setItem("positions", JSON.stringify(positions));
            }
        });
    }
    window.onscroll = function (ev) {
        if (curtab != "#AnnTab") return;
        if ((window.innerHeight + window.scrollY + 100) >= document.body.offsetHeight) {
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/announcement?page=" + annpage,
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + token
                },
                success: async function (data) {
                    annpage += 1;
                    ann = data.response.list;
                    for (i = 0; i < ann.length; i++) {
                        a = ann[i];
                        dt = getDateTime(a.timestamp * 1000);
                        content = "<span style='font-size:10px;color:grey'><b>#" + a.aid + "</b> | <b>" + dt +
                            "</b> by <a style='cursor:pointer' onclick='loadProfile(" + a.byuserid + ")'><i>" + a.by + "</i></a></span><br>" +
                            parseMarkdown(a.content.replaceAll("\n", "<br>"));
                        TYPES = ["info", "info", "warning", "criticle", "resolved"];
                        banner = genBanner(TYPES[a.atype], a.title, content);
                        $("#anns").append(banner);
                        $($("#anns").children()[$("#anns").children().length - 1]).hide();
                        $($("#anns").children()[$("#anns").children().length - 1]).fadeIn();
                        await sleep(200);
                    }
                    if (ann.length == 0) {
                        toastFactory("info", "No more announcements", "You have reached the end of the list", 5000,
                            false);
                        $("#annloadmore").attr("disabled", "disabled");
                    }
                }
            });
        }
    };
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
                ranktable += `<tr class="text-xs">
                <td class="py-5 px-6 font-medium">${RANKING[rankpnt[i * 8 + j]]}</td>
                <td class="py-5 px-6 font-medium">${rankpnt[i * 8 + j]}</td>
              </tr>`;
            }
            ranktable += `
            </tbody>
          </table>`;
            $("#ranktable").append(ranktable);
        }
    }
});