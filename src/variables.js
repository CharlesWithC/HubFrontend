var host = "";
exports.host = host;

var apiversion = "";
var dhconfig = null;
var apiconfig = null;
var dhpath = "";
var dhlogo = null;
var dhbanner = null;
var dhbgimage = null;
var dhvtcbg = null;
var dhcustombg = (localStorage.getItem("custom-background") !== null ? localStorage.getItem("custom-background") : "");
exports.apiversion = apiversion;
exports.dhconfig = dhconfig;
exports.apiconfig = apiconfig;
exports.dhpath = dhpath;
exports.dhlogo = dhlogo;
exports.dhbanner = dhbanner;
exports.dhbgimage = dhbgimage;
exports.dhvtcbg = dhvtcbg;
exports.dhcustombg = dhcustombg;

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

var allUsers = [];
exports.allUsers = allUsers;