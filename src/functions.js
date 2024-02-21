import axios from 'axios';
import axiosRetry from 'axios-retry';
import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

import i18n from './i18n';

var vars = require('./variables');

const customAxios = axios.create();
axiosRetry(customAxios, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined && error.response.status in [429, 503];
    },
});
customAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorResponse = error.response;

        if (errorResponse && (errorResponse.status === 429 || errorResponse.status === 503)) {
            const errorMessage = `${errorResponse.status}: ${errorResponse.statusText}`;
            console.error(new Error(errorMessage));
        }

        return errorResponse;
    }
);

export { customAxios };

export const makeRequests = async (urls) => {
    const responses = await Promise.all(
        urls.map((url) =>
            customAxios({
                url,
            })
        )
    );
    return responses.map((response) => response.data);
};

export const makeRequestsWithAuth = async (urls) => {
    const responses = await Promise.all(
        urls.map((url) =>
            customAxios({
                url,
                headers: {
                    Authorization: `Bearer ${getAuthToken()}`
                }
            })
        )
    );
    return responses.map((response) => response.data);
};

export const makeRequestsAuto = async (urls) => {
    const responses = await Promise.all(
        urls.map(({ url, auth }) => {
            if (auth === false || (auth === true && getAuthToken() !== null) || auth === "prefer") {
                return customAxios({
                    url,
                    headers: auth === true || auth === "prefer" && getAuthToken() !== null ? {
                        Authorization: `Bearer ${getAuthToken()}`
                    } : null,
                });
            } else {
                return { data: {} };
            }
        })
    );
    return responses.map((response) => response.data);
};

export function writeLS(key, data, secretKey) {
    let jsonString = JSON.stringify(data);
    let compressedString = LZString.compressToUTF16(jsonString);
    let encryptedString = CryptoJS.AES.encrypt(compressedString, secretKey).toString();
    localStorage.setItem(key, encryptedString);
}
export function readLS(key, secretKey) {
    try {
        let encryptedString = localStorage.getItem(key);
        let decryptedBytes = CryptoJS.AES.decrypt(encryptedString, secretKey);
        let decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        let decompressedString = LZString.decompressFromUTF16(decryptedString);
        let data = JSON.parse(decompressedString);
        return data;
    } catch {
        try {
            let data = JSON.parse(localStorage.getItem(key));
            writeLS(key, data, secretKey);
            return data;
        } catch {
            localStorage.removeItem(key);
            return null;
        }
    }
}

export function setAuthToken(token) {
    writeLS("token", { token: token }, vars.host);
}

export function getAuthToken() {
    let data = localStorage.getItem("token");
    if (data === null) return null;
    if (data.length === 36) {
        writeLS("token", { token: data }, vars.host);
        return data;
    }
    data = readLS("token", vars.host);
    if (data === null) return null;
    else return data.token;
};

