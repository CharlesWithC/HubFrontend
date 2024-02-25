import { useState, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../context';

import { Button, Card, CardActions, CardContent, Typography, TextField, useTheme } from '@mui/material';

import { customAxios as axios } from '../../functions';

// rp -> reset password
// rg -> register (confirm email)
// ue -> update email (confirm email)

const EmailAuth = () => {
    const { t: tr } = useTranslation();
    const { apiPath, themeSettings } = useContext(ThemeContext);

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
        let resp = await axios({ url: `${apiPath}/auth/email?secret=${secret}`, data: { password: password }, method: `POST` });
        if (resp.status === 204) {
            setPasswordColor(theme.palette.success.main);
            setPasswordText(tr("password_updated_redirecting_to_login"));
            setTimeout(function () { navigate("/auth/login"); }, 500);
        } else {
            setPasswordError(true);
            setPasswordColor(theme.palette.error.main);
            setPasswordText(resp.data.error);
            setUpdateDisabled(false);
        }
    }, [apiPath, secret, password]);

    useEffect(() => {
        if (!["rp", "rg", "ue"].includes(op)) {
            setTitle(tr("unknown_operation"));
            setMessage(tr("error_invalid_link"));
        } else {
            const TITLE_MAP = { "rp": tr("reset_password"), "rg": tr("email_confirmation"), "ue": tr("email_confirmation") };
            setTitle(TITLE_MAP[op]);
        }

        async function doAuth() {
            let resp = await axios({ url: `${apiPath}/auth/email?secret=${secret}`, method: `POST` });
            if (resp.status === 204) {
                setMessage(tr("email_confirmed_redirecting_to_overview"));
                setTimeout(function () { navigate("/"); }, 500);
            } else {
                setMessage(`Error: ${resp.data.error}`);
            }
        }
        if (["rg", "ue"].includes(op)) {
            doAuth();
        }
    }, [apiPath, op, secret]);

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
            <Card sx={{ width: 450, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                        {title}
                    </Typography>
                    {op !== "rp" && <Typography variant="body2" sx={{ mt: "20px" }}>
                        {message}
                    </Typography>}
                    {op === "rp" && <TextField label={tr("new_password")} variant="outlined" type="password" onChange={(e) => { setPassword(e.target.value); }} error={passwordError} helperText={passwordText} sx={{ mt: "20px", width: "100%", '& .MuiFormHelperText-root': { color: passwordColor } }} disabled={updateDisabled} />}
                </CardContent>
                {op === "rp" && <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={handleUpdatePassword} disabled={updateDisabled}>{tr("update")}</Button>
                </CardActions>}
            </Card>
        </div >
    );
};

export default EmailAuth;