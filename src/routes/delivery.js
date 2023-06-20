import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

import UserCard from '../components/usercard';
import { makeRequestsAuto } from '../functions';

var vars = require("../variables");

const Delivery = () => {
    const { logid } = useParams();
    const [dlog, setDlog] = useState({});

    useEffect(() => {
        async function doLoad() {
            const loadingStart = new CustomEvent('loadingStart', {});
            window.dispatchEvent(loadingStart);

            const [dlogD] = await makeRequestsAuto([
                { url: `${vars.dhpath}/dlog/${logid}`, auth: true },
            ]);
            setDlog(dlogD);

            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
        }
        doLoad();
    }, [logid]);

    return (<>
        {dlog.logid === undefined && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4">Delivery #{logid}</Typography>
        </div>}
        {dlog.logid !== undefined && <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4">Delivery #{logid}</Typography>
            <Typography variant="h4"><UserCard user={dlog.user} inline={true} /></Typography>
        </div>}
    </>
    );
};

export default Delivery;