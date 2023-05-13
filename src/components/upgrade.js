import React from 'react';
import { Grid, Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';

const UpgradeCard = () => {
    const premiumFeatures = [
        { text: 'Exclusive content' },
        { text: 'Early access' },
        { text: 'Community recognition' },
        { text: 'Custom emojis' },
    ];

    const freeFeatures = [
        { text: 'Basic content' },
        { text: 'Limited access' },
        { text: 'No recognition' },
        { text: 'No custom emojis' },
    ];

    return (
        <Grid container spacing={2} justify="center">
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardHeader
                        title="Premium Features"
                        subheader="Subscribe to our Patreon for these benefits"
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
                            $10 per month
                        </Typography>
                        <Button variant="contained" color="primary" fullWidth>
                            Subscribe
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Card>
                    <CardHeader
                        title="Free Features"
                        subheader="Use our app with these features for free"
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
                        <Button variant="outlined" color="primary" fullWidth>
                            Download for Free
                        </Button>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default UpgradeCard;