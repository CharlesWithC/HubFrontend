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

var economyConfig = null;
exports.economyConfig = economyConfig;
var economyGarages = [];
exports.economyGarages = economyGarages;
var economyTrucks = [];
exports.economyTrucks = economyTrucks;
var economyMerch = [];
exports.economyMerch = economyMerch;
var economyGaragesMap = {};
exports.economyGaragesMap = economyGaragesMap;
var economyMerchMap = {};
exports.economyMerchMap = economyMerchMap;

var dlogDetails = {};
exports.dlogDetails = dlogDetails;

var userSettings = { "theme": "auto", "use_custom_theme": false, "theme_background": "#ffffff", "theme_main": "#ffffff", "theme_darken_ratio": null, "notificationRefresh": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular" };
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
} else {
    localStorage.setItem("client-settings", JSON.stringify(userSettings));
}
exports.userSettings = userSettings;

var userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
exports.userBanner = userBanner;

// CHub
var specialRoles = {};
exports.specialRoles = specialRoles;
var specialRolesMap = {};
exports.specialRolesMap = specialRolesMap;
var supportersTabCache = undefined;
exports.supportersTabCache = supportersTabCache;
var userConfig = {};
exports.userConfig = userConfig;
var userLevel = 0;
exports.userLevel = userLevel;

// DriversHub
var discordClientID = null;
exports.discordClientID = discordClientID;

var languages = [];
var roles = {};
var orderedRoles = [];
var perms = {};
var ranks = {};
exports.languages = languages;
exports.roles = roles;
exports.orderedRoles = orderedRoles;
exports.perms = perms;
exports.ranks = ranks;

var announcementTypes = null;
exports.announcementTypes = announcementTypes;

var applicationTypes = {};
exports.applicationTypes = applicationTypes;

var divisions = {};
exports.divisions = divisions;

var members = [];
exports.members = members;
var users = {}; // uid:user | this will not be fully-loaded, we'll write in when there's new user loaded
exports.users = users;
var allUsers = [];
exports.allUsers = allUsers;