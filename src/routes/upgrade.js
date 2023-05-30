import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const UpgradeCard = () => {
    const freeFeatures = [
        { text: '✔️ Dark/Light theme' },
        { text: '✔️ Regular name color' },
        { text: '✔️ Regular support' },
        { text: '✔️ All regular functionalities' },
    ];

    const premiumFeatures = [
        { text: '✔️ More themes and customizable themes' },
        { text: '✔️ Golden name color' },
        { text: '✔️ Special Discord role' },
        { text: '✔️ Exclusive functionalities' },
    ];


    return (
        <Grid container spacing={6} justifyContent="center">
            <Grid item xs={12} sm={5}>
                <Card>
                    <CardHeader
                        title="Regular User"
                        subheader="All functions needed to use the Drivers Hub"
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {freeFeatures.map((feature) => (
                                <ListItem key={feature.text}>
                                    <ListItemText primary={feature.text} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            Free forever
                        </Typography>
                        <Button variant="outlined" color="primary" fullWidth>
                            No action needed
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={5}>
                <Card>
                    <CardHeader
                        title="Patreon Subscribers"
                        subheader="Make your profile distringuied among members"
                        titleTypographyProps={{ align: 'center' }}
                        subheaderTypographyProps={{ align: 'center' }}
                    />
                    <CardContent>
                        <List>
                            {premiumFeatures.map((feature) => (
                                <ListItem key={feature.text}>
                                    <ListItemText primary={feature.text} />
                                </ListItem>
                            ))}
                        </List>
                        <Typography variant="h5" align="center" gutterBottom>
                            $3 per month
                        </Typography>
                        <a href="https://patreon.com/charlws" target="_blank" rel="noreferrer"><Button variant="contained" color="primary" fullWidth>
                            Subscribe at Patreon
                        </Button></a>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;