
function FetchAnnouncement() {
    aid = $("#annid").val();

    GeneralLoad();
    $("#fetchAnnouncementBtn").html("Working...");
    $("#fetchAnnouncementBtn").attr("disabled", "disabled");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/announcement?announcementid=" + aid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#fetchAnnouncementBtn").html("Fetch Data");
            $("#fetchAnnouncementBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);

            const announcement = data.response;
            $("#anntitle").val(announcement.title);
            $("#anncontent").val(announcement.content);
            if (announcement.is_private) $("#annpvt-1").prop("checked", true);
            else $("#annpvt-0").prop("checked", true);
            $('#annselect option:eq(' + announcement.announcement_type + ')').prop('selected', true);
        },
        error: function (data) {
            $("#fetchAnnouncementBtn").html("Fetch Data");
            $("#fetchAnnouncementBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to fetch announcement. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
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
    $("#newAnnBtn").html("Working...");
    $("#newAnnBtn").attr("disabled", "disabled");

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
                "pvt": pvt,
                "channelid": chnid
            },
            success: function (data) {
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Announcement updated! Refresh page to view it!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                } else {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Error',
                        text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
                    console.warn(`Announcement update failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                    console.log(data);
                }
            },
            error: function (data) {
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Announcement update failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
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
                "pvt": pvt,
                "channelid": chnid,
                "discord_message_content": $("#annmsg").val()
            },
            success: function (data) {
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Announcement created! Refresh page to view it!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                } else {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Error',
                        text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })

                    console.warn(
                        `Announcement creation failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                    console.log(data);
                }
            },
            error: function (data) {
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Announcement creation failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
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
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Announcement deleted!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                } else {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Error',
                        text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
                }
            },
            error: function (data) {
                // Un-disable the submit button
                $("#newAnnBtn").prop("disabled", false);
                $("#newAnnBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Announcement deletion failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
            }
        });
    }
}