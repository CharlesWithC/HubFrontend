import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { Card, CardContent, Typography } from '@mui/material';

const StatCard = () => {
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

        const data = {
            labels: generateLabels(),
            datasets: [
                {
                    label: 'Dataset',
                    data: generateData(),
                    borderColor: 'rgba(255, 99, 132, 1)', // Red color
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red color with transparency
                    fill: 'start',
                },
            ],
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: false, // Hide x-axis
                },
                y: {
                    display: false, // Hide y-axis
                },
            },
            plugins: {
                title: {
                    display: false, // Hide title
                },
                legend: {
                    display: false, // Hide legend
                },
                tooltip: {
                    enabled: false, // Disable tooltip
                },
            },
            layout: {
                padding: 0, // Remove padding
            },
            elements: {
                line: {
                    tension: 0, // Set tension to 0 to remove curved lines
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        };

        const chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options,
        });

        console.log("re-render");

        return () => {
            chart.destroy();
        };
    }, []);

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
            <div style={{ height: '400px' }}>
                <canvas ref={chartRef} style={{ height: '100%' }} />
            </div>
        </Card>
    );
};

export default StatCard;