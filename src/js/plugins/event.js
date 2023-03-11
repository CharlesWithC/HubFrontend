allevents = {};

event_placerholder_row = `
<tr>
    <td style="width:calc(100% - 480px - 40%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 25%);"><span class="placeholder w-100"></span></td>
    <td style="width:120px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:180px;"><span class="placeholder w-100"></span></td>
    <td style="width:calc(100% - 480px - 10%);"><span class="placeholder w-100"></span></td>
</tr>`;

async function LoadEvent(noplaceholder = false) {
    // TODO Recursively fetch all events 
    if (eventsCalendar == undefined || force) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/event/list",
            type: "GET",
            contentType: "application/json", processData: false,
            headers: authorizationHeader,
            success: async function (data) {
                d = data.list;
                var eventlist = [];
                offset = (+new Date().getTimezoneOffset()) * 60 * 1000;
                for (var i = 0; i < d.length; i++) {
                    eventlist.push({
                        "title": d[i].title,
                        "url": "/event/" + d[i].eventid,
                        "start": new Date(d[i].meetup_timestamp * 1000 - offset).toISOString().slice(0, -1).substring(0, 10)
                    })
                }

                while (1) {
                    try {
                        FullCalendar;
                        break;
                    } catch {
                        await sleep(100);
                    }
                }

                var eventsCalendarEl = document.getElementById('events-calendar');
                var eventsCalendar = new FullCalendar.Calendar(eventsCalendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title'
                    },
                    eventClick: function (info) {
                        info.jsEvent.preventDefault();
                        eventid = info.event.url.split("/")[2];
                        ShowEventDetail(eventid);
                    },
                    events: eventlist,
                    height: 'auto'
                });
                eventsCalendar.render();
            },
            error: function (data) {
                AjaxError(data);
            }
        })
    }

    InitPaginate("#table_event_list", "LoadEvent();");
    page = parseInt($("#table_event_list_page_input").val());
    if (page == "" || page == undefined || page <= 0 || page == NaN) page = 1;
    if (!noplaceholder) {
        $("#table_event_list_data").empty();
        for (var i = 0; i < 10; i++) {
            $("#table_event_list_data").append(event_placerholder_row);
        }
    }
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/list?page=" + page,
        type: "GET",
        contentType: "application/json", processData: false,
        headers: authorizationHeader,
        success: async function (data) {

            eventList = data.list;
            total_pages = data.total_pages;
            data = [];

            while (1) {
                if (userPermLoaded) break;
                await sleep(100);
            }
            if (userPerm.includes("event") || userPerm.includes("admin")) {
                $("#event-new").show();
            }

            for (i = 0; i < eventList.length; i++) {
                event = eventList[i];
                allevents[event.eventid] = event;
                meetup_timestamp = event.meetup_timestamp * 1000;
                departure_timestamp = event.departure_timestamp * 1000;
                now = +new Date();
                style = "";
                if (now >= meetup_timestamp - 1000 * 60 * 60 * 6) style = "color:lightblue";
                if (now >= meetup_timestamp && now <= departure_timestamp + 1000 * 60 * 30) style = "color:lightgreen"
                if (now > departure_timestamp + 1000 * 60 * 30) style = "color:grey";
                mt = getDateTime(meetup_timestamp);
                dt = getDateTime(departure_timestamp);
                votecnt = event.votes.length;
                pvt = "";
                if (event.is_private) pvt = SVG_LOCKED;

                extra = "";
                if (userPerm.includes("event") || userPerm.includes("admin")) { extra = `<a id="button-event-edit-show-${event.eventid}" class="clickable" onclick="EditEventShow(${event.eventid});"><span class="rect-20"><i class="fa-solid fa-pen-to-square"></i></span></a><a id="button-event-delete-show-${event.eventid}" class="clickable" onclick="DeleteEventShow(${event.eventid});"><span class="rect-20"><i class="fa-solid fa-trash" style="color:red"></i></span></a>`; }

                data.push([`<tr_style>${style}</tr_style>`, `<a class="clickable" onclick="ShowEventDetail('${event.eventid}')">${pvt} ${event.title}</a>`, `${event.departure}`, `${event.destination}`, `${event.distance}`, `${mt.replaceAll(",", ",<br>")}`, `${dt.replaceAll(",", ",<br>")}`, `${votecnt}`, extra]);
            }

            PushTable("#table_event_list", data, total_pages, "LoadEvent();");
        },
        error: function (data) {
            AjaxError(data);
        }
    });
    while (1) {
        if (userPermLoaded) break;
        await sleep(100);
    }
    if (userPerm.includes("event") || userPerm.includes("admin")) {
        $("#event-new").show();
    }
}

