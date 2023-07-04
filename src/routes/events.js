import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { LocalParkingRounded, TimeToLeaveRounded, FlightTakeoffRounded, FlightLandRounded, RouteRounded, HowToRegRounded, LocalShippingRounded, EmojiEventsRounded } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import MarkdownRenderer from '../components/markdown';
import UserCard from '../components/usercard';
import { makeRequestsWithAuth, makeRequests, getFormattedDate } from '../functions';

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

const EventCard = ({ imageUrl, title, description, link, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent, voters, attendees }) => {
    return (
        <Card>
            <CardMedia component="img" src={imageUrl} alt=" " />
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    <a href={link} target="_blank" rel="noreferrer">{title}</a>
                </Typography>
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

const Events = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const calendarRef = useRef(null);

    const [openEventDetails, setOpenEventDetals] = useState(false);
    const [modalEvent, setModalEvent] = useState({});

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
    }, []);

    const mergeEvents = (newEventList) => {
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
    };

    const handleEventClick = (info) => {
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

            let attendees = <></>;
            for (let i = 0; i < event.attendees.length; i++) {
                attendees = <>{attendees}&nbsp;<UserCard user={event.attendees[i]} inline={false} /></>
            }
            summary.attendeecnt = parseInt(summary.attendees);
            summary.attendees = attendees;
            if (event.attendees.length === 0) summary.attendees = undefined;

            let votes = <></>;
            for (let i = 0; i < event.votes.length; i++) {
                votes = <>{votes}&nbsp;<UserCard user={event.votes[i]} inline={false} /></>
            }
            summary.votecnt = parseInt(summary.votes);
            summary.votes = votes;
            if (event.votes.length === 0) summary.votes = undefined;

            setModalEvent(summary);
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
    };
    const handleDateSet = async (dateInfo) => {
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
    };
    useEffect(() => {
        let newCalendarEvents = [];
        for (let i = 0; i < allEvents.length; i++) {
            let event = allEvents[i];
            newCalendarEvents.push({ url: `/event/${event.eventid}`, title: event.title, start: new Date(event.departure_timestamp * 1000).toISOString().split('T')[0] });
        }
        setCalendarEvents(newCalendarEvents);
    }, [allEvents]);

    return (
        <>
            <Card sx={{ padding: "20px" }}>
                <FullCalendar
                    ref={calendarRef}
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
                        voters={modalEvent.votes}
                        attendees={modalEvent.attendees}
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
                        />
                    </Grid>
                    {upcomingEvents.length === 2 && <Grid item xs={6}>
                        <EventCard
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
                        />
                    </Grid>}
                </Grid>
            }
        </>
    );
};

export default Events;