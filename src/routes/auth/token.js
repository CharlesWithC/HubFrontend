import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardActions, Button, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const TokenAuth = () => {
    const { t: tr } = useTranslation();
    
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const [message, setMessage] = useState(tr("checking_token"));
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validateToken() {
            try {
                let resp = await axios({ url: `${vars.dhpath}/token`, headers: { "Authorization": `Bearer ${token}` }, method: `PATCH` });
                if (resp.status === 200) {
                    setAuthToken(resp.data.token);
                    setMessage(tr("you_are_authorized"));
                    await FetchProfile(true);
                    setContinue(true);
                    setTimeout(function () { navigate('/'); }, 500);
                } else if (resp.status === 401) {
                    setMessage(tr("invalid_token"));
                    setContinue(true);
                } else {
                    setMessage(resp.data.error);
                    setContinue(true);
                }
            } catch (error) {
                console.error(error);
                setMessage(tr("error_occurred"));
            }
        }
        if (token === null || token.length !== 36) {
            setContinue(true);
            setMessage(tr("invalid_token"));
            return;
        } else {
            validateToken();
        }
    }, [token, navigate]);

    function handleContinue() {
        navigate('/');
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
            <Card sx={{ width: 350, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <h2>Authorization</h2>
                    <div><p>{message}</p></div>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleContinue} disabled={!allowContinue}>{tr("continue")}</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default TokenAuth;