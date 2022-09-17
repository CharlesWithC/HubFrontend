function loadDownloads() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return AjaxError(data);
            $("#downloads").html(parseMarkdown(data.response));
            $("#downloadscontent").val(data.response);
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function toggleUpdateDownloads() {
    $("#downloadsedit").toggle();
    $("#downloads").toggle();
}

function UpdateDownloads() {
    GeneralLoad();
    LockBtn("#saveDownloadsBtn");
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "data": $("#downloadscontent").val()
        },
        success: function (data) {
            UnlockBtn("#saveDownloadsBtn");
            if (data.error) return AjaxError(data);
            $("#downloads").html(parseMarkdown($("#downloadscontent").val()));
            toastFactory("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            UnlockBtn("#saveDownloadsBtn");
            AjaxError(data);
        }
    })
}