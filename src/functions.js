
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
            const allPerms = Object.keys(vars.perms);
            for(let i = 0 ; i < userRoles.length ; i++){
                for(let j = 0 ; j < allPerms.length ; j++){
                    if(vars.perms[allPerms[j]].includes(userRoles[i])){
                        vars.userPerm.push(allPerms[j]);
                        break;
                    }
                }
            }
            vars.userBanner = {name: vars.userInfo.name, role: roleOnDisplay, avatar: vars.userInfo.avatar};
        } else {
            localStorage.removeItem("token");
        }
    }
}