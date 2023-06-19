import React from 'react';
import { Card, CardContent, Grid, Paper, Typography } from '@mui/material';
import { TSep } from '../functions';

const Podium = ({ title, first, second, third, fixWidth }) => {
    if (fixWidth === undefined) fixWidth = false;

    const calculateBackgroundColor = (rank) => {
        const opacity = 1 - (rank * 0.15); // Adjust the opacity based on rank
        return `rgba(128, 128, 128, ${opacity})`; // You can replace "255, 0, 0" with the desired color values
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" component="div">
                    {title}
                </Typography>
            </CardContent>
            <Grid container direction="column" alignItems="flex-start" spacing={2} sx={{ marginBottom: "15px" }}>
                <Grid item sx={{ width: "100%" }}>
                    <Paper
                        elevation={3}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px', fontSize: '15px',
                            margin: "0 15px 0 15px",
                            background: calculateBackgroundColor(1),
                        }}
                    >
                        <Typography variant="body1" style={{ display: 'flex', alignItems: 'center', marginRight: '8px', fontWeight: 'bold', width: '100%' }}>
                            <span style={{ flexGrow: 1 }}>{first.name}</span>
                            <Typography variant="caption" style={{ fontSize: '12px', opacity: 0.7 }}>
                                {TSep(first.stat)}
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item sx={{ width: (!fixWidth ? String(parseInt((second.stat / first.stat) * 100)) : "80") + "%" }}>
                    <Paper
                        elevation={3}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px', fontSize: '15px',
                            margin: "0 15px 0 15px",
                            background: calculateBackgroundColor(2),
                        }}
                    >
                        <Typography variant="body1" style={{ display: 'flex', alignItems: 'center', marginRight: '8px', fontWeight: 'bold', width: '100%' }}>
                            <span style={{ flexGrow: 1 }}>{second.name}</span>
                            <Typography variant="caption" style={{ fontSize: '12px', opacity: 0.7 }}>
                                {TSep(second.stat)}
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item sx={{ width: (!fixWidth ? String(parseInt((third.stat / first.stat) * 100)) : "60") + "%" }}>
                    <Paper
                        elevation={3}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '10px', fontSize: '15px',
                            margin: "0 15px 0 15px",
                            background: calculateBackgroundColor(3),
                        }}
                    >
                        <Typography variant="body1" style={{ display: 'flex', alignItems: 'center', marginRight: '8px', fontWeight: 'bold', width: '100%' }}>
                            <span style={{ flexGrow: 1 }}>{third.name}</span>
                            <Typography variant="caption" style={{ fontSize: '12px', opacity: 0.7 }}>
                                {TSep(third.stat)}
                            </Typography>
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Card>
    );
};

export default Podium;