async function ShowEventDetail(eventid, reload = false) {
    if (Object.keys(allevents).indexOf(String(eventid)) == -1 || reload) {
        $.ajax({
            url: api_host + "/" + dhabbr + "/event/" + eventid,
            type: "GET",
            contentType: "application/json", processData: false,
            headers: authorizationHeader,
            success: function (data) {
                allevents[eventid] = data;
                ShowEventDetail(eventid);
            },
            error: function (data) {
                return AjaxError(data);
            }
        });
        return;
    }
    event = allevents[eventid];
    voteop = `<a style="cursor:pointer;color:grey" onclick="VoteEvent(${eventid}, 'Voted')">(Vote)</a>`;
    vote = "";
    userid = localStorage.getItem("userid");
    for (i = 0; i < event.votes.length; i++) {
        vote += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.votes[i].userid})">${event.votes[i].name}</a>, `;
        if (event.votes[i].userid == String(userid)) {
            voteop = `<a style="cursor:pointer;color:grey" onclick="VoteEvent(${eventid}, 'Unvoted')">(Unvote)</a>`;
        }
    }
    vote = vote.substr(0, vote.length - 2);
    votecnt = event.votes.length;
    attendee = "";
    for (i = 0; i < event.attendees.length; i++) {
        attendee += `<a style="cursor:pointer" onclick="LoadUserProfile(${event.attendees[i].userid})">${event.attendees[i].name}</a>, `;
    }
    attendee = attendee.substr(0, attendee.length - 2);
    attendeeop = "";
    if (userPerm.includes("event") || userPerm.includes("admin")) {
        attendeeop = `<a style="cursor:pointer;color:grey" onclick="EditAttendeeShow(${event.eventid})">Edit</a>`;
    }

    distance = "&nbsp;";
    if (event.distance != "") distance = event.distance;
    info = `
    <div class="row w-100">
        <div class="col-5 m-auto" style="text-align:center">
            <p style="font-size:25px;"><b>${event.departure}</b></p>
        </div>
        <div class="col-2 m-auto" style="text-align:center">
            <p style="font-size:15px;margin-bottom:0;position:relative;width:130%;left:-15%">${distance}</p>
            <hr style="margin:5px">
            <p>&nbsp;</p>
        </div>
        <div class="col-5 m-auto" style="text-align:center">
            <p style="font-size:25px;"><b>${event.destination}</b></p>
        </div>
    </div>`;
    function GenTableRow(key, val) {
        return `<tr><td style="min-width:120px"><b>${key}</b></td><td>${val}</td></tr>\n`;
    }
    info += "<table style='width:100%'><tbody>";
    if (event.link != "") {
        info += GenTableRow(mltr("link"), `<a href="${event.link}" target="_blank">${event.link}</a>`);
    }
    info += GenTableRow(mltr("meetup"), getDateTime(event.meetup_timestamp * 1000));
    info += GenTableRow(mltr("departure"), getDateTime(event.departure_timestamp * 1000));
    if (userid != null && userid != -1) {
        info += GenTableRow(mltr("points"), parseInt(event.points));
        info += GenTableRow(`${mltr("voters")} ${voteop}`, vote);
        info += GenTableRow(`${mltr("attendees")} ${attendeeop}`, attendee);
    }

    info += "</tbody></table>"
    info += "<div class='w-100 mt-2' style='overflow:scroll'><p>" + marked.parse(event.description).replaceAll("<img", "<img style='width:100%' ") + "</p></div>";
    event_ics = ics();
    event_ics.addEvent(event.title, event.link + "\n" + event.description, event.departure + " - " + event.destination, new Date(event.meetup_timestamp * 1000), new Date(event.departure_timestamp * 1000));
    modalid = ShowModal(event.title, info, `<button type="button" class="btn btn-primary" data-bs-dismiss="modal" onclick="event_ics.download();">${mltr("export")} (.ics)</button><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("close")}</button>`);
    InitModal("event_detail", modalid);
}

