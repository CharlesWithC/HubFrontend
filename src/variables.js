var apiversion = "";
var dhconfig = null;
var apiconfig = null;
var dhpath = "";
var dhlogo = "";
exports.apiversion = apiversion;
exports.dhconfig = dhconfig;
exports.apiconfig = apiconfig;
exports.dhpath = dhpath;
exports.dhlogo = dhlogo;

var isLoggedIn = false;
exports.isLoggedIn = isLoggedIn;

var userInfo = {};
exports.userInfo = userInfo;
var userPerm = [];
exports.userPerm = userPerm;
var userDivisionIDs = [];
exports.userDivisionIDs = userDivisionIDs;
var userStats = {};
exports.userStats = userStats;

var economyConfig = {};
exports.economyConfig = economyConfig;
var economyGarages = [];
exports.economyGarages = economyGarages;
var economyTrucks = [];
exports.economyTrucks = economyTrucks;

var dlogDetails = {};
exports.dlogDetails = dlogDetails;

var userSettings = { "theme": "auto", "notificationRefresh": 30, "unit": "metric", "radio": "enabled", "radio_type": "tsr" };
// radio: enabled / disabled / auto-play (enabled)
// radio-type: tsr / {url}
if (localStorage.getItem("client-settings") !== null) {
    try {
        let lsSettings = JSON.parse(localStorage.getItem("client-settings"));
        let sKeys = Object.keys(userSettings);
        for (let i = 0; i < sKeys.length; i++) {
            if (Object.keys(lsSettings).includes(sKeys[i])) {
                userSettings[sKeys[i]] = lsSettings[sKeys[i]];
            }
        }
        localStorage.setItem("client-settings", JSON.stringify(userSettings));
    } catch (error) {
        console.error("Unable to parse client settings in local storage:");
        console.error(error);
    }
}
exports.userSettings = userSettings;

var userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
exports.userBanner = userBanner;

// CHub
var specialRoles = {};
exports.specialRoles = specialRoles;

// DriversHub
var discordClientID = null;
exports.discordClientID = discordClientID;

var roles = {};
var perms = {};
var ranks = {};
exports.roles = roles;
exports.perms = perms;
exports.ranks = ranks;

var announcementTypes = [];
exports.announcementTypes = announcementTypes;

var applicationPositions = [];
var applicationTypes = {};
exports.applicationPositions = applicationPositions;
exports.applicationTypes = applicationTypes;

var divisions = {};
exports.divisions = divisions;

var members = [];
exports.members = members;
var membersTabCache = undefined;
exports.membersTabCache = membersTabCache;
var users = {}; // uid:user | this will not be fully-loaded, we'll write in when there's new user loaded
exports.users = users;