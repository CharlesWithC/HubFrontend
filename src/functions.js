import axios from 'axios';
import axiosRetry from 'axios-retry';

var vars = require('./variables');

const customAxios = axios.create();
axiosRetry(customAxios, {
    retries: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    },
    retryCondition: (error) => {
        return error.response === undefined || error.response.status in [429, 503];
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

export function setAuthToken(token) {
    // localStorage.setItem("token", atob(token.replaceAll("-", "z"), 'utf8'));
    localStorage.setItem("token", token);
}

export function getAuthToken() {
    // return btoa(localStorage.getItem("token"), "utf8").replaceAll("z", "-");
    return localStorage.getItem("token");
};

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

export async function FetchProfile() {
    const bearerToken = getAuthToken();
    if (bearerToken !== null) {
        const resp = await customAxios({ url: `${vars.dhpath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
        if (resp.status === 200) {
            vars.isLoggedIn = true;
            vars.userInfo = resp.data;

            let roles = Object.values(vars.roles);
            roles.sort((a, b) => a.order_id - b.order_id);
            let roleOnDisplay = "";
            for (let i = 0; i < roles.length; i++) {
                if (vars.userInfo.roles.includes(roles[i].id)) {
                    roleOnDisplay = roles[i].name;
                    break;
                }
            }
            const allPerms = Object.keys(vars.perms);
            for (let i = 0; i < vars.userInfo.roles.length; i++) {
                for (let j = 0; j < allPerms.length; j++) {
                    if (vars.perms[allPerms[j]].includes(vars.userInfo.roles[i]) && !vars.userPerm.includes(allPerms[j])) {
                        vars.userPerm.push(allPerms[j]);
                    }
                }
            }
            vars.userBanner = { name: vars.userInfo.name, role: roleOnDisplay, avatar: vars.userInfo.avatar };

            let tiers = ["platinum", "gold", "silver", "bronze"];
            for (let i = 0; i < tiers.length; i++) {
                if (vars.userLevel !== -1) break;
                for (let j = 0; j < vars.patrons[tiers[i]].length; j++) {
                    let patron = vars.patrons[tiers[i]][j];
                    if (patron.abbr === vars.dhconfig.abbr && patron.uid === vars.userInfo.uid) {
                        vars.userPatreonID = patron.id;
                        vars.userLevel = 4 - i;
                        break;
                    }
                }
            }
            if (vars.userLevel === -1) vars.userLevel = 0;
            vars.userLevel = vars.defaultUserLevel; // TODO: Remove after open beta

            if (vars.userInfo.discordid !== null && vars.userInfo.discordid !== undefined && Object.keys(vars.specialRolesMap).includes(vars.userInfo.discordid) && vars.specialRolesMap[vars.userInfo.discordid] !== undefined) {
                for (let i = 0; i < vars.specialRolesMap[vars.userInfo.discordid].length; i++) {
                    if (['lead_developer', 'project_manager', 'community_manager', 'development_team', 'support_leader', 'marketing_leader', 'graphic_leader', 'support_team', 'marketing_team', 'graphic_team'].includes(vars.specialRolesMap[vars.userInfo.discordid][i].role)) {
                        // Team member get Platinum Perks
                        vars.userLevel = 4;
                        break;
                    }
                }
            }

            if (vars.userInfo.userid !== -1) {
                const divisionIDs = Object.keys(vars.divisions);
                vars.userDivisionIDs = [];
                for (let i = 0; i < divisionIDs.length; i++) {
                    if (vars.userInfo.roles.includes(vars.divisions[divisionIDs[i]].role_id)) {
                        vars.userDivisionIDs.push(divisionIDs[i]);
                    }
                }

                // just patch, don't wait
                customAxios({ url: `${vars.dhpath}/user/timezone`, method: "PATCH", data: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }, headers: { "Authorization": `Bearer ${bearerToken}` } });

                let [resp] = await makeRequestsWithAuth([`${vars.dhpath}/dlog/statistics/summary?userid=${vars.userInfo.userid}`]);
                vars.userStats = resp;

                // is member / fetch all members
                [resp] = await makeRequestsWithAuth([`${vars.dhpath}/member/list?page=1&page_size=250`]);
                let totalPages = resp.total_pages;
                vars.members = resp.list;
                if (totalPages > 1) {
                    let urlsBatch = [];
                    for (let i = 2; i <= totalPages; i++) {
                        urlsBatch.push(`${vars.dhpath}/member/list?page=${i}&page_size=250`);
                        if (urlsBatch.length === 5 || i === totalPages) {
                            let resps = await makeRequestsWithAuth(urlsBatch);
                            for (let j = 0; j < resps.length; j++) {
                                vars.members.push(...resps[j].list);
                                for (let k = 0; k < resps[j].list.length; k++) {
                                    vars.users[resps[j].list[k].uid] = resps[j].list[k];
                                }
                            }
                            urlsBatch = [];
                        }
                    }
                }
            }
        } else if (resp.status === 401) {
            localStorage.removeItem("token");
            vars.userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
        }
    } else {
        vars.isLoggedIn = false;
        vars.userInfo = {};
        vars.userPerm = [];
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

export const loadImageAsBase64 = async (imageUrl) => {
    try {
        let response = await customAxios.get(imageUrl, {
            responseType: 'blob' // Set the response type to blob
        });

        if (response.status === 404) {
            response = await customAxios.get("https://cdn.chub.page/assets/logo.png", {
                responseType: 'blob' // Set the response type to blob
            });
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

export function checkUserRole(roles) {
    // any matches in perms will return true
    for (let i = 0; i < roles.length; i++) {
        if (vars.userInfo.roles.includes(roles[i])) {
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

export function checkUserPerm(perms) {
    // any matches in perms will return true
    for (let i = 0; i < perms.length; i++) {
        if (vars.userPerm.includes(perms[i])) {
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