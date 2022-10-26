async function LoadDownloads() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#downloads-content").html(marked.parse(data.response));
            $("#downloads-edit-content").val(data.response);
        },
        error: function (data) {
            AjaxError(data);
        }
    });

    while(1){
        if(userPermLoaded) break;
        await sleep(100);
    }
    if(userPerm.includes("downloads") || userPerm.includes("admin")){
        $("#downloads-edit-button-wrapper").show();
        $("#downloads-edit-content").on("input", function(){
            $("#downloads-content").html(marked.parse($("#downloads-edit-content").val()));
            $("#downloads-unsaved").show();
        });
    }
}

function UpdateDownloads() {
    LockBtn("#button-downloads-edit-save", "Saving...");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "data": $("#downloads-edit-content").val()
        },
        success: function (data) {
            UnlockBtn("#button-downloads-edit-save");
            $("#downloads-unsaved").hide();
            if (data.error) return AjaxError(data);
            $("#downloads-content").html(marked.parse($("#downloads-edit-content").val()));
            toastNotification("success", "Success", "Downloads saved!", 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-downloads-edit-save");
            AjaxError(data);
        }
    })
}