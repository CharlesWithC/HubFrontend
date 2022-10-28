challenge_placerholder_row = `
<tr>
    <td style="width:30%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:10%;"><span class="placeholder w-100"></span></td>
    <td style="width:30%;"><span class="placeholder w-100"></span></td>
    <td style="width:20%;"><span class="placeholder w-100"></span></td>
</tr>`;

allchallenges = {};

async function LoadChallenge(noplaceholder = false) {
    InitPaginate("#table_challenge_list", "LoadChallenge();");
    page = parseInt($("#table_challenge_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if(!noplaceholder){
        $("#table_challenge_list_data").empty();
        for(var i = 0 ; i < 10 ; i++){
            $("#table_challenge_list_data").append(challenge_placerholder_row);
        }
    }
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: async function (data) {
            if (data.error) return AjaxError(data);
            
            challengeList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            while(1){
                if(userPermLoaded && user_distance != null) break;
                await sleep(100);
            }
            if(userPerm.includes("challenge") || userPerm.includes("admin")){
                $("#challenge-new").show();
                $("#button-challenge-edit-delivery").show();
            }

            for (i = 0; i < challengeList.length; i++) {
                challenge = challengeList[i];

                allchallenges[challenge.challengeid] = challenge;
                
                extra = "";
                if(userPerm.includes("challenge") || userPerm.includes("admin")){ extra = `<a id="button-challenge-edit-show-${challenge.challengeid}" class="clickable" onclick="EditChallengeShow(${challenge.challengeid});"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a id="button-challenge-delete-show-${challenge.challengeid}" class="clickable" onclick="DeleteChallengeShow(${challenge.challengeid}, \`${challenge.title}\`);"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a>`;}

                CHALLENGE_TYPE = ["", "Personal", "Company"];
                challenge_type = CHALLENGE_TYPE[challenge.challenge_type];
                
                pct = Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100),100);

                progress = `<div class="progress">
                    <div class="progress-bar progress-bar-striped" role="progressbar" style="width:${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">${challenge.current_delivery_count} / ${challenge.delivery_count}</div>
                </div>`;

                status = "";
                status_type = "";
                if(challenge.start_time * 1000 <= +new Date() && challenge.end_time * 1000 >= +new Date()) 
                    status = "Ongoing", status_type = "text-bg-success";
                else if(challenge.start_time * 1000 > +new Date())
                    status = "Upcoming", status_type = "text-bg-info";
                else if(challenge.end_time * 1000 < +new Date())
                    status = "Ended", status_type = "text-bg-danger";
                if(parseInt(challenge.current_delivery_count) >= parseInt(challenge.delivery_count))
                    status = "Completed", status_type = "text-bg-warning";
                
                extra_status = "";
                roles = JSON.parse(localStorage.getItem("roles"));
                roleok = false;
                for(j = 0 ; j < challenge.required_roles.length ; j++){
                    if(roles.includes(challenge.required_roles[j])) roleok = true;
                }
                if(!roleok) extra_status = "Not Qualified";
                if(parseInt(user_distance) < parseInt(challenge.required_distance)) extra_status = "Not Qualified";

                badge_status = `<span class="badge ${status_type}">${status}</span>`;
                if(extra_status != "") badge_status += `&nbsp;&nbsp;<span class="badge text-bg-secondary">${extra_status}</span>`;

                data.push([`<a class="clickable" onclick="ShowChallengeDetail('${challenge.challengeid}')">${challenge.title}</a>`, `${challenge_type}`, `${challenge.reward_points}`, `${progress}`, `${badge_status}`, extra]);
            }

            PushTable("#table_challenge_list", data, total_pages, "LoadChallenge();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function ShowChallengeDetail(challengeid){
    challenge = allchallenges[challengeid];
    function GenTableRow(key, val){
        return `<tr><td><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    info = "<table><tbody>";
    CHALLENGE_TYPE = ["", "Personal", "Company"];
    challenge_type = CHALLENGE_TYPE[challenge.challenge_type];
    info += GenTableRow("Challenge Type", challenge_type);
    info += GenTableRow("Reward Points", challenge.reward_points);
    info += GenTableRow("Start Time", getDateTime(challenge.start_time * 1000));
    info += GenTableRow("End Time", getDateTime(challenge.end_time * 1000));
    status = "";
    status_type = "";
    if(challenge.start_time * 1000 <= +new Date() && challenge.end_time * 1000 >= +new Date()) 
        status = "Ongoing", status_type = "text-bg-success";
    else if(challenge.start_time * 1000 > +new Date())
        status = "Upcoming", status_type = "text-bg-info";
    else if(challenge.end_time * 1000 < +new Date())
        status = "Ended", status_type = "text-bg-danger";
    if(challenge.current_delivery_count >= challenge.delivery_count)
        status = "Completed", status_type = "text-bg-warning";
    badge_status = `<span class="badge ${status_type}">${status}</span>`;
    info += GenTableRow("Status", badge_status);

    info += GenTableRow("&nbsp;", "&nbsp;");
    info += GenTableRow("Deliveries", challenge.delivery_count);
    info += GenTableRow("Current Deliveries", challenge.current_delivery_count);
    pct = Math.min(parseInt(challenge.current_delivery_count / challenge.delivery_count * 100),100);
    progress = `<div class="progress">
        <div class="progress-bar progress-bar-striped" role="progressbar" style="width:${pct}%" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">${pct}%</div>
    </div>`;
    info += GenTableRow("Progress", progress);
    info += GenTableRow("&nbsp;", "&nbsp;");

    roles = challenge.required_roles;
    rolestxt = "";
    for(var i = 0 ; i < roles.length ; i++){
        rolestxt += `${rolelist[roles[i]]} (${roles[i]}),`
    }
    rolestxt = rolestxt.slice(0,-1);
    info += GenTableRow("Required Roles", rolestxt);
    info += GenTableRow("Required Distance Driven", TSeparator(parseInt((challenge.required_distance * distance_ratio))) + distance_unit_txt);
    if(!roleok) extra_status = "Not Qualified";
    if(parseInt(user_distance) < parseInt(challenge.required_distance)) extra_status = "Not Qualified";
    if(extra_status != "") badge_status = `<span class="badge text-bg-secondary">${extra_status}</span>`;
    else badge_status = `<span class="badge text-bg-success">Qualified</span>`;
    info += GenTableRow("Qualification", badge_status);
    info += GenTableRow("&nbsp;", "&nbsp;");
    
    completed_users = "";
    for (i = 0; i < challenge.completed.length; i++) {
        pointstxt = "";
        if(challenge.challenge_type == 2)pointstxt = ` (${challenge.completed[i].points} Points)`;
        completed_users += `<a style="cursor:pointer" onclick="LoadUserProfile(${challenge.completed[i].userid})">${challenge.completed[i].name}${pointstxt}</a>, `;
    }
    completed_users = completed_users.substr(0, completed_users.length - 2);

    if(challenge.completed.length != 0){
        info += GenTableRow("Completed Members", completed_users);
        info += GenTableRow("&nbsp;", "&nbsp;");
    }

    info += "</tbody></table>" + marked.parse(challenge.description);
    modalid = ShowModal(challenge.title, info);
    InitModal("challenge_detail", modalid);
}

function CreateChallenge() {
    title = $("#challenge-new-title").val();
    description = $("#challenge-new-description").val();
    start_time = +new Date($("#challenge-new-start-time").val())/1000;
    end_time = +new Date($("#challenge-new-end-time").val())/1000;    
    challenge_type = $("input[name=challenge-new-type]:checked").val();
    delivery_count = $("#challenge-new-delivery-count").val();
    required_roles = $("#challenge-new-required-roles").val();
    rolest = required_roles.split(",");
    roles = [];
    for (var i = 0; i < rolest.length; i++) {
        s = rolest[i];
        roles.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    roles = roles.join(",");
    required_roles = roles;
    required_distance = $("#challenge-new-required-distance").val();
    reward_points = $("#challenge-new-reward-points").val();
    public_details = $("input[name=challenge-new-public-details]:checked").val();
    jobreqs = $(".challenge-new-job-requirements");
    jobreqd = {};
    for (var i = 0; i < jobreqs.length; i++) {
        t = jobreqs[i];
        id = $(t).attr("id");
        val = $(t).val();
        if (val == "") continue;
        if (id == "#challenge-new-allow-auto") {
            if (val == "none") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-park") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-load") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 1;
            } else if (val == "both") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 1;
            }
        } else {
            jobreqd[id.substr(14).replaceAll("-", "_")] = val;
        }
    }
    
    LockBtn("#button-challenge-new-create", "Creating...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "challenge_type": challenge_type,
            "delivery_count": delivery_count,
            "required_roles": required_roles,
            "required_distance": required_distance,
            "reward_points": reward_points,
            "public_details": public_details,
            "job_requirements": JSON.stringify(jobreqd)
        },
        success: function (data) {
            UnlockBtn("#button-challenge-new-create");
            if (data.error) return AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", "Challenge created!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-new-create");
            AjaxError(data);
        }
    });
}

function EditChallengeShow(challengeid){
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge?challengeid="+challengeid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            d = data.response;
            $("#challenge-edit").show();
            $("#challenge-edit-id-span").html(challengeid);
            $("#button-challenge-edit").attr("onclick", `EditChallenge(${challengeid})`);
            $("#challenge-edit-title").val(d.title);
            $("#challenge-edit-description").val(d.description);
            $("#challenge-edit-start-time").val(new Date(d.start_time*1000).toISOString().slice(0,-1));
            $("#challenge-edit-end-time").val(new Date(d.end_time*1000).toISOString().slice(0,-1));
            $("#challenge-edit-type-"+d.challenge_type).prop("checked", true);
            $("#challenge-edit-delivery-count").val(d.delivery_count);
            roles = d.required_roles;
            rolestxt = "";
            for(var i = 0 ; i < roles.length ; i++){
                rolestxt += `${rolelist[roles[i]]} (${roles[i]}),`
            }
            rolestxt = rolestxt.slice(0,-1);
            $("#challenge-edit-required-roles").val(rolestxt);
            $("#challenge-edit-required-distance").val(d.required_distance);
            $("#challenge-edit-reward-points").val(d.reward_points);
            $("#challenge-edit-public-details-"+d.public_details).prop("checked", true);
            jobreqd = d.job_requirements;
            jobreqs = $(".challenge-edit-job-requirements");
            for (var i = 0; i < jobreqs.length; i++) {
                t = jobreqs[i];
                id = $(t).attr("id");
                val = jobreqd[id.substr(15).replaceAll("-", "_")];
                if(val == undefined || val == "-1") continue;
                if (id == "#challenge-edit-allow-auto") {
                    t = 0;
                    if(jobreqd["allow_auto_park"]) autopark += 1;
                    if(jobreqd["allow_auto_load"]) autopark += 2;
                    if(autopark == 0) $(t).val("none");
                    else if(autopark == 1) $(t).val("auto-park");
                    else if(autopark == 2) $(t).val("auto-load");
                    else if(autopark == 3) $(t).val("both");
                } else {
                    $(t).val(jobreqd[id.substr(15).replaceAll("-", "_")]);
                }
            }
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function EditChallenge(challengeid) {
    LockBtn("#button-challenge-edit", "Editing...");
    title = $("#challenge-edit-title").val();
    description = $("#challenge-edit-description").val();
    start_time = +new Date($("#challenge-edit-start-time").val())/1000;
    end_time = +new Date($("#challenge-edit-end-time").val())/1000;    
    challenge_type = $("input[name=challenge-edit-type]:checked").val();
    delivery_count = $("#challenge-edit-delivery-count").val();
    required_roles = $("#challenge-edit-required-roles").val();
    rolest = required_roles.split(",");
    roles = [];
    for (var i = 0; i < rolest.length; i++) {
        s = rolest[i];
        roles.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }
    roles = roles.join(",");
    required_roles = roles;
    required_distance = $("#challenge-edit-required-distance").val();
    reward_points = $("#challenge-edit-reward-points").val();
    public_details = $("input[name=challenge-edit-public-details]:checked").val();
    jobreqs = $(".challenge-edit-job-requirements");
    jobreqd = {};
    for (var i = 0; i < jobreqs.length; i++) {
        t = jobreqs[i];
        id = $(t).attr("id");
        val = $(t).val();
        if (val == "") continue;
        if (id == "#challenge-edit-allow-auto") {
            if (val == "none") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-park") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 0;
            } else if (val == "auto-load") {
                jobreqd["allow_auto_park"] = 0;
                jobreqd["allow_auto_load"] = 1;
            } else if (val == "both") {
                jobreqd["allow_auto_park"] = 1;
                jobreqd["allow_auto_load"] = 1;
            }
        } else {
            jobreqd[id.substr(15).replaceAll("-", "_")] = val;
        }
    }
    
    LockBtn("#button-challenge-edit-create", "Creating...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge?challengeid="+challengeid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "challenge_type": challenge_type,
            "delivery_count": delivery_count,
            "required_roles": required_roles,
            "required_distance": required_distance,
            "reward_points": reward_points,
            "public_details": public_details,
            "job_requirements": JSON.stringify(jobreqd)
        },
        success: function (data) {
            UnlockBtn("#button-challenge-edit");
            if (data.error) return AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", "Challenge edited!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-edit");
            AjaxError(data);
        }
    });
}

function DeleteChallengeShow(challengeid, title){
    if(shiftdown) return DeleteChallenge(challengeid);
    modalid = ShowModal("Delete Challenge", `<p>Are you sure you want to delete this challenge?</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen"><b>PROTIP:</b></span><br>You can hold down shift when clicking delete button to bypass this confirmation entirely.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-challenge-delete-${challengeid}" type="button" class="btn btn-danger" onclick="DeleteChallenge(${challengeid});">Delete</button>`);
    InitModal("delete_challenge", modalid);
}

function DeleteChallenge(challengeid){
    LockBtn("#button-challenge-delete-"+challengeid, "Deleting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge?challengeid=" + challengeid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-challenge-delete-"+challengeid);
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", "Challenge deleted!", 5000, false);
            if(Object.keys(modals).includes("delete_challenge")) DestroyModal("delete_challenge");
        },
        error: function (data) {
            UnlockBtn("#button-challenge-delete-"+challengeid);
            AjaxError(data);
        }
    });
}

function EditChallengeDeliveryShow(){
    div = `
    <label for="challenge-challenge-id" class="form-label">Challenge ID</label>
    <div class="input-group mb-2">
        <input type="number" class="form-control bg-dark text-white" id="challenge-challenge-id" placeholder="0">
    </div>
    <label for="challenge-dlog-id" class="form-label">Delivery Log ID</label>
    <div class="input-group mb-3">
        <input type="number" class="form-control bg-dark text-white" id="challenge-dlog-id" placeholder="0">
    </div>`;
    modalid = ShowModal(`Challenge Delivery`, div, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button id="button-challenge-delete-delivery" type="button" class="btn btn-danger" onclick="DeleteChallengeDelivery();">Delete</button><button id="button-challenge-add-delivery" type="button" class="btn btn-success" onclick="AddChallengeDelivery();">Add</button>`);
    InitModal("edit_challenge_delivery", modalid);
}

function AddChallengeDelivery(){
    LockBtn("#button-challenge-add-delivery", "Adding...");
    challengeid = $("#challenge-challenge-id").val();
    logid = $("#challenge-dlog-id").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge/delivery?challengeid=" + challengeid,
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "logid": logid
        },
        success: function (data) {
            UnlockBtn("#button-challenge-add-delivery");
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", "Delivery added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-add-delivery");
            AjaxError(data);
        }
    });
}

function DeleteChallengeDelivery(){
    LockBtn("#button-challenge-delete-delivery", "Deleting...");
    challengeid = $("#challenge-challenge-id").val();
    logid = $("#challenge-dlog-id").val();
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/challenge/delivery?challengeid=" + challengeid+"&logid="+logid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-challenge-delete-delivery");
            if (data.error) AjaxError(data);
            LoadChallenge(noplaceholder = true);
            toastNotification("success", "Success", "Delivery deleted!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-challenge-delete-delivery");
            AjaxError(data);
        }
    });
}