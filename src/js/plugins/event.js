function HandleAttendeeInput(){
    $('#attendeeId').keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode == 13) {
            val = $("#attendeeId").val();
            if (val == "") return;
            $.ajax({
                url: apidomain + "/" + vtcprefix + "/member/list?page=1&order_by=highest_role&order=desc&name=" + val,
                type: "GET",
                dataType: "json",
                headers: {
                    "Authorization": "Bearer " + localStorage.getItem("token")
                },
                success: function (data) {
                    d = data.response.list;
                    if (d.length == 0) {
                        return toastNotification("error", "Error:", "No member with name " + val + " found.", 5000, false);
                    }
                    userid = d[0].userid;
                    username = d[0].name;
                    if ($(`#attendeeid-${userid}`).length > 0) {
                        return toastNotification("error", "Error:", "Member already added.", 5000, false);
                    }
                    $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                        <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
                    $("#attendeeId").val("");
                },
                error: function (data) {
                    return toastNotification("error", "Error:", "Failed to get User ID", 5000, false);
                }
            })
        } else if (keyCode == 8) {
            e.preventDefault();
            val = $("#attendeeId").val();
            if (val != "") {
                $("#attendeeId").val(val.substring(0, val.length - 1));
                return;
            }
            ch = $("#attendeeIdWrap").children();
            ch[ch.length - 2].remove();
        }
    });
}

function FetchEvent(showdetail = -1) {
    eventid = $("#eventid").val();
    if (!isNumber(eventid))
        return toastNotification("error", "Error", "Event ID must be in integar!", 5000, false);

    GeneralLoad();
    LockBtn("#fetchEventBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchEventBtn");
            if (data.error) return AjaxError(data);

            event = data.response;
            allevents[event.eventid] = event;
            $("#eventtitle").val(event.title);
            $("#eventtruckersmp_link").val(event.truckersmp_link);
            $("#eventfrom").val(event.departure);
            $("#eventto").val(event.destination);
            $("#eventdistance").val(event.distance);
            offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
            $("#eventmeetup_timestamp").val(new Date(event.meetup_timestamp * 1000 - offset).toISOString().substring(0, 16));
            $("#eventdeparture_timestamp").val(new Date(event.departure_timestamp * 1000 - offset).toISOString().substring(0, 16));
            description = event.description;
            if (event.is_private) $("#eventpvt-1").prop("checked", true);
            else $("#eventpvt-0").prop("checked", true);
            $("#eventimgs").val(description);

            if (showdetail != -1) eventDetail(showdetail);
        },
        error: function (data) {
            UnlockBtn("#fetchEventBtn");
            AjaxError(data);
        }
    })
}

function FetchEventAttendee() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastNotification("error", "Error", "Event ID must be in integar!", 5000, false);
    }

    GeneralLoad();
    LockBtn("#fetchEventAttendeeBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            UnlockBtn("#fetchEventAttendeeBtn");
            if (data.error) return AjaxError(data);

            event = data.response;
            $(".attendee").remove();
            for (let i = 0; i < event.attendees.length; i++) {
                userid = event.attendees[i].userid;
                username = event.attendees[i].name;
                if (userid == "") continue;
                $("#attendeeId").before(`<span class='tag attendee' id='attendeeid-${userid}'>${username} (${userid})
                <a style='cursor:pointer' onclick='$("#attendeeid-${userid}").remove()'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16"> <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/> </svg> </a></span>`);
            }
        },
        error: function (data) {
            UnlockBtn("#fetchEventAttendeeBtn");
            AjaxError(data);
        }
    })
}

function UpdateEventAttendees() {
    eventid = $("#aeventid").val();
    if (!isNumber(eventid)) {
        return toastNotification("error", "Error", "Event ID must be in integar!", 5000, false);
    }
    attendeeid = "";
    $(".attendee").each(function (index, value) {
        attendeeid += $(value).prop('id').replaceAll("attendeeid-", "") + ",";
    })
    attendeeid = attendeeid.substring(0, attendeeid.length - 1);
    points = $("#attendeePoints").val();
    if (!isNumber(points)) {
        return toastNotification("error", "Error", "Points must be in integar!", 5000, false);
    }

    GeneralLoad();
    LockBtn("#attendeeBtn");

    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/attendee?eventid=" + eventid,
        type: "PATCH",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: {
            "attendees": attendeeid,
            "points": points
        },
        success: function (data) {
            UnlockBtn("#attendeeBtn");
            if (data.error) return AjaxError(data);
            
            Swal.fire({
                title: 'Event Attendees Updated!',
                html: "<p style='text-align:left'>" + data.response.message.replaceAll("\n", "<br>") + "</p>",
                icon: 'success',
                confirmButtonText: 'OK'
            })
            LoadEventInfo();
        },
        error: function (data) {
            $("#attendeeBtn").html("Update");
            $("#attendeeBtn").removeAttr("disabled");
            AjaxError(data);
        }
    })
}

