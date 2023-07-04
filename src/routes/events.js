import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import { LocalParkingRounded, TimeToLeaveRounded, FlightTakeoffRounded, FlightLandRounded, RouteRounded, HowToRegRounded, LocalShippingRounded, EmojiEventsRounded } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import MarkdownRenderer from '../components/markdown';
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

const EventCard = ({ imageUrl, title, description, meetupTime, departureTime, departure, destination, distance, votercnt, attendeecnt, points, futureEvent }) => {
    return (
        <Card>
            <CardMedia component="img" src={imageUrl} alt=" " />
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
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
                            <RouteRounded />&nbsp;&nbsp;{distance}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                            <HowToRegRounded />&nbsp;&nbsp;{votercnt}
                        </Typography>
                    </Grid>
                    {futureEvent !== true && <>
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
                </Grid>
                <Typography variant="body2" sx={{ marginTop: "20px" }}>
                    <MarkdownRenderer>{description}</MarkdownRenderer>
                </Typography>
            </CardContent>
        </Card>
    );
};

const Events = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const calendarRef = useRef(null);

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
            setAllEvents(curMonthEvents.list);

            let newCalendarEvents = [];
            for (let i = 0; i < curMonthEvents.list.length; i++) {
                let event = curMonthEvents.list[i];
                newCalendarEvents.push({ title: event.title, start: new Date(event.departure_timestamp * 1000).toISOString().split('T')[0] });
            }
            setCalendarEvents(newCalendarEvents);

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

    const handleEventClick = (eventClickInfo) => {
        const clickedEvent = eventClickInfo.event;
        console.log('Clicked event:', clickedEvent);
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

        mergeEvents(monthEvents.list);

        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    };
    useEffect(() => {
        let newCalendarEvents = [];
        for (let i = 0; i < allEvents.length; i++) {
            let event = allEvents[i];
            newCalendarEvents.push({ title: event.title, start: new Date(event.departure_timestamp * 1000).toISOString().split('T')[0] });
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
            {upcomingEvents.length !== 0 &&
                <Grid container spacing={2} sx={{ marginTop: "20px" }}>
                    <Grid item xs={upcomingEvents.length === 2 ? 6 : 12}>
                        <EventCard
                            imageUrl={upcomingEvents[0].image}
                            title={upcomingEvents[0].title}
                            description={upcomingEvents[0].description}
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