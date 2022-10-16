function LoadXOfTheMonth(){
    if($("#member-tab-left").is(":visible")) return;
    if(perms.driver_of_the_month != undefined){
        dotm_role = perms.driver_of_the_month[0];
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&page_size=1&roles=" + dotm_role,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#driver-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png'");><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
                $("#driver-of-the-month").show();

                $("#member-tab-left").show();
                $("#member-tab-right").addClass("col-8");
            }
        })
    }
    if(perms.staff_of_the_month != undefined){
        sotm_role = perms.staff_of_the_month[0];
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/list?page=1&page_size=1&roles=" + sotm_role,
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                d = data.response.list;
                user = d[0];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                $("#staff-of-the-month-info").html(`<img src="${avatar}" width="60%" style="border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/${vtcprefix}/logo.png')";><br><a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`);
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
function LoadMemberList(noplaceholder = false) {
    LockBtn("#button-member-list-search", btntxt = "...");

    InitPaginate("#table_member_list", "LoadMemberList();");
    page = parseInt($("#table_member_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    search_name = $("#input-member-search").val();

    if(!noplaceholder){
        $("#table_member_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_member_list_data").append(member_list_placeholder_row);
        }
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + search_name,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            UnlockBtn("#button-member-list-search");
            if (data.error) return AjaxError(data);
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }

            memberList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < memberList.length; i++) {
                user = memberList[i];
                userid = user.userid;
                name = user.name;
                discordid = user.discordid;
                avatar = user.avatar;
                highestrole = user.roles[0];
                highestroleid = roles[0];
                highestrole = rolelist[highestrole];
                if (highestrole == undefined) highestrole = "/";
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                }
                userop = ``;
                if(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin")){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Manage
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">Roles</a></li>
                        <li><a class="dropdown-item clickable" onclick="EditPointsShow(${userid}, '${name}')">Points</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item clickable" onclick="DismissMemberShow(${userid}, '${name}')" style="color:red">Dismiss</a></li>
                    </ul>
                </div>`;
                } else if(userPerm.includes(`division`)){
                    userop = `<div class="dropdown">
                    <a class="dropdown-toggle clickable" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Manage
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                        <li><a class="dropdown-item clickable" onclick="EditRolesShow(${userid})">Roles</a></li>
                    </ul>
                </div>`;
                }
                data.push([`<img src='${src}' width="40px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');">`, `<a style="cursor: pointer" onclick="LoadUserProfile(${userid})">${name}</a>`, `${highestrole}`, userop]);
            }

            PushTable("#table_member_list", data, total_pages, "LoadMemberList();");
        },
        error: function (data) {
            UnlockBtn("#button-member-list-search");
            AjaxError(data);
        }
    })
}

function EditRolesShow(uid){
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?userid=" + uid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            d = data.response;
            roles = d.roles;

            roled = `
            <div>
                <label class="form-label">Roles</label>
                <br>
            </div>`;
            
            roleids = Object.keys(rolelist);
            if(!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin"))&&userPerm.includes("division")){
                division_roles = [];
                divisions_ids = Object.keys(divisions);
                for(var i = 0 ; i < divisions_ids.length ; i++){
                    division_roles.push(divisions[divisions_ids[i]].role_id);
                }
            }
            for (var i = 0; i < roleids.length; i++) {
                if(i>0&&i%2==0) roled += "<br>";
                checked = "";
                if(roles.includes(roleids[i])) checked = "checked";
                disabled = "";
                if (roleids[i] <= highestroleid) disabled = "disabled";
                if(!(userPerm.includes("hr") || userPerm.includes("hrm") || userPerm.includes("admin"))&&userPerm.includes("division")){
                    if(!division_roles.includes(roleids[i])) disabled="disabled";
                }
                roled += `
                <div class="form-check mb-2" style="width:49.5%;display:inline-block">
                    <input class="form-check-input" type="checkbox" value="" id="edit-roles-${roleids[i]}" name="edit-roles" ${checked} ${disabled}>
                    <label class="form-check-label" for="edit-roles-${roleids[i]}">
                        ${rolelist[roleids[i]]}
                    </label>
                </div>`;
            }
            
            modalid = ShowModal(`${d.name} (${d.userid})`, roled, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-roles" type="button" class="btn btn-primary" onclick="EditRoles(${d.userid});">Update</button>`);
            InitModal("edit_roles", modalid);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditRoles(uid) {
    LockBtn("#button-edit-roles", "Updating...");

    d = $('input[name="edit-roles"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("edit-roles-", ""));
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": uid,
            "roles": roles.join(",")
        },
        success: function (data) {
            UnlockBtn("#button-edit-roles");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", "Member roles updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-roles");
            AjaxError(data);
        }
    });
}

