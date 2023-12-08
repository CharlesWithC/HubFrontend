import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

var vars = require('../variables');

const BrowserAuth = ({ completed = false }) => {
    // completed = true => definitely browser client

    const { t: tr } = useTranslation();

    const navigate = useNavigate();

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
            <Card sx={{ width: 400, padding: "20px", position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: "20px" }}>
                        {tr("authorization")}
                    </Typography>
                    <Typography variant="body">{!completed ? tr("authorizaing_with_browser") : tr("authorization_complete_you_may_close_this_tab")}</Typography>
                </CardContent>
                <CardActions>
                    {!completed && <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={() => {
                            navigate("/auth/login");
                            if (window.isElectron) {
                                window.electron.ipcRenderer.send("cancel-browser-auth");
                            }
                        }}>{tr("cancel")}</Button>}
                </CardActions>
            </Card>
        </div>
    );
};

export default BrowserAuth;