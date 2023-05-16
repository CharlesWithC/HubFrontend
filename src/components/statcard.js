import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const StatCard = () => {
    const theme = useTheme();

    const chartRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext('2d');

        const inputs = {
            count: 7, // Modify this value as per your requirement
        };

        const generateLabels = () => {
            return Array.from({ length: inputs.count }, (_, i) => i + 1);
        };

        const generateData = () => {
            return Array.from({ length: inputs.count }, () => Math.random() * 100);
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
                    data: generateData(),
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
    }, [theme.palette.text.primary]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" component="div">
                    Latest Stat
                </Typography>
                <Typography variant="body1" component="div">
                    xxx drivers
                </Typography>
            </CardContent>
            <div style={{ height: '100%' }}>
                <canvas ref={chartRef} style={{ height: '100%' }} />
            </div>
        </Card>
    );
};

export default StatCard;