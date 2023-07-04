import React from 'react';
import { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Snackbar, Alert } from '@mui/material';
import { LocalParkingRounded, TimeToLeaveRounded, FlightTakeoffRounded, FlightLandRounded, RouteRounded, HowToRegRounded, LocalShippingRounded, EmojiEventsRounded, EditRounded, DeleteRounded, CheckBoxRounded, CheckBoxOutlineBlankRounded, PeopleAltRounded } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import { makeRequestsWithAuth, makeRequests, getFormattedDate, customAxios as axios, checkPerm } from '../functions';

var vars = require("../variables");

function ParseEventImage(events) {
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        const re = event.description.match(/^\[Image src="(.+)"\]/);
        if (re !== null) {
            const link = re[1];
            events[i].image = link;
            events[i].description = event.description.replace(`[Image src="${link}"]`, "").trimStart();
        }
    }
    return events;
}

function getDefaultDateRange() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const firstDay = firstDayOfMonth.getDay(); // Day of the week (0 - Sunday, 1 - Monday, ...)
    const lastSundayOfPreviousMonth = new Date(currentYear, currentMonth, 0);
    const daysUntilLastSunday = firstDay > 0 ? firstDay - 1 : 6;

    lastSundayOfPreviousMonth.setDate(lastSundayOfPreviousMonth.getDate() - daysUntilLastSunday);

    return {
        start: lastSundayOfPreviousMonth,
        end: lastDayOfMonth,
    };
}

const EventCard = ({ eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted, onVote, onUnvote, onUpdateAttendees, onEdit, onDelete }) => {
    const showControls = (vars.isLoggedIn && checkPerm(vars.userInfo.roles, ["admin", "event"]));
    const showButtons = (vars.isLoggedIn);

    const handleVote = useCallback(() => {
        onVote(eventid);
    }, [eventid, onVote]);

    const handleUnvote = useCallback(() => {
        onUnvote(eventid);
    }, [eventid, onUnvote]);

    const handleUpdateAttendees = useCallback(() => {
        onUpdateAttendees(eventid);
    }, [eventid, onUpdateAttendees]);

    const handleEdit = useCallback(() => {
        onEdit(eventid);
    }, [eventid, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(eventid);
    }, [eventid, onDelete]);

    return (
        <Card>
            <CardMedia component="img" src={imageUrl} alt=" " />
            <CardContent>
                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                    <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                        <a href={link} target="_blank" rel="noreferrer">{title}</a>
                    </Typography>
                    {showButtons && <>
                        {voted !== null && <IconButton size="small" aria-label={voted ? "Unvote" : "Vote"} onClick={voted ? handleUnvote : handleVote}>{voted ? <CheckBoxRounded /> : <CheckBoxOutlineBlankRounded />}</IconButton >}
                        {showControls && <>
                            <IconButton size="small" aria-label="Update Attendees" onClick={handleUpdateAttendees}><PeopleAltRounded /></IconButton >
                            <IconButton size="small" aria-label="Edit" onClick={handleEdit}><EditRounded /></IconButton >
                            <IconButton size="small" aria-label="Delete" onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                        </>}
                    </>}
                </div>
                <Grid container>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalParkingRounded />&nbsp;&nbsp;{meetupTime}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeToLeaveRounded />&nbsp;&nbsp;{departureTime}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <FlightTakeoffRounded />&nbsp;&nbsp;{departure}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <FlightLandRounded />&nbsp;&nbsp;{destination}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <RouteRounded />&nbsp;&nbsp;{distance !== "" ? distance : "N/A"}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <HowToRegRounded />&nbsp;&nbsp;{votercnt}
                        </Typography>
                    </Grid>
                    {futureEvent !== true && attendeecnt > 0 && <>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalShippingRounded />&nbsp;&nbsp;{attendeecnt}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmojiEventsRounded />&nbsp;&nbsp;{points}
                            </Typography>
                        </Grid>
                    </>}
                    {(voters !== undefined && voters !== <></>) && <>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', }}>
                                <HowToRegRounded />&nbsp;&nbsp;
                                <div style={{ display: 'inline-block', whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '100%' }}>
                                    <Typography variant="body2">{voters}</Typography>
                                </div>
                            </Typography>
                        </Grid>
                    </>}
                    {(attendees !== undefined && attendees !== <></>) && <>
                        <Grid item xs={12} sm={12} md={12} lg={12}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalShippingRounded />&nbsp;&nbsp;
                                <div style={{ display: 'inline-block', whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '100%' }}>
                                    <Typography variant="body2">{attendees}</Typography>
                                </div>
                            </Typography>
                        </Grid>
                    </>}
                </Grid>
                <Typography variant="body2" sx={{ marginTop: "20px" }}>
                    <MarkdownRenderer>{description}</MarkdownRenderer>
                </Typography>
            </CardContent>
        </Card >
    );
};

