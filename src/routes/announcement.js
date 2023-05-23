import { useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import AnnouncementCard from '../components/announcement';
import { makeRequests, makeRequestsWithAuth } from '../functions';

import axios from 'axios';
const axiosRetry = require('axios-retry');
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

var vars = require("../variables");

/*

Cases
i) Two ann without image -> 2-column grid
ii) One ann without image + one with image -> 2-row half/full column grid

*/


function Announcement() {
    const [announcements, setAnnouncemnts] = useState([]);

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            let url = `${vars.dhpath}/announcements/list?page_size=250`;
            if (announcements.length !== 0) {
                url = `${vars.dhpath}/announcements/list?page_size=250&after_announcementid=${announcements[announcements.length - 1].announcementid}`;
            }

            var newAnns = [];
            if (vars.isLoggedIn) {
                const [anns] = await makeRequestsWithAuth([
                    url
                ]);
                newAnns = anns.list;
            } else {
                const [anns] = await makeRequests([
                    url
                ]);
                newAnns = anns.list;
            }

            for (let i = 0; i < newAnns.length; i++) {
                newAnns[i] = { ...newAnns[i], "display": "half-width" };
            }

            setAnnouncemnts(newAnns);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        if (announcements.length === 0) {
            doLoad();
        }
    }, [announcements]);

    return (
        <Grid container spacing={3}>
            {announcements.map((announcement) => (
                <AnnouncementCard announcement={announcement} />
            ))}
        </Grid>
    );
}

export default Announcement;