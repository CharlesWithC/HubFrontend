import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext, ThemeContext } from '../../../context';

import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

import { FetchProfile, customAxios as axios, setAuthToken, getAuthToken, getAuthMode, eraseAuthMode } from '../../../functions';

const DiscordAuth = () => {
    const { t: tr } = useTranslation();
    const appContext = useContext(AppContext);
    const { apiPath } = useContext(AppContext);
    const { themeSettings } = useContext(ThemeContext);

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const discordCode = searchParams.get('code');
    const discordError = searchParams.get('error');
    const discordErrorDescription = searchParams.get('error_description');

    const [message, setMessage] = useState(tr("validating_authorization"));
    const [allowContinue, setContinue] = useState(false);
    const [doingUpdate, setDoingUpdate] = useState(false);

    useEffect(() => {
        let callback_url = `https://${window.dhhost}/auth/discord/callback`;
        if (appContext.apiConfig.discord_client_id === 1120997206938361877) {
            callback_url = `https://oauth.chub.page/discord-auth`;
        }
        async function validateDiscordAuth() {
            try {
                let authMode = getAuthMode();
                eraseAuthMode();
                if (authMode === null) {
                    let resp = await axios({ url: `${apiPath}/auth/discord/callback`, params: { code: discordCode, callback_url: callback_url }, method: `GET` });
                    if (resp.status === 200) {
                        if (resp.data.mfa === false) {
                            setAuthToken(resp.data.token);
                            setMessage(tr("you_are_authorized"));
                            await FetchProfile(appContext, true);
                            appContext.loadMemberUIDs();
                            appContext.loadDlogDetails();
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
                } else if (authMode[0] === "update-discord") {
                    setDoingUpdate(true);
                    let resp = await axios({ url: `${apiPath}/user/discord`, params: { code: discordCode, callback_url: callback_url }, method: `PATCH`, headers: { Authorization: `Bearer ${getAuthToken()}` } });
                    if (resp.status === 204) {
                        setContinue(true);
                        setTimeout(function () { navigate("/settings"); }, 3000);
                        setMessage(tr("discord_account_updated"));
                    } else {
                        setContinue(true);
                        setMessage(tr("failed_to_update_discord_account") + resp.data.error);
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
        } if (discordErrorDescription !== null) {
            setContinue(true);
            setMessage(`❌ Discord Error: ${discordErrorDescription}`);
            return;
        } else if (discordError !== null) {
            setContinue(true);
            setMessage(`❌ Discord Error: ${discordError}`);
            return;
        } else if (discordCode === null) {
            navigate("/auth/discord/redirect");
            return;
        } else {
            validateDiscordAuth();
        }
    }, [apiPath, discordCode, discordError, discordErrorDescription]);

    function handleContinue() {
        if (doingUpdate) {
            navigate('/settings');
        } else {
            navigate('/');
        }
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
                        <FontAwesomeIcon icon={faDiscord} />&nbsp;&nbsp;{tr("discord_authorization")}</Typography>
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

export default DiscordAuth;