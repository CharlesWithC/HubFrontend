// NOTE: NOT TESTED!

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Typography, useTheme } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSteam } from '@fortawesome/free-brands-svg-icons';

import { FetchProfile, customAxios as axios, setAuthToken, getAuthToken } from '../../../functions';

var vars = require('../../../variables');

const SteamAuth = () => {
    const theme = useTheme();
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
                            setTimeout(function () { navigate('/'); }, 500);
                        } else {
                            navigate("/auth/mfa?token=" + resp.data.token);
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
                        setTimeout(function () { navigate("/settings"); }, 3000);
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
            navigate('/settings');
        } else {
            navigate('/');
        }
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
            <Card sx={{ backgroundColor: vars.dhbgimage === "" ? theme.palette.primary.main : theme.palette.primary.main + "cc", width: 400, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: "20px" }}>
                        <FontAwesomeIcon icon={faSteam} />&nbsp;&nbsp;Steam Authorization
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

export default SteamAuth;