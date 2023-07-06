import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent } from '@mui/material';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const DiscordAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const discordCode = searchParams.get('code');
    const discordError = searchParams.get('error');
    const discordErrorDescription = searchParams.get('error_description');

    const [message, setMessage] = useState("Validating authorization...");
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validateDiscordAuth() {
            try {
                let resp = await axios({ url: `${vars.dhpath}/auth/discord/callback`, params: { code: discordCode, callback_url: `${window.location.protocol}//${window.location.host}/discord-auth` }, method: `GET` });
                if (resp.status === 200) {
                    if (resp.data.mfa === false) {
                        setAuthToken(resp.data.token);
                        setMessage("You are authorized 🎉");
                        await FetchProfile();
                        setContinue(true);
                        setTimeout(function () { navigate('/'); }, 500);
                    } else {
                        navigate("/mfa?token=" + resp.data.token);
                        setMessage("MFA OTP Required 🔑");
                    }
                } else {
                    setContinue(true);
                    setMessage("❌ " + resp.data.error);
                }
            } catch (error) {
                console.error(error);
                setMessage("Error occurred! Check F12 for more info.");
            }
        } if (discordErrorDescription !== null) {
            setContinue(true);
            setMessage(`❌ Discord Error: ${discordErrorDescription}`);
            return;
        } else if (discordError !== null) {
            setContinue(true);
            setMessage(`❌ Discord Error: ${discordError}`);
            return;
        } else if (discordCode === null) {
            navigate("/discord-redirect");
            return;
        } else {
            validateDiscordAuth();
        }
    }, [discordCode, discordError, discordErrorDescription, navigate]);

    function handleContinue() {
        navigate('/');
    }

    return (
        <Card sx={{ width: 350, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>Discord Authorization</h2>
                <div><p>{message}</p></div>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={handleContinue} disabled={!allowContinue}>Continue</Button>
            </CardActions>
        </Card>
    );
}

export default DiscordAuth;