function EditPointsShow(uid, name){
    div = `
    <label class="form-label">Points</label>
    <div class="input-group mb-2">
        <span class="input-group-text" id="edit-points-distance-label">Distance</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-distance" placeholder="0" aria-describedby="edit-points-distance-label">
    </div>
    <div class="input-group mb-3">
        <span class="input-group-text" id="edit-points-myth-label">Myth</span>
        <input type="number" class="form-control bg-dark text-white" id="edit-points-myth" placeholder="0" aria-describedby="edit-points-myth-label">
    </div>`;
    modalid = ShowModal(`${name} (${uid})`, div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-edit-points" type="button" class="btn btn-primary" onclick="EditPoints(${uid});">Update</button>`);
    InitModal("edit_points", modalid);
}

function EditPoints(uid) {
    LockBtn("#button-edit-points");

    distance = $("#edit-points-distance").val();
    mythpoint = $("#edit-points-myth").val();
    if (!isNumber(distance)) distance = 0;
    if (!isNumber(mythpoint)) mythpoint = 0;
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/point",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": uid,
            "distance": distance,
            "mythpoint": mythpoint,
        },
        success: function (data) {
            UnlockBtn("#button-edit-points");
            if (data.error) return AjaxError(data);
            toastNotification("success", "Success!", "Member points updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-edit-points");
            AjaxError(data);
        }
    });
}

function DismissMemberShow(uid, name){
    if(uid == localStorage.getItem("userid")) return toastNotification("error", "Error", "You cannot dismiss yourself!", 5000);
    modalid = ShowModal(`Dismiss Member`, `<p>Are you sure you want to dismiss this member?</p><p><i>${name} (User ID: ${uid})</i></p><br><p>Dismissing ${name} will erase all their delivery log (marking them as by unknown user) and remove them from Navio company. This <b>cannot</b> be undone.`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-dismiss-member" type="button" class="btn btn-danger" onclick="DismissMember(${uid});">Dismiss</button>`);
    InitModal("dismiss_member", modalid);
}

function DismissMember(uid){
    LockBtn("#button-dismiss-member", "Dismissing...");
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/dismiss?userid=" + uid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#button-dismiss-member");
            if (data.error) return AjaxError(data);
            LoadMemberList(noplaceholder=true);
            toastNotification("success", "Success", "Member dismissed!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-dismiss-member");
            AjaxError(data);
        }
    });
}

function LoadRanking(){
    $("#ranking-tab").children().remove();
    for(var i = 0 ; i < 3 ; i++){
        t = `<div class="row">`;
        for(var j = 0 ; j < 3 ; j++){
            t += GenCard(`<span class="placeholder" style="width:150px"></span>`, `<span class="placeholder" style="width:100px"></span>`);
        }
        t += `</div>`;
        $("#ranking-tab").append(t);
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?point_types=distance,event,division,myth&userids=" + localStorage.getItem("userid"),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            if (data.error) AjaxError(data);
            d = data.response.list[0];
            rank = point2rank(d.points.total_no_limit);
            $("#ranking-tab").children().remove();
            t = `<div class="row">`;
            t += GenCard(`My Points`, TSeparator(d.points.total_no_limit) + " - " + rank + `
            <button id="button-rankings-role" type="button" class="btn btn-sm btn-primary button-rankings-role" onclick="GetDiscordRankRole();">Get Discord Role</button>`);
            k = Object.keys(RANKING);
            for(var i = 0 ; i < Math.min(k.length, 2) ; i++){
                t += GenCard(RANKING[k[i]], `${TSeparator(k[i])} Points`);
            }
            t += `</div>`;
            if(t.length>2){
                for(var i = 2, j = 2; i < k.length ; i = j){
                    t += `<div class="row">`;
                    for(j = i ; j < Math.min(k.length, i + 3) ; j++){
                        t += GenCard(RANKING[k[j]], `${TSeparator(k[j])} Points`);
                    }
                    t += `</div>`;
                }
            }
            $("#ranking-tab").append(t);
        }, error: function(data){
            AjaxError(data);
        }
    });
}

function GetDiscordRankRole() {
    LockBtn(".button-rankings-role", "Getting...");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles/rank",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn(".button-rankings-role");
            if (data.error) return AjaxError(data);
            else return toastNotification("success", "Success", "Discord role assigned!", 5000, false);
        },
        error: function (data) {
            UnlockBtn(".button-rankings-role");
            AjaxError(data);
        }
    })
}

