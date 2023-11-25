import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, CardActions, CardContent, Typography, useTheme } from '@mui/material';
import TextField from '@mui/material/TextField';

import { customAxios as axios } from '../../functions';

var vars = require('../../variables');

// rp -> reset password
// rg -> register (confirm email)
// ue -> update email (confirm email)

const EmailAuth = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    let secret = searchParams.get('secret');
    if (secret === null) secret = "";
    const op = secret.substring(0, 2);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [passwordColor, setPasswordColor] = useState(null);
    const [passwordError, setPasswordError] = useState(false);
    const [passwordText, setPasswordText] = useState("");
    const [updateDisabled, setUpdateDisabled] = useState(false);

    const handleUpdatePassword = useCallback(async () => {
        setUpdateDisabled(true);
        let resp = await axios({ url: `${vars.dhpath}/auth/email?secret=${secret}`, data: { password: password }, method: `POST` });
        if (resp.status === 204) {
            setPasswordColor(theme.palette.success.main);
            setPasswordText("Password updated! Redirecting to login...");
            setTimeout(function () { navigate("/auth/login"); }, 500);
        } else {
            setPasswordError(true);
            setPasswordColor(theme.palette.error.main);
            setPasswordText(resp.data.error);
            setUpdateDisabled(false);
        }
    }, [secret, password]);

    useEffect(() => {
        if (!["rp", "rg", "ue"].includes(op)) {
            setTitle("Unknown Operation");
            setMessage("Error: Invalid Link!");
        } else {
            const TITLE_MAP = { "rp": "Reset Password", "rg": "Email Confirmation", "ue": "Email Confirmation" };
            setTitle(TITLE_MAP[op]);
        }

        async function doAuth() {
            let resp = await axios({ url: `${vars.dhpath}/auth/email?secret=${secret}`, method: `POST` });
            if (resp.status === 204) {
                setMessage("Email confirmed! Redirecting to overview...");
                setTimeout(function () { navigate("/"); }, 500);
            } else {
                setMessage(`Error: ${resp.data.error}`);
            }
        }
        if (["rg", "ue"].includes(op)) {
            doAuth();
        }
    }, [op, secret]);

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
                        {title}
                    </Typography>
                    {op !== "rp" && <Typography variant="body2" sx={{ mt: "20px" }}>
                        {message}
                    </Typography>}
                    {op === "rp" && <TextField label="New Password" variant="outlined" type="password" onChange={(e) => { setPassword(e.target.value); }} error={passwordError} helperText={passwordText} sx={{ mt: "20px", width: "100%", '& .MuiFormHelperText-root': { color: passwordColor } }} disabled={updateDisabled} />}
                </CardContent>
                {op === "rp" && <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleUpdatePassword} disabled={updateDisabled}>Update</Button>
                </CardActions>}
            </Card>
        </div >
    );
};

export default EmailAuth;