annInit = 0;
function LoadAnnouncement(){
    annInit = 1;
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
                content = "<span style='font-size:10px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.announcement_type], a.title, content);
            }
            for (i = 0; i < ann.length; i++) {
                a = ann[i];
                dt = getDateTime(a.timestamp * 1000);
                content = "<span style='font-size:10  px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                    "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                    parseMarkdown(a.content.replaceAll("\n", "<br>"));
                TYPES = ["info", "info", "warning", "criticle", "resolved"];
                banner = genBanner(TYPES[a.announcement_type], a.title, content);
                $("#anns").append(banner);
            }
        }
    });
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
                        content = "<span style='font-size:10px;color:grey'><b>#" + a.announcementid + "</b> | <b>" + dt +
                            "</b> by <a style='cursor:pointer' onclick='LoadUserProfile(" + a.author.userid + ")'><i>" + a.author.name + "</i></a></span><br>" +
                            parseMarkdown(a.content.replaceAll("\n", "<br>"));
                        TYPES = ["info", "info", "warning", "criticle", "resolved"];
                        banner = genBanner(TYPES[a.announcement_type], a.title, content);
                        $("#anns").append(banner);
                        $($("#anns").children()[$("#anns").children().length - 1]).hide();
                        $($("#anns").children()[$("#anns").children().length - 1]).fadeIn();
                        await sleep(200);
                    }
                }
            });
        }
    };
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