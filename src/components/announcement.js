import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { timeAgo } from '../functions';
import UserCard from './usercard';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { InfoRounded, EventNoteRounded, WarningRounded, ErrorOutlineRounded, CheckCircleOutlineRounded } from '@mui/icons-material';

const AnnouncementCard = ({ announcement }) => {
    const ICONS = { 0: <InfoRounded />, 1: <EventNoteRounded />, 2: <WarningRounded />, 3: <ErrorOutlineRounded />, 4: <CheckCircleOutlineRounded /> }
    const icon = ICONS[announcement.announcement_type];

    if (announcement.display === "half-width") {
        return (
            <Grid item xs={12} sm={12} md={6} lg={6} key={announcement.announcementid}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{ marginBottom: "10px", flexGrow: 1, display: 'flex', alignItems: "center" }}>{icon}&nbsp;&nbsp;{announcement.title}</Typography>
                        <Typography variant="body2"><ReactMarkdown>{announcement.content}</ReactMarkdown></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | {timeAgo(announcement.timestamp * 1000)}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (announcement.display === "full-width") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{ marginBottom: "10px" , flexGrow: 1, display: 'flex', alignItems: "center"}}>{icon}&nbsp;&nbsp;{announcement.title}</Typography>
                        <Typography variant="body2"><ReactMarkdown>{announcement.content}</ReactMarkdown></Typography>
                    </CardContent>
                    <CardContent>
                        <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | {timeAgo(announcement.timestamp * 1000)}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    } else if (announcement.display === "with-image") {
        return (
            <Grid item xs={12} sm={12} md={12} lg={12} key={announcement.announcementid}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={12} md={6} lg={6}>
                        <img src={announcement.image} alt="Announcement" style={{ width: '100%', border: 'none' }} />
                    </Grid>
                    <Grid item xs={12} sm={12} md={6} lg={6} style={{ display: 'flex' }}>
                        <Card style={{ display: 'flex', flexDirection: 'column' }}>
                            <CardContent>
                                <Typography variant="h5" sx={{ marginBottom: "10px", flexGrow: 1, display: 'flex', alignItems: "center" }}>{icon}&nbsp;&nbsp;{announcement.title}</Typography>
                                <Typography variant="body2"><ReactMarkdown>{announcement.content}</ReactMarkdown></Typography>
                                <Typography variant="caption"><UserCard user={announcement.author} inline={true} /> | {timeAgo(announcement.timestamp * 1000)}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
};

export default AnnouncementCard;