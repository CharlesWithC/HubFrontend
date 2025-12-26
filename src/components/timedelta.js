import { useState, useEffect, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context";

import { Tooltip } from "@mui/material";

import { getFormattedDate } from "../functions";

const TimeDelta = ({ timestamp, lower = false, rough = false }) => {
  const { t: tr } = useTranslation();
  const { userSettings } = useContext(AppContext);

  const calculate = useCallback((timestamp, lower) => {
    if (timestamp === undefined || timestamp === null || isNaN(timestamp)) return "";
    if (timestamp <= 86400000) {
      return tr("never");
    }
    const date = new Date(timestamp);

    const DAY_IN_MS = 86400000; // 24 * 60 * 60 * 1000
    const today = new Date();
    const yesterday = new Date(today.getTime() - DAY_IN_MS);
    const tomorrow = new Date(today.getTime() + DAY_IN_MS);
    const seconds = Math.round((today.getTime() - date) / 1000);
    const minutes = Math.round(seconds / 60);
    const isToday = today.toDateString() === date.toDateString();
    const isYesterday = yesterday.toDateString() === date.toDateString();
    const isTomorrow = tomorrow.toDateString() === date.toDateString();
    const isThisYear = today.getFullYear() === date.getFullYear();

    let ret = "";
    if (timestamp <= +new Date()) {
      if (seconds < 5) {
        ret = tr("now");
      } else if (seconds < 60) {
        ret = tr("seconds_ago", { seconds: seconds });
      } else if (seconds < 120) {
        ret = tr("1_minute_ago");
      } else if (minutes < 60) {
        ret = tr("minutes_ago", { minutes: minutes });
      } else if (isToday) {
        ret = getFormattedDate(userSettings.display_timezone, date, tr("today")); // Today at 10:20
      } else if (isYesterday) {
        ret = getFormattedDate(userSettings.display_timezone, date, tr("yesterday")); // Yesterday at 10:20
      }
    } else {
      if (seconds > -5) {
        ret = tr("now");
      } else if (seconds > -60) {
        ret = tr("seconds_later", { seconds: -seconds });
      } else if (seconds > -120) {
        ret = tr("1_minute_later");
      } else if (minutes > -60) {
        ret = tr("minutes_later", { minutes: -minutes });
      } else if (isToday) {
        ret = getFormattedDate(userSettings.display_timezone, date, tr("today")); // Today at 10:20
      } else if (isTomorrow) {
        ret = getFormattedDate(userSettings.display_timezone, date, tr("tomorrow")); // Tomorrow at 10:20
      }
    }
    if (rough) ret = ret.split(" at")[0];
    if (ret !== "") {
      if (lower) return ret.toLowerCase();
      else return ret;
    }
    ret = getFormattedDate(userSettings.display_timezone, date);
    if (rough) ret = ret.split(" at")[0];
    if (lower) return ret.toLowerCase();
    else return ret;
  }, []);

  const calculateInterval = useCallback(timestamp => {
    const currentTime = Date.now();
    const diff = currentTime - timestamp;

    if (diff < 60000) {
      return 1000;
    } else if (diff < 3600000) {
      return 60000;
    } else {
      return null;
    }
  }, []);

  if (timestamp === null) timestamp = 0;
  timestamp = parseInt(timestamp);
  const [timeAgo, setTimeAgo] = useState(calculate(timestamp, lower));
  const [intervalDuration, setIntervalDuration] = useState(calculateInterval(timestamp));

  useEffect(() => {
    let interval = null;

    if (intervalDuration) {
      interval = setInterval(() => {
        let newInterval = calculateInterval(timestamp);
        if (newInterval === null) {
          setIntervalDuration(null);
        } else if (newInterval !== intervalDuration) {
          setIntervalDuration(newInterval);
        }
        setTimeAgo(calculate(timestamp, lower));
      }, intervalDuration);
    }

    return () => clearInterval(interval);
  }, [timestamp, intervalDuration]);

  const date = new Date(timestamp);
  const day = date.toLocaleDateString(userSettings.language || "en", { weekday: "long" });
  return (
    <Tooltip placement="top" arrow title={<>{getFormattedDate(userSettings.display_timezone, date, false, true)}</>} PopperProps={{ modifiers: [{ name: "offset", options: { offset: [0, -10] } }] }}>
      {timeAgo}
    </Tooltip>
  );
};

export default TimeDelta;
