import React, { useState, useCallback } from 'react';
import { ImageList, ImageListItem, SpeedDial, SpeedDialIcon, SpeedDialAction, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, CardActions, Button, Typography, IconButton, Grid, Snackbar, Alert, TextField, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Portal } from '@mui/base';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGears, faPlus, faMinus, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { customAxios as axios, checkUserPerm, getAuthToken } from '../functions';
import { useNavigate } from 'react-router-dom';

var vars = require("../variables");

const Gallery = () => {
    const navigate = useNavigate();
    if (vars.vtcLevel < 1) {
        navigate("/404");
        return <></>;
    }
    
    const { t: tr } = useTranslation();
    const theme = useTheme();
    const matchesXS = useMediaQuery(theme.breakpoints.down('xs'));
    const matchesSM = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const matchesMD = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const matchesLG = useMediaQuery(theme.breakpoints.up('lg'));

    let cols;
    if (matchesXS) {
        cols = 1;
    } else if (matchesSM) {
        cols = 2;
    } else if (matchesMD) {
        cols = 3;
    } else if (matchesLG) {
        cols = 4;
    }

    const [snackbarContent, setSnackbarContent] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const handleCloseSnackbar = useCallback(() => {
        setSnackbarContent("");
    }, []);

    const [images, setImages] = useState(vars.dhconfig.gallery);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogButtonDisabled, setDialogButtonDisabled] = useState(false);

    const updateImages = useCallback(async () => {
        const loadingStart = new CustomEvent('loadingStart', {});
        window.dispatchEvent(loadingStart);
        setDialogButtonDisabled(true);

        let resp = await axios({ url: `${vars.dhpath}/auth/ticket`, method: "POST", headers: { Authorization: `Bearer ${getAuthToken()}` } });
        if (resp.status !== 200) {
            setDialogButtonDisabled(false);
            const loadingEnd = new CustomEvent('loadingEnd', {});
            window.dispatchEvent(loadingEnd);
            setSnackbarContent(tr("failed_to_generate_auth_ticket_try_again_later"));
            setSnackbarSeverity("error");
            return;
        }
        let ticket = resp.data.token;

        resp = await axios({ url: `https://config.chub.page/config/gallery?domain=${vars.dhconfig.domain}`, data: { gallery: images }, method: "PATCH", headers: { Authorization: `Ticket ${ticket}` } });
        if (resp.status === 204) {
            setSnackbarContent(tr("gallery_updated"));
            setSnackbarSeverity("success");
            vars.dhconfig.gallery = images;
        } else {
            setSnackbarContent(resp.data.error);
            setSnackbarSeverity("error");
        }

        setDialogButtonDisabled(false);
        const loadingEnd = new CustomEvent('loadingEnd', {});
        window.dispatchEvent(loadingEnd);
    }, [images]);

    return (
        <>
            {images.length !== 0 && <ImageList
                sx={{ width: "100%", height: "100%", borderRadius: "10px" }}
                variant="quilted"
                cols={cols}
            >
                {images.map((item) => (
                    <ImageListItem key={item.url} cols={item.cols || 1} rows={item.rows || 1}>
                        <img
                            src={item.url}
                            alt={item.title}
                        />
                    </ImageListItem>
                ))}
            </ImageList>}
            {images.length === 0 && <Card sx={{ width: 350, position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <CardContent>
                    <h2>{tr("no_image")}</h2>
                </CardContent>
                <CardActions>
                    <Button variant="contained" color="primary" sx={{ ml: 'auto' }}
                        onClick={() => { setDialogOpen("settings"); }}>{tr("add_one")}</Button>
                </CardActions>
            </Card>}
            <Dialog open={dialogOpen === "settings"} onClose={() => setDialogOpen("")} fullWidth>
                <DialogTitle><FontAwesomeIcon icon={faGears} />&nbsp;&nbsp;{tr("settings")}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{tr("gallery_settings_note")}<br />{tr("gallery_settings_note_2")}<br /><br />{tr("gallery_settings_note_3")}<br />{tr("gallery_settings_note_4")}<br />{tr("gallery_settings_note_5")}</Typography>
                    {images.length === 0 &&
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>{tr("no_image_create")}</Typography>
                            <IconButton variant="contained" color="success" onClick={() => {
                                let newImages = [{ url: "", cols: 1, rows: 1 }];
                                setImages(newImages);
                            }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                        </div>}
                    {images.length > 0 && <>
                        {images.map((image, index) => (<>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" fontWeight="bold" sx={{ mb: "10px", flexGrow: 1 }}>{tr("image")} #{index + 1}
                                </Typography>
                                <div>
                                    <IconButton variant="contained" color="success" onClick={() => {
                                        let newImages = [...images];
                                        newImages.splice(index + 1, 0, { url: "", cols: 1, rows: 1 });
                                        setImages(newImages);
                                    }}><FontAwesomeIcon icon={faPlus} /></IconButton>
                                    <IconButton variant="contained" color="error" onClick={() => {
                                        let newImages = [...images];
                                        newImages.splice(index, 1);
                                        setImages(newImages);
                                    }}><FontAwesomeIcon icon={faMinus} /></IconButton>
                                    <IconButton variant="contained" color="info" onClick={() => {
                                        if (index >= 1) {
                                            let newImages = [...images];
                                            newImages[index] = newImages[index - 1];
                                            newImages[index - 1] = images[index];
                                            setImages(newImages);
                                        }
                                    }}><FontAwesomeIcon icon={faArrowUp} /></IconButton>
                                    <IconButton variant="contained" color="warning" onClick={() => {
                                        if (index <= images.length - 2) {
                                            let newImages = [...images];
                                            newImages[index] = newImages[index + 1];
                                            newImages[index + 1] = images[index];
                                            setImages(newImages);
                                        }
                                    }}><FontAwesomeIcon icon={faArrowDown} /></IconButton>
                                </div>
                            </div>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label={tr("url")}
                                        value={images[index].url}
                                        onChange={(e) => {
                                            let newImages = [...images];
                                            newImages[index].url = e.target.value;
                                            setImages(newImages);
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label={tr("cols")}
                                        defaultValue={1}
                                        value={images[index].cols}
                                        onChange={(e) => {
                                            if (isNaN(e.target.value)) return;
                                            let newImages = [...images];
                                            newImages[index].cols = parseInt(e.target.value);
                                            setImages(newImages);
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <TextField
                                        label={tr("rows")}
                                        defaultValue={1}
                                        value={images[index].rows}
                                        onChange={(e) => {
                                            if (isNaN(e.target.value)) return;
                                            let newImages = [...images];
                                            newImages[index].rows = parseInt(e.target.value);
                                            setImages(newImages);
                                        }}
                                        fullWidth
                                    />
                                </Grid>
                            </Grid></>))}
                    </>}
                </DialogContent>
                <DialogActions>
                    <Button variant="primary" onClick={() => { setDialogOpen(""); }}>{tr("cancel")}</Button>
                    {checkUserPerm(["administrator", "manage_gallery"]) && <Button variant="contained" color="info" onClick={() => { updateImages(); }} disabled={dialogButtonDisabled}>{tr("save")}</Button>}
                </DialogActions>
            </Dialog>
            <SpeedDial
                ariaLabel={tr("controls")}
                sx={{ position: 'fixed', bottom: 20, right: 20 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction
                    key="settings"
                    tooltipTitle={tr("settings")}
                    icon={<FontAwesomeIcon icon={faGears} />}
                    onClick={() => { setDialogOpen("settings"); }} />
            </SpeedDial>
            <Portal>
                <Snackbar
                    open={!!snackbarContent}
                    autoHideDuration={5000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                        {snackbarContent}
                    </Alert>
                </Snackbar>
            </Portal>
        </>
    );
};

export default Gallery;