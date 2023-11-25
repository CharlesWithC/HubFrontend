import { Card, CardContent, CardActions, Button, useTheme } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const TokenAuth = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    const [message, setMessage] = useState("Checking token...");
    const [allowContinue, setContinue] = useState(false);

    useEffect(() => {
        async function validateToken() {
            try {
                let resp = await axios({ url: `${vars.dhpath}/token`, headers: { "Authorization": `Bearer ${token}` }, method: `PATCH` });
                if (resp.status === 200) {
                    setAuthToken(resp.data.token);
                    setMessage("You are authorized 🎉");
                    await FetchProfile();
                    setContinue(true);
                    setTimeout(function () { navigate('/'); }, 500);
                } else if (resp.status === 401) {
                    setMessage("Invalid token ❌");
                    setContinue(true);
                } else {
                    setMessage(resp.data.error);
                    setContinue(true);
                }
            } catch (error) {
                console.error(error);
                setMessage("Error occurred! Check F12 for more info.");
            }
        }
        if (token === null || token.length !== 36) {
            setContinue(true);
            setMessage("Invalid token ❌");
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
                        onClick={handleContinue} disabled={!allowContinue}>Continue</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default TokenAuth;