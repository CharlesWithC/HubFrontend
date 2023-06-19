import React, { useState, useEffect } from 'react';
import { getFormattedDate } from "../functions";

function calculate(timestamp) {
    if (timestamp === undefined || timestamp === null || isNaN(timestamp)) return "";
    if (timestamp === 0) {
        return "Never";
    }
    const date = new Date(timestamp);

    const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
    const today = new Date();
    const yesterday = new Date(today - DAY_IN_MS);
    const seconds = Math.round((today - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();

    if (seconds < 5) {
        return "Now";
    } else if (seconds < 60) {
        return `${seconds} seconds ago`;
    } else if (seconds < 120) {
        return "1 minute ago";
    } else if (minutes < 60) {
        return `${minutes} minutes ago`;
    } else if (isToday) {
        return getFormattedDate(date, "Today"); // Today at 10:20
    } else if (isYesterday) {
        return getFormattedDate(date, "Yesterday"); // Yesterday at 10:20
    } else if (isThisYear) {
        return getFormattedDate(date, false, true); // 10. January at 10:20
    }
    
    return getFormattedDate(date); // 10. January 2017. at 10:20
}

const calculateInterval = (timestamp) => {
    const currentTime = Date.now();
    const diff = currentTime - timestamp;

    if (diff < 60000) {
        return 1000;
    } else if (diff < 3600000) {
        return 60000;
    } else {
        return null;
    }
};

const TimeAgo = ({ timestamp, lower = false }) => {
    timestamp = parseInt(timestamp);
    const [timeAgo, setTimeAgo] = useState(calculate(timestamp));
    const [intervalDuration, setIntervalDuration] = useState(calculateInterval(timestamp));

    useEffect(() => {
        let interval = null;

        if (intervalDuration) {
            interval = setInterval(() => {
                let newInterval = calculateInterval(timestamp);
                if (newInterval === null) {
                    setIntervalDuration(null);
                } else if (newInterval !== intervalDuration) {
                    setIntervalDuration(null);
                }
                setTimeAgo(calculate(timestamp));
            }, intervalDuration);
        }

        return () => clearInterval(interval);
    }, [timestamp, intervalDuration]);

    if (!lower) {
        return <>{timeAgo}</>;
    } else {
        return <>{timeAgo.toLowerCase()}</>;
    }
};

export default TimeAgo;