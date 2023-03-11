function LoadXOfTheMonth() {
    if ($("#member-tab-left").is(":visible")) return;
    if (perms.driver_of_the_month != undefined) {
        dotm_role = perms.driver_of_the_month[0];

        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&page_size=1&roles=" + dotm_role,
            type: "GET",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#driver-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"><br><a style="cursor: pointer; ${GetSpecialColorStyle(discordid)}" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#driver-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
    if (perms.staff_of_the_month != undefined) {
        sotm_role = perms.staff_of_the_month[0];

        $.ajax({
            url: api_host + "/" + dhabbr + "/member/list?page=1&page_size=1&roles=" + sotm_role,
            type: "GET",
            contentType: "application/json", processData: false,
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#staff-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);"><br><a style="cursor: pointer;${GetSpecialColorStyle(discordid)}" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#staff-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
}

member_list_placeholder_row = `
<tr>
    <td style="width:40px;"></td>
    <td style="width:calc(100% - 40px - 60%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 40px - 40%);"><span class="placeholder w-100"></span></td>
</tr>`;
filter_roles = [];
function LoadMemberList(noplaceholder = false) {
    LockBtn("#button-member-list-search", btntxt = "...");

    InitPaginate("#table_member_list", "LoadMemberList();");
    page = parseInt($("#table_member_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    search_name = $("#input-member-search").val();

    if (!noplaceholder) {
        $("#table_member_list_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_member_list_data").append(member_list_placeholder_row);
        }
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + search_name + "&roles=" + filter_roles.join(","),
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-member-list-search");
            while (1) {
                if (userPermLoaded) break;
                await sleep(100);
            }

            memberList = data.list;
            total_pages = data.total_pages;
            data = [];

            for (i = 0; i < memberList.length; i++) {
                user = memberList[i];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = user.avatar;
                cur_highestrole = rolelist[user.roles[0]];
                if (cur_highestrole == undefined) cur_highestrole = "/";
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = logob64;
                }
                userop = ``;
                if (userPerm.includes("hrm") || userPerm.includes("admin")) {
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr("roles")}</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${convertQuotation1(name)}')">${mltr("points")}</a></li>
                        <li><a class="dropdown-item clickable" onclick="UpdateProfile('${user.discordid}')">${mltr('refresh_profile')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DisableUserMFAShow('${discordid}', '${convertQuotation1(name)}')">${mltr('disable_mfa')}</a></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="UpdateDiscordShow('${discordid}', '${convertQuotation1(name)}')">${mltr('update_discord_id')}</a></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DeleteConnectionsShow('${discordid}', '${convertQuotation1(name)}')">${mltr('delete_connections')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" style="color:red" onclick="DismissMemberShow(${userid}, '${convertQuotation1(name)}')" >${mltr('dismiss')}</a></li>
                    </ul>
                </div>`;
                } else if (userPerm.includes("hr")) {
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr('roles')}</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${convertQuotation1(name)}')">${mltr('points')}</a></li>
                        <li><a class="dropdown-item clickable" onclick="UpdateProfile('${user.discordid}')">${mltr('refresh_profile')}</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" onclick="DismissMemberShow(${userid}, '${convertQuotation1(name)}')" style="color:red">${mltr('dismiss')}</a></li>
                    </ul>
                </div>`;
                } else if (userPerm.includes(`division`)) {
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        ${mltr('manage')}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">${mltr('roles')}</a></li>
                    </ul>
                </div>`;
                }
                data.push([`<img src='${src}' width="40px" height="40px" style="display:inline;border-radius:100%" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);">`, `<a style="cursor: pointer;${GetSpecialColorStyle(discordid)}" onclick="LoadUserProfile(${userid})">${name}</a>`, `${cur_highestrole}`, userop]);
            }

            PushTable("#table_member_list", data, total_pages, "LoadMemberList();");
        },
        error: function (data) {
            UnlockBtn("#button-member-list-search");
            AjaxError(data);
        }
    })
}

function FilterRolesShow() {
    roled = `
    <div>
        <label class="form-label">${mltr('roles')}</label>
        <br>
    </div>`;

    roleids = Object.keys(rolelist);
    for (var i = 0; i < roleids.length; i++) {
        if (i > 0 && i % 2 == 0) roled += "<br>";
        checked = "";
        if (filter_roles.includes(roleids[i])) checked = "checked";
        roled += `
        <div class="form-check mb-2" style="width:49.5%;display:inline-block">
            <input class="form-check-input" type="checkbox" value="" id="filter-roles-${roleids[i]}" name="filter-roles" ${checked}>
            <label class="form-check-label" for="filter-roles-${roleids[i]}">
                ${rolelist[roleids[i]]}
            </label>
        </div>`;
    }

    modalid = ShowModal(mltr("filter_by_roles"), roled, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button type="button" class="btn btn-primary" onclick="FilterRoles();LoadMemberList(true)" data-bs-dismiss="modal">${mltr("confirm")}</button>`);
    InitModal("filter_roles", modalid);

    $('input[name="filter-roles"]').on('change', function () {
        var numChecked = $('input[name="filter-roles"]:checked').length;
        if (numChecked >= 5) {
            $('input[name="filter-roles"]').prop('disabled', true);
            $('input[name="filter-roles"]:checked').prop('disabled', false);
        } else if (numChecked < 5) {
            $('input[name="filter-roles"]').prop('disabled', false);
        }
    });
}

function FilterRoles() {
    checked = $('input[name="filter-roles"]:checked');
    filter_roles = [];
    for (var i = 0; i < checked.length; i++) {
        filter_roles.push($(checked[i]).attr("id").replaceAll("filter-roles-", ""));
    }
}

function EditRolesShow(uid) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user?userid=" + uid,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            d = data;
            roles = d.roles;

            roled = `
            <div>
                <label class="form-label">${mltr('roles')}</label>
                <br>
            </div>`;

            roleids = Object.keys(rolelist);
            if (!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin")) && userPerm.includes("division")) {
                division_roles = [];
                divisions_ids = Object.keys(divisions);
                for (var i = 0; i < divisions_ids.length; i++) {
                    division_roles.push(divisions[divisions_ids[i]].role_id);
                }
            }
            for (var i = 0; i < roleids.length; i++) {
                if (i > 0 && i % 2 == 0) roled += "<br>";
                checked = "";
                if (roles.includes(roleids[i])) checked = "checked";
                disabled = "";
                if (parseInt(roleids[i]) <= parseInt(highestroleid))
                    disabled = "disabled";
                if (!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin")) && userPerm.includes("division")) {
                    if (!division_roles.includes(roleids[i])) disabled = "disabled";
                }
                roled += `
                <div class="form-check mb-2" style="width:49.5%;display:inline-block">
                    <input class="form-check-input" type="checkbox" value="" id="edit-roles-${roleids[i]}" name="edit-roles" ${checked} ${disabled}>
                    <label class="form-check-label" for="edit-roles-${roleids[i]}">
                        ${rolelist[roleids[i]]}
                    </label>
                </div>`;
            }

            modalid = ShowModal(`${d.name} (${d.userid})`, roled, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button><button id="button-edit-roles" type="button" class="btn btn-primary" onclick="EditRoles(${d.userid});">${mltr("update")}</button>`);
            InitModal("edit_roles", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditRoles(uid) {
    LockBtn("#button-edit-roles", mltr("updating"));

    d = $('input[name="edit-roles"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("edit-roles-", ""));
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/roles",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "userid": uid,
            "roles": roles.join(",")
        }),
        success: function (data) {
            UnlockBtn("#button-edit-roles");
            toastNotification("success", "Success!", mltr("member_roles_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-roles");
            AjaxError(data);
        }
    });
}

function EditPointsShow(uid, name) {
    div = `
    <label class="form-label">${mltr('points')}</label>
    <div class="input-group mb-2">
        <span class="input-group-text" id="edit-points-distance-label">${mltr('distance')}</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-distance" placeholder="0" aria-describedby="edit-points-distance-label">
    </div>
    <div class="input-group mb-3">
        <span class="input-group-text" id="edit-points-myth-label">${mltr('myth')}</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-myth" placeholder="0" aria-describedby="edit-points-myth-label">
    </div>`;
    modalid = ShowModal(`${name} (${uid})`, div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-points" type="button" class="btn btn-primary" onclick="EditPoints(${uid});">${mltr('update')}</button>`);
    InitModal("edit_points", modalid);
}

function EditPoints(uid) {
    LockBtn("#button-edit-points");

    distance = $("#edit-points-distance").val();
    mythpoint = $("#edit-points-myth").val();
    if (!isNumber(distance)) distance = 0;
    if (!isNumber(mythpoint)) mythpoint = 0;

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/point",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "userid": uid,
            "distance": distance,
            "mythpoint": mythpoint,
        }),
        success: function (data) {
            UnlockBtn("#button-edit-points");
            toastNotification("success", "Success!", mltr("member_points_updated"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-points");
            AjaxError(data);
        }
    });
}

function DismissMemberShow(uid, name) {
    if (uid == localStorage.getItem("userid")) return toastNotification("error", "Error", mltr("you_cannot_dismiss_yourself"), 5000);
    modalid = ShowModal(mltr('dismiss_member'), `<p>${mltr('dismiss_member_note_1')}</p><p><i>${name} (${mltr('user_id')}: ${uid})</i></p><br><p>${mltr("dismiss_member_note_2")}</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr('cancel')}</button><button id="button-dismiss-member" type="button" class="btn btn-danger" onclick="DismissMember(${uid});">${mltr('dismiss')}</button>`);
    InitModal("dismiss_member", modalid);
}

function DismissMember(uid) {
    LockBtn("#button-dismiss-member", mltr("dismissing"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/dismiss?userid=" + uid,
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-dismiss-member");
            LoadMemberList(noplaceholder = true);
            toastNotification("success", "Success", mltr("member_dismissed"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-dismiss-member");
            AjaxError(data);
        }
    });
}

function LoadRanking() {
    $("#ranking-tab").children().remove();
    for (var i = 0; i < 3; i++) {
        t = `<div class="row">`;
        for (var j = 0; j < 3; j++) {
            t += GenCard(`<span class="placeholder" style="width:150px"></span>`, `<span class="placeholder" style="width:100px"></span>`);
        }
        t += `</div>`;
        $("#ranking-tab").append(t);
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + localStorage.getItem("userid"),
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            t = `<div class="row">`;
            $("#ranking-tab").children().remove();
            if (data.list.length != 0) {
                d = data.list[0];
                rank = point2rank(d.points.total_no_limit);
                t += GenCard(mltr('my_points'), TSeparator(d.points.total_no_limit) + " - " + rank + `
                <button id="button-rankings-role" type="button" class="btn btn-sm btn-primary button-rankings-role" onclick="GetDiscordRankRole();" style="float:right">${mltr('get_discord_role')}</button>`);
            } else {
                t += GenCard(mltr('my_points'), mltr("you_are_not_a_driver"));
            }
            k = Object.keys(RANKING);
            for (var i = 0; i < Math.min(k.length, 2); i++) {
                t += GenCard(`<span style="color:${RANKCLR[k[i]]}"> ${RANKING[k[i]]}</span>`, `${TSeparator(k[i])} Points`);
            }
            t += `</div>`;
            if (t.length > 2) {
                for (var i = 2, j = 2; i < k.length; i = j) {
                    t += `<div class="row">`;
                    for (j = i; j < Math.min(k.length, i + 3); j++) {
                        t += GenCard(`<span style="color:${RANKCLR[k[j]]}"> ${RANKING[k[j]]}</span>`, `${TSeparator(k[j])} Points`);
                    }
                    t += `</div>`;
                }
            }
            $("#ranking-tab").append(t);
        }, error: function (data) {
            AjaxError(data);
        }
    });
}

function getActivityName(name) {
    if (name.startsWith("dlog_")) return mltr("viewing_delivery_log") + " #" + name.split("_")[1];
    else if (name == "dlog") return mltr("viewing_delivery_logs");
    else if (name == "index") return mltr("viewing_drivers_hub_index");
    else if (name == "leaderboard") return mltr("viewing_leaderboard");
    else if (name == "member") return mltr("viewing_members");
    else if (name.includes("member_")) return mltr("viewing_profile") + ": " + allmembers[name.split("_")[1]];
    else if (name == "announcement") return mltr("viewing_announcements");
    else if (name == "application") return mltr("viewing_appliactions");
    else if (name == "challenge") return mltr("viewing_challenges");
    else if (name == "division") return mltr("viewing_divisions");
    else if (name == "downloads") return mltr("viewing_downloads");
    else if (name == "event") return mltr("viewing_events");
    else return "/";
}

function getActitivyUrl(name) {
    if (name.startsWith("dlog_")) return "/delivery/" + name.split("_")[1];
    else if (name == "dlog") return "/delivery";
    else if (name == "index") return "/";
    else if (name == "leaderboard") return "/leaderboard";
    else if (name == "member") return "/member";
    else if (name.includes("member_")) return "/member/" + name.split("_")[1];
    else if (name == "announcement") return "/announcement";
    else if (name == "application") return "/application/my";
    else if (name == "challenge") return "/challenge";
    else if (name == "division") return "/division";
    else if (name == "downloads") return "/downloads";
    else if (name == "event") return "/event";
    else return "/";
}

function UpdateProfile(discordid) {
    $.ajax({
        url: api_host + "/" + dhabbr + "/user/profile?discordid=" + discordid,
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (curtab == "#user-delivery-tab") LoadUserProfile(profile_userid);
            if (curtab == "#member-tab") LoadMemberList(noplaceholder = true);
            if (curtab == "#manage-user-tab") LoadUserList(noplaceholder = true);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function LoadUserProfile(userid) {
    if (userid < 0) return;
    profile_userid = userid;

    user_statistics_placeholder = `<div class="row">
    <div class="shadow p-3 m-3 bg-dark rounded col">
        <div style="padding:20px 0 0 20px;float:left" id="profile-info">
        </div>
        <div style="width:170px;padding:10px;float:right"><img id="profile-avatar" onerror="if($(this).attr('src')!=logob64) $(this).attr('src',logob64);" style="border-radius: 100%;width:150px;height:150px;border:solid ${dhcolor} 5px;">
        </div>
        <a style="cursor:pointer"><img id="profile-banner" onclick="CopyBannerURL(profile_userid)" onerror="$(this).hide();" style="border-radius:10px;width:100%;margin-top:10px;margin-bottom:20px;"></a>
    </div>
    <div class="shadow p-3 m-3 bg-dark rounded col-4">
        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-user"></i></span> ${mltr('account')}</strong></h5>
        <div id="user-account-info"></div>
    </div>
    </div>
    <div class="row">
    <div class="shadow p-3 m-3 bg-dark rounded col">
        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-chart-line"></i></span> ${mltr('statistics')}</strong></h5>
        <div style="float:right">
            <select class="form-select bg-dark text-white" style="display:inline-block;margin-right:5px;width:120px;" id="user-statistics-chart-select">
                <option value="1">24 Hours</option>
                <option value="2">7 Days</option>
                <option value="3">14 Days</option>
                <option value="4" selected id="user-statistics-chart-select-30d">30 Days</option>
                <option value="5">90 Days</option>
                <option value="6">360 Days</option>
                <option value="7">600 Days</option>
            </select>
            <a id="user-chart-sum" onclick='addup=1-addup;LoadChart(profile_userid)' style="cursor:pointer" class="btn btn-primary active">${mltr('sum')}</a>
        </div>
        </h2>
        <div class="p-4 overflow-x-auto" style="display: block;">
            <canvas id="user-statistics-chart" width="100%" height="300px"></canvas>
        </div>
    </div>
    <div class="shadow p-3 m-3 bg-dark rounded col-4">
        <h5 style="display:inline-block"><strong><span class="rect-20"><i class="fa-solid fa-align-left"></i></span> ${mltr('statistics')}</strong></h5>
        <div id="profile-text-statistics"></div>
    </div>
    </div>`;

    $("#user-statistics").html(user_statistics_placeholder);
    $("#user-statistics-chart-select").change(function () {
        chartscale = parseInt($(this).val());
        LoadChart(userid);
    });
    $('#delivery-log-userid').val(userid);
    $("#profile-banner").attr("src", "/banner/" + userid);
    chartscale = 4;
    LoadChart(userid);

    function GenTableRow(key, val) {
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }

    $.ajax({
        url: api_host + "/" + dhabbr + "/user?userid=" + String(userid),
        type: "GET",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            ShowTab("#user-delivery-tab", userid);

            d = data;

            document.title = d.name + " - " + company_name;

            account_info = "<table>";
            account_info += GenTableRow(mltr("id"), d.userid);
            if (d.email != undefined && d.email != "") {
                account_info += GenTableRow(mltr("email"), d.email);
            }
            account_info += GenTableRow(mltr("discord"), d.discordid);
            account_info += GenTableRow(mltr("truckersmp"), `<a href='https://truckersmp.com/user/${d.truckersmpid}'>${d.truckersmpid}</a>`);
            account_info += GenTableRow(mltr("steam"), `<a href='https://steamcommunity.com/profiles/${d.steamid}'>${d.steamid}</a>`);
            account_info += GenTableRow(mltr("joined_at"), getDateTime(d.join_timestamp * 1000));

            roles = d.roles;
            rtxt = "";
            for (var i = 0; i < roles.length; i++) {
                color = dhcolor;
                if (rolecolor[roles[i]] != undefined) color = rolecolor[roles[i]];
                fcolor = foregroundColorOf(color);
                rtxt += `<span class='badge' style='background-color:${color};color:${fcolor}'>` + rolelist[roles[i]] + "</span> ";
            }
            rtxt = rtxt.substring(0, rtxt.length - 2);

            if (d.roles.length == 1) account_info += GenTableRow(mltr("role"), rtxt);
            else account_info += GenTableRow(mltr("roles"), rtxt);

            account_info += GenTableRow("&nbsp;", "&nbsp;");
            if (d.activity == null) d.activity = { "status": "unknown", "last_seen": "0" };
            activity_url = getActitivyUrl(d.activity.status);
            if (d.activity.status == "offline") {
                if (d.activity.last_seen != -1)
                    account_info += GenTableRow(mltr("status"), mltr("offline") + " - " + mltr("last_seen") + " " + timeAgo(new Date(d.activity.last_seen * 1000)));
                else
                    account_info += GenTableRow(mltr("status"), mltr("offline"));
            }
            else if (d.activity.status == "online") account_info += GenTableRow(mltr("status"), mltr("online"));
            else account_info += GenTableRow(mltr("activity"), `<a class="clickable" onclick='window.history.pushState("", "", "${activity_url}");PathDetect()'>${getActivityName(d.activity.status)}</a>`);

            account_info += "</table>";

            $("#user-account-info").html(account_info);

            extra = "";

            while (1) {
                if (userPermLoaded) break;
                await sleep(100);
            }
            if (userPerm.includes("hrm") || userPerm.includes("admin") || userPerm.includes("patch_username") || d.userid == localStorage.getItem("userid")) {
                extra = `<button type="button" class="btn btn-primary" style="position:relative;top:-3px;" onclick="UpdateProfile('${d.discordid}');"><i class="fa-solid fa-rotate"></i></button>`;
            }

            profile_info = "";
            profile_info += `<h1 style='font-size:40px'><b>${d.name}</b> ${extra}</h1>`;
            profile_info += "" + marked.parse(d.bio).replaceAll("<img ", "<img style='width:100%;' ");
            $("#profile-info").html(profile_info);

            avatar = GetAvatarSrc(d.discordid, d.avatar);
            $("#profile-avatar").attr("src", avatar);

            $("#profile-text-statistics").html("Loading...");
            $.ajax({
                url: api_host + "/" + dhabbr + "/dlog/statistics/summary?userid=" + String(userid),
                type: "GET",
                contentType: "application/json", processData: false,
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    d = data;
                    info = "";
                    info += `<b>${mltr('jobs')}</b>: ${TSeparator(d.job.all.sum.tot)} (${TSeparator(d.job.all.ets2.tot)} + ${TSeparator(d.job.all.ats.tot)})<br>`;
                    info += `<b>${mltr('including_cancelled_jobs')}</b>: ${TSeparator(d.job.cancelled.sum.tot)}<br>`;

                    dtot = TSeparator(d.distance.all.sum.tot * distance_ratio) + distance_unit_txt;
                    dets2 = TSeparator(d.distance.all.ets2.tot * distance_ratio) + distance_unit_txt;
                    dats = TSeparator(d.distance.all.ats.tot * distance_ratio) + distance_unit_txt;
                    info += `<b>${mltr('distance')}</b>: ${dtot} (${dets2} + ${dats})<br>`;

                    dtot = TSeparator(d.fuel.all.sum.tot * fuel_ratio) + fuel_unit_txt;
                    dets2 = TSeparator(d.fuel.all.ets2.tot * fuel_ratio) + fuel_unit_txt;
                    dats = TSeparator(d.fuel.all.ats.tot * fuel_ratio) + fuel_unit_txt;
                    info += `<b>${mltr('fuel')}</b>: ${dtot} (${dets2} + ${dats})<br>`;

                    info += `<b>${mltr('profit')}</b>: €` + TSeparator(d.profit.all.tot.euro) + " + $" + TSeparator(d.profit.all.tot.dollar) + "<br>";
                    info += `<b>${mltr('including_cancellation_penalty')}</b>: -€` + TSeparator(-d.profit.cancelled.tot.euro) + " - $" + TSeparator(-d.profit.cancelled.tot.dollar) + "";

                    $("#profile-text-statistics").html(info);

                    $.ajax({
                        url: api_host + "/" + dhabbr + "/dlog/leaderboard?point_types=distance,challenge,event,division,myth&userids=" + String(userid),
                        type: "GET",
                        contentType: "application/json", processData: false,
                        headers: {
                            "Authorization": "Bearer " + localStorage.getItem("token")
                        },
                        success: async function (data) {
                            info += "<hr>";
                            d = data.list[0];
                            if (d != undefined) {
                                info += `<b>${mltr('points')}</b><br>`;
                                info += `<b>${mltr('distance')}</b>: ${d.points.distance}<br>`;
                                info += `<b>${mltr('challenge')}</b>: ${d.points.challenge}<br>`;
                                info += `<b>${mltr('event')}</b>: ${d.points.event}<br>`;
                                info += `<b>${mltr('division')}</b>: ${d.points.division}<br>`;
                                info += `<b>${mltr('myth')}</b>: ${d.points.myth}<br>`;
                                info += `<b>${mltr('total')}: ${d.points.total_no_limit}</b><br>`;
                                info += `<b>${mltr('rank')}: #${d.points.rank_no_limit} (${point2rank(d.points.total_no_limit)})</b><br>`;
                            }
                            info += `</p>`;
                            $("#profile-text-statistics").html(info);
                        }
                    });
                },
                error: function (data) {
                    AjaxError(data, no_notification = true);
                }
            });
        },
        error: function (data) {
            ShowTab("#overview-tab", "#button-overview-tab");
            AjaxError(data);
        }
    });
}

function GetDiscordRankRole() {
    LockBtn(".button-rankings-role", mltr("getting"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/member/roles/rank",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn(".button-rankings-role");
            toastNotification("success", "Success", mltr("discord_role_assigned"), 5000, false);
    },
        error: function (data) {
            UnlockBtn(".button-rankings-role");
            AjaxError(data);
        }
    })
}