annInit = 0;

ANNOUNCEMENT_ICON = [`<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-info"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-triangle-exclamation" style="color:yellow"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-xmark"style="color:red"></i></span>`, `<span class="rect-20"><i class="fa-solid fa-circle-check"style="color:green"></i></span>`];

announcement_placeholder_row = `<div class="row">
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-8"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-8"></span> <span class="placeholder col-6"></span></h6>
    <p><span class="placeholder col-4"></span>&nbsp;&nbsp;<span class="placeholder col-7"></span></p>
    <p><span class="placeholder col-6"></span>&nbsp;&nbsp;<span class="placeholder col-5"></span></p>
</div>
<div class="announcement shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
</div>`;

function LoadAnnouncement(){
    InitPaginate("#announcements", "LoadAnnouncement()");
    $("#announcement-tab .page-item").addClass("disabled");

    $("#announcements").children().remove();
    for(i = 0 ; i < 5 ; i++){
        $("#announcements").append(announcement_placeholder_row);
    }

    page = parseInt($("#announcements_page_input").val());

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
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
                content += `<div class="announcement shadow p-3 m-3 bg-dark rounded col" id="announcement-${announcement.announcementid}">
                    <h5><strong>${ANNOUNCEMENT_ICON[announcement.announcement_type]} ${announcement.title}</strong></h5>
                    <h6 style="font-size:15px"><strong>${GetAvatar(author.userid, author.name, author.discordid, author.avatar)} | ${announcement_datetime}</strong></h6>
                    <p>${parseMarkdown(announcement.content.replaceAll("\n", "<br>"))}</p>
                </div>`;
            }
            content += `</div>`;
            $("#announcements").children().remove();
            $("#announcements").append(content);
            UpdatePaginate("#announcements", data.response.total_pages, "LoadAnnouncement();");
        }
    });
}

function FetchAnnouncement() {
    aid = $("#annid").val();

    GeneralLoad();
    LockBtn("#fetchAnnouncementBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + aid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchAnnouncementBtn");
            if (data.error) return AjaxError(data);

            announcement = data.response;
            $("#anntitle").val(announcement.title);
            $("#anncontent").val(announcement.content);
            if (announcement.is_private) $("#annpvt-1").prop("checked", true);
            else $("#annpvt-0").prop("checked", true);
            $('#annselect option:eq(' + announcement.announcement_type + ')').prop('selected', true);
        },
        error: function (data) {
            UnlockBtn("#fetchAnnouncementBtn");
            AjaxError(data);
        }
    })
}

function AnnouncementOp() {
    anntype = parseInt($("#annselect").find(":selected").val());
    title = $("#anntitle").val();
    content = $("#anncontent").val();
    annid = $("#annid").val();
    pvt = $("#annpvt-1").prop("checked");
    chnid = $("#annchan").val().replaceAll(" ", "");

    if (chnid != "" && !isNumber(chnid)) {
        toastFactory("warning", "Error", "Channel ID must be an integar if specified!", 5000, false);
        return;
    }

    GeneralLoad();
    LockBtn("#newAnnBtn");

    op = "create";
    if (isNumber(annid)) {
        if (title != "" || content != "") {
            op = "update";
        } else {
            op = "delete";
        }
    }

    if (op == "update") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/announcement?announcementid="+annid,
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "content": content,
                "announcement_type": anntype,
                "is_private": pvt,
                "channelid": chnid
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    } else if (op == "create") {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/announcement",
            type: "POST",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "content": content,
                "announcement_type": anntype,
                "is_private": pvt,
                "channelid": chnid,
                "discord_message_content": $("#annmsg").val()
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    } else if (op == "delete") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + annid,
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                UnlockBtn("#newAnnBtn");
                if (data.error) AjaxError(data);
                toastFactory("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newAnnBtn");
                AjaxError(data);
            }
        });
    }
}