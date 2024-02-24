var dhlogo = null;
var dhbanner = null;
var dhvtcbg = null;
var dhcustombg = (localStorage.getItem("custom-background") !== null ? localStorage.getItem("custom-background") : "");
exports.dhlogo = dhlogo;
exports.dhbanner = dhbanner;
exports.dhvtcbg = dhvtcbg;
exports.dhcustombg = dhcustombg;

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