function UserResign() {
    if ($("#resignBtn").html() != "Confirm?") {
        $("#resignBtn").html("Confirm?");
        return;
    }

    GeneralLoad();
    LockBtn("#resignBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/resign",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#resignBtn");
            if (data.error) return AjaxError(data);

            localStorage.clear();
            Swal.fire({
                title: "Resigned",
                html: "Sorry to see you leave, good luck with your future career!",
                icon: 'info',
                confirmButtonText: 'Close'
            });

            setTimeout(function(){window.location.reload()}, 5000);
        },
        error: function (data) {
            UnlockBtn("#resignBtn");
            AjaxError(data);
        }
    });
}

useridCurrentProfile = -1;

function LoadUserProfile(userid) {
    if (userid < 0) return;

    $("#overview-chart-scale-1").attr("onclick", `chartscale=1;LoadChart(${userid});`);
    $("#overview-chart-scale-2").attr("onclick", `chartscale=2;LoadChart(${userid});`);
    $("#overview-chart-scale-3").attr("onclick", `chartscale=3;LoadChart(${userid});`);
    $("#overview-chart-sum").attr("onclick", `addup=1-addup;LoadChart(${userid});`);
    LoadChart(userid);

    $("#udpages").val("1");
    useridCurrentProfile = userid;

    LoadUserDeliveryList(userid);

    if (userid == parseInt(localStorage.getItem("userid"))) { // current user
        LoadUserSessions();
        $("#userSessions").show();
    } else {
        $("#userSessions").hide();
    }

    if (curtab != "#ProfileTab") {
        ShowTab("#ProfileTab", userid);
        return;
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?userid=" + String(userid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            window.history.pushState("", "", '/member/' + userid);
            if (data.error) {
                ShowTab("#overview-tab", "#button-overview-tab");
                return AjaxError(data);
            }

            d = data.response;
            $("#account_id").html(d.userid + " (" + getDateTime(d.join_timestamp * 1000) + ")");
            if (d.email != undefined) {
                $("#account_email").html(d.email);
                $(".email_private").show();
            } else $(".email_private").hide();
            $("#account_discordid").html(d.discordid);
            $("#account_steamid").html(d.steamid);
            $("#account_truckersmpid").html(d.truckersmpid);
            info = "";
            info += "<h1 style='font-size:40px'><b>" + d.name + "</b></h1>";
            info += "" + parseMarkdown(d.bio);
            $("#userProfileDetail").html(info);
            
            avatar = GetAvatarSrc(d.discordid, d.avatar);
            $("#UserProfileAvatar").attr("src", avatar);
            
            roles = d.roles;
            rtxt = "";
            for (var i = 0; i < roles.length; i++) {
                if (roles[i] == 0) color = "rgba(127,127,127,0.4)";
                else if (roles[i] < 10) color = vtccolor;
                else if (roles[i] <= 98) color = "#ff0000";
                else if (roles[i] == 99) color = "#4e6f7b";
                else if (roles[i] == 100) color = vtccolor;
                else if (roles[i] > 100) color = "grey";
                if (roles[i] == 223 || roles[i] == 224) color = "#ffff77;color:black;";
                if (roles[i] == 1000) color = "#9146ff";
                if (rolelist[roles[i]] != undefined) rtxt += `<span class='tag' title="${rolelist[roles[i]]}" style='max-width:fit-content;margin-bottom:15px;display:inline;background-color:${color};white-space:nowrap;'>` + rolelist[roles[i]] + "</span> ";
                else rtxt += "Unknown Role (ID " + roles[i] + "), ";
            }
            rtxt = rtxt.substring(0, rtxt.length - 2);
            $("#profileRoles").html(rtxt);

            if (d.userid == localStorage.getItem("userid")) {
                $("#UpdateAM").show();
                $(".account_private").show();
                $("#Security").show();
                $("#biocontent").val(d.bio);
                if(d.mfa == false){
                    $("#button-enable-mfa-modal").show();
                    $("#p-mfa-enabled").hide();
                } else {
                    $("#button-enable-mfa-modal").hide();
                    $("#p-mfa-enabled").show();
                }
            } else {
                $("#UpdateAM").hide();
                $(".account_private").hide();
                $("#Security").hide();
            }

            $("#user_statistics").html("Loading...");
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/dlog/statistics/summary?userid=" + String(userid),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: async function (data) {
                    if (!data.error) {
                        d = data.response;
                        info = "";
                        info += `<p><b>Jobs</b>: ${TSeparator(d.job.all.sum.tot)}</p><p> ${TSeparator(d.job.all.ets2.tot)} in ETS2 + ${TSeparator(d.job.all.ats.tot)} in ATS</p>`;
                        info += ` <p> ${TSeparator(d.job.delivered.sum.tot)} Delivered + ${TSeparator(d.job.cancelled.sum.tot)} Cancelled</p><br>`;

                        dtot = TSeparator(d.distance.all.sum.tot * distance_ratio) + distance_unit_txt;
                        dets2 = TSeparator(d.distance.all.ets2.tot * distance_ratio) + distance_unit_txt;
                        dats = TSeparator(d.distance.all.ats.tot * distance_ratio) + distance_unit_txt;
                        info += `<p><b>Distance</b>: ${dtot}</p><p> ${dets2} in ETS2 + ${dats} in ATS</p><br>`;

                        dtot = TSeparator(d.fuel.all.sum.tot * fuel_ratio) + fuel_unit_txt;
                        dets2 = TSeparator(d.fuel.all.ets2.tot * fuel_ratio) + fuel_unit_txt;
                        dats = TSeparator(d.fuel.all.ats.tot * fuel_ratio) + fuel_unit_txt;
                        info += `<p><b>Fuel</b>: ${dtot}</p><p> ${dets2} in ETS2 + ${dats} in ATS</p><br>`;

                        info += "<p><b>Profit</b>: €" + TSeparator(d.profit.all.tot.euro) + " (ETS2) + $" + TSeparator(d.profit.all.tot.dollar) + " (ATS)</p>";
                        info += "<p><b>Including cancellation penalty</b>: -€" + TSeparator(-d.profit.cancelled.tot.euro) + " - $" + TSeparator(-d.profit.cancelled.tot.dollar) + "</p><br>";

                        $("#user_statistics").html(info);

                        $.ajax({
                            url: apidomain + "/" + vtcprefix + "/dlog/leaderboard?point_types=distance,event,division,myth&userids=" + String(userid),
                            type: "GET",
                            dataType: "json",
                            headers: {
                                "Authorization": "Bearer " + localStorage.getItem("token")
                            },
                            success: async function (data) {
                                if (!data.error) {
                                    info += "<hr><br>";
                                    d = data.response.list[0];
                                    info += "<p><b>Points</b></p>";
                                    info += `<p>Distance: ${d.points.distance}</p>`;
                                    info += `<p>Event: ${d.points.event}</p>`;
                                    info += `<p>Division: ${d.points.division}</p>`;
                                    info += `<p>Myth: ${d.points.myth}</p>`;
                                    info += `<p><b>Total: ${d.points.total_no_limit}</b></p>`;
                                    info += `<p><b>Rank: #${d.points.rank_no_limit} (${point2rank(d.points.total_no_limit)})</b></p>`;
                                    if (String(userid) == localStorage.getItem("userid")) {
                                        info += `
                                    <button type="button" style="font-size:16px;padding:10px;padding-top:5px;padding-bottom:5px"
                                        class="requestRoleBtn w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                                        onclick="GetDiscordRankRole()">Request Discord Role</button>`;
                                    }
                                    $("#user_statistics").html(info);
                                }
                            },
                            error: async function (data) {
                                $("#user_statistics").html(info);
                            }
                        });
                    }
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

mfa_secret = "";
function EnableMFAModal(){
    mfa_secret = RandomString(16).toUpperCase();
    Swal.fire({
        title: "Enable MFA",
        html: `<p style="text-align:left">Please download MFA app, enter the secret <b>${mfa_secret}</b>, then enter the generated OTP below. (QR Code is not supported yet).</p><br>
        <p id="p-mfa-message" style="color:red;text-align:left"></p>
        <input id="input-mfa-otp"
            class="block w-full px-4 py-3 mb-2 text-sm placeholder-gray-500 bg-white border rounded"
            type="text" name="" placeholder="000 000">
        <button type="button" id="button-enable-mfa" style="float:right"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="EnableMFA()">Enable</button>`,
        icon: 'info',
        showConfirmButton: false,
        confirmButtonText: 'Close'
    });
}

function EnableMFA(){
    otp = $("#input-mfa-otp").val();
    if(!isNumber(otp) || otp.length != 6){
        $("#p-mfa-message").html("Invalid OTP!");
        return;
    }

    GeneralLoad();
    LockBtn("#button-enable-mfa");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/auth/mfa",
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            secret: mfa_secret,
            otp: otp
        },
        success: function (data) {
            UnlockBtn("#button-enable-mfa");
            if (data.error){
                $("#p-mfa-message").html(data.descriptor);
                return;
            }
            
            toastNotification("success", "Success", "MFA Enabled.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            $("#p-mfa-message").html(JSON.parse(data.responseText).descriptor);
        }
    });
}