function VoteEvent(eventid, resp) {
    let method = "";
    if (resp == "Voted") method = "PUT";
    else if (resp == "Unvoted") method = "DELETE";
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/" + eventid + "/vote",
        type: method,
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        success: function (data) {
            ShowEventDetail(eventid, reload = true)
            toastNotification("success", "Success", resp, 5000, false);
        },
        error: function (data) {
            AjaxError(data);
        }
    });
}

function CreateEvent() {
    title = $("#event-new-title").val();
    description = simplemde["#event-new-description"].value();
    truckersmp_link = $("#event-new-truckersmp-link").val();
    departure = $("#event-new-departure").val();
    destination = $("#event-new-destination").val();
    distance = $("#event-new-distance").val();
    meetup_timestamp = +new Date($("#event-new-meetup-time").val()) / 1000;
    departure_timestamp = +new Date($("#event-new-departure-time").val()) / 1000;
    is_private = $("#event-visibility-private").is(":checked");

    LockBtn("#button-event-new-create", mltr("creating"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/event",
        type: "POST",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        data: JSON.stringify({
            "title": title,
            "description": description,
            "link": truckersmp_link,
            "departure": departure,
            "destination": destination,
            "distance": distance,
            "meetup_timestamp": meetup_timestamp,
            "departure_timestamp": departure_timestamp,
            "is_private": is_private
        }),
        success: function (data) {
            UnlockBtn("#button-event-new-create");
            LoadEvent(force = true);
            toastNotification("success", "Success", mltr("event_created"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-event-new-create");
            AjaxError(data);
        }
    });
}

function EditEventShow(eventid) {
    e = allevents[eventid];
    title = e.title;
    description = e.description;
    truckersmp_link = e.link;
    departure = e.departure;
    destination = e.destination;
    distance = e.distance;
    meetup_timestamp = e.meetup_timestamp;
    departure_timestamp = e.departure_timestamp;
    is_private = e.is_private;
    $("#event-edit-id-span").html(eventid);
    $("#event-edit-id").val(eventid);
    $("#event-edit-title").val(title);
    simplemde["#event-edit-description"].value(description);
    $("#event-edit-truckersmp-link").val(truckersmp_link);
    $("#event-edit-departure").val(departure);
    $("#event-edit-destination").val(destination);
    $("#event-edit-distance").val(distance);
    $("#event-edit-meetup-time").val(new Date(parseInt(meetup_timestamp) * 1000).toISOString().slice(0, -1).slice(0, -1));
    $("#event-edit-departure-time").val(new Date(parseInt(departure_timestamp) * 1000).toISOString().slice(0, -1).slice(0, -1));
    if (is_private) $("#event-edit-visibility-private").prop("checked", true);
    else $("#event-edit-visibility-public").prop("checked", true);
    $("#event-edit").show();
}

function EditEvent() {
    LockBtn("#button-event-edit", mltr("editing"));
    eventid = $("#event-edit-id").val();
    title = $("#event-edit-title").val();
    description = simplemde["#event-edit-description"].value();
    truckersmp_link = $("#event-edit-truckersmp-link").val();
    departure = $("#event-edit-departure").val();
    destination = $("#event-edit-destination").val();
    distance = $("#event-edit-distance").val();
    meetup_timestamp = +new Date($("#event-edit-meetup-time").val()) / 1000;
    departure_timestamp = +new Date($("#event-edit-departure-time").val()) / 1000;
    is_private = $("#event-edit-visibility-private").is(":checked");
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/" + eventid,
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        data: JSON.stringify({
            "title": title,
            "description": description,
            "link": truckersmp_link,
            "departure": departure,
            "destination": destination,
            "distance": distance,
            "meetup_timestamp": meetup_timestamp,
            "departure_timestamp": departure_timestamp,
            "is_private": is_private
        }),
        success: function (data) {
            UnlockBtn("#button-event-edit");
            LoadEvent(force = true);
            toastNotification("success", "Success", mltr("event_edited"), 5000, false);
        },
        error: function (data) {
            UnlockBtn("#button-event-edit");
            AjaxError(data);
        }
    });
}

