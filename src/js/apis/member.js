function LoadXOfTheMonth(){
    if($("#dotmdiv").is(":visible") || $("#sotmdiv").is(":visible")) return;
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
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                distance = TSeparator(parseInt(user.distance * distance_ratio));
                $("#dotm").html(GetAvatarImg(src, user.userid, user.name));
                $("#x_of_the_month").show();
                $("#dotmdiv").show();
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
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                distance = TSeparator(parseInt(user.distance * distance_ratio));
                $("#sotm").html(GetAvatarImg(src, user.userid, user.name));
                $("#x_of_the_month").show();
                $("#sotmdiv").show();
            }
        })
    }
}

function GetDiscordRankRole() {
    GeneralLoad();
    LockBtn(".requestRoleBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles/rank",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn(".requestRoleBtn");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            else return toastFactory("success", "Success", "You have got your new role!", 5000, false);
        },
        error: function (data) {
            UnlockBtn(".requestRoleBtn");
            AjaxError(data);
        }
    })
}

function LoadMemberList() {
    GeneralLoad();
    LockBtn("#loadMemberListBtn", btntxt = "...");
    InitTable("#table_member_list", "LoadMemberList();");

    page = parseInt($("#table_member_list_page_input").val())
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/list?page=" + page + "&order_by=highest_role&order=desc&name=" + $("#searchname").val(),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#loadMemberListBtn");
            if (data.error) return AjaxError(data);

            memberList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < memberList.length; i++) {
                user = memberList[i];
                highestrole = user.highestrole;
                highestrole = rolelist[highestrole];
                if (highestrole == undefined) highestrole = "/";
                discordid = user.discordid;
                avatar = GetAvatarSrc(discordid, user.avatar);
                totalpnt = parseInt(user.totalpnt);
                
                data.push([`${user.userid}`, `${GetAvatarImg(avatar, user.userid, user.name)}`, `${highestrole}`]);
            }

            PushTable("#table_member_list", data, total_pages, "LoadMemberList();");
        },
        error: function (data) {
            UnlockBtn("#loadMemberListBtn");
            AjaxError(data);
        }
    })
}

useridToUpdateRole = -1;

function GetMemberRoles() {
    GeneralLoad();
    LockBtn("#fetchRolesBtn");

    s = $("#memberroleid").val();
    useridToUpdateRole = s.substr(s.indexOf("(")+1,s.indexOf(")")-s.indexOf("(")-1);
    $("#rolelist").children().children().prop("checked", false);
    
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user?userid=" + String(useridToUpdateRole),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchRolesBtn");
            if (data.error) return AjaxError(data);
            d = data.response;
            roles = d.roles;
            $("#memberrolename").html(d.name + " (" + useridToUpdateRole + ")");
            for (var i = 0; i < roles.length; i++)
                $("#role" + roles[i]).prop("checked", true);
            toastFactory("success", "Success!", "Existing roles are fetched!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#fetchRolesBtn");
            AjaxError(data);
        }
    });
}

function UpdateMemberRoles() {
    GeneralLoad();
    LockBtn("#updateMemberRolesBtn");

    d = $('input[name="assignrole"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("role", ""));
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/roles",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": useridToUpdateRole,
            "roles": roles.join(",")
        },
        success: function (data) {
            UnlockBtn("#updateMemberRolesBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "Member roles updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateMemberRolesBtn");
            AjaxError(data);
        }
    });
}

function UpdateMemberPoints() {
    s = $("#memberpntid").val();
    userid = s.substr(s.indexOf("(")+1,s.indexOf(")")-s.indexOf("(")-1);
    if (!isNumber(userid)) {
        toastFactory("error", "Error:", "Invalid User ID", 5000, false);
        return;
    }

    GeneralLoad();
    LockBtn("#updateMemberPointsBtn");

    distance = $("#memberpntdistance").val();
    mythpoint = $("#memberpntmyth").val();
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
            "userid": userid,
            "distance": distance,
            "mythpoint": mythpoint,
        },
        success: function (data) {
            UnlockBtn("#updateMemberPointsBtn");
            if (data.error) return AjaxError(data);
            toastFactory("success", "Success!", "Member points updated!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#updateMemberPointsBtn");
            AjaxError(data);
        }
    });
}

useridToDismiss = 0;

function DismissUser() {
    s = $("#dismissUserID").val();
    userid = s.substr(s.indexOf("(")+1,s.indexOf(")")-s.indexOf("(")-1);
    GeneralLoad();

    if ($("#dismissbtn").html() != "Confirm?" || useridToDismiss != userid) {
        LockBtn("#dismissbtn");
        
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/user?userid=" + String(userid),
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#dismissbtn");
                if (data.error) return AjaxError(data);

                d = data.response;
                roles = d.roles;
                $("#dismissbtn").html("Confirm?");
                useridToDismiss = userid;
            },
            error: function (data) {
                UnlockBtn("#dismissbtn");
                AjaxError(data);
            }
        });
        return;
    } else {
        LockBtn("#dismissbtn");
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member/dismiss?userid=" + String(userid),
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                UnlockBtn("#dismissbtn");
                $("#dismissUserID").val("");
                if (data.error) return AjaxError(data);
                toastFactory("success", "Success", "Member dismissed", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#dismissbtn");
                AjaxError(data);
            }
        });
    }
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

    $("#aucs1").attr("onclick", `chartscale=1;LoadChart(${userid});`);
    $("#aucs2").attr("onclick", `chartscale=2;LoadChart(${userid});`);
    $("#aucs3").attr("onclick", `chartscale=3;LoadChart(${userid});`);
    $("#aaddup1").attr("onclick", `addup=1-addup;LoadChart(${userid});`);
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
                                    info += `<p>Distance: ${d.distance}</p>`;
                                    info += `<p>Event: ${d.event}</p>`;
                                    info += `<p>Division: ${d.division}</p>`;
                                    info += `<p>Myth: ${d.myth}</p>`;
                                    info += `<p><b>Total: ${d.total_no_limit}</b></p>`;
                                    info += `<p><b>Rank: #${d.rank_no_limit} (${point2rank(d.total_no_limit)})</b></p>`;
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
            
            toastFactory("success", "Success", "MFA Enabled.", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-enable-mfa");
            $("#p-mfa-message").html(JSON.parse(data.responseText).descriptor);
        }
    });
}