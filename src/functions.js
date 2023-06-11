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
customAxios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const errorResponse = error.response;

        if (errorResponse && (errorResponse.status === 429 || errorResponse.status === 503)) {
            const errorMessage = `Error ${errorResponse.status}: ${errorResponse.statusText}`;
            throw new Error(errorMessage);
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
                return customAxios({
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
        const resp = await customAxios({ url: `${vars.dhpath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
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
            if (vars.userInfo.userid !== -1) {
                // is member / fetch all members
                let [resp] = await makeRequests([`${vars.dhpath}/member/list?page=1&page_size=250`]);
                let totalPages = resp.total_pages;
                vars.members = resp.list;
                if (totalPages > 1) {
                    let urlsBatch = [];
                    for (let i = 2; i <= totalPages; i++) {
                        urlsBatch.push(`${vars.dhpath}/member/list?page=${i}&page_size=250`);
                    }
                    let resps = await makeRequests(urlsBatch);
                    for (let i = 0; i < resps.length; i++) {
                        vars.members.push(...resps[i].list);
                    }
                }
            }
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
        const response = await customAxios.get(imageUrl, {
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
    if (date === undefined || date === null) return "";
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