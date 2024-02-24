import { useState, useEffect, useCallback, useContext, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context';

import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton, Snackbar, Alert, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, SpeedDial, SpeedDialIcon, SpeedDialAction } from '@mui/material';
import { LocalParkingRounded, TimeToLeaveRounded, FlightTakeoffRounded, FlightLandRounded, RouteRounded, HowToRegRounded, LocalShippingRounded, EmojiEventsRounded, EditRounded, DeleteRounded, CheckBoxRounded, CheckBoxOutlineBlankRounded, PeopleAltRounded, EditNoteRounded } from '@mui/icons-material';
import { Portal } from '@mui/base';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import DateTimeField from '../components/datetime';
import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import UserSelect from '../components/userselect';

import { makeRequestsWithAuth, makeRequests, getFormattedDate, customAxios as axios, checkPerm, checkUserPerm, getAuthToken, toLocalISOString } from '../functions';

var vars = require("../variables");

function ParseEventImage(events) {
    for (let i = 0; i < events.length; i++) {
        let event = events[i];
        const re = event.description.match(/^\[Image src="(.+)"\]/);
        if (re !== null) {
            const link = re[1];
            events[i].image = link;
        }
    }
    return events;
}

const EventCard = ({ event, eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted, onVote, onUnvote, onUpdateAttendees, onEdit, onDelete }) => {
    const { t: tr } = useTranslation();
    const { curUID, curUserPerm, userSettings } = useContext(AppContext);

    const showControls = onEdit !== undefined && (curUID !== null && checkUserPerm(curUserPerm, ["administrator", "manage_events"]));
    const showButtons = onEdit !== undefined && (curUID !== null);

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
        onEdit(event);
    }, [event, onEdit]);

    const [isShiftPressed, setIsShiftPressed] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.keyCode === 16) {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.keyCode === 16) {
                setIsShiftPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const handleDelete = useCallback(() => {
        onDelete({ event, eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted, isShiftPressed });
    }, [onDelete, event, eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted, isShiftPressed]);

    description = description.replace(`[Image src="${imageUrl}"]`, "").trimStart();

    return (
        <Card>
            {imageUrl !== undefined && <CardMedia component="img" src={imageUrl} alt="" />}
            <CardContent>
                <div style={{ marginBottom: "10px", display: 'flex', alignItems: "center" }}>
                    <Typography variant="h6" gutterBottom sx={{ flexGrow: 1 }}>
                        <a href={link} target="_blank" rel="noreferrer">{title}</a>
                    </Typography>
                    {showButtons && <>
                        {voted !== null && <IconButton size="small" aria-label={voted ? tr("unvote") : tr("vote")} onClick={voted ? handleUnvote : handleVote}>{voted ? <CheckBoxRounded /> : <CheckBoxOutlineBlankRounded />}</IconButton >}
                        {showControls && <>
                            <IconButton size="small" aria-label={tr("update_attendees")} onClick={handleUpdateAttendees}><PeopleAltRounded /></IconButton >
                            <IconButton size="small" aria-label={tr("edit")} onClick={handleEdit}><EditRounded /></IconButton >
                            <IconButton size="small" aria-label={tr("delete")} onClick={handleDelete}><DeleteRounded sx={{ "color": "red" }} /></IconButton >
                        </>}
                    </>}
                </div>
                <Grid container>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalParkingRounded />&nbsp;&nbsp;{getFormattedDate(userSettings.display_timezone, meetupTime * 1000)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeToLeaveRounded />&nbsp;&nbsp;{getFormattedDate(userSettings.display_timezone, departureTime * 1000)}
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

const EventsMemo = memo(({ upcomingEvents, setUpcomingEvents, calendarEvents, setCalendarEvents, allEvents, setAllEvents, openEventDetails, setOpenEventDetals, modalEvent, setModalEvent, setSnackbarContent, setSnackbarSeverity, onEdit, onDelete, onUpdateAttendees, doReload }) => {
    const { t: tr } = useTranslation();
    const { apiPath, curUID, curUser } = useContext(AppContext);

    useEffect(() => {
        async function doLoad() {
            window.loading += 1;

            let events;
            if (curUID !== null) {
                [events] = await makeRequestsWithAuth([`${apiPath}/events/list?page_size=2&page=1&meetup_after=${parseInt(+new Date() / 1000)}`]);
            } else {
                [events] = await makeRequests([`${apiPath}/events/list?page_size=2&page=1&meetup_after=${parseInt(+new Date() / 1000)}`]);
            }
            setUpcomingEvents(ParseEventImage(events.list));

            window.loading -= 1;
        }
        doLoad();
    }, [apiPath, setAllEvents, setUpcomingEvents, doReload]);

    const onVote = useCallback(async (eventid) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/events/${eventid}/vote`, method: "PUT", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
                updatedModalEvent.votes.push(curUser);
                updatedModalEvent.voteO = <>{updatedModalEvent.votes.map((voter) => (<><UserCard user={voter} inline={true} />&nbsp;&nbsp;</>))}</>;
                setModalEvent(updatedModalEvent);
            }
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        window.loading -= 1;
    }, [apiPath, allEvents, modalEvent, setAllEvents, setModalEvent, setSnackbarContent, setSnackbarSeverity, setUpcomingEvents, upcomingEvents]);

    const onUnvote = useCallback(async (eventid) => {
        window.loading += 1;

        let resp = await axios({ url: `${apiPath}/events/${eventid}/vote`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
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
                    if (updatedModalEvent.votes[i].userid === curUser.userid) {
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

        window.loading -= 1;
    }, [apiPath, allEvents, modalEvent, setAllEvents, setModalEvent, setSnackbarContent, setSnackbarSeverity, setUpcomingEvents, upcomingEvents]);

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
            window.loading += 1;

            let urls = [
                `${apiPath}/events/${eventid}`,
            ];
            let event = {};

            if (curUID !== null) {
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

            window.loading -= 1;
        }

        info.jsEvent.preventDefault();
        const eventid = parseInt(info.event.url.split("/")[2]);
        for (let i = 0; i < allEvents.length; i++) {
            if (allEvents[i].eventid === eventid) {
                loadDetails(eventid, allEvents[i]);
            }
        }
    }, [apiPath, allEvents, setModalEvent, setOpenEventDetals]);
    const handleDateSet = useCallback(async (dateInfo) => {
        const start = parseInt(dateInfo.start.getTime() / 1000 - 86400 * 14);
        const end = parseInt(dateInfo.end.getTime() / 1000 + 86400 * 14);

        window.loading += 1;

        let urls = [
            `${apiPath}/events/list?page_size=250&page=1&meetup_after=${start}&meetup_before=${end}`
        ];
        let [monthEvents] = [{}, {}];

        if (curUID !== null) {
            [monthEvents] = await makeRequestsWithAuth(urls);
        } else {
            [monthEvents] = await makeRequests(urls);
        }

        mergeEvents(ParseEventImage(monthEvents.list));

        window.loading -= 1;
    }, [apiPath]);
    useEffect(() => {
        let newCalendarEvents = [];
        for (let i = 0; i < allEvents.length; i++) {
            let event = allEvents[i];
            newCalendarEvents.push({ url: `/event/${event.eventid}`, title: event.title, start: toLocalISOString(new Date(event.departure_timestamp * 1000)).split('T')[0] });
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
                <DialogTitle>{tr("event")}</DialogTitle>
                <DialogContent>
                    <EventCard
                        event={modalEvent}
                        eventid={modalEvent.eventid}
                        imageUrl={modalEvent.image}
                        title={modalEvent.title}
                        description={modalEvent.description}
                        link={modalEvent.link}
                        meetupTime={modalEvent.meetup_timestamp}
                        departureTime={modalEvent.departure_timestamp}
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
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onUpdateAttendees={onUpdateAttendees}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setOpenEventDetals(false); }}>{tr("close")}</Button>
                </DialogActions>
            </Dialog>
            {upcomingEvents.length !== 0 &&
                <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                    <Grid item xs={upcomingEvents.length === 2 ? 6 : 12}>
                        <EventCard
                            event={upcomingEvents[0]}
                            eventid={upcomingEvents[0].eventid}
                            imageUrl={upcomingEvents[0].image}
                            title={upcomingEvents[0].title}
                            description={upcomingEvents[0].description}
                            link={upcomingEvents[0].link}
                            meetupTime={upcomingEvents[0].meetup_timestamp}
                            departureTime={upcomingEvents[0].departure_timestamp}
                            departure={upcomingEvents[0].departure}
                            destination={upcomingEvents[0].destination}
                            distance={upcomingEvents[0].distance}
                            votercnt={upcomingEvents[0].votes}
                            futureEvent={true}
                            voted={upcomingEvents[0].voted}
                            onVote={onVote}
                            onUnvote={onUnvote}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateAttendees={onUpdateAttendees}
                        />
                    </Grid>
                    {upcomingEvents.length === 2 && <Grid item xs={6}>
                        <EventCard
                            event={upcomingEvents[1]}
                            eventid={upcomingEvents[1].eventid}
                            imageUrl={upcomingEvents[1].image}
                            title={upcomingEvents[1].title}
                            description={upcomingEvents[1].description}
                            link={upcomingEvents[1].link}
                            meetupTime={upcomingEvents[1].meetup_timestamp}
                            departureTime={upcomingEvents[1].departure_timestamp}
                            departure={upcomingEvents[1].departure}
                            destination={upcomingEvents[1].destination}
                            distance={upcomingEvents[1].distance}
                            votercnt={upcomingEvents[1].votes}
                            futureEvent={true}
                            voted={upcomingEvents[1].voted}
                            onVote={onVote}
                            onUnvote={onUnvote}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onUpdateAttendees={onUpdateAttendees}
                        />
                    </Grid>}
                </Grid>
            }
        </>
    );
});

const EventManagers = memo(() => {
    const { allPerms, users, memberUIDs } = useContext(AppContext);
    const allMembers = memberUIDs.map((uid) => users[uid]);

    let managers = [];
    for (let i = 0; i < allMembers.length; i++) {
        if (checkPerm(allMembers[i].roles, ["administrator", "manage_events"], allPerms)) {
            managers.push(allMembers[i]);
        }
    }

    return <>{
        managers.map((user) => (
            <UserCard user={user} useChip={true} inline={true} />
        ))
    }</>;
});

const Events = () => {
    const { t: tr } = useTranslation();
    const { apiPath, curUser, curUserPerm } = useContext(AppContext);

    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [editId, setEditId] = useState(null);
    const [doReload, setDoReload] = useState(0);

    const [openEventDetails, setOpenEventDetals] = useState(false);
    const [modalEvent, setModalEvent] = useState({});
    const [openAttendeeEvent, setOpenAttendeeEvent] = useState(false);
    const [attendeeEvent, setAttendeeEvent] = useState({});
    const [eventAttendees, setEventAttendees] = useState([]);
    const [points, setPoints] = useState(0);

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState(tr("create_event"));
    const [dialogButton, setDialogButton] = useState(tr("create"));
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [description, setDescription] = useState('');
    const [departure, setDeparture] = useState('');
    const [destination, setDestination] = useState('');
    const [distance, setDistance] = useState('');
    const [meetupTime, setMeetupTime] = useState(undefined);
    const [departureTime, setDepartureTime] = useState(undefined);
    const [visibility, setVisibility] = useState('public');
    const [orderId, setOrderId] = useState('');
    const [isPinned, setIsPinned] = useState('false');
    const [submitLoading, setSubmitLoading] = useState(false);

    const [dialogDelete, setDialogDelete] = useState(false);
    const [toDelete, setToDelete] = useState(null);
    const [dialogManagers, setDialogManagers] = useState(false);

    const clearModal = useCallback(() => {
        setTitle('');
        setLink('');
        setDescription('');
        setDeparture('');
        setDestination('');
        setDistance('');
        setMeetupTime(undefined);
        setDepartureTime(undefined);
        setVisibility('public');
        setOrderId('');
        setIsPinned('false');
    }, []);

    const createEvent = useCallback(() => {
        if (editId !== null) {
            setEditId(null);
            clearModal();
        }
        setDialogTitle(tr("create_event"));
        setDialogButton(tr("create"));
        setDialogOpen(true);
    }, [editId, clearModal]);

    const editEvent = useCallback(async (event) => {
        clearModal();

        setTitle(event.title);
        setLink(event.link);
        setDescription(event.description);
        setDeparture(event.departure);
        setDestination(event.destination);
        setDistance(event.distance);
        setMeetupTime(event.meetup_timestamp);
        setDepartureTime(event.departure_timestamp);
        setVisibility(event.is_private ? "private" : "public");
        setOrderId(0);
        setIsPinned(false);

        setEditId(event.eventid);

        setDialogTitle(tr("edit_event"));
        setDialogButton(tr("edit"));
        setDialogOpen(true);
    }, [clearModal]);

    const editEventAttendees = useCallback(async (eventid) => {
        window.loading += 1;

        let [event] = await makeRequestsWithAuth([`${apiPath}/events/${eventid}`]);
        if (event.error === undefined) {
            setAttendeeEvent(event);
            setOpenAttendeeEvent(true);
            setEventAttendees(event.attendees);
            setPoints(event.points);
        }

        window.loading -= 1;
    }, [apiPath]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        const eventData = {
            title,
            description,
            link: link,
            departure,
            destination,
            distance,
            meetup_timestamp: meetupTime,
            departure_timestamp: departureTime,
            is_private: visibility === "private",
        };

        let resp;
        if (editId === null) {
            resp = await axios.post(`${apiPath}/events`, eventData, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
        } else {
            resp = await axios.patch(`${apiPath}/events/${editId}`, eventData, {
                headers: { Authorization: `Bearer ${getAuthToken()}` },
            });
        }

        if (resp.status === 200 || resp.status === 204) {
            setDoReload(+new Date());
            setSnackbarContent(editId === null ? tr("event_posted") : tr("event_updated"));
            setSnackbarSeverity("success");
            clearModal();
            setDialogOpen(false);
            if (editId !== null) setEditId(null);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setSubmitLoading(false);
    }, [apiPath, title, description, link, departure, destination, distance, meetupTime, departureTime, visibility, editId]);

    const deleteEvent = useCallback(async ({ event, eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted, isShiftPressed, confirmed }) => {
        if (isShiftPressed === true || confirmed === true) {
            setSubmitLoading(true);
            let resp = await axios({ url: `${apiPath}/events/${eventid}`, method: "DELETE", headers: { Authorization: `Bearer ${getAuthToken()}` } });
            if (resp.status === 204) {
                setDoReload(+new Date());
                setSnackbarContent(tr("event_deleted"));
                setSnackbarSeverity("success");
                setDialogDelete(false);
                setToDelete(null);
            } else {
                setSnackbarContent(resp.data.error);
                setSnackbarSeverity("error");
            }
            setSubmitLoading(false);
        } else {
            setDialogDelete(true);
            setToDelete({ event, eventid, imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees, voted });
        }
    }, [apiPath]);

    const handleUpdateAttendees = useCallback(async (e) => {
        e.preventDefault();
        setSubmitLoading(true);

        let attendees = eventAttendees.map(user => user.userid);

        let resp = await axios.patch(`${apiPath}/events/${attendeeEvent.eventid}/attendees`, { attendees: attendees, points: points }, {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
        });

        if (resp.status === 200 || resp.status === 204) {
            setSnackbarContent(resp.message);
            setSnackbarSeverity("success");
            setOpenAttendeeEvent(false);

            let event = { ...attendeeEvent, attendees: eventAttendees, points: points };
            event.attendeecnt = event.attendees.length;
            event.attendeeO = <>{event.attendees.map((attendee) => (<><UserCard user={attendee} inline={true} />&nbsp;&nbsp;</>))}</>;
            if (event.attendeecnt === 0) event.attendeeO = undefined;
            setModalEvent(event);
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setSubmitLoading(false);
    }, [apiPath, attendeeEvent, eventAttendees, points]);

    return <>
        <EventsMemo upcomingEvents={upcomingEvents} setUpcomingEvents={setUpcomingEvents} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} allEvents={allEvents} setAllEvents={setAllEvents} openEventDetails={openEventDetails} setOpenEventDetals={setOpenEventDetals} modalEvent={modalEvent} setModalEvent={setModalEvent} setSnackbarContent={setSnackbarContent} setSnackbarSeverity={setSnackbarSeverity} onEdit={editEvent} onDelete={deleteEvent} doReload={doReload} onUpdateAttendees={editEventAttendees} />

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit} style={{ marginTop: "5px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("title")}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("link")}
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("description")}
                                multiline
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                fullWidth
                                minRows={4}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("departure")}
                                value={departure}
                                onChange={(e) => setDeparture(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("destination")}
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label={tr("distance")}
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label={tr("meetup_time")}
                                defaultValue={meetupTime}
                                onChange={(timestamp) => setMeetupTime(timestamp)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateTimeField
                                label={tr("departure_time")}
                                defaultValue={departureTime}
                                onChange={(timestamp) => setDepartureTime(timestamp)}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{tr("visibility")}</FormLabel>
                                <RadioGroup
                                    value={visibility}
                                    row
                                    onChange={(e) => setVisibility(e.target.value)}
                                >
                                    <FormControlLabel value="public" control={<Radio />} label={tr("public")} />
                                    <FormControlLabel value="private" control={<Radio />} label={tr("private")} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <TextField
                                    label={tr("order_id")}
                                    value={orderId}
                                    onChange={(e) => { let f = e.target.value.startsWith("-"); setOrderId((f ? "-" : "") + e.target.value.replace(/[^0-9]/g, "")); }}
                                    fullWidth
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">{tr("is_pinned")}</FormLabel>
                                <RadioGroup
                                    value={isPinned}
                                    row
                                    onChange={(e) => setIsPinned(e.target.value)}
                                >
                                    <FormControlLabel value={true} control={<Radio />} label={tr("yes")} />
                                    <FormControlLabel value={false} control={<Radio />} label={tr("no")} />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogOpen(false); clearModal(); }}>{tr("cancel")}</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={submitLoading}>{dialogButton}</Button>
            </DialogActions>
        </Dialog>
        <SpeedDial
            ariaLabel={tr("controls")}
            sx={{ position: 'fixed', bottom: 20, right: 20 }}
            icon={<SpeedDialIcon />}
        >
            {checkUserPerm(curUserPerm, ["administrator", "manage_events"]) && <SpeedDialAction
                key="create"
                icon={<EditNoteRounded />}
                tooltipTitle={tr("create")}
                onClick={() => createEvent()}
            />}
            {curUser.userid !== -1 && <SpeedDialAction
                key="managers"
                icon={<PeopleAltRounded />}
                tooltipTitle={tr("managers")}
                onClick={() => setDialogManagers(true)}
            />}
        </SpeedDial>
        <Dialog open={dialogDelete} onClose={() => setDialogDelete(false)}>
            <DialogTitle>{tr("delete_event")}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ minWidth: "400px", marginBottom: "20px" }}>{tr("delete_event_confirm")}</Typography>
                {toDelete !== null &&
                    <EventCard
                        event={toDelete.event}
                        eventid={toDelete.eventid}
                        imageUrl=""
                        title={toDelete.title}
                        description=""
                        link=""
                        meetupTime={toDelete.meetupTime}
                        departureTime={toDelete.departureTime}
                        departure={toDelete.departure}
                        destination={toDelete.destination}
                        distance={toDelete.distance}
                        votercnt={toDelete.votercnt}
                        futureEvent={true}
                        onEdit={null}
                        onDelete={null}
                    />}
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogDelete(false); }}>{tr("cancel")}</Button>
                <Button variant="contained" color="error" onClick={() => { deleteEvent({ ...toDelete.event, confirmed: true }); }} disabled={submitLoading}>{tr("delete")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={openAttendeeEvent} onClose={() => setOpenAttendeeEvent(false)}>
            <DialogTitle>{attendeeEvent.title}</DialogTitle>
            <DialogContent>
                <form onSubmit={handleUpdateAttendees} style={{ marginTop: "5px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <UserSelect label={tr("attendees")} users={eventAttendees} onUpdate={setEventAttendees} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label={tr("points")}
                                value={points}
                                onChange={(e) => { let f = e.target.value.startsWith("-"); setPoints((f ? "-" : "") + e.target.value.replace(/[^0-9]/g, "")); }}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setOpenAttendeeEvent(false); }}>{tr("close")}</Button>
                <Button variant="contained" onClick={handleUpdateAttendees} disabled={submitLoading}>{tr("update")}</Button>
            </DialogActions>
        </Dialog>
        <Dialog open={dialogManagers} onClose={() => setDialogManagers(false)}>
            <DialogTitle>{tr("event_managers")}</DialogTitle>
            <DialogContent>
                <EventManagers />
            </DialogContent>
            <DialogActions>
                <Button variant="primary" onClick={() => { setDialogManagers(false); }}>{tr("close")}</Button>
            </DialogActions>
        </Dialog>
        <Portal>
            <Snackbar
                open={!!snackbarContent}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                    {snackbarContent}
                </Alert>
            </Snackbar>
        </Portal>
    </>;
};

export default Events;