ANNOUNCEMENT_ICON = [`<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-triangle-exclamation" style="color:yellow"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-xmark"style="color:red"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-check"style="color:green"></i></span>`];

announcement_placeholder_row = `<div class="row">
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
</div>`;

function LoadAnnouncement(noplaceholder = false){
    InitPaginate("#announcements", "LoadAnnouncement()");
    $("#announcement-tab .page-item").addClass("disabled");

    if(!noplaceholder){
        $("#announcements").children().remove();
        for(i = 0 ; i < 5 ; i++){
            $("#announcements").append(announcement_placeholder_row);
        }
    }

    page = parseInt($("#announcements_page_input").val());

    if(userPerm.includes("announcement") || userPerm.includes("admin")){
        $("#announcement-new").show();
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement/list?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: async function (data) {
            while(1){
                if(userPermLoaded) break;
                await sleep(100);
            }
            if(userPerm.includes("announcement") || userPerm.includes("admin")){
                $("#announcement-new").show();
            }
            announcements = data.response.list;
            content = "";
            for (i = 0; i < announcements.length; i++) {
                if(i % 2 == 0){
                    if(i != 0) content += `</div>`;
                    content += `<div class="row">`;
                }
                announcement = announcements[i];
                announcement_datetime = getDateTime(announcement.timestamp * 1000);
                author = announcement.author;
                announcement_control = "";
                announcement_control_title_style = "";
                announcement_control_top = "";
                announcement_control_bottom = "";
                if(userPerm.includes("announcement") || userPerm.includes("admin")){
                    announcement_control = `<div style="float:right"><a style="cursor:pointer" onclick="EditAnnouncementToggle(${announcement.announcementid})"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a style="cursor:pointer" onclick="DeleteAnnouncementShow(${announcement.announcementid})"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a></div>`;
                    announcement_control_title_style = `width:calc(100% - 70px)`;
                    announcement_control_top = `<input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-title" placeholder="A short and nice title" value="${announcement.title}" style="display:none;width:100%;">`;
                    public_checked = "";
                    private_checked = "";
                    if(announcement.is_private == true) private_checked = "checked";
                    else public_checked = "checked";
                    type_checked = [];
                    for(var j = 0 ; j < parseInt(announcement.announcement_type) ; j++){
                        type_checked.push("");
                    }
                    type_checked.push("selected");
                    for(var j = 0 ; j < 4 ; j++){
                        type_checked.push("");
                    }
                    announcement_control_bottom = `<div id="announcement-edit-${announcement.announcementid}-bottom-div" style="display:none;"><div class="input-group mb-3" style="height:calc(100% + 50px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-content" placeholder="Content of the announcement, MarkDown supported" style="height:100%">${announcement.content}</textarea></div>
                    <div class="pb-2">
                        <div class="form-check" style="display:inline-block;width:80px;">
                            <input class="form-check-input" type="radio" name="announcement-edit-${announcement.announcementid}-visibility" id="announcement-edit-${announcement.announcementid}-visibility-public" ${public_checked}>
                                <label class="form-check-label" for="announcement-edit-${announcement.announcementid}-visibility-public">
                                    Public
                                </label>
                            </div>
                        <div class="form-check" style="display:inline-block;width:80px;">
                            <input class="form-check-input" type="radio" name="announcement-edit-${announcement.announcementid}-visibility" id="announcement-edit-${announcement.announcementid}-visibility-private" ${private_checked}>
                            <label class="form-check-label" for="announcement-edit-${announcement.announcementid}-visibility-private">
                                Private
                            </label>
                        </div>
                        <select style="display:inline-block;width:130px" class="form-select bg-dark text-white" aria-label="Default select example" id="announcement-edit-${announcement.announcementid}-type">
                            <option value="0" ${type_checked[0]}>Information</option>
                            <option value="1" ${type_checked[1]}>Event</option>
                            <option value="2" ${type_checked[2]}>Warning</option>
                            <option value="3" ${type_checked[3]}>Critical</option>
                            <option value="4" ${type_checked[4]}>Resolved</option>
                        </select>
                    </div>
                    <label for="announcement-edit-${announcement.announcementid}-discord" class="form-label">Discord Integration</label>
                    <div class="input-group mb-2">
                        <span class="input-group-text" id="announcement-edit-${announcement.announcementid}-discord-channel-label">Channel ID</span>
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-channel" placeholder="" style="width: 150px;display:inline-block;margin-right:10px;">
                    </div>
                    <div class="input-group mb-2">
                        <span class="input-group-text" id="announcement-edit-${announcement.announcementid}-discord-channel-label">Message</span>
                        <input type="text" class="form-control bg-dark text-white" id="announcement-edit-${announcement.announcementid}-discord-message" placeholder="" style="width:250px;display:inline-block;">
                    </div>
                    <button id="button-announcement-edit-${announcement.announcementid}-save" type="button" class="btn btn-primary" style="float:right" onclick="EditAnnouncement(${announcement.announcementid});">Save</button></div>`;
                }
                content += `<div class="announcement shadow p-3 m-3 bg-dark rounded col" id="announcement-${announcement.announcementid}">
                    <h5 style="display:inline-block;${announcement_control_title_style}"><strong><span id="announcement-display-${announcement.announcementid}-title"> ${ANNOUNCEMENT_ICON[announcement.announcement_type]} ${announcement.title}</span>${announcement_control_top}</strong></h5>
                    ${announcement_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(author.userid, author.name, author.discordid, author.avatar)} | ${announcement_datetime}</strong></h6>
                    <div id="announcement-display-${announcement.announcementid}-content">${marked.parse(announcement.content.replaceAll("\n", "<br>"))}</div>
                    ${announcement_control_bottom}
                </div>`;
            }
            content += `</div>`;
            $("#announcements").children().remove();
            $("#announcements").append(content);
            UpdatePaginate("#announcements", data.response.total_pages, "LoadAnnouncement();");
        }
    });
}

