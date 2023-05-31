// NOTE: NOT TESTED!

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent } from '@mui/material';

import { FetchProfile, customAxios as axios } from '../../functions';

var vars = require('../../variables');

const SteamAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState("Validating authorization...");
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validateSteamAuth() {
            try {
                let resp = await axios({ url: `${vars.dhpath}/auth/steam/callback` + location.search, method: `GET` });
                if (resp.status === 200) {
                    if (resp.data.mfa === false) {
                        localStorage.setItem("token", resp.data.token);
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
        }
        validateSteamAuth();
    }, [location.search, navigate]);

    function handleContinue() {
        navigate('/');
    }

    return (
        <Card sx={{ width: 350, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>Steam Authorization</h2>
                <div><p>{message}</p></div>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={handleContinue} disabled={!allowContinue}>Continue</Button>
            </CardActions>
        </Card>
    );
}

export default SteamAuth;