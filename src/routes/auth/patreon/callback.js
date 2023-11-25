import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Typography, useTheme } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPatreon } from '@fortawesome/free-brands-svg-icons';

import { customAxios as axios, getAuthToken } from '../../../functions';

var vars = require('../../../variables');

const PatreonAuth = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const patreonCode = searchParams.get('code');
    const patreonError = searchParams.get('error');
    const patreonErrorDescription = searchParams.get('error_description');

    const [message, setMessage] = useState("Validating authorization...");
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validatePatreonAuth() {
            try {
                if (getAuthToken() === null) {
                    setContinue(true);
                    setMessage("❌ You are not logged in!");
                    return;
                }

                let resp = await axios({ url: `${vars.dhpath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status !== 200) {
                    setContinue(true);
                    setMessage(`Failed to generate auth ticket, try again later...`);
                    return;
                }
                let ticket = resp.data.token;

                resp = await axios({ url: `https://config.chub.page/patreon`, params: { domain: window.location.host, code: patreonCode }, method: `PATCH`, headers: { Authorization: `Ticket ${ticket}` } });
                if (resp.status === 200) {
                    vars.userPatreonID = resp.data.patreon_id;
                    setMessage(`Patreon account connected 🎉`);
                    setContinue(true);
                    setTimeout(function () { navigate('/settings/general'); }, 3000);
                } else {
                    setContinue(true);
                    setMessage("❌ " + resp.data.error);
                }
            } catch (error) {
                console.error(error);
                setMessage("Error occurred! Check F12 for more info.");
            }
        } if (patreonErrorDescription !== null) {
            setContinue(true);
            setMessage(`❌ Patreon Error: ${patreonErrorDescription}`);
            return;
        } else if (patreonError !== null) {
            setContinue(true);
            setMessage(`❌ Patreon Error: ${patreonError}`);
            return;
        } else if (patreonCode === null) {
            window.location.href = "https://oauth.chub.page/patreon-auth?domain=" + encodeURIComponent(window.location.origin);
            return;
        } else {
            validatePatreonAuth();
        }
    }, [patreonCode, patreonError, patreonErrorDescription, navigate]);

    function handleContinue() {
        navigate('/settings/general');
    }

    return (
        <div style={{
            backgroundImage: `url(${vars.dhbgimage})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}>
            <Card sx={{ width: 400, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: "20px" }}>
                        <FontAwesomeIcon icon={faPatreon} />&nbsp;&nbsp;Patreon Authorization
                    </Typography>
                    <Typography variant="body">
                        {message}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleContinue} disabled={!allowContinue}>Continue</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default PatreonAuth;