export async function FetchProfile({ setUsers, initMemberUIDs, setCurUID, setCurUser, setCurUserPerm }, isLogin = false) {
    // accept a whole appContext OR those separate vars as first argument
    // this handles login/session validation and logout data update
    const bearerToken = getAuthToken();
    if (bearerToken !== null) {
        let resp = await customAxios({ url: `${vars.dhpath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
        if (resp.status === 200) {
            const curUser = resp.data;

            setCurUID(curUser.uid); // do this before setUsers so setUsers could automatically setCurUser
            setUsers(users => ({ ...users, [resp.data.uid]: curUser }));

            let roles = Object.values(vars.roles);
            roles.sort((a, b) => a.order_id - b.order_id);
            let roleOnDisplay = "";
            for (let i = 0; i < roles.length; i++) {
                if (curUser.roles.includes(roles[i].id)) {
                    roleOnDisplay = roles[i].name;
                    break;
                }
            }
            const allPerms = Object.keys(vars.perms);
            const userPerm = [];
            for (let i = 0; i < curUser.roles.length; i++) {
                for (let j = 0; j < allPerms.length; j++) {
                    if (vars.perms[allPerms[j]].includes(curUser.roles[i]) && !userPerm.includes(allPerms[j])) {
                        userPerm.push(allPerms[j]);
                    }
                }
            }
            setCurUserPerm(userPerm);
            
            vars.userBanner = { name: curUser.name, role: roleOnDisplay, avatar: curUser.avatar };

            let tiers = ["platinum", "gold", "silver", "bronze"];
            for (let i = 0; i < tiers.length; i++) {
                if (vars.userLevel !== -1) break;
                for (let j = 0; j < vars.patrons[tiers[i]].length; j++) {
                    let patron = vars.patrons[tiers[i]][j];
                    if (patron.abbr === vars.dhconfig.abbr && patron.uid === curUser.uid) {
                        vars.userPatreonID = patron.id;
                        vars.userLevel = 4 - i;
                        break;
                    }
                }
            }
            if (vars.userLevel === -1) vars.userLevel = 0;

            if (curUser.discordid !== null && curUser.discordid !== undefined && Object.keys(vars.specialRolesMap).includes(curUser.discordid) && vars.specialRolesMap[curUser.discordid] !== undefined) {
                for (let i = 0; i < vars.specialRolesMap[curUser.discordid].length; i++) {
                    if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_leader', 'marketing_leader', 'graphic_leader', 'support_team', 'marketing_team', 'graphic_team'].includes(vars.specialRolesMap[curUser.discordid][i].role)) {
                        // Team member get Platinum Perks
                        vars.userLevel = 4;
                        break;
                    }
                }
            }

            resp = await customAxios({ url: `${vars.dhpath}/user/language`, headers: { "Authorization": `Bearer ${bearerToken}` } });
            if (resp.status === 200) {
                vars.userSettings.language = resp.data.language;
                i18n.changeLanguage(resp.data.language);
                writeLS("client-settings", vars.userSettings, vars.host);
            }

            if (curUser.userid !== -1) {
                if (isLogin) {
                    // just patch, don't wait
                    customAxios({ url: `${vars.dhpath}/user/timezone`, method: "PATCH", data: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, headers: { "Authorization": `Bearer ${bearerToken}` } });
                }

                initMemberUIDs();
            }
        } else if (resp.status === 401) {
            localStorage.removeItem("token");
            vars.userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
        }
    } else {
        setCurUID(null);
        setCurUser({});
        setCurUserPerm([]);
        vars.userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
    }
}

export async function loadAllUsers() {
    let [resp] = await makeRequestsWithAuth([`${vars.dhpath}/user/list?page=1&page_size=250`]);
    let totalPages = resp.total_pages;
    vars.allUsers = resp.list;
    if (totalPages > 1) {
        let urlsBatch = [];
        for (let i = 2; i <= totalPages; i++) {
            urlsBatch.push(`${vars.dhpath}/user/list?page=${i}&page_size=250`);
            if (urlsBatch.length === 5 || i === totalPages) {
                let resps = await makeRequestsWithAuth(urlsBatch);
                for (let i = 0; i < resps.length; i++) {
                    vars.allUsers.push(...resps[i].list);
                }
                urlsBatch = [];
            }
        }
    }
}

export function TSep(val) {
    return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function ConvertUnit(type, val, decimal = 0) {
    if (val === undefined || val === null) {
        return "";
    }
    if (vars.userSettings.unit === "imperial") {
        if (type === "km") {
            val = (val * 0.621371192).toFixed(decimal);
            return TSep(val) + "mi";
        } else if (type === "kg") {
            val = (val * 2.20462262185).toFixed(decimal);
            return TSep(val) + "lb";
        } else if (type === "l") {
            val = (val * 0.26417205235815).toFixed(decimal);
            return TSep(val) + "gal";
        }
    } else if (vars.userSettings.unit === "metric") {
        return TSep((val * 1.0).toFixed(decimal)) + type;
    }
}

export function zfill(number, width) {
    const numberString = number.toString();
    const paddingWidth = width - numberString.length;
    if (paddingWidth <= 0) {
        return numberString;
    }
    const paddingZeros = '0'.repeat(paddingWidth);
    return paddingZeros + numberString;
}

export function CalcInterval(start_time, end_time) {
    let interval = (end_time - start_time) / 1000;
    let hours = parseInt(interval / 3600);
    let minutes = parseInt((interval - hours * 3600) / 60);
    let seconds = parseInt(interval - hours * 3600 - minutes * 60);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return "";
    return `${zfill(hours, 2)}:${zfill(minutes, 2)}:${zfill(seconds, 2)}`;
}

export const loadImageAsBase64 = async (imageUrl, fallback = "") => {
    try {
        let response = await customAxios.get(imageUrl, {
            responseType: 'blob' // Set the response type to blob
        });

        if (response.status === 404) {
            if (fallback !== "") {
                response = await customAxios.get(fallback, {
                    responseType: 'blob' // Set the response type to blob
                });
            } else {
                throw new Error('Image not found');
            }
        }

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

export function sortDictWithValue(dict) {
    var items = Object.keys(dict).map(function (key) {
        return [key, dict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
        return second[1] - first[1];
    });

    return items;
}

export function getRankName(points) {
    let ranks = [];
    for (let i = 0; i < vars.ranks.length; i++) {
        if (vars.ranks[i].default) {
            ranks = vars.ranks[i].details;
            break;
        }
    }
    if (isNaN(Number(points)) || points < ranks[0].points) return "N/A";
    for (let i = 0; i < ranks.length - 1; i++) {
        if (points > ranks[i].points && points < ranks[i + 1].points) {
            return ranks[i].name;
        }
    }
    return ranks[ranks.length - 1].name;
}

export function getCurrentMonthName() {
    const date = new Date();
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

    return months[date.getMonth()];
}

export function getTimezoneOffset(timezone) {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (utcDate - tzDate) / (1000 * 60);
}

export function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
    if (date === undefined || date === null) return "";
    if (typeof date === "number") {
        if (date < 2000000000) date = date * 1000;
        date = new Date(date);
    }

    // convert display timezone
    try {
        date = new Date(new Date(date.getTime() - getTimezoneOffset(vars.userSettings.display_timezone) * 60000).toISOString().slice(0, 16));
    } catch {
        return "";
    }

    const day = date.getDate();
    const month = MONTH_NAMES[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    if (hours < 10) {
        // Adding leading zero to hours
        hours = `0${hours}`;
    }
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

export function getTodayUTC() {
    const today = new Date();
    const utcDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    return utcDate.getTime();
}

export function getMonthUTC(date = undefined) {
    if (date === undefined) {
        date = new Date();
    }
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), 1);
    return utcDate.getTime();
}

export function getNextMonthUTC() {
    const today = new Date();
    if (today.getUTCMonth() === 12) {
        const utcDate = new Date(today.getUTCFullYear() + 1, 1, 1);
        return utcDate.getTime();
    } else {
        const utcDate = new Date(today.getUTCFullYear(), today.getUTCMonth() + 1, 1);
        return utcDate.getTime();
    }
}

export function checkUserRole(user, roles) {
    // any matches in perms will return true
    for (let i = 0; i < roles.length; i++) {
        if (user.roles.includes(roles[i])) {
            return true;
        }
    }
    return false;
}

export function getRolePerms(role, permsConfig = vars.perms) {
    let perms = [];
    let allPerms = Object.keys(permsConfig);
    for (let i = 0; i < allPerms.length; i++) {
        if (permsConfig[allPerms[i]].includes(role)) {
            perms.push(allPerms[i]);
        }
    }
    return perms;
}

export function checkPerm(roles, perms) {
    if (roles === undefined) return false;
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

export function checkUserPerm(userPerm, perms) {
    // any matches in perms will return true
    for (let i = 0; i < perms.length; i++) {
        if (userPerm.includes(perms[i])) {
            return true;
        }
    }
    return false;
}

export function downloadFile(url) {
    // Create an anchor element
    var link = document.createElement('a');

    // Set the href to the provided URL
    link.href = url;

    // Fetch the final URL after following redirects
    fetch(link.href, { method: 'HEAD', redirect: 'follow' })
        .then(response => {
            // Extract the final URL
            var finalUrl = response.url;

            // Check if the final URL is a real file
            if (/\.[^/.]+$/.test(finalUrl)) {
                // Extract the file name from the URL
                var fileName = finalUrl.substring(finalUrl.lastIndexOf('/') + 1);

                // Set the download attribute and file name
                link.download = fileName;

                // Trigger a click event on the anchor element to initiate the download
                link.click();
            } else {
                // Open the link in a new tab
                window.open(finalUrl, '_blank');
            }
        })
        .catch(error => {
            console.error('Error fetching the file:', error);
        });
}

export function downloadLocal(fileName, fileContent) {
    // Creating a Blob with the content
    const blob = new Blob([fileContent], { type: 'text/plain' });

    // Creating a link element
    const link = document.createElement('a');

    // Setting the href attribute to the Blob URL
    link.href = URL.createObjectURL(blob);

    // Setting the download attribute to specify the filename
    link.download = fileName;

    // Appending the link to the document
    document.body.appendChild(link);

    // Triggering the click event to initiate the download
    link.click();

    // Removing the link from the document
    document.body.removeChild(link);
};

export function b62decode(num62) {
    let flag = 1;
    if (num62.startsWith("-")) {
        flag = -1;
        num62 = num62.slice(1);
    }
    let ret = 0;
    let l = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOQRSTUVWXYZ";
    for (var i = 0; i < num62.length; i++) {
        ret += l.indexOf(num62[i]) * 62 ** (num62.length - i - 1);
    }
    return ret * flag;
}

export function isSameDay(timestamp) {
    // Convert the timestamp to a Date object
    const dateFromTimestamp = new Date(timestamp);

    // Get the current date
    const currentDate = new Date();

    // Compare the date components (year, month, and day)
    const isSameYear = dateFromTimestamp.getFullYear() === currentDate.getFullYear();
    const isSameMonth = dateFromTimestamp.getMonth() === currentDate.getMonth();
    const isSameDay = dateFromTimestamp.getDate() === currentDate.getDate();

    // If all date components match, it's the same day
    return isSameYear && isSameMonth && isSameDay;
}

export function removeNullValues(obj) {
    const newObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
};

export function removeNUEValues(obj) { // NUE => null + undefined + empty string
    const newObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
            newObj[key] = obj[key];
        }
    }

    return newObj;
};

export function compareVersions(version1, version2) {
    const v1 = version1.replace('.dev', '').split('.').map(Number);
    const v2 = version2.replace('.dev', '').split('.').map(Number);

    for (let i = 0; i < v1.length; i++) {
        if (v1[i] < v2[i]) {
            return -1;
        } else if (v1[i] > v2[i]) {
            return 1;
        }
    }

    return 0;
}

export function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

export function setAuthMode(name, value = "") {
    setCookie("auth-mode", name + "," + value + "," + +new Date());
}

export function getAuthMode() {
    let authMode = getCookie("auth-mode");
    if (authMode !== null) {
        authMode = authMode.split(",");
        if (+new Date() - authMode[2] > 600000) authMode = null;
        else return [authMode[0], authMode[1]];
    }
    return authMode;
}

export function eraseAuthMode() {
    eraseCookie("auth-mode");
}

export function toLocalISOString(date) {
    var tzo = -date.getTimezoneOffset(),
        dif = tzo >= 0 ? '+' : '-',
        pad = function (num) {
            var norm = Math.floor(Math.abs(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        dif + pad(tzo / 60) +
        ':' + pad(tzo % 60);
}