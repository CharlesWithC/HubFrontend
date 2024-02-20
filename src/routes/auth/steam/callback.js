import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../../context';

import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSteam } from '@fortawesome/free-brands-svg-icons';

import { FetchProfile, customAxios as axios, setAuthToken, getAuthToken, getAuthMode, eraseAuthMode } from '../../../functions';

var vars = require('../../../variables');

const SteamAuth = () => {
    const { t: tr } = useTranslation();
    const { initMemberUIDs } = useContext(AppContext);

    const navigate = useNavigate();
    const location = useLocation();

    const [message, setMessage] = useState(tr("validating_authorization"));
    const [allowContinue, setContinue] = useState(false);
    const [doingUpdate, setDoingUpdate] = useState(false);

    useEffect(() => {
        async function validateSteamAuth() {
            try {
                let authMode = getAuthMode();
                eraseAuthMode();
                if (authMode === null) {
                    let resp = await axios({ url: `${vars.dhpath}/auth/steam/callback` + location.search, method: `GET` });
                    if (resp.status === 200) {
                        if (resp.data.mfa === false) {
                            setAuthToken(resp.data.token);
                            setMessage(tr("you_are_authorized"));
                            await FetchProfile(initMemberUIDs, true);
                            setContinue(true);
                            setTimeout(function () { navigate('/'); }, 500);
                        } else {
                            navigate("/auth/mfa?token=" + resp.data.token);
                            setMessage(tr("mfa_otp_required"));
                        }
                    } else {
                        setContinue(true);
                        setMessage("❌ " + resp.data.error);
                    }
                } else if (authMode[0] === "update-steam") {
                    setDoingUpdate(true);
                    let resp = await axios({ url: `${vars.dhpath}/user/steam` + location.search, method: `PATCH`, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 204) {
                        setContinue(true);
                        setTimeout(function () { navigate("/settings"); }, 3000);
                        setMessage(tr("steam_account_updated"));
                    } else {
                        setContinue(true);
                        setMessage(tr("failed_to_update_steam_account") + resp.data.error);
                    }
                } else if (authMode[0] === "app_login") {
                    window.location.href = authMode[1] + window.location.search;
                    setContinue(false);
                    setMessage(tr("authorizing_drivers_hub_app"));
                    return;
                }
            } catch (error) {
                console.error(error);
                setMessage(tr("error_occurred"));
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
            <Card sx={{ width: 400, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: "20px" }}>
                        <FontAwesomeIcon icon={faSteam} />&nbsp;&nbsp;{tr("steam_authorization")}</Typography>
                    <Typography variant="body">
                        {message}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleContinue} disabled={!allowContinue}>{tr("continue")}</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default SteamAuth;