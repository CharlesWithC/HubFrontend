import axios from 'axios';
import axiosRetry from 'axios-retry';

var vars = require('./variables');

const customAxios = axios.create();
axiosRetry(customAxios, {
    retries: 3,
    retryDelay: (retryCount) => {
        console.log(`retry attempt: ${retryCount}`);
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
    },
});

export { customAxios };

export const makeRequests = async (urls) => {
    const responses = await Promise.all(
        urls.map((url) =>
            axios({
                url,
            })
        )
    );
    return responses.map((response) => response.data);
};

export const makeRequestsWithAuth = async (urls) => {
    const responses = await Promise.all(
        urls.map((url) =>
            axios({
                url,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            })
        )
    );
    return responses.map((response) => response.data);
};

export const makeRequestsAuto = async (urls) => {
    const responses = await Promise.all(
        urls.map(({ url, auth }) => {
            if (!auth || (auth && vars.isLoggedIn)) {
                return axios({
                    url,
                    headers: auth ? {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    } : null,
                });
            } else {
                return { data: {} };
            }
        })
    );
    return responses.map((response) => response.data);
};

export async function FetchProfile() {
    const bearerToken = localStorage.getItem("token");
    if (bearerToken !== null) {
        const resp = await axios({ url: `${vars.dhpath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
        if (resp.status === 200) {
            vars.isLoggedIn = true;
            vars.userInfo = resp.data;
            const userRoles = vars.userInfo.roles.sort();
            var roleOnDisplay = "";
            for (let i = 0; i < userRoles.length; i++) {
                if (Object.keys(vars.roles).includes(String(userRoles[i]))) {
                    roleOnDisplay = vars.roles[userRoles[i]].name;
                    break;
                }
            }
            const allPerms = Object.keys(vars.perms);
            for (let i = 0; i < userRoles.length; i++) {
                for (let j = 0; j < allPerms.length; j++) {
                    if (vars.perms[allPerms[j]].includes(userRoles[i])) {
                        vars.userPerm.push(allPerms[j]);
                        break;
                    }
                }
            }
            vars.userBanner = { name: vars.userInfo.name, role: roleOnDisplay, avatar: vars.userInfo.avatar };
        } else {
            localStorage.removeItem("token");
            vars.userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" }
        }
    } else {
        vars.isLoggedIn = false;
        vars.userInfo = {};
        vars.userPerm = [];
        vars.userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" }
    }
}

export function TSep(val) {
    return val.toLocaleString('en-US');
}

export function ConvertUnit(type, val) {
    if (val === undefined || val === null) {
        return "";
    }
    if (vars.userSettings.unit === "imperial") {
        if (type === "km") {
            val = parseInt(val * 0.621371192);
            return TSep(val) + "mi";
        } else if (type === "kg") {
            val = parseInt(val * 2.20462262185);
            return TSep(val) + "lb";
        } else if (type === "l") {
            val = parseInt(val * 0.26417205235815);
            return TSep(val) + "gal";
        }
    } else if (vars.userSettings.unit === "metric") {
        return TSep(val) + type;
    }
}

export const loadImageAsBase64 = async (imageUrl) => {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'blob' // Set the response type to blob
        });

        const blob = response.data;
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result);
                } else {
                    reject('Failed to convert image to base64');
                }
            };

            reader.onerror = () => {
                reject('Error occurred while converting image to base64');
            };

            reader.readAsDataURL(blob); // Read the blob as data URL (base64)
        });
    } catch (error) {
        console.error('Error loading image:', error);
        throw error;
    }
};

export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export function OrdinalSuffix(i) {
    var j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

export function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 10) {
        // Adding leading zero to minutes
        minutes = `0${minutes}`;
    }

    if (prefomattedDate) {
        // Today at 10:20
        // Yesterday at 10:20
        return `${prefomattedDate} at ${hours}:${minutes}`;
    }

    if (hideYear) {
        // January 10. at 10:20
        return `${month} ${OrdinalSuffix(day)} at ${hours}:${minutes}`;
    }

    // January 10. 2017. at 10:20
    return `${month} ${OrdinalSuffix(day)} ${year} at ${hours}:${minutes}`;
}


export function timeAgo(dateParam) {
    if (typeof (dateParam) === "number") dateParam = new Date(dateParam);
    if (dateParam.getTime() === new Date(0).getTime()) {
        return "Never";
    }
    if (!dateParam) {
        return null;
    }

    const date = typeof dateParam === 'object' ? dateParam : new Date(dateParam);
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
    } else if (seconds < 90) {
        return "About a minute ago";
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

export function checkPerm(roles, perms) {
    // any matches in perms will return true
    for (let i = 0; i < perms.length; i++) {
        for (let j = 0; j < vars.perms[perms[i]].length; j++) {
            if (roles.includes(vars.perms[perms[i]][j])) {
                return true;
            }
        }
    }
    return false;
}

export function checkUserPerm(perms) {
    // any matches in perms will return true
    for (let i = 0; i < perms.length; i++) {
        if (vars.userPerm.includes(perms[i])) {
            return true;
        }
    }
    return false;
}