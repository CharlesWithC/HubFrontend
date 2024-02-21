import { useState, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context';

import { Button, Card, CardActions, CardContent, Typography, TextField, useTheme } from '@mui/material';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint } from '@fortawesome/free-solid-svg-icons';

import { FetchProfile, customAxios as axios, setAuthToken } from '../../functions';

var vars = require('../../variables');

const MfaAuth = () => {
    const { t: tr } = useTranslation();
    const appContext = useContext(AppContext);

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
                setOtpText(tr("you_are_authorized"));
                setOtpReadOnly(true);
                await FetchProfile(appContext, true);
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
            setOtpText(tr("error_occurred"));
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
                        <FontAwesomeIcon icon={faFingerprint} />&nbsp;&nbsp;{tr("multiple_factor_authentication")}</Typography>
                    <TextField label={tr("otp")} variant="outlined" onChange={validateOTP} readOnly={otpReadOnly} error={otpError} helperText={otpText} onKeyDown={(e) => { if (e.key === tr("enter")) { handleVerify(); } }} sx={{ mt: "20px", width: "100%", '& .MuiFormHelperText-root': { color: otpColor } }} />
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleVerify} disabled={!allowVerify}>{tr("verify")}</Button>
                </CardActions>
            </Card>
        </div>
    );
};

export default MfaAuth;