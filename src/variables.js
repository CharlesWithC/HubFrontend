var apiversion = "";
var dhconfig = null;
var apiconfig = null;
var dhpath = "";
var dhlogo = "";
var dhbgimage = "";
var dhvtcbg = "";
var dhcustombg = (localStorage.getItem("custom-background") !== null ? localStorage.getItem("custom-background") : "");
exports.apiversion = apiversion;
exports.dhconfig = dhconfig;
exports.apiconfig = apiconfig;
exports.dhpath = dhpath;
exports.dhlogo = dhlogo;
exports.dhbgimage = dhbgimage;
exports.dhvtcbg = dhvtcbg;
exports.dhcustombg = dhcustombg;

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

var userSettings = { "theme": "auto", "use_custom_theme": false, "theme_background": null, "theme_main": null, "theme_darken_ratio": null, "notification_refresh_interval": 30, "unit": "metric", "radio": "disabled", "radio_type": "tsr", "radio_volume": 100, "display_timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, "data_saver": false, "font_size": "regular", "default_row_per_page": 10 };
// radio: enabled / disabled / auto-play (enabled)
// radio-type: tsr / {url}
exports.userSettings = userSettings;

var userBanner = { name: "Login", role: "", avatar: "https://charlws.com/me.gif" };
exports.userBanner = userBanner;

// CHub
var specialRoles = {};
exports.specialRoles = specialRoles;
var specialRolesMap = {};
exports.specialRolesMap = specialRolesMap;
var patrons = {};
exports.patrons = patrons;
var userPatreonID = null;
exports.userPatreonID = null;
var userConfig = {};
exports.userConfig = userConfig;
var defaultUserLevel = 0; // this affects all users;
exports.defaultUserLevel = defaultUserLevel;
var vtcLevel = 0; // 0: regular / 1: premium / 3: special
exports.vtcLevel = vtcLevel;
var userLevel = -1;
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