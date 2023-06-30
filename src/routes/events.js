import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid } from '@mui/material';
import { LocalParkingRounded, TimeToLeaveRounded, FlightTakeoffRounded, FlightLandRounded } from '@mui/icons-material';
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

const EventCard = ({ imageUrl, title, description, meetupTime, departureTime, departure, destination }) => {
    return (
        <Card>
            <CardMedia component="img" src={imageUrl} alt=" " />
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" gutterBottom>
                    {description}
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
                </Grid>
            </CardContent>
        </Card>
    );
};

const Events = () => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        async function doLoad() {

            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            if (vars.isLoggedIn) {
                const [events] = await makeRequestsWithAuth([
                    `${vars.dhpath}/events/list?page_size=2&page=1&after=${parseInt(+new Date() / 1000)}`
                ]);
                setUpcomingEvents(ParseEventImage(events.list));
            } else {
                const [events] = await makeRequests([
                    `${vars.dhpath}/events/list?page_size=2&page=1&after=${parseInt(+new Date() / 1000)}`
                ]);
                setUpcomingEvents(ParseEventImage(events.list));
            }

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, []);

    return (
        <>{upcomingEvents.length !== 0 &&
            <Grid container spacing={2}>
                <Grid item xs={upcomingEvents.length === 2 ? 6 : 12}>
                    <EventCard
                        imageUrl={upcomingEvents[0].image}
                        title={upcomingEvents[0].title}
                        description={upcomingEvents[0].description}
                        meetupTime={getFormattedDate(new Date(upcomingEvents[0].meetup_timestamp * 1000))}
                        departureTime={getFormattedDate(new Date(upcomingEvents[0].departure_timestamp * 1000))}
                        departure={upcomingEvents[0].departure}
                        destination={upcomingEvents[0].destination}
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
                    />
                </Grid>}
            </Grid>
        }</>
    );
};

export default Events;