import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StatCard = (props) => {
    const { icon, title, latest, inputs } = props;
    const theme = useTheme();

    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        const generateLabels = () => {
            return Array.from({ length: inputs.length }, (_, i) => i + 1);
        };

        var gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, theme.palette.text.primary + '75');
        gradient.addColorStop(0.382, theme.palette.text.primary + '25');
        gradient.addColorStop(0.618, theme.palette.text.primary + '10');

        const data = {
            labels: generateLabels(),
            datasets: [
                {
                    label: 'Dataset',
                    data: inputs,
                    fill: 'start',
                    borderColor: theme.palette.text.primary,
                    backgroundColor: gradient
                },
            ],
        };


        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false,
                },
                y: {
                    display: false,
                    suggestedMin: 0
                },
            },
            plugins: {
                title: {
                    display: false,
                },
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                },
            },
            layout: {
                padding: 0,
            },
            elements: {
                line: {
                    tension: 0.5,
                },
                point: {
                    radius: 0,
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true,
            },
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options,
        });

        return () => {
            chart.destroy();
        };
    }, [inputs, theme.palette.text.primary]);

    return (
        <Card>
            <CardContent>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <Typography variant="h5" component="div" sx={{ flexGrow: 1, display: 'flex', alignItems: "center" }}>
                        {icon}&nbsp;&nbsp;{title}
                    </Typography>
                    <Chip label={latest} sx={{ fontFamily: "Orbitron", borderRadius: "5px" }}></Chip>
                </div>
            </CardContent>
            <div style={{ height: '100%' }}>
                <canvas ref={chartRef} style={{ height: '100%' }} />
            </div>
        </Card >
    );
};

export default StatCard;