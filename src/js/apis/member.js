function requestRole() {
    GeneralLoad();
    $("#requestRoleBtn").html("Working...");
    $("#requestRoleBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/role/rank",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#requestRoleBtn").html("Request Role");
            $("#requestRoleBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            else return toastFactory("success", "Success", "You have got your new role!", 5000, false);
        },
        error: function (data) {
            $("#loadLeaderboardBtn").html("Go");
            $("#loadLeaderboardBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load leaderboard. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}
function loadMembers(recurse = true) {
    page = parseInt($("#mpages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;
    GeneralLoad();
    $("#searchMemberBtn").html("...");
    $("#searchMemberBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/members?page=" + page + "&query=" + $("#searchname").val(),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#searchMemberBtn").html("Go");
            $("#searchMemberBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#membersTable").empty();
            const users = data.response.list;

            if (users.length == 0) {
                $("#membersTableHead").hide();
                $("#membersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#mpages").val(1);
                if (recurse) loadMembers(recurse = false);
                return;
            }
            $("#membersTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#mpages").val(1);
                if (recurse) loadMembers(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#mpages").val(1);
                page = 1;
            }
            $("#mtotpages").html(totpage);
            $("#membersTableControl").children().remove();
            $("#membersTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#mpages').val(1);loadMembers();">1</button>`);
            if (page > 3) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#mpages').val(${i});loadMembers();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#membersTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#mpages').val(${totpage});loadMembers();">${totpage}</button>`);
            }

            for (i = 0; i < users.length; i++) {
                const user = users[i];
                // Fill the table using this format: 
                // <tr class="text-sm">
                //  <td class="py-5 px-6 font-medium">id here</td>
                //    <td class="py-5 px-6 font-medium">name here</td>
                //  </tr>
                //
                highestrole = user.highestrole;
                color = "blue"; // Member
                if (highestrole < 100) color = "#ff0000"; // Staff
                if (highestrole <= 9) color = vtccolor; // Leadership
                if (highestrole > 100 || highestrole == 99) color = "grey"; // External / LOA
                highestrole = rolelist[highestrole];
                if (highestrole == undefined) highestrole = "/";
                discordid = user.discordid;
                avatar = user.avatar;
                totalpnt = parseInt(user.totalpnt);
                src = "";
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
                } else {
                    avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                }
                $("#membersTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">${user.userid}</td>
              <td class="py-5 px-6 font-medium" style="color:${color}">
                <a style="cursor:pointer;" onclick="loadProfile('${user.userid}')">
                <img src='${src}' width="20px" style="display:inline;border-radius:100%" onerror="$(this).attr('src','https://drivershub-cdn.charlws.com/assets/`+vtcprefix+`/logo.png');"> ${user.name}</a></td>
              <td class="py-5 px-6 font-medium" style="color:${color}">${highestrole}</td>
            </tr>`);
            }

            user = data.response.staff_of_the_month;
            discordid = user.discordid;
            avatar = user.avatar;
            src = "";
            if (avatar != null) {
                if (avatar.startsWith("a_"))
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                else
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            } else {
                avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
            }
            $("#sotm").html(`<a style='cursor:pointer' onclick='loadProfile("${user.userid}")'>${user.name}</a>`);
            $("#sotma").attr("src", src);

            user = data.response.driver_of_the_month;
            discordid = user.discordid;
            avatar = user.avatar;
            src = "";
            if (avatar != null) {
                if (avatar.startsWith("a_"))
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".gif";
                else
                    src = "https://cdn.discordapp.com/avatars/" + discordid + "/" + avatar + ".png";
            }
            $("#dotm").html(`<a style='cursor:pointer' onclick='loadProfile("${user.userid}")'>${user.name}</a>`);
            $("#dotma").attr("src", src);

        },
        error: function (data) {
            $("#searchMemberBtn").html("Go");
            $("#searchMemberBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(`Failed to load members. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}
function memberDetail(userid) {
    $("#MemberInfoBtn" + userid).attr("disabled", "disabled");
    $("#MemberInfoBtn" + userid).html("Loading...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member?userid=" + String(userid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            info = "";
            if (!data.error) {
                d = data.response;
                roles = d.roles;
                rtxt = "";
                for (var i = 0; i < roles.length; i++)
                    if (rolelist[roles[i]] != undefined) rtxt += rolelist[roles[i]] + ", ";
                    else rtxt += "Unknown Role (ID " + roles[i] + "), ";
                rtxt = rtxt.substring(0, rtxt.length - 2);
                info += "<p style='text-align:left'><b>Name:</b> " + d.name + "</p>";
                info += "<p style='text-align:left'><b>User ID:</b> " + d.userid + "</p>"
                info += "<p style='text-align:left'><b>Roles:</b> " + rtxt + "</p>";
                if (d.email != undefined) info += "<p style='text-align:left'><b>Email:</b> " + d.email + "</p>";
                info += "<p style='text-align:left'><b>Discord ID:</b> " + d.discordid + "</p>";
                info +=
                    "<p style='text-align:left'><b>TruckersMP ID:</b> <a href='https://truckersmp.com/user/" +
                    d.truckersmpid + "'>" + d.truckersmpid + "</a></p>";
                info +=
                    "<p style='text-align:left'><b>Steam ID:</b> <a href='https://steamcommunity.com/profiles/" +
                    d.steamid + "'>" + d.steamid + "</a></p>";
                info += "<br><p style='text-align:left'><b>Join:</b> " + getDateTime(d.join * 1000) + "</p>";
                info += "<p style='text-align:left'><b>Total Jobs:</b> " + d.totjobs + "</p>";
                if (distance_unit == "metric") {
                    info += "<p style='text-align:left'><b>Distance Driven:</b> " + parseInt(d.distance) + "mi</p>";
                } else if (distance_unit == "imperial") {
                    info += "<p style='text-align:left'><b>Distance Driven:</b> " + parseInt(d.distance * distance_ratio) + "km</p>";
                }
                info += "<p style='text-align:left'><b>Fuel Consumed:</b> " + parseInt(d.fuel) + "L</p>";
                info += "<p style='text-align:left'><b>XP Earned:</b> " + d.xp + "</p>";
                info += "<p style='text-align:left'><b>Event Points:</b> " + parseInt(d.eventpnt) + "</p>";
                info += "<p style='text-align:left'><b>Division Points:</b> " + parseInt(d.divisionpnt) + "</p>";
                if (company_distance_unit == "metric") {
                    info += "<p style='text-align:left'><b>Total Points:</b> " + parseInt(parseInt(d.distance) + parseInt(d.eventpnt) + parseInt(d.divisionpnt)) +
                        "</p>";
                } else if (company_distance_unit == "imperial") {
                    info += "<p style='text-align:left'><b>Total Points:</b> " + parseInt(parseInt(d.distance) * 0.621371 + parseInt(d.eventpnt) + parseInt(d.divisionpnt)) +
                        "</p>";
                }

            }
            Swal.fire({
                title: d.name,
                html: info,
                icon: 'info',
                confirmButtonText: 'Close'
            })
            $("#MemberInfoBtn" + userid).removeAttr("disabled");
            $("#MemberInfoBtn" + userid).html("Details");
        },
        error: function (data) {
            $("#MemberInfoBtn" + userid).removeAttr("disabled");
            $("#MemberInfoBtn" + userid).html("Details");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}
lastfetch = -1;

function fetchRoles() {
    val = $("#memberroleid").val();
    GeneralLoad();
    $("#fetchRolesBtn").html("Working...");
    $("#fetchRolesBtn").attr("disabled", "disabled");
    $("#rolelist").children().children().prop("checked", false);
    $("#memberrolename").html("");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/members?page=1&query=" + val,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#fetchRolesBtn").html("Fetch Existing Roles");
            $("#fetchRolesBtn").removeAttr("disabled");
            d = data.response.list;
            if (d.length == 0) {
                return toastFactory("error", "Error:", "No member with name " + val + " found.", 5000, false);
            }
            lastfetch = d[0].userid;

            $.ajax({
                url: apidomain + "/" + vtcprefix + "/member?userid=" + String(lastfetch),
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    $("#fetchRolesBtn").html("Fetch Existing Roles");
                    $("#fetchRolesBtn").removeAttr("disabled");
                    if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                    info = "";
                    if (!data.error) {
                        userid = lastfetch;
                        d = data.response;
                        roles = d.roles;
                        rtxt = "";
                        $("#memberrolename").html(d.name + " (" + userid + ")");
                        for (var i = 0; i < roles.length; i++)
                            $("#role" + roles[i]).prop("checked", true);
                        return toastFactory("success", "Success!", "Existing roles are fetched!", 5000, false);
                    }
                },
                error: function (data) {
                    $("#fetchRolesBtn").html("Fetch Existing Roles");
                    $("#fetchRolesBtn").removeAttr("disabled");
                    toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                        false);
                    console.warn(
                        `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
                    console.log(data);
                }
            });
        },
        error: function (data) {
            return toastFactory("error", "Error:", "Failed to get User ID", 5000, false);
        }
    })
}

function updateMemberRoles() {
    userid = lastfetch;
    GeneralLoad();
    $("#updateMemberRolesBtn").html("Working...");
    $("#updateMemberRolesBtn").attr("disabled", "disabled");
    d = $('input[name="assignrole"]:checked');
    roles = [];
    for (var i = 0; i < d.length; i++) {
        roles.push(d[i].id.replaceAll("role", ""));
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/role",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": userid,
            "roles": roles.join(",")
        },
        success: function (data) {
            $("#updateMemberRolesBtn").html("Update");
            $("#updateMemberRolesBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                return toastFactory("success", "Success!", "Member roles updated!", 5000, false);
            }
        },
        error: function (data) {
            $("#updateMemberRolesBtn").html("Update");
            $("#updateMemberRolesBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function updateMemberPoints() {
    userid = $("#memberpntid").val();
    if (!isNumber(userid)) {
        toastFactory("error", "Error:", "Please enter a valid user ID.", 5000, false);
        return;
    }
    distance = $("#memberpntdistance").val();
    eventpnt = $("#memberpntevent").val();
    divisionpnt = $("#memberpntdivision").val();
    if (!isNumber(distance)) {
        distance = 0;
    }
    if (!isNumber(eventpnt)) {
        eventpnt = 0;
    }
    if (!isNumber(divisionpnt)) {
        divisionpnt = 0;
    }
    GeneralLoad();
    $("#updateMemberPointsBtn").html("Working...");
    $("#updateMemberPointsBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/point",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "userid": userid,
            "distance": distance,
            "eventpnt": eventpnt,
            "divisionpnt": divisionpnt
        },
        success: function (data) {
            $("#updateMemberPointsBtn").html("Update");
            $("#updateMemberPointsBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                return toastFactory("success", "Success!", "Member points updated!", 5000, false);
            }
        },
        error: function (data) {
            $("#updateMemberPointsBtn").html("Update");
            $("#updateMemberPointsBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

dismissid = 0;

function dismissUser() {
    userid = $("#dismissUserID").val();
    if ($("#dismissbtn").html() != "Confirm?" || dismissid != userid) {
        $("#dismissbtn").html("Fetching name...");
        $("#dismissbtn").attr("disabled", "disabled");
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/member?userid=" + String(userid),
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: function (data) {
                $("#dismissbtn").html("Dismiss");
                $("#dismissbtn").removeAttr("disabled");
                $("#memberdismissname").html("");
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                info = "";
                if (!data.error) {
                    lastfetch = userid;
                    d = data.response;
                    roles = d.roles;
                    rtxt = "";
                    $("#memberdismissname").html("Dismiss <b>" + d.name + "</b>?");
                    $("#dismissbtn").html("Confirm?");
                    dismissid = userid;
                }
            },
            error: function (data) {
                $("#dismissbtn").html("Dismiss");
                $("#dismissbtn").removeAttr("disabled");
                toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                    false);
                console.warn(
                    `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
                console.log(data);
            }
        });
        return;
    }
    GeneralLoad();
    $("#dismissbtn").html("Working...");
    $("#dismissbtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/dismiss?userid=" + String(userid),
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#memberdismissname").html("");
            $("#dismissUserID").val("");
            $("#dismissbtn").removeAttr("disabled");
            $("#dismissbtn").html("Dismiss");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000,
                false);
            return toastFactory("success", "Success", "Member dismissed", 5000, false);
        },
        error: function (data) {
            $("#dismissbtn").removeAttr("disabled");
            $("#dismissbtn").html("Dismiss");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to dismiss member. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function updateBio() {
    bio = $("#biocontent").val();
    $("#updateBioBtn").html("Updating...");
    $("#updateBioBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/user/bio",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "bio": bio
        },
        success: function (data) {
            $("#updateBioBtn").html("Update");
            $("#updateBioBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                loadProfile(localStorage.getItem("userid"));
                return toastFactory("success", "Success!", "About Me updated!", 5000, false);
            }
        },
        error: function (data) {
            $("#updateBioBtn").html("Update");
            $("#updateBioBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to update About Me. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function genNewAppToken() {
    GeneralLoad();
    $("#genAppTokenBtn").html("Working...");
    $("#genAppTokenBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/token/application",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#genAppTokenBtn").html("Reset Token");
            $("#genAppTokenBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#userAppToken").html(data.response.token);
            return toastFactory("success", "Success", "Application Token generated!", 5000, false);
        },
        error: function (data) {
            $("#genAppTokenBtn").html("Reset Token");
            $("#genAppTokenBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to generate app token. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

function resign() {
    if ($("#resignBtn").html() != "Confirm?") {
        $("#resignBtn").html("Confirm?");
        return;
    }
    GeneralLoad();
    $("#resignBtn").html("Working...");
    $("#resignBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/resign",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#resignBtn").html("Resign");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                localStorage.clear();
                Swal.fire({
                    title: "Resigned",
                    html: "Sorry to see you leave, good luck with your future career!",
                    icon: 'info',
                    confirmButtonText: 'Close'
                })
            }
        },
        error: function (data) {
            $("#resignBtn").html("Resign");
            $("#resignBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to resign. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}
function loadProfile(userid) {
    if (userid < 0) {
        return;
    }
    $("#aucs1").attr("onclick", `chartscale=1;loadChart(${userid});`);
    $("#aucs2").attr("onclick", `chartscale=2;loadChart(${userid});`);
    $("#aucs3").attr("onclick", `chartscale=3;loadChart(${userid});`);
    $("#aaddup1").attr("onclick", `addup=1-addup;loadChart(${userid});`);
    loadChart(userid);
    $("#udpages").val("1");
    curprofile = userid;
    loadUserDelivery(userid);
    if (curtab != "#ProfileTab") {
        ShowTab("#ProfileTab", userid);
        return;
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member?userid=" + String(userid),
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) {
                ShowTab("#HomeTab", "#HomeTabBtn");
                return toastFactory("error", "Error:", data.descriptor, 5000, false);
            }
            if (!data.error) {
                window.history.pushState("", "", '/member/' + userid);
                d = data.response;
                $("#account_id").html(d.userid + " (" + getDateTime(d.join * 1000) + ")");
                if(d.email != undefined){$("#account_email").html(d.email);$(".email_private").show();}
                else $(".email_private").hide();
                $("#account_discordid").html(d.discordid);
                $("#account_steamid").html(d.steamid);
                $("#account_truckersmpid").html(d.truckersmpid);
                info = "";
                info += "<h1 style='font-size:40px'><b>" + d.name + "</b></h1>";
                info += "" + parseMarkdown(d.bio);
                $("#userProfileDetail").html(info);

                info = "";
                info += "<p><b>Total Jobs:</b> " + d.totjobs + "</p>";
                if (distance_unit == "metric") {
                    info += "<p><b>Distance Driven:</b> " + parseInt(d.distance) + "km</p>";
                } else if (distance_unit == "imperial") {
                    info += "<p><b>Distance Driven:</b> " + parseInt(parseInt(d.distance) * distance_ratio) + "mi</p>";
                }
                info += "<p><b>Fuel Consumed:</b> " + parseInt(d.fuel) + "L</p>";
                info += "<p><b>XP Earned:</b> " + d.xp + "</p>";
                info += "<p><b>Event Points:</b> " + parseInt(d.eventpnt) + "</p>";
                info += "<p style='text-align:left'><b>Division Points:</b> " + parseInt(d.divisionpnt) + "</p>";
                if (company_distance_unit == "metric") {
                    info += "<p style='text-align:left'><b>Total Points:</b> " + parseInt(parseInt(d.distance) + parseInt(d.eventpnt) + parseInt(d.divisionpnt)) +
                        "</p>";
                } else if (company_distance_unit == "imperial") {
                    info += "<p style='text-align:left'><b>Total Points:</b> " + parseInt(parseInt(d.distance) * 0.621371 + parseInt(d.eventpnt) + parseInt(d.divisionpnt)) +
                        "</p>";
                }
                $("#user_statistics").html(info);

                avatar = d.avatar;
                if (avatar != null) {
                    if (avatar.startsWith("a_"))
                        src = "https://cdn.discordapp.com/avatars/" + d.discordid + "/" + avatar + ".gif";
                    else
                        src = "https://cdn.discordapp.com/avatars/" + d.discordid + "/" + avatar + ".png";
                    $("#UserProfileAvatar").attr("src", src);
                } else {
                    avatar = "https://drivershub-cdn.charlws.com/assets/"+vtcprefix+"/logo.png";
                }
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
                } else {
                    $("#UpdateAM").hide();
                    $(".account_private").hide();
                    $("#Security").hide();
                }
            }
        },
        error: function (data) {
            ShowTab("#HomeTab", "#HomeTabBtn");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to load member details. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}
function resign() {
    if ($("#resignBtn").html() != "Confirm?") {
        $("#resignBtn").html("Confirm?");
        return;
    }
    GeneralLoad();
    $("#resignBtn").html("Working...");
    $("#resignBtn").attr("disabled", "disabled");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/member/resign",
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#resignBtn").html("Resign");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            info = "";
            if (!data.error) {
                localStorage.clear();
                Swal.fire({
                    title: "Resigned",
                    html: "Sorry to see you leave, good luck with your future career!",
                    icon: 'info',
                    confirmButtonText: 'Close'
                })
            }
        },
        error: function (data) {
            $("#resignBtn").html("Resign");
            $("#resignBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to resign. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}