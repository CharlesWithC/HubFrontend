function FetchEvent(showdetail = -1) {
    eventid = $("#eventid").val();
    if (!isNumber(eventid)) {
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);
    }

    GeneralLoad();
    $("#fetchEventBtn").html("Working...");
    $("#fetchEventBtn").attr("disabled", "disabled");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/events?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#fetchEventBtn").html("Fetch Data");
            $("#fetchEventBtn").removeAttr("disabled");

            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);

            const event = data.response;
            allevents[event.eventid] = event;
            $("#eventtitle").val(event.title);
            $("#eventtmplink").val(event.tmplink);
            $("#eventfrom").val(event.departure);
            $("#eventto").val(event.destination);
            $("#eventdistance").val(event.distance);
            offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
            $("#eventmts").val(new Date(event.mts * 1000 - offset).toISOString().substring(0, 16));
            $("#eventdts").val(new Date(event.dts * 1000 - offset).toISOString().substring(0, 16));
            imgs = "";
            for (let i = 0; i < event.img.length; i++) {
                imgs += event.img[i] + "\n";
            }
            if (event.private) $("#eventpvt-1").prop("checked", true);
            else $("#eventpvt-0").prop("checked", true);
            $("#eventimgs").val(imgs);

            if (showdetail != -1) eventDetail(showdetail);
        },
        error: function (data) {
            $("#fetchEventBtn").html("Fetch Data");
            $("#fetchEventBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to fetch event. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function FetchEventAttendee() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);
    }

    GeneralLoad();
    $("#fetchEventAttendeeBtn").html("Working...");
    $("#fetchEventAttendeeBtn").attr("disabled", "disabled");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/events?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            $("#fetchEventAttendeeBtn").html("Fetch Existing Attendees");
            $("#fetchEventAttendeeBtn").removeAttr("disabled");

            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);

            const event = data.response;
            attendeeids = event.attendeeid.split(",");
            attendeenames = event.attendee.split(",");
            $(".attendee").remove();
            for (let i = 0; i < attendeeids.length; i++) {
                userid = attendeeids[i];
                username = attendeenames[i];
                if (userid == "") continue;
                $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
            }
        },
        error: function (data) {
            $("#fetchEventAttendeeBtn").html("Fetch Existing Attendees");
            $("#fetchEventAttendeeBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to fetch event attendees. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function UpdateEventAttendees() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastFactory("error", "Error", "Event ID must be in integar!", 5000, false);
    }
    attendeeid = "";
    $(".attendee").each(function (index, value) {
        attendeeid += $(value).prop('id').replaceAll("attendeeid-", "") + ",";
    })
    attendeeid = attendeeid.substring(0, attendeeid.length - 1);
    points = $("#attendeePoints").val();
    if (!isNumber(points)) {
        return toastFactory("error", "Error", "Points must be in integar!", 5000, false);
    }

    GeneralLoad();
    $("#attendeeBtn").html("Working...");
    $("#attendeeBtn").attr("disabled", "disabled");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/attendee",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "eventid": eventid,
            "attendees": attendeeid,
            "points": points
        },
        success: function (data) {
            $("#attendeeBtn").html("Update");
            $("#attendeeBtn").removeAttr("disabled");

            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            loadEvent();
            Swal.fire({
                title: 'Event Attendees Updated!',
                html: "<p style='text-align:left'>" + data.response.message.replaceAll("\n", "<br>") + "</p>",
                icon: 'success',
                confirmButtonText: 'OK'
            })
        },
        error: function (data) {
            $("#attendeeBtn").html("Update");
            $("#attendeeBtn").removeAttr("disabled");
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to update event attendees. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })

}

