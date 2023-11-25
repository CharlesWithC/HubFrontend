import { useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Typography, useTheme } from '@mui/material';
import TextField from '@mui/material/TextField';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const MfaAuth = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const mfaToken = searchParams.get('token');

    const [otp, setOtp] = useState("");
    const [otpReadOnly, setOtpReadOnly] = useState(false);
    const [otpColor, setOtpColor] = useState(null);
    const [otpError, setOtpError] = useState(false);
    const [otpText, setOtpText] = useState("");
    const [allowVerify, setAllowVerify] = useState(false);

    const handleVerify = useCallback(async () => {
        try {
            setAllowVerify(false);
            let resp = await axios({ url: `${vars.dhpath}/auth/mfa`, data: { token: mfaToken, otp: otp }, method: `POST` });
            if (resp.status === 200) {
                setAuthToken(resp.data.token);
                setOtpColor(theme.palette.success.main);
                setOtpText("You are authorized 🎉");
                setOtpReadOnly(true);
                await FetchProfile();
                setTimeout(function () { navigate("/"); }, 500);
            } else {
                setOtpError(true);
                setOtpColor(theme.palette.error.main);
                setOtpText(resp.data.error);
                setAllowVerify(true);
            }
        } catch (error) {
            console.error(error);
            setOtpError(true);
            setOtpColor(theme.palette.error.main);
            setOtpText("Error occurred! Check F12 for more info.");
            setAllowVerify(true);
        }
    }, [otp]);

    const validateOTP = useCallback((event) => {
        setOtpError(false);
        setOtpColor(null);
        setOtpText("");

        const otp = event.target.value;
        setOtp(otp);
        if (otp.length === 6 && /^\d+$/.test(otp)) {
            setAllowVerify(true);
            handleVerify();
        } else {
            setAllowVerify(false);
        }
    });

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
            <Card sx={{ width: 450, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;Multiple Factor Authentication
                    </Typography>
                    <TextField label="OTP" variant="outlined" onChange={validateOTP} readOnly={otpReadOnly} error={otpError} helperText={otpText} onKeyDown={(e) => { if (e.key === "Enter") { handleVerify(); } }} sx={{ mt: "20px", width: "100%", '& .MuiFormHelperText-root': { color: otpColor } }} />
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleVerify} disabled={!allowVerify}>Verify</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default MfaAuth;