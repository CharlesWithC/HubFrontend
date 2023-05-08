
import axios from 'axios';
var vars = require('./variables');

export async function FetchProfile() {
    const bearerToken = localStorage.getItem("token");
    if (bearerToken !== null) {
        const resp = await axios({ url: `${vars.dhpath}/user/profile`, headers: { "Authorization": `Bearer ${bearerToken}` } });
        if(resp.status === 200){
            vars.isLoggedIn = true;
            vars.userInfo = resp.data;
            const userRoles = vars.userInfo.roles.sort();
            var roleOnDisplay = "";
            for(let i = 0 ; i < userRoles.length ; i++){
                if(Object.keys(vars.roles).includes(String(userRoles[i]))){
                    roleOnDisplay = vars.roles[userRoles[i]].name;
                    break;
                }
            }
            vars.userBanner = {name: vars.userInfo.name, role: roleOnDisplay, avatar: vars.userInfo.avatar};
        } else {
            localStorage.removeItem("token");
        }
    }
}