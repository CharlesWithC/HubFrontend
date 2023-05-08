// NOTE: NOT TESTED!

import { Button, Card, CardActions, CardContent } from '@mui/material';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

function MfaAuth() {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const mfaToken = searchParams.get('token');

    const [otp, setOtp] = useState("");
    const [otpReadOnly, setOtpReadOnly] = useState(false);
    const [otpColor, setOtpColor] = useState(null);
    const [otpError, setOtpError] = useState(false);
    const [otpText, setOtpText] = useState(false);
    const [allowVerify, setAllowVerify] = useState(false);

    async function handleVerify() {
        try {
            let resp = await axios({ url: `${vars.dhpath}/auth/mfa`, data: { token: mfaToken, otp: otp }, method: `POST` });
            if (resp.status === 200) {
                localStorage.setItem("token", resp.data.token);
                setOtpColor("success");
                setOtpText("You are authorized 🎉");
                setAllowVerify(false);
                setOtpReadOnly(true);
                await FetchProfile();
                setTimeout(function () { navigate("/"); }, 500);
            } else {
                setOtpError(true);
                setOtpText(resp.data.error);
            }
        } catch (error) {
            console.error(error);
            setOtpError(true);
            setOtpText("Error occurred! Check F12 for more info.");
        }
    }

    const validateOTP = (event) => {
        setOtpError(false);
        setOtpColor(null);
        setOtpText("");

        const otp = event.target.value;
        setOtp(otp);
        if (otp.length === 6 && /^\d+$/.test(otp)) {
            setAllowVerify(true);
        } else {
            setAllowVerify(false);
        }
    };

    return (
        <Card sx={{ width: 400, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CardContent>
                <h2>Multiple Factor Authentication</h2>
                <TextField label="OTP" variant="outlined" onChange={validateOTP} color={otpColor} readOnly={otpReadOnly} error={otpError} helperText={otpText} sx={{ width: "100%" }} />
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                    onClick={handleVerify} disabled={!allowVerify}>Verify</Button>
            </CardActions>
        </Card>
    );
}

export default MfaAuth;