function EventOp() {
    title = $("#eventtitle").val();
    tmplink = $("#eventtmplink").val();
    from = $("#eventfrom").val();
    to = $("#eventto").val();
    distance = $("#eventdistance").val();
    mts = +new Date($("#eventmts").val());
    dts = +new Date($("#eventdts").val());
    mts /= 1000;
    dts /= 1000;
    eventid = $("#eventid").val();
    pvt = $("#eventpvt-1").prop("checked");
    img = $("#eventimgs").val().replaceAll("\n", ",");

    GeneralLoad();
    $("#newEventBtn").html("Working...");
    $("#newEventBtn").attr("disabled", "disabled");

    op = "create";
    if (isNumber(eventid)) {
        if (title != "" || from != "" || to != "" || distance != "") {
            op = "update";
        } else {
            op = "delete";
        }
    }

    if (op == "update") {
        eventid = parseInt(eventid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event",
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "eventid": eventid,
                "title": title,
                "tmplink": tmplink,
                "departure": from,
                "destination": to,
                "distance": distance,
                "mts": mts,
                "dts": dts,
                "img": img,
                "pvt": pvt
            },
            success: function (data) {
                // Un-disable the submit button
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Event updated!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                    loadEvent();
                } else {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Error',
                        text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })
                    console.warn(`Event update failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                    console.log(data);
                }
            },
            error: function (data) {
                // Un-disable the submit button
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Event update failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
            }
        });
    } else if (op == "create") {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event",
            type: "POST",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "tmplink": tmplink,
                "departure": from,
                "destination": to,
                "distance": distance,
                "mts": mts,
                "dts": dts,
                "img": img,
                "pvt": pvt
            },
            success: function (data) {
                // Un-disable the submit button
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Event created!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                    loadEvent();
                } else {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Error',
                        text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                        icon: 'error',
                        confirmButtonText: 'OK'
                    })

                    console.warn(
                        `Event creation failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                    console.log(data);
                }
            },
            error: function (data) {
                // Un-disable the submit button
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Event creation failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
            }
        });
    } else if (op == "delete") {
        annid = parseInt(annid);
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
            type: "DELETE",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            success: function (data) {
                // Un-disable the submit button
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");
                if (data.error == false) {
                    // Trigger req swal.fire
                    Swal.fire({
                        title: 'Success',
                        text: 'Event deleted!',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    })
                    loadEvent();
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
                $("#newEventBtn").prop("disabled", false);
                $("#newEventBtn").html("Submit");

                // Trigger req swal.fire
                Swal.fire({
                    title: 'Error',
                    text: JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText,
                    icon: 'error',
                    confirmButtonText: 'OK'
                })

                console.warn(`Event deletion failed: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : 'Unknown error'}`);
                console.log(data);
            }
        });
    }
}
allevents = {};

function loadEvent(recurse = true) {
    page = parseInt($("#epages").val())
    if (page == "") page = 1;
    if (page == undefined) page = 1;

    if (eventsCalendar == undefined) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/events/all",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: async function (data) {
                if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
                const d = data.response.list;
                var eventlist = [];
                offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
                for (var i = 0; i < d.length; i++) {
                    eventlist.push({
                        "title": d[i].title,
                        "url": "/events?eventid=" + d[i].eventid,
                        "start": new Date(d[i].mts * 1000 - offset).toISOString().substring(0, 10)
                    })
                }

                setTimeout(async function () {
                    while ($("#loading").width() != 0) await sleep(50);
                    var eventsCalendarEl = document.getElementById('eventsCalendar');
                    var eventsCalendar = new FullCalendar.Calendar(eventsCalendarEl, {
                        initialView: 'dayGridMonth',
                        headerToolbar: {
                            left: 'prev,next today',
                            center: 'title'
                        },
                        eventClick: function (info) {
                            info.jsEvent.preventDefault();
                            eventid = parseInt(info.event.url.split("=")[1]);
                            eventDetail(eventid);
                        },
                        events: eventlist,
                        height: 'auto'
                    });
                    eventsCalendar.render();
                    setInterval(function () {
                        $(".fc-daygrid-event").removeClass("fc-daygrid-event");
                    }, 500);
                }, 50);
            },
            error: function (data) {
                toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
                console.warn(
                    `Failed to load events. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
                console.log(data);
            }
        })
    }

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/events?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#eventTable").empty();
            const events = data.response.list;
            if (events.length == 0) {
                $("#eventTableHead").hide();
                $("#eventTable").append(`
            <tr class="text-sm">
              <td class="py-5 px-6 font-medium">No Data</td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
              <td class="py-5 px-6 font-medium"></td>
            </tr>`);
                $("#epages").val(1);
                if (recurse) loadEvent(recurse = false);
                return;
            }
            $("#eventTableHead").show();
            totpage = Math.ceil(data.response.tot / 10);
            if (page > totpage) {
                $("#epages").val(1);
                if (recurse) loadEvent(recurse = false);
                return;
            }
            if (page <= 0) {
                $("#epages").val(1);
                page = 1;
            }
            $("#etotpages").html(totpage);
            $("#eventTableControl").children().remove();
            $("#eventTableControl").append(`
            <button type="button" style="display:inline"
            class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
            onclick="$('#epages').val(1);loadEvent();">1</button>`);
            if (page > 3) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            for (var i = Math.max(page - 1, 2); i <= Math.min(page + 1, totpage - 1); i++) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#epages').val(${i});loadEvent();">${i}</button>`);
            }
            if (page < totpage - 2) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                >...</button>`);
            }
            if (totpage > 1) {
                $("#eventTableControl").append(`
                <button type="button" style="display:inline"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="$('#epages').val(${totpage});loadEvent();">${totpage}</button>`);
            }

            for (i = 0; i < events.length; i++) {
                const event = events[i];
                allevents[event.eventid] = event;
                mts = event.mts * 1000;
                dts = event.dts * 1000;
                now = +new Date();
                color = "";
                if (now >= mts - 1000 * 60 * 60 * 6) {
                    color = "blue";
                }
                if (now >= mts && now <= dts + 1000 * 60 * 30) {
                    color = "lightgreen"
                }
                if (now > dts + 1000 * 60 * 30) {
                    color = "grey";
                }
                mt = getDateTime(mts);
                dt = getDateTime(dts);
                voteids = event.voteid.split(",");
                voteids = voteids.filter(function (el) {
                    return el != "";
                });
                votecnt = voteids.length;
                pvt = "";
                if (event.private) pvt = LOCKED;
                $("#eventTable").append(`
            <tr class="text-sm" style="color:${color}">
              <td class="py-5 px-6 font-medium">${event.eventid} ${pvt}</td>
              <td class="py-5 px-6 font-medium">${event.title}</td>
              <td class="py-5 px-6 font-medium">${event.departure}</td>
              <td class="py-5 px-6 font-medium">${event.destination}</td>
              <td class="py-5 px-6 font-medium">${event.distance}</td>
              <td class="py-5 px-6 font-medium">${mt}</td>
              <td class="py-5 px-6 font-medium">${dt}</td>
              <td class="py-5 px-6 font-medium">${votecnt}</td>
              <td class="py-5 px-6 font-medium">
              <button type="button" style="display:inline;padding:5px"
                class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                onclick="eventDetail('${event.eventid}')">Details</button></td>
            </tr>`);
            }
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000, false);
            console.warn(
                `Failed to load events. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    })
}

