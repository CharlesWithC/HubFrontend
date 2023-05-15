import React from 'react';
import ReactApexChart from 'react-apexcharts';

function StatCard() {
    const series = [
        {
            name: 'series1',
            data: [31, 40, 28, 51, 42, 109, 100]
        },
        {
            name: 'series2',
            data: [11, 32, 45, 32, 34, 52, 41]
        }
    ];

    const options = {
        chart: {
            height: 350,
            type: 'area',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth'
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            tooltip: {
                enabled: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            }
        },
        tooltip: {
            enabled: false
        },
        legend: {
            show: false
        },
        grid: {
            show: false
        },
    };

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="area" height={350} />
        </div>
    );
}

export default StatCard;