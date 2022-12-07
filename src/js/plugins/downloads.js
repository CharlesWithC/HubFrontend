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
        url: api_host + "/" + dhabbr + "/downloads/list?page=" + page,
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
                downloads_control_title_style = "";
                downloads_control_top = "";
                downloads_control_bottom = "";
                if(userPerm.includes("downloads") || userPerm.includes("admin")){
                    downloads_control += `<a style="cursor:pointer" onclick="EditDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a style="cursor:pointer" onclick="DeleteDownloadsShow(${downloads.downloadsid})"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a></div>`;
                    downloads_control_title_style = `width:calc(100% - 100px)`;
                    downloads_control_top = `<input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-title" placeholder="A short and nice title" value="${downloads.title}" style="display:none;width:100%;">`;
                    downloads_control_bottom = `<div id="downloads-edit-${downloads.downloadsid}-bottom-div" style="display:none;"><div class="input-group mb-3" style="height:calc(100% + 50px)">
                        <textarea type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-description" placeholder="Content of the downloadable item, MarkDown supported" style="height:100%">${downloads.description}</textarea></div>
                    <label for="downloads-edit-${downloads.downloadsid}-link" class="form-label">Link</label>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-link" placeholder="https://..." value="${convertQuotation2(downloads.link)}">
                    </div>
                    <label for="downloads-edit-${downloads.downloadsid}-orderid" class="form-label">Order ID</label>
                    <div class="input-group mb-2">
                        <input type="text" class="form-control bg-dark text-white" id="downloads-edit-${downloads.downloadsid}-orderid" placeholder="0" value="${downloads.orderid}">
                    </div>
                    <button id="button-downloads-edit-${downloads.downloadsid}-save" type="button" class="btn btn-primary" style="float:right" onclick="EditDownloads(${downloads.downloadsid});">Save</button></div>
                    `;
                } else {
                    downloads_control += "</div>";
                }
                content += `<div class="downloads shadow p-3 m-3 bg-dark rounded col" id="downloads-${downloads.downloadsid}">
                    <h5 style="display:inline-block;${downloads_control_title_style}"><strong><span id="downloads-display-${downloads.downloadsid}-title"> ${downloads.title}</span>${downloads_control_top}</strong></h5>
                    ${downloads_control}
                    <h6 style="font-size:15px"><strong>${GetAvatar(creator.userid, creator.name, creator.discordid, creator.avatar)} | ${downloads.click_count} Downloads</strong></h6>
                    <div id="downloads-display-${downloads.downloadsid}-description">${marked.parse(downloads.description.replaceAll("\n", "<br>")).replaceAll("<img ", "<img style='width:100%;' ")}</div>
                    ${downloads_control_bottom}
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
        url: api_host + "/" + dhabbr + "/downloads?downloadsid=" + downloadsid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            if(data.error) return AjaxError(data);
            window.location.href = api_host + "/" + dhabbr + "/downloads/" + data.response.downloads.secret;
        },
        error: function (data){
            UnlockBtn("#button-downloads-redirect-"+downloadsid);
            AjaxError(data);
        }
    });
}

function CreateDownloads(){
    title = $("#downloads-new-title").val();
    description = simplemde["#downloads-new-description"].value();
    link = $("#downloads-new-link").val();
    orderid = $("#downloads-new-orderid").val();

    LockBtn("#button-downloads-new-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads",
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
            toastNotification("success", "Success", mltr("downloadable_item_added"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-new-create");
            AjaxError(data);
        }
    });
}

function EditDownloadsShow(downloadsid){
    $(`#downloads-edit-${downloadsid}-bottom-div`).css("height", ($(`#downloads-display-${downloadsid}-content`).height()) + "px");
    $(`#downloads-edit-${downloadsid}-bottom-div`).toggle();
    $(`#downloads-edit-${downloadsid}-title`).toggle();
    $(`#downloads-display-${downloadsid}-description`).toggle();
    $(`#downloads-display-${downloadsid}-title`).toggle();
}

function EditDownloads(downloadsid){
    title = $(`#downloads-edit-${downloadsid}-title`).val();
    description = $(`#downloads-edit-${downloadsid}-description`).val();
    link = $(`#downloads-edit-${downloadsid}-link`).val();
    orderid = $(`#downloads-edit-${downloadsid}-orderid`).val();

    LockBtn(`#button-downloads-edit-${downloadsid}-save`, mltr("editing"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads?downloadsid="+downloadsid,
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
            UnlockBtn(`#button-downloads-edit-${downloadsid}-save`);
            if (data.error) return AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", mltr("downloadable_item_edited"), 5000, false);
        },
        error: function (data) {
            UnlockBtn(`#button-downloads-edit-${downloadsid}-save`);
            AjaxError(data);
        }
    });
}

function DeleteDownloadsShow(downloadsid){
    if(shiftdown) return DeleteDownloads(downloadsid);
    title = alldownloads[downloadsid].title;
    modalid = ShowModal(mltr("delete_downloadable_item"), `<p>${mltr("delete_downloadable_item_note")}</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-downloads-delete-${downloadsid}" type="button" class="btn btn-danger" onclick="DeleteDownloads(${downloadsid});">${mltr("delete")}</button>`);
    InitModal("delete_downloads", modalid);
}

function DeleteDownloads(downloadsid){
    LockBtn("#button-downloads-delete-"+downloadsid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/downloads?downloadsid=" + downloadsid,
        type: "DELETE",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            if (data.error) AjaxError(data);
            LoadDownloads(noplaceholder = true);
            toastNotification("success", "Success", mltr("downloadable_item_deleted"), 5000, false);
            if(Object.keys(modals).includes("delete_downloads")) DestroyModal("delete_downloads");
        },
        error: function (data) {
            UnlockBtn("#button-downloads-delete-"+downloadsid);
            AjaxError(data);
        }
    });
}