function eventvote(eventid) {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/vote",
        type: "POST",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "eventid": eventid
        },
        success: function (data) {
            if (data.error) return toastFactory("error", "Error:", data.descriptor, 5000, false);
            $("#eventid").val(eventid);
            FetchEvent(eventid, showdetail = eventid);
            return toastFactory("success", "Success:", data.response, 5000, false);
        },
        error: function (data) {
            toastFactory("error", "Error:", JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText, 5000,
                false);
            console.warn(
                `Failed to vote / unvote for event. Error: ${JSON.parse(data.responseText).descriptor  ? JSON.parse(data.responseText).descriptor  : data.status + " " + data.statusText}`);
            console.log(data);
        }
    });
}

async function eventDetail(eventid) {
    keys = Object.keys(allevents);
    if (keys.indexOf(String(eventid)) == -1) {
        $("#eventid").val(eventid);
        GeneralLoad();
        FetchEvent();
        while ($.active > 0) {
            await sleep(50);
        }
        keys = Object.keys(allevents);
        if (keys.indexOf(String(eventid)) == -1) {
            return toastFactory("error", "Error:", "Event not found.", 5000, false);
        }
    }
    event = allevents[eventid];
    voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Vote)</a>`;
    console.log(event);
    voteids = event.voteid.split(",");
    voteids = voteids.filter(function (el) {
        return el != "";
    });
    userid = localStorage.getItem("userid");
    if (voteids.indexOf(String(userid)) != -1) {
        voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Unvote)</a>`;
    }
    votecnt = voteids.length;
    info = `<div style="text-align:left">`;
    info += "<p><b>Event ID</b>: " + event.eventid + "</p>";
    info += "<p><b>From</b>: " + event.departure + "</p>";
    info += "<p><b>To</b>: " + event.destination + "</p>";
    info += "<p><b>Distance</b>: " + event.distance + "</p>";
    info += "<p><b>Meetup Time</b>: " + getDateTime(event.mts * 1000) + "</p>";
    info += "<p><b>Departure Time</b>: " + getDateTime(event.dts * 1000) + "</p>";
    info += "<p><b>Voted (" + votecnt + ")</b>: " + voteop + " " + event.vote + "</p>";
    info += "<p><b>Attendees</b>: " + event.attendee + "</p>";
    for (var i = 0; i < event.img.length; i++) {
        info += "<img src='" + event.img[i] + "' style='width:100%'/>";
    }
    info += "</div>";
    Swal.fire({
        title: `<a href='${event.tmplink}' target='_blank'>${event.title}</a>`,
        html: info,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}