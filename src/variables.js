var dhconfig = null;
var dhapplication = "";
var dhstyle = "";
var dhpath = "";
exports.dhconfig = dhconfig;
exports.dhapplication = dhapplication;
exports.dhstyle = dhstyle;
exports.dhpath = dhpath;

var isLoggedIn = false;
exports.isLoggedIn = isLoggedIn;

var userInfo = {};
exports.userInfo = userInfo;
var userPerm = [];
exports.userPerm = userPerm;

var userSettings = { "theme": null, "notificationRefresh": 30 };
if (localStorage.getItem("client-settings") !== null) {
    try {
        let lsSettings = JSON.parse(localStorage.getItem("client-settings"));
        let sKeys = Object.keys(userSettings);
        for (let i = 0; i < sKeys.length; i++) {
            userSettings[sKeys[i]] = lsSettings[sKeys[i]];
        }
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

var applicationPositions = [];
var applicationTypes = {};
exports.applicationPositions = applicationPositions;
exports.applicationTypes = applicationTypes;

var divisions = {};
exports.divisions = divisions;