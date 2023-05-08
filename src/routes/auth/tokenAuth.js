import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardActions, Button } from '@mui/material';
import axios from 'axios';
import { FetchProfile } from '../../functions';
axios.defaults.validateStatus = (status) => status < 600;

const axiosRetry = require('axios-retry');
axiosRetry(axios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

var vars = require('../../variables');

function TokenAuth() {
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
                    localStorage.setItem("token", resp.data.token);
                    setMessage("You are authorized 🎉");
                    await FetchProfile();
                    setContinue(true);
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
        if(token === null || token.length !== 36){
            setContinue(true);
            setMessage("Invalid token ❌");
            return;
        } else {
            validateToken();
        }
    }, [token]);

    function handleContinue() {
        navigate('/');
    }

    return (
        <Card sx={{ width: 350, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>Authorization</h2>
                <p>{message}</p>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={handleContinue} disabled={!allowContinue}>Continue</Button>
            </CardActions>
        </Card>
    );
}

export default TokenAuth;