import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent } from '@mui/material';
import TextField from '@mui/material/TextField';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const MfaAuth = () => {
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
                setAuthToken(resp.data.token);
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