const EventsMemo = memo(({ upcomingEvents, setUpcomingEvents, calendarEvents, setCalendarEvents, allEvents, setAllEvents, openEventDetails, setOpenEventDetals, modalEvent, setModalEvent, setSnackbarContent, setSnackbarSeverity }) => {
    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const defaultDateRange = getDefaultDateRange();
            const [after, before] = [parseInt(defaultDateRange.start.getTime() / 1000), parseInt(defaultDateRange.end.getTime() / 1000)];

            let urls = [
                `${vars.dhpath}/events/list?page_size=2&page=1&after=${parseInt(+new Date() / 1000)}`,
                `${vars.dhpath}/events/list?page_size=250&page=1&after=${after}&before=${before}`
            ];
            let [events, curMonthEvents] = [{}, {}];

            if (vars.isLoggedIn) {
                [events, curMonthEvents] = await makeRequestsWithAuth(urls);
            } else {
                [events, curMonthEvents] = await makeRequests(urls);
            }
            setUpcomingEvents(ParseEventImage(events.list));
            setAllEvents(ParseEventImage(curMonthEvents.list));

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [setAllEvents, setUpcomingEvents]);

    const onVote = useCallback(async (eventid) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let resp = await axios({ url: `${vars.dhpath}/events/${eventid}/vote`, method: "PUT", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (resp.status === 204) {
            const updatedAllEvents = allEvents.map((event) => {
                if (event.eventid === eventid) {
                    return {
                        ...event,
                        votes: event.votes + 1,
                        voted: true,
                    };
                }
                return event;
            });

            const updatedUpcomingEvents = upcomingEvents.map((event) => {
                if (event.eventid === eventid) {
                    return {
                        ...event,
                        votes: event.votes + 1,
                        voted: true,
                    };
                }
                return event;
            });

            setAllEvents(updatedAllEvents);
            setUpcomingEvents(updatedUpcomingEvents);

            if (modalEvent.eventid === eventid) {
                let updatedModalEvent = { ...modalEvent, votecnt: modalEvent.votecnt + 1, voted: true };
                updatedModalEvent.votes.push(vars.userInfo);
                updatedModalEvent.voteO = <>{updatedModalEvent.votes.map((voter) => (<><UserCard user={voter} inline={true} />&nbsp;&nbsp;</>))}</>;
                setModalEvent(updatedModalEvent);
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [allEvents, modalEvent, setAllEvents, setModalEvent, setSnackbarContent, setSnackbarSeverity, setUpcomingEvents, upcomingEvents]);

    const onUnvote = useCallback(async (eventid) => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let resp = await axios({ url: `${vars.dhpath}/events/${eventid}/vote`, method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (resp.status === 204) {
            const updatedAllEvents = allEvents.map((event) => {
                if (event.eventid === eventid) {
                    return {
                        ...event,
                        votes: event.votes - 1,
                        voted: false,
                    };
                }
                return event;
            });

            const updatedUpcomingEvents = upcomingEvents.map((event) => {
                if (event.eventid === eventid) {
                    return {
                        ...event,
                        votes: event.votes - 1,
                        voted: false,
                    };
                }
                return event;
            });

            setAllEvents(updatedAllEvents);
            setUpcomingEvents(updatedUpcomingEvents);

            if (modalEvent.eventid === eventid) {
                const updatedModalEvent = { ...modalEvent, votecnt: modalEvent.votecnt - 1, voted: false };
                for (let i = 0; i < updatedModalEvent.votes.length; i++) {
                    if (updatedModalEvent.votes[i].userid === vars.userInfo.userid) {
                        updatedModalEvent.votes.splice(i, 1);
                        break;
                    }
                }
                updatedModalEvent.voteO = <>{updatedModalEvent.votes.map((voter) => (<><UserCard user={voter} inline={true} />&nbsp;&nbsp;</>))}</>;
                if (updatedModalEvent.votes.length === 0) updatedModalEvent.voteO = undefined;
                setModalEvent(updatedModalEvent);
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [allEvents, modalEvent, setAllEvents, setModalEvent, setSnackbarContent, setSnackbarSeverity, setUpcomingEvents, upcomingEvents]);

    const mergeEvents = useCallback((newEventList) => {
        setAllEvents((prevEvents) => {
            const mergedArray = [...prevEvents];

            newEventList.forEach((newEvent) => {
                const existingIndex = prevEvents.findIndex((item) => item.eventid === newEvent.eventid);

                if (existingIndex !== -1) {
                    mergedArray[existingIndex] = newEvent;
                } else {
                    mergedArray.push(newEvent);
                }
            });

            return mergedArray;
        });
    }, [setAllEvents]);

    const handleEventClick = useCallback((info) => {
        async function loadDetails(eventid, summary) {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let urls = [
                `${vars.dhpath}/events/${eventid}`,
            ];
            let event = {};

            if (vars.isLoggedIn) {
                [event] = await makeRequestsWithAuth(urls);
            } else {
                [event] = await makeRequests(urls);
            }

            event.attendeecnt = event.attendees.length;
            event.attendeeO = <>{event.attendees.map((attendee) => (<><UserCard user={attendee} inline={true} />&nbsp;&nbsp;</>))}</>;
            if (event.attendeecnt === 0) event.attendeeO = undefined;

            event.votecnt = event.votes.length;
            event.voteO = <>{event.votes.map((voter) => (<><UserCard user={voter} inline={true} />&nbsp;&nbsp;</>))}</>;
            if (event.votecnt === 0) event.voteO = undefined;

            setModalEvent(event);
            setOpenEventDetals(true);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }

        info.jsEvent.preventDefault();
        const eventid = parseInt(info.event.url.split("/")[2]);
        for (let i = 0; i < allEvents.length; i++) {
            if (allEvents[i].eventid === eventid) {
                loadDetails(eventid, allEvents[i]);
            }
        }
    }, [allEvents, setModalEvent, setOpenEventDetals]);
    const handleDateSet = useCallback(async (dateInfo) => {
        const start = parseInt(dateInfo.start.getTime() / 1000);
        const end = parseInt(dateInfo.end.getTime() / 1000);

        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);

        let urls = [
            `${vars.dhpath}/events/list?page_size=250&page=1&after=${start}&before=${end}`
        ];
        let [monthEvents] = [{}, {}];

        if (vars.isLoggedIn) {
            [monthEvents] = await makeRequestsWithAuth(urls);
        } else {
            [monthEvents] = await makeRequests(urls);
        }

        mergeEvents(ParseEventImage(monthEvents.list));

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [mergeEvents]);
    useEffect(() => {
        let newCalendarEvents = [];
        for (let i = 0; i < allEvents.length; i++) {
            let event = allEvents[i];
            newCalendarEvents.push({ url: `/event/${event.eventid}`, title: event.title, start: new Date(event.departure_timestamp * 1000).toISOString().split('T')[0] });
        }
        setCalendarEvents(newCalendarEvents);
    }, [allEvents, setCalendarEvents]);

    return (
        <>
            <Card sx={{ padding: "20px" }}>
                <FullCalendar
                    plugins={[dayGridPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    contentHeight="auto"
                    eventClick={handleEventClick}
                    datesSet={handleDateSet}
                />
            </Card>
            <Dialog open={openEventDetails} onClose={() => setOpenEventDetals(false)}>
                <DialogTitle>Event</DialogTitle>
                <DialogContent>
                    <EventCard
                        eventid={modalEvent.eventid}
                        imageUrl={modalEvent.image}
                        title={modalEvent.title}
                        description={modalEvent.description}
                        link={modalEvent.link}
                        meetupTime={getFormattedDate(new Date(modalEvent.meetup_timestamp * 1000))}
                        departureTime={getFormattedDate(new Date(modalEvent.departure_timestamp * 1000))}
                        departure={modalEvent.departure}
                        destination={modalEvent.destination}
                        distance={modalEvent.distance}
                        votercnt={modalEvent.votecnt}
                        attendeecnt={modalEvent.attendeecnt}
                        points={modalEvent.points}
                        voters={modalEvent.voteO}
                        attendees={modalEvent.attendeeO}
                        voted={modalEvent.voted}
                        onVote={onVote}
                        onUnvote={onUnvote}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setOpenEventDetals(false) }}>Close</Button>
                </DialogActions>
            </Dialog>
            {upcomingEvents.length !== 0 &&
                <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                    <Grid item xs={upcomingEvents.length === 2 ? 6 : 12}>
                        <EventCard
                            eventid={upcomingEvents[0].eventid}
                            imageUrl={upcomingEvents[0].image}
                            title={upcomingEvents[0].title}
                            description={upcomingEvents[0].description}
                            link={upcomingEvents[0].link}
                            meetupTime={getFormattedDate(new Date(upcomingEvents[0].meetup_timestamp * 1000))}
                            departureTime={getFormattedDate(new Date(upcomingEvents[0].departure_timestamp * 1000))}
                            departure={upcomingEvents[0].departure}
                            destination={upcomingEvents[0].destination}
                            distance={upcomingEvents[0].distance}
                            votercnt={upcomingEvents[0].votes}
                            futureEvent={true}
                            voted={upcomingEvents[0].voted}
                            onVote={onVote}
                            onUnvote={onUnvote}
                        />
                    </Grid>
                    {upcomingEvents.length === 2 && <Grid item xs={6}>
                        <EventCard
                            eventid={upcomingEvents[1].eventid}
                            imageUrl={upcomingEvents[1].image}
                            title={upcomingEvents[1].title}
                            description={upcomingEvents[1].description}
                            link={upcomingEvents[1].link}
                            meetupTime={getFormattedDate(new Date(upcomingEvents[1].meetup_timestamp * 1000))}
                            departureTime={getFormattedDate(new Date(upcomingEvents[1].departure_timestamp * 1000))}
                            departure={upcomingEvents[1].departure}
                            destination={upcomingEvents[1].destination}
                            distance={upcomingEvents[1].distance}
                            votercnt={upcomingEvents[1].votes}
                            futureEvent={true}
                            voted={upcomingEvents[1].voted}
                            onVote={onVote}
                            onUnvote={onUnvote}
                        />
                    </Grid>}
                </Grid>
            }
        </>
    );
});

const Events = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);

    const [openEventDetails, setOpenEventDetals] = useState(false);
    const [modalEvent, setModalEvent] = useState({});

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);


    return <>
        <EventsMemo upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} allEvents={allEvents} setAllEvents={setAllEvents} openEventDetails={openEventDetails} setOpenEventDetals={setOpenEventDetals} modalEvent={modalEvent} setModalEvent={setModalEvent} setSnackbarContent={setSnackbarContent} setSnackbarSeverity={setSnackbarSeverity} />

        <Snackbar
            dialogOpen={!!snackbarContent}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                {snackbarContent}
            </Alert>
        </Snackbar>
    </>;
};

export default Events;