function EditAnnouncementToggle(announcementid){
    $(`#announcement-edit-${announcementid}-bottom-div`).css("height", ($(`#announcement-display-${announcementid}-content`).height()) + "px");
    $(`#announcement-edit-${announcementid}-bottom-div`).toggle();
    $(`#announcement-edit-${announcementid}-title`).toggle();
    $(`#announcement-display-${announcementid}-content`).toggle();
    $(`#announcement-display-${announcementid}-title`).toggle();
}

function PostAnnouncement(){
    title = $("#announcement-new-title").val();
    content = simplemde["#announcement-new-content"].value();
    anntype = $("#announcement-new-type").find(":selected").val();
    if(!isNumber(anntype)){
        return toastNotification("warning", "Warning", mltr("please_select_an_announcement_type"), 3000);
    }
    is_private = $("#announcement-visibility-private").is(":checked");
    discord_channelid = $("#announcement-new-discord-channel").val();
    discord_message = $("#announcement-new-discord-message").val();
    if(!isNumber(discord_channelid)){
        discord_channelid = 0;
        discord_message = "";
    }
    LockBtn("#button-announcement-new-post", mltr("posting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "content": content,
            "announcement_type": anntype,
            "is_private": is_private,
            "channelid": discord_channelid,
            "discord_message_content": discord_message
        },
        success: function (data) {
            UnlockBtn("#button-announcement-new-post");
            if (data.error) AjaxError(data);
            toastNotification("success", "Success", mltr("announcement_posted"), 5000, false);
            LoadAnnouncement(noplaceholder = false);
        },
        error: function (data) {
            UnlockBtn("#button-announcement-new-post");
            AjaxError(data);
        }
    });
}

function EditAnnouncement(announcementid){
    title = $("#announcement-edit-"+announcementid+"-title").val();
    content = $("#announcement-edit-"+announcementid+"-content").val();
    anntype = $("#announcement-edit-"+announcementid+"-type").find(":selected").val();
    is_private = $("#announcement-edit-"+announcementid+"-visibility-private").is(":checked");
    discord_channelid = $("#announcement-edit-"+announcementid+"-discord-channel").val();
    discord_message = $("#announcement-edit-"+announcementid+"-discord-message").val();
    if(!isNumber(discord_channelid)){
        discord_channelid = 0;
        discord_message = "";
    }
    LockBtn("#button-announcement-edit-"+announcementid+"-save", mltr("saving"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement?announcementid="+announcementid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "content": content,
            "announcement_type": anntype,
            "is_private": is_private,
            "channelid": discord_channelid,
            "discord_message_content": discord_message
        },
        success: function (data) {
            UnlockBtn("#button-announcement-edit-"+announcementid+"-save");
            if (data.error) AjaxError(data);
            LoadAnnouncement(noplaceholder = false);
            toastNotification("success", "Success", mltr("edit_saved"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-announcement-edit-"+announcementid+"-save");
            AjaxError(data);
        }
    });
}

function DeleteAnnouncementShow(announcementid){
    if(shiftdown) return DeleteAnnouncement(announcementid);
    content = $("#announcement-display-"+announcementid+"-title").html();
    modalid = ShowModal(mltr("delete_announcement"), `<p>${mltr("delete_announcement_note")}</p><p><i>${content}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-announcement-delete-${announcementid}" type="button" class="btn btn-danger" onclick="DeleteAnnouncement(${announcementid});">${mltr("delete")}</button>`);
    InitModal("delete_announcement", modalid);
}

function DeleteAnnouncement(announcementid){
    LockBtn("#button-announcement-delete-"+announcementid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/announcement?announcementid=" + announcementid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-announcement-delete-"+announcementid);
            if (data.error) AjaxError(data);
            LoadAnnouncement(noplaceholder = false);
            toastNotification("success", "Success", mltr("announcement_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_announcement")) DestroyModal("delete_announcement");
        },
        error: function (data) {
            UnlockBtn("#button-announcement-delete-"+announcementid);
            AjaxError(data);
        }
    });
}