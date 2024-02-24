import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext, ThemeContext } from '../../../context';

import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPatreon } from '@fortawesome/free-brands-svg-icons';

import { customAxios as axios, getAuthToken, getAuthMode, eraseAuthMode } from '../../../functions';

var vars = require('../../../variables');

const PatreonAuth = () => {
    const { t: tr } = useTranslation();
    const { apiPath } = useContext(AppContext);
    const { themeSettings } = useContext(ThemeContext);

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const patreonCode = searchParams.get('code');
    const patreonError = searchParams.get('error');
    const patreonErrorDescription = searchParams.get('error_description');

    const [message, setMessage] = useState(tr("validating_authorization"));
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validatePatreonAuth() {
            try {
                let authMode = getAuthMode();
                eraseAuthMode();

                if (authMode !== null && authMode[0] === "app_login" && authMode[1] !== "") {
                    window.location.href = authMode[1] + window.location.search;
                    setContinue(false);
                    setMessage(tr("authorizing_drivers_hub_app"));
                    return;
                }

                if (getAuthToken() === null) {
                    setContinue(true);
                    setMessage(tr("you_are_not_logged_in"));
                    return;
                }

                let resp = await axios({ url: `${apiPath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                if (resp.status !== 200) {
                    setContinue(true);
                    setMessage(`Failed to generate auth ticket, try again later...`);
                    return;
                }
                let ticket = resp.data.token;

                resp = await axios({ url: `https://config.chub.page/patreon`, params: { domain: window.dhhost, code: patreonCode }, method: `PATCH`, headers: { Authorization: `Ticket ${ticket}` } });
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
                setMessage(tr("error_occurred"));
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
            window.location.href = "https://oauth.chub.page/patreon-auth?domain=" + encodeURIComponent(window.dhhost);
            return;
        } else {
            validatePatreonAuth();
        }
    }, [apiPath, patreonCode, patreonError, patreonErrorDescription]);

    function handleContinue() {
        navigate('/settings/general');
    }

    return (
        <div style={{
            backgroundImage: `url(${themeSettings.bg_image})`,
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
                        <FontAwesomeIcon icon={faPatreon} />&nbsp;&nbsp;{tr("patreon_authorization")}</Typography>
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

export default PatreonAuth;