function DeleteEventShow(eventid) {
    if (shiftdown) return DeleteEvent(eventid);
    title = allevents[eventid].title;
    modalid = ShowModal(mltr("delete_event"), `<p>${mltr("delete_event_note")}</p><p><i>${title}</i></p><br><p style="color:#aaa"><span style="color:lightgreen">${mltr("delete_protip")}`, `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button><button id="button-event-delete-${eventid}" type="button" class="btn btn-danger" onclick="DeleteEvent(${eventid});">${mltr("delete")}</button>`);
    InitModal("delete_event", modalid);
}

function DeleteEvent(eventid) {
    LockBtn("#button-event-delete-" + eventid, mltr("deleting"));
    $.ajax({
        url: api_host + "/" + dhabbr + "/event/" + eventid,
        type: "DELETE",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + token
        },
        success: function (data) {
            UnlockBtn("#button-event-delete-" + eventid);
            LoadEvent(noplaceholder = true);
            toastNotification("success", "Success", mltr("event_deleted"), 5000, false);
            if (Object.keys(modals).includes("delete_event")) DestroyModal("delete_event");
        },
        error: function (data) {
            UnlockBtn("#button-event-delete-" + eventid);
            AjaxError(data);
        }
    });
}

function EditAttendeeShow(eventid) {
    modalid = ShowModal(mltr("edit_event_point__attendee"), `
    <p>#${eventid} | ${allevents[eventid].title}</p>
    <label for="event-edit-point" class="form-label">${mltr("event_points")}</label>
    <div class="input-group mb-3">
        <input type="number" class="form-control bg-dark text-white" id="event-edit-point" placeholder="3000">
    </div>
    <label for="event-edit-attendee" class="form-label">${mltr("attendees")}</label>
    <div class="input-group mb-3">
        <input type='text' id="event-edit-attendee" placeholder="${mltr("select_members_from_list")}" class="form-control bg-dark text-white flexdatalist" list="all-member-datalist" data-min-length='1' multiple='' data-selection-required='1'></input>
    </div>
    <p id="event-edit-message"></p>`,
        `<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${mltr("cancel")}</button>
    <button id="button-event-edit-attendee" type="button" class="btn btn-primary" onclick="EditEventAttendee(${eventid});">${mltr("edit")}</button>`);
    InitModal("edit_event_attendee", modalid, top = true);
    $('#event-edit-attendee').flexdatalist({
        selectionRequired: 1,
        minLength: 1
    });
    attendees = allevents[eventid].attendees;
    attendeestxt = "";
    for (var i = 0; i < attendees.length; i++) {
        attendeestxt += `${attendees[i].name} (${attendees[i].userid}),`;
    }
    attendeestxt = attendeestxt.slice(0, -1);
    $("#event-edit-point").val(allevents[eventid].points);
    $("#event-edit-attendee").val(attendeestxt);
}

function EditEventAttendee(eventid) {
    points = $("#event-edit-point").val();
    if (!isNumber(points)) {
        return toastNotification("error", "Error", mltr("invalid_event_point"), 5000);
    }
    attendeestxt = $("#event-edit-attendee").val();
    attendeest = attendeestxt.split(",");
    attendees = [];
    for (var i = 0; i < attendeest.length; i++) {
        s = attendeest[i];
        attendees.push(s.substr(s.lastIndexOf("(") + 1, s.lastIndexOf(")") - s.lastIndexOf("(") - 1));
    }

    LockBtn("#button-event-edit-attendee", mltr("editing"));

    $.ajax({
        url: api_host + "/" + dhabbr + "/event/" + eventid + "/attendees",
        type: "PATCH",
        contentType: "application/json", processData: false,
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        },
        data: JSON.stringify({
            "attendees": attendees,
            "points": points
        }),
        success: function (data) {
            UnlockBtn("#button-event-edit-attendee");
            LoadEvent(noplaceholder = true);
            $("#event-edit-message").html("<br>" + marked.parse(data.message).replaceAll("\n", "<br>"));
            toastNotification("success", "Sucess", mltr("event_point__attendee_updated"), 5000);
        },
        error: function (data) {
            UnlockBtn("#button-event-edit-attendee");
            AjaxError(data);
        }
    })
}