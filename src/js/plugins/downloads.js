downloads_placeholder_row = `<div class="row">
<div class="downloads shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
<div class="downloads shadow p-3 m-3 bg-dark rounded col">
    <h5><strong><span class="placeholder col-2"></span> <span class="placeholder col-7"></span></strong></h5>
    <h6 style="font-size:15px"><span class="placeholder col-3"></span> <span class="placeholder col-4"></span></h6>
    <p><span class="placeholder col-3"></span>&nbsp;&nbsp;<span class="placeholder col-6"></span></p>
    <p><span class="placeholder col-5"></span>&nbsp;&nbsp;<span class="placeholder col-4"></span></p>
</div>
</div>`;

alldownloads = {};

function LoadDownloads(noplaceholder = false){
    InitPaginate("#downloads", "LoadDownloads()");
    $("#downloads-tab .page-item").addClass("disabled");

    if(!noplaceholder){
        $("#downloads").children().remove();
        for(i = 0 ; i < 5 ; i++){
            $("#downloads").append(downloads_placeholder_row);
        }
    }

    page = parseInt($("#downloads_page_input").val());

    if(userPerm.includes("downloads") || userPerm.includes("admin")){
        $("#downloads-new").show();
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads/list?page=" + page,
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
            if(userPerm.includes("downloads") || userPerm.includes("admin")){
                $("#downloads-new").show();
            }
            downloadslist = data.response.list;
            content = "";
            for (i = 0; i < downloadslist.length; i++) {
                if(i % 2 == 0){
                    if(i != 0) content += `</div>`;
                    content += `<div class="row">`;
                }
                downloads = downloadslist[i];
                alldownloads[downloadslist[i].downloadsid] = downloadslist[i];
                creator = downloads.creator;
                downloads_control = `<div style="float:right"><a style="cursor:pointer" onclick="DownloadsRedirect(${downloads.downloadsid});"><span class="rect-20"><i class="fa-solid fa-download"></i></span></a>`;
                if(userPerm.includes("downloads") || userPerm.includes("admin")){
                    downloads_control += `<a style="cursor:pointer" onclick="EditDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a style="cursor:pointer" onclick="DeleteDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a></div>`;
                } else {
                    downloads_control += "</div>";
                }
                content += `<div class="downloads shadow p-3 m-3 bg-dark rounded col" id="downloads-${downloads.downloadsid}">
                    <h5><strong><span id="downloads-display-${downloads.downloadsid}-title"> ${downloads.title}</span></strong></h5>
                    ${downloads_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar)} | ${downloads.click_count} Downloads</strong></h6>
                    <div id="downloads-display-${downloads.downloadsid}-description"">${marked.parse(downloads.description.replaceAll("\n", "<br>"))}</div>
                </div>`;
            }
            content += `</div>`;
            $("#downloads").children().remove();
            $("#downloads").append(content);
            UpdatePaginate("#downloads", data.response.total_pages, "LoadDownloads();");
        }
    });
}

function DownloadsRedirect(downloadsid){
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads?downloadsid=" + downloadsid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            if(data.error) return AjaxError(data);
            window.location.href = apidomain + "/" + vtcprefix + "/downloads/" + data.response.secret;
        },
        error: function (data){
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            AjaxError(data);
        }
    });
}

function CreateDownloads(){
    title = $("#downloads-new-title").val();
    description = $("#downloads-new-description").val();
    link = $("#downloads-new-link").val();
    orderid = $("#downloads-new-orderid").val();

    LockBtn("#button-downloads-new-create", "Creating...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": link,
            "orderid": orderid
        },
        success: function (data) {
            UnlockBtn("#button-downloads-new-create");
            if (data.error) return AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", "Downloadable item added!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-new-create");
            AjaxError(data);
        }
    });
}

function EditDownloadsShow(downloadsid){
    $("#downloads-edit-id").val(downloadsid);
    $("#downloads-edit-id-span").html(downloadsid);
    downloads = alldownloads[downloadsid];
    $("#downloads-edit-title").val(downloads.title);
    $("#downloads-edit-description").val(downloads.description);
    $("#downloads-edit-link").val(downloads.link);
    $("#downloads-edit-orderid").val(downloads.orderid);
    $("#downloads-edit").show();
}

function EditDownloads(){
    downloadsid = $("#downloads-edit-id").val();

    title = $("#downloads-edit-title").val();
    description = $("#downloads-edit-description").val();
    link = $("#downloads-edit-link").val();
    orderid = $("#downloads-edit-orderid").val();

    LockBtn("#button-downloads-edit", "Editing...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads?downloadsid="+downloadsid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        data: {
            "title": title,
            "description": description,
            "link": link,
            "orderid": orderid
        },
        success: function (data) {
            UnlockBtn("#button-downloads-edit");
            if (data.error) return AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", "Downloadable item edited!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-edit");
            AjaxError(data);
        }
    });
}

function DeleteDownloadsShow(downloadsid){
    if(shiftdown) return DeleteDownloads(downloadsid);
    title = alldownloads[downloadsid].title;
    modalid = ShowModal("Delete Downloadable Item", `<p>Are you sure you want to delete this downloadable item?</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen"><b>PROTIP:</b></span><br>You can hold down shift when clicking delete button to bypass this confirmation entirely.</p>`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button id="button-downloads-delete-${downloadsid}" type="button" class="btn btn-danger" onclick="DeleteDownloads(${downloadsid});">Delete</button>`);
    InitModal("delete_downloads", modalid);
}

function DeleteDownloads(downloadsid){
    LockBtn("#button-downloads-delete-"+downloadsid, "Deleting...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads?downloadsid=" + downloadsid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            if (data.error) AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", "Downloadable item deleted!", 5000, false);
            if(Object.keys(modals).includes("delete_downloads")) DestroyModal("delete_downloads");
        },
        error: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            AjaxError(data);
        }
    });
}