function loadDownloads() {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/downloads",
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#downloads").html(parseMarkdown(data.response));
            $("#downloadscontent").val(data.response);
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to fetch downloads. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function toggleUpdateDownloads() {
    $("#downloadsedit").toggle();
    $("#downloads").toggle();
}

lastdownloadsupd = 0;

function UpdateDownloads() {
    if (+new Date() - lastdownloadsupd < 50) return;
    lastdownloadsupd = +new Date();
    $("#saveDownloadsBtn").html("Working...");
    $("#saveDownloadsBtn").attr("disabled", "disabled");
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
            $("#saveDownloadsBtn").html("Update");
            $("#saveDownloadsBtn").removeAttr("disabled");
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#downloads").html(parseMarkdown($("#downloadscontent").val()));
        },
        error: function (data) {
            $("#saveDownloadsBtn").html("Update");
            $("#saveDownloadsBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to update downloads. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}