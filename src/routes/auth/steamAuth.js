// NOTE: NOT TESTED!

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent } from '@mui/material';

import { FetchProfile, customAxios as axios, setAuthToken, getAuthToken } from '../../functions';

var vars = require('../../variables');

const SteamAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState("Validating authorization...");
    const [allowContinue, setContinue] = useState(false);
    const [doingUpdate, setDoingUpdate] = useState(false);

    useEffect(() => {
        async function validateSteamAuth() {
            try {
                let updcode = localStorage.getItem("update-steam");
                if (updcode === null || !isNaN(updcode) && +new Date() - updcode > 600000 || getAuthToken() === null) {
                    localStorage.removeItem("update-steam");
                    let resp = await axios({ url: `${vars.dhpath}/auth/steam/callback` + location.search, method: `GET` });
                    if (resp.status === 200) {
                        if (resp.data.mfa === false) {
                            setAuthToken(resp.data.token);
                            setMessage("You are authorized 🎉");
                            await FetchProfile();
                            setContinue(true);
                            setTimeout(function () { navigate('/beta/'); }, 500);
                        } else {
                            navigate("/beta/mfa?token=" + resp.data.token);
                            setMessage("MFA OTP Required 🔑");
                        }
                    } else {
                        setContinue(true);
                        setMessage("❌ " + resp.data.error);
                    }
                } else {
                    setDoingUpdate(true);
                    let resp = await axios({ url: `${vars.dhpath}/user/steam` + location.search, method: `PATCH`, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 204) {
                        setContinue(true);
                        localStorage.removeItem("update-steam");
                        setTimeout(function () { navigate("/beta/settings"); }, 3000);
                        setMessage("Steam Account Updated");
                    } else {
                        setContinue(true);
                        setMessage("❌ Failed to update Steam account: " + resp.data.error);
                    }
                }
            } catch (error) {
                console.error(error);
                setMessage("Error occurred! Check F12 for more info.");
            }
        }
        validateSteamAuth();
    }, [location.search, navigate]);

    function handleContinue() {
        if (doingUpdate) {
            navigate('/beta/settings');
        } else {
            navigate('/beta/');
        }
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
};

export default SteamAuth;