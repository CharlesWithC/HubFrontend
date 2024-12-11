import axios from 'axios';
import axiosRetry from 'axios-retry';
import LZString from 'lz-string';
import CryptoJS from 'crypto-js';

import i18n from './i18n';

let cache = "";
let cacheExp = 0;
let cacheA = "";
let cacheAExp = 0;

async function gck(ua, au, ts) {
    const te = new TextEncoder();
    let km = te.encode(ts.toString());
    let k = await window.crypto.subtle.importKey(
        "raw", km, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    let d = te.encode(ua);
    let sig = await window.crypto.subtle.sign("HMAC", k, d);

    if (au) {
        km = te.encode(au);
        k = await window.crypto.subtle.importKey(
            "raw", km, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        d = new Uint8Array(sig);
        sig = await window.crypto.subtle.sign("HMAC", k, d);
    }

    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

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
customAxios.interceptors.request.use(async (config) => {
    if (config.fetchOnly) {
        config.adapter = async () => {
            const response = await fetch(config.url, {
                method: config.method,
                body: config.data,
            });

            const headers = {};
            response.headers.forEach((value, name) => {
                headers[name] = value;
            });

            return {
                data: await response.text(),
                status: response.status,
                statusText: response.statusText,
                headers: headers,
                config: config,
                request: null,
            };
        };
    }

    if (config.headers['Authorization']) {
        if (cacheAExp > +new Date()) {
            config.headers['Client-Key'] = cacheA;
            return config;
        }
    } else {
        if (cacheExp > +new Date()) {
            config.headers['Client-Key'] = cache;
            return config;
        }
    }
    const ts = parseInt(+new Date() / 1000 / 60);
    const au = config.headers['Authorization'];
    const hmac = await gck(navigator.userAgent, au, ts);
    config.headers['Client-Key'] = hmac;
    if (config.headers['Authorization']) {
        cacheA = hmac; cacheAExp = +new Date() + 60000;
    } else {
        cache = hmac; cacheExp = +new Date() + 60000;
    }
    return config;
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
        urls.map(async ({ url, auth, fetchOnly }) => {
            if (fetchOnly) {
                return await customAxios({
                    url,
                    fetchOnly: true,
                });
            }
            if (auth === false || (auth === true && getAuthToken() !== null) || auth === "prefer") {
                return await customAxios({
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
    return responses.map((response) => response ? (response.error || response.data) : {});
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
    writeLS("token", { token: token }, window.dhhost);
}

export function getAuthToken() {
    let data = localStorage.getItem("token");
    if (data === null) return null;
    if (data.length === 36) {
        writeLS("token", { token: data }, window.dhhost);
        return data;
    }
    data = readLS("token", window.dhhost);
    if (data === null) return null;
    else return data.token;
};

export async function FetchProfile({ apiPath, specialUsers, patrons, setUserLevel, webConfig, setCurUserPatreonID, setUsers, setCurUID, setCurUser, setCurUserPerm, setCurUserBanner, setUserSettings }, isLogin = false) {
    // accept a whole appContext OR those separate vars as first argument
    // this handles login/session validation and logout data update
    const bearerToken = getAuthToken();
    if (bearerToken !== null) {
        let resp = await customAxios({ url: `${apiPath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
        if (resp.status === 200) {
            const curUser = resp.data;
            let userLevel = -1;

            setUsers(users => ({ ...users, [curUser.uid]: curUser }));
            setCurUID(curUser.uid);

            writeLS("cache-user", curUser, window.dhhost + bearerToken);

            let sync_to = undefined;
            if (curUser.avatar.startsWith("https://cdn.discordapp.com/")) {
                sync_to = "discord";
            } else if (curUser.avatar.startsWith("https://avatars.steamstatic.com/")) {
                sync_to = "steam";
            } else if (curUser.avatar.startsWith("https://static.truckersmp.com/")) {
                sync_to = "truckersmp";
            }
            sync_to === undefined ? sync_to = "" : sync_to = `?sync_to_${sync_to}=true`;
            if (sync_to !== "") {
                let avatarOk = true;
                fetch(curUser.avatar, {
                    method: 'HEAD',
                    mode: 'no-cors'
                }).then(response => {
                    if (!response.ok) {
                        avatarOk = false;
                    }
                }).catch(error => {
                    avatarOk = false;
                }).finally(async () => {
                    if (!avatarOk) {
                        let resp = await customAxios({ url: `${apiPath}/user/profile${sync_to}`, method: "PATCH", headers: { Authorization: `Bearer ${getAuthToken()}` } });
                        if (resp.status === 200) {
                            setUsers(users => ({ ...users, [curUser.uid]: resp.data }));
                        }
                    }
                });
            }

            let tiers = ["platinum", "gold", "silver", "bronze"];
            for (let i = 0; i < tiers.length; i++) {
                if (userLevel !== -1) break;
                for (let j = 0; j < patrons[tiers[i]].length; j++) {
                    let patron = patrons[tiers[i]][j];
                    if (patron.abbr === webConfig.abbr && patron.uid === curUser.uid) {
                        setCurUserPatreonID(patron.id);
                        userLevel = 4 - i;
                        break;
                    }
                }
            }
            if (userLevel === -1) userLevel = 0;

            if (curUser.discordid !== null && curUser.discordid !== undefined && Object.keys(specialUsers).includes(curUser.discordid) && specialUsers[curUser.discordid] !== undefined) {
                for (let i = 0; i < specialUsers[curUser.discordid].length; i++) {
                    if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_leader', 'marketing_leader', 'graphic_leader', 'support_team', 'marketing_team', 'graphic_team', 'platinum_access'].includes(specialUsers[curUser.discordid][i].role)) {
                        // Team member get Platinum Perks
                        userLevel = 4;
                        break;
                    }
                }
            }

            if (apiPath === "https://drivershub.charlws.com/atm") {
                // ATM Leadership & HR+ gets platinum perks
                for (let i = 0; i < curUser.roles.length; i++) {
                    if (curUser.roles[i] < 30) {
                        userLevel = 4;
                        break;
                    }
                }
            }

            setUserLevel(userLevel);

            customAxios({ url: `${apiPath}/user/language`, headers: { "Authorization": `Bearer ${bearerToken}` } })
                .then(resp => {
                    if (resp.status === 200) {
                        setUserSettings(userSettings => ({ ...userSettings, language: resp.data.language }));
                        i18n.changeLanguage(resp.data.language);
                    }
                });

            if (curUser.userid !== undefined && curUser.userid !== null && curUser.userid !== -1) {
                if (isLogin) {
                    // just patch, don't wait
                    customAxios({ url: `${apiPath}/user/timezone`, method: "PATCH", data: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, headers: { "Authorization": `Bearer ${bearerToken}` } });
                }

                return { "ok": true, "member": true };
            } else {
                return { "ok": true, "member": false };
            }
        } else if (resp.status === 401) {
            localStorage.removeItem("token");
            setCurUserBanner({ name: "Login", role: "", avatar: "https://charlws.com/me.gif" });
            return { "ok": false, "member": false };
        }
    } else {
        setCurUID(null);
        setCurUser({});
        setCurUserPerm([]);
        setCurUserBanner({ name: "Login", role: "", avatar: "https://charlws.com/me.gif" });
        return { "ok": false, "member": false };
    }
}

export function TSep(val) {
    return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function ConvertUnit(unit, type, val, decimal = 0) {
    if (val === undefined || val === null) {
        return "";
    }
    if (unit === "imperial") {
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
    } else if (unit === "metric") {
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
        throw error;
    }
};

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

export function getRankName(points, allRanks) {
    let ranks = [];
    for (let i = 0; i < allRanks.length; i++) {
        if (allRanks[i].default) {
            ranks = allRanks[i].details;
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

export function getTimezoneOffset(timezone, compareWith = 'UTC') {
    const date = new Date();
    const baseDate = new Date(date.toLocaleString('en-US', { timeZone: compareWith }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (baseDate - tzDate) / (1000 * 60);
}

export function getFormattedDate(display_timezone, date, prefomattedDate = false) {
    if (date === undefined || date === null) return "";
    if (typeof date === "number") {
        if (date < 2000000000) date = date * 1000;
        date = new Date(date);
    }

    // convert display timezone
    try {
        date = new Date(new Date(date.getTime() - getTimezoneOffset(display_timezone) * 60000).toISOString().slice(0, 16));
    } catch {
        return "";
    }

    const localizedDate = date.toLocaleDateString();
    const localizedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (prefomattedDate) {
        // Today at 10:20
        // Yesterday at 10:20
        return `${prefomattedDate} at ${localizedTime}`;
    }

    // {localized datetime} at 10:20
    return `${localizedDate} ${localizedTime}`;
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

export function getRolePerms(role, permsConfig) {
    let perms = [];
    let allPerms = Object.keys(permsConfig);
    for (let i = 0; i < allPerms.length; i++) {
        if (permsConfig[allPerms[i]].includes(role)) {
            perms.push(allPerms[i]);
        }
    }
    return perms;
}

export function checkPerm(roles, perms, allPerms) {
    if (roles === undefined) return false;
    // any matches in perms will return true
    for (let i = 0; i < perms.length; i++) {
        for (let j = 0; j < allPerms[perms[i]].length; j++) {
            if (roles.includes(allPerms[perms[i]][j])) {
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

export function removeNUEValues(obj) { // NUE => null + nan + undefined + empty string
    const newObj = {};

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined && obj[key] !== "" && !Number.isNaN(obj[key])) {
            newObj[key] = obj[key];
        }
        if (typeof (newObj[key]) === "object") {
            newObj[key] = newObj[key].join(","); // lists are converted to comma separated strings
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

export function eraseCookie(name, path = '/', domain = '') {
    document.cookie = name + '=; ' +
        'expires=Thu, 01 Jan 1970 00:00:00 GMT; ' +
        'path=' + path + '; ' +
        (domain ? 'domain=' + domain + '; ' : '') +
        'max-age=0';
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

export function convertLocalTimeToUTC(time) {
    // Extract hours and minutes from the input time
    const [hours, minutes] = time.split(':').map(Number);

    // Create a Date object for today with the specified local time
    const localDate = new Date();
    localDate.setHours(hours, minutes, 0, 0);

    // Get the UTC hours and minutes
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();

    // Format the UTC time as HH:MM
    const formattedUTCTime = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;

    return formattedUTCTime;
}

export const DEFAULT_ROLES = [{ 'id': 0, 'name': 'Owner', 'order_id': 0, 'discord_role_id': '' }, { 'id': 10, 'name': 'Leadership', 'order_id': 10, 'discord_role_id': '' }, { 'id': 20, 'name': 'Human Resources Manager', 'order_id': 20, 'discord_role_id': '' }, { 'id': 21, 'name': 'Human Resources Staff', 'order_id': 21, 'discord_role_id': '' }, { 'id': 30, 'name': 'Events Manager', 'order_id': 30, 'discord_role_id': '' }, { 'id': 31, 'name': 'Events Staff', 'order_id': 31, 'discord_role_id': '' }, { 'id': 40, 'name': 'Convoy Supervisor', 'order_id': 40, 'discord_role_id': '' }, { 'id': 41, 'name': 'Convoy Control', 'order_id': 41, 'discord_role_id': '' }, { 'id': 70, 'name': 'Division Manager', 'order_id': 70, 'discord_role_id': '' }, { 'id': 71, 'name': 'Division Supervisor', 'order_id': 71, 'discord_role_id': '' }, { 'id': 80, 'name': 'Community Manager', 'order_id': 80, 'discord_role_id': '' }, { 'id': 81, 'name': 'Community Team', 'order_id': 81, 'discord_role_id': '' }, { 'id': 99, 'name': 'Trial Staff', 'order_id': 99, 'discord_role_id': '' }, { 'id': 100, 'name': 'Driver', 'order_id': 100, 'discord_role_id': '' }, { 'id': 200, 'name': 'Staff of the Month', 'order_id': 200, 'discord_role_id': '', 'display_order_id': '-100' }, { 'id': 201, 'name': 'Driver of the Month', 'order_id': 201, 'discord_role_id': '', 'display_order_id': '-100' }, { 'id': 202, 'name': 'Leave of absence', 'order_id': 202, 'discord_role_id': '', 'display_order_id': '-1' }];

export const DEFAULT_PERMS = { 'administrator': [0, 10], 'update_config': [], 'reload_config': [], 'restart_service': [], 'accept_members': [20, 21], 'dismiss_members': [20, 21], 'update_roles': [20, 21], 'update_points': [20, 21], 'update_connections': [20, 21], 'disable_mfa': [20], 'delete_notifications': [20], 'manage_profiles': [20, 21], 'view_sensitive_profile': [20, 21], 'view_privacy_protected_data': [20, 21], 'view_global_note': [20, 21], 'update_global_note': [20, 21], 'view_external_user_list': [20, 21], 'ban_users': [20, 21], 'delete_users': [20, 21], 'import_dlogs': [20], 'delete_dlogs': [20], 'view_audit_log': [20, 21], 'manage_announcements': [20], 'manage_applications': [20, 21, 70, 71], 'delete_applications': [20], 'manage_challenges': [20, 80, 81], 'manage_divisions': [70, 71], 'manage_downloads': [], 'manage_economy': [], 'manage_economy_balance': [], 'manage_economy_truck': [], 'manage_economy_garage': [], 'manage_economy_merch': [], 'manage_events': [40, 41], 'manage_polls': [], 'driver': [100], 'staff_of_the_month': [200], 'driver_of_the_month': [201] };

export const DEFAULT_RANKS = [{ 'name': 'Trainee', 'color': '#24ad88', 'discord_role_id': '', 'points': 0, 'daily_bonus': { 'type': 'streak', 'base': 50, 'streak_type': 'algo', 'streak_value': 1.01, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.025 } }, { 'name': 'Rookie', 'color': '#80e8dd', 'discord_role_id': '', 'points': 2000, 'daily_bonus': { 'type': 'streak', 'base': 75, 'streak_type': 'algo', 'streak_value': 1.015, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.035 } }, { 'name': 'Driver', 'color': '#f47b60', 'discord_role_id': '', 'points': 10000, 'daily_bonus': { 'type': 'streak', 'base': 100, 'streak_type': 'algo', 'streak_value': 1.02, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.045 } }, { 'name': 'Experienced Driver', 'color': '#008080', 'discord_role_id': '', 'points': 15000, 'daily_bonus': { 'type': 'streak', 'base': 125, 'streak_type': 'algo', 'streak_value': 1.025, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.055 } }, { 'name': 'Enthusiast Driver', 'color': '#2d687a', 'discord_role_id': '', 'points': 25000, 'daily_bonus': { 'type': 'streak', 'base': 150, 'streak_type': 'algo', 'streak_value': 1.03, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.065 } }, { 'name': 'Master Driver', 'color': '#317fa0', 'discord_role_id': '', 'points': 40000, 'daily_bonus': { 'type': 'streak', 'base': 175, 'streak_type': 'algo', 'streak_value': 1.035, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.075 } }, { 'name': 'Veteran Driver', 'color': '#3a5f0b', 'discord_role_id': '', 'points': 75000, 'daily_bonus': { 'type': 'streak', 'base': 225, 'streak_type': 'algo', 'streak_value': 1.045, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.095 } }, { 'name': 'Elite Driver', 'color': '#920931', 'discord_role_id': '', 'points': 80000, 'daily_bonus': { 'type': 'streak', 'base': 250, 'streak_type': 'algo', 'streak_value': 1.05, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.105 } }, { 'name': 'Ultimate Driver', 'color': '#d81438', 'discord_role_id': '', 'points': 100000, 'daily_bonus': { 'type': 'streak', 'base': 275, 'streak_type': 'algo', 'streak_value': 1.055, 'algo_offset': 15 }, 'distance_bonus': { 'min_distance': 500, 'max_distance': -1, 'probability': 1, 'type': 'fixed_percentage', 'value': 0.115 } }];

export const DEFAULT_APPLICATIONS = [{ 'id': 1, 'name': 'Driver', 'message': '<@&role-id>', 'channel_id': '', 'webhook_url': '', 'staff_role_ids': [20, 21], 'required_connections': ['steam'], 'required_member_state': 0, 'required_either_user_role_ids': [], 'required_all_user_role_ids': [], 'prohibited_either_user_role_ids': [], 'prohibited_all_user_role_ids': [], 'cooldown_hours': 2, 'form': [{ 'type': 'date', 'label': 'What is your birthday?', 'must_input': true }, { 'type': 'textarea', 'label': 'How did you find us?', 'rows': '3', 'placeholder': 'Enter a short answer', 'min_length': 10 }, { 'type': 'radio', 'label': 'Are you currently in another VTC?', 'choices': ['Yes', 'No'], 'must_input': true }, { 'type': 'textarea', 'label': 'What are your interests?', 'rows': '5', 'placeholder': 'Tell us a little bit about yourself', 'min_length': 150 }, { 'type': 'textarea', 'label': 'Why do you want to be a part of our VTC?', 'rows': '5', 'placeholder': "Why would you like to join us? This doesn't need to be complicated.", 'min_length': 150 }, { 'type': 'checkbox', 'label': 'By joining the VTC, you agree to follow both discord and VTC rules at all times? Do you agree to our terms?', 'must_input': true, 'choices': [] }], 'discord_role_change': ['+role-id', '-role-id'], 'allow_multiple_pending': false }, { 'id': 2, 'name': 'Staff', 'message': '<@&role-id>', 'channel_id': '', 'webhook_url': '', 'staff_role_ids': [20, 21], 'required_connections': ['steam'], 'required_member_state': -1, 'required_either_user_role_ids': [], 'required_all_user_role_ids': [], 'prohibited_either_user_role_ids': [], 'prohibited_all_user_role_ids': [], 'cooldown_hours': 2, 'form': [{ 'type': 'date', 'label': 'What is your birthdate?' }, { 'type': 'textarea', 'label': 'What country do you live in? Also include your Time Zone', 'placeholder': 'US, Canada, UK, etc', 'rows': '3', 'min_length': 10 }, { 'type': 'dropdown', 'label': 'Which position are your applying for?', 'choices': ['Events Team'], 'must_input': true }, { 'type': 'textarea', 'label': 'Please provide a summary about yourself.', 'placeholder': 'You may include hobbies, work positions, or any unique facts about yourself!', 'rows': '5', 'min_length': 150 }, { 'type': 'textarea', 'label': 'Why are you interested in joining the position you are applying for? What do you want to achieve?', 'placeholder': 'Explain why does that position interest you and what do you want to achieve.', 'rows': '5', 'min_length': 150 }, { 'type': 'textarea', 'label': 'Do you have a lot of time to dedicate to this position?', 'placeholder': 'Explain your time availability.', 'rows': '3', 'min_length': 150 }, { 'type': 'checkbox', 'label': 'By joining the VTC, you agree to follow both discord and VTC rules at all times? Do you agree to our terms?', 'must_input': true, 'choices': [] }], 'discord_role_change': ['+role-id', '-role-id'], 'allow_multiple_pending': false }, { 'id': 3, 'name': 'LOA', 'message': ' <@&role-id>', 'channel_id': '', 'webhook_url': '', 'staff_role_ids': [20, 21], 'required_connections': [], 'required_member_state': 1, 'required_either_user_role_ids': [], 'required_all_user_role_ids': [], 'prohibited_either_user_role_ids': [], 'prohibited_all_user_role_ids': [], 'cooldown_hours': 2, 'form': [{ 'type': 'date', 'label': 'Start Date' }, { 'type': 'date', 'label': 'End Date' }, { 'type': 'textarea', 'label': 'Reason for LOA', 'rows': '3', 'min_length': 150, 'placeholder': '' }, { 'type': 'checkbox', 'label': 'I will leave the staff position' }, { 'type': 'checkbox', 'label': 'I will leave the VTC' }], 'discord_role_change': ['+role-id', '-role-id'], 'allow_multiple_pending': false }, { 'id': 4, 'name': 'Division', 'message': ' <@&role-id>', 'channel_id': '', 'webhook_url': '', 'staff_role_ids': [70, 71], 'required_connections': [], 'required_member_state': 1, 'required_either_user_role_ids': [], 'required_all_user_role_ids': [], 'prohibited_either_user_role_ids': [], 'prohibited_all_user_role_ids': [], 'cooldown_hours': 336, 'form': [{ 'type': 'dropdown', 'label': 'Choose a division', 'choices': ['Agricultural', 'Chilled', 'Construction', 'Hazmat'], 'must_input': true }, { 'type': 'radio', 'label': 'Have you read the Construction Division Handbook?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Construction' } }, { 'type': 'text', 'label': 'Why do you want to join the Construction Division?', 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Construction' }, 'min_length': 0, 'placeholder': '' }, { 'type': 'radio', 'label': 'In the Construction Division, you are required to complete 5 deliveries of 125+ miles / 201+ km with construction loads per month. Do you agree to meet the monthly requirement?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Construction' } }, { 'type': 'radio', 'label': 'Have you read the Chilled Division Handbook?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Chilled' } }, { 'type': 'text', 'label': 'Why do you want to join the Chilled Division?', 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Chilled' } }, { 'type': 'radio', 'label': 'In the Chilled Division, you are required to meet a certain requirement to remain in the Division. Do you agree to meet the monthly requirement?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Chilled' } }, { 'type': 'radio', 'label': 'Have you read the Hazmat Division Handbook?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Hazmat' } }, { 'type': 'text', 'label': 'Why do you want to join the Hazmat Division?', 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Hazmat' } }, { 'type': 'radio', 'label': 'In the Hazmat Division, you are required to meet a certain requirement to remain in the Division. Do you agree to meet the monthly requirement?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Hazmat' } }, { 'type': 'radio', 'label': 'Have you read the Agricultural Division Handbook?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Agricultural' } }, { 'type': 'text', 'label': 'Why do you want to join the Agricultural Division?', 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Agricultural' } }, { 'type': 'radio', 'label': 'In the Agricultural Division, you are required to meet a certain requirement to remain in the Division. Do you agree to meet the monthly requirement?', 'choices': ['Yes', 'No'], 'must_input': true, 'x_must_be': { 'label': 'Choose a division', 'value': 'Agricultural' } }], 'discord_role_change': ['+role-id', '-role-id'], 'allow_multiple_pending': false }];