function EventOp() {
    title = $("#eventtitle").val();
    truckersmp_link = $("#eventtruckersmp_link").val();
    from = $("#eventfrom").val();
    to = $("#eventto").val();
    distance = $("#eventdistance").val();
    meetup_timestamp = +new Date($("#eventmeetup_timestamp").val());
    departure_timestamp = +new Date($("#eventdeparture_timestamp").val());
    meetup_timestamp /= 1000;
    departure_timestamp /= 1000;
    eventid = $("#eventid").val();
    pvt = $("#eventpvt-1").prop("checked");
    img = $("#eventimgs").val().replaceAll("\n", ",");

    GeneralLoad();
    LockBtn("#newEventBtn");

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
            url: apidomain + "/" + vtcprefix + "/event?eventid=" + eventid,
            type: "PATCH",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + token
            },
            data: {
                "title": title,
                "truckersmp_link": truckersmp_link,
                "departure": from,
                "destination": to,
                "distance": distance,
                "meetup_timestamp": meetup_timestamp,
                "departure_timestamp": departure_timestamp,
                "description": img,
                "is_private": pvt
            },
            success: function (data) {
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
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
                "truckersmp_link": truckersmp_link,
                "departure": from,
                "destination": to,
                "distance": distance,
                "meetup_timestamp": meetup_timestamp,
                "departure_timestamp": departure_timestamp,
                "description": img,
                "is_private": pvt
            },
            success: function (data) {
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
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
                UnlockBtn("#newEventBtn");
                if (data.error) return AjaxError(data);
                toastNotification("success", "Success", "", 5000, false);
            },
            error: function (data) {
                UnlockBtn("#newEventBtn");
                AjaxError(data);
            }
        });
    }
}

allevents = {};

function LoadEventInfo() {
    if (eventsCalendar == undefined) {
        $.ajax({
            url: apidomain + "/" + vtcprefix + "/event/all",
            type: "GET",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            success: async function (data) {
                if (data.error) return toastNotification("error", "Error:", data.descriptor, 5000, false);
                d = data.response.list;
                var eventlist = [];
                offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
                for (var i = 0; i < d.length; i++) {
                    eventlist.push({
                        "title": d[i].title,
                        "url": "/event?eventid=" + d[i].eventid,
                        "start": new Date(d[i].meetup_timestamp * 1000 - offset).toISOString().substring(0, 10)
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
                AjaxError(data);
            }
        })
    }

    InitPaginate("#table_event_list", "LoadEventInfo();");
    page = parseInt($("#table_event_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event?page=" + page,
        type: "GET",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastNotification("error", "Error:", data.descriptor, 5000, false);
            
            eventList = data.response.list;
            total_pages = data.response.total_pages;
            data = [];

            for (i = 0; i < eventList.length; i++) {
                event = eventList[i];
                allevents[event.eventid] = event;
                meetup_timestamp = event.meetup_timestamp * 1000;
                departure_timestamp = event.departure_timestamp * 1000;
                now = +new Date();
                style = "";
                if (now >= meetup_timestamp - 1000 * 60 * 60 * 6) style = "color:blue";
                if (now >= meetup_timestamp && now <= departure_timestamp + 1000 * 60 * 30) style = "color:lightgreen"
                if (now > departure_timestamp + 1000 * 60 * 30) style = "color:grey";
                mt = getDateTime(meetup_timestamp);
                dt = getDateTime(departure_timestamp);
                votecnt = event.votes.length;
                pvt = "";
                if (event.is_private) pvt = SVG_LOCKED;

                data.push([`<tr_style>${style}</tr_style>`, `${event.eventid} ${pvt}`, `${event.title}`, `${event.departure}`, 
                    `${event.destination}`, `${event.distance}`, `${mt}`, `${dt}`, `${votecnt}`, `<button type="button" style="display:inline;padding:5px"
                    class="w-full md:w-auto px-6 py-3 font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition duration-200"
                    onclick="eventDetail('${event.eventid}')">Details</button>`]);
            }

            PushTable("#table_event_list", data, total_pages, "LoadEventInfo();");
        },
        error: function (data) {
            AjaxError(data);
        }
    })
}

function eventvote(eventid) {
    $.ajax({
        url: apidomain + "/" + vtcprefix + "/event/vote?eventid=" + eventid,
        type: "PUT",
        dataType: "json",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            if (data.error) return toastNotification("error", "Error:", data.descriptor, 5000, false);
            $("#eventid").val(eventid);
            FetchEvent(eventid, showdetail = eventid);
            toastNotification("success", "Success", data.response, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
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
            return toastNotification("error", "Error:", "Event not found.", 5000, false);
        }
    }
    event = allevents[eventid];
    voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Vote)</a>`;
    vote = "";
    userid = localStorage.getItem("userid");
    for (i = 0; i < event.votes.length; i++) {
        vote += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.votes[i].userid})">${event.votes[i].name}</a>, `;
        if (event.votes[i].userid == String(userid)) {
            voteop = `<a style="cursor:pointer;color:grey" onclick="eventvote(${eventid})">(Unvote)</a>`;
        }
    }
    vote = vote.substr(0, vote.length - 2);
    votecnt = event.votes.length;
    attendee = "";
    for (i = 0; i < event.attendees.length; i++) {
        attendee += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.attendees[i].userid})">${event.attendees[i].name}</a>, `;
    }
    attendee = attendee.substr(0, attendee.length - 2);
    info = `<div style="text-align:left">`;
    info += "<p><b>Event ID</b>: " + event.eventid + "</p>";
    info += "<p><b>From</b>: " + event.departure + "</p>";
    info += "<p><b>To</b>: " + event.destination + "</p>";
    info += "<p><b>Distance</b>: " + event.distance + "</p>";
    info += "<p><b>Meetup Time</b>: " + getDateTime(event.meetup_timestamp * 1000) + "</p>";
    info += "<p><b>Departure Time</b>: " + getDateTime(event.departure_timestamp * 1000) + "</p>";
    info += "<p><b>Voted (" + votecnt + ")</b>: " + voteop + " " + vote + "</p>";
    info += "<p><b>Attendees</b>: " + attendee + "</p>";
    info += "<p>" + parseMarkdown(event.description) + "</p>";
    info += "</div>";
    Swal.fire({
        title: `<a href='${event.truckersmp_link}' target='_blank'>${event.title}</a>`,
        html: info,
        icon: 'info',
        confirmButtonText: 'Close'
    });
}