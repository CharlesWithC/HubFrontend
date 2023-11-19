# Drivers Hub: Frontend (Extension)
# Author: @CharlesWithC

import json
import math
import os
import sqlite3
import threading
import time
import uuid
import urllib

import requests
import uvicorn
from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import RedirectResponse

app = FastAPI()

reservedColor = [3129847, 14398740, 14977209, 16023551, 11721600, 15161175, 11609971, 14846019, 15512708, 16023551, 4826287, 16143002, 1159551, 10118082, 16023551, 16023551, 16023551, 16568598, 5958113]
rolesCache = []
rolesLU = 0
userConfigCache = []
userConfigLU = 0

discord_bot_token = os.getenv("BOT_TOKEN")

gconn = sqlite3.connect("truckersmp.db", check_same_thread=False)
gcur = gconn.cursor()

uconn = sqlite3.connect("user-settings.db", check_same_thread=False)
ucur = uconn.cursor()
# user-settings => set name color + profile upper/lower theme + profile banner url
# these data are synced into /roles endpoint
ucur.execute("CREATE TABLE IF NOT EXISTS users (discordid BIGINT UNSIGNED, abbr VARCHAR(10), name_color INT, profile_upper_color INT, profile_lower_color INT, profile_banner_url TEXT)")
try:
    ucur.execute("CREATE INDEX users_discordid ON users (discordid)")
    ucur.execute("CREATE INDEX users_abbr ON users (abbr)")
except:
    pass

def color_similarity(hex1, hex2):
    # Convert hex codes to RGB values
    r1, g1, b1 = tuple(int(hex1[i:i+2], 16) for i in (0, 2, 4))
    r2, g2, b2 = tuple(int(hex2[i:i+2], 16) for i in (0, 2, 4))

    # Calculate Euclidean distance between RGB values
    distance = math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)

    # Normalize distance to a value between 0 and 1
    max_distance = math.sqrt((255 ** 2) * 3)
    similarity = 1 - (distance / max_distance)

    return similarity

def truckersmp_online_data():
    conn = sqlite3.connect("truckersmp.db", check_same_thread=False)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS players (mpid INT PRIMARY KEY, name VARCHAR(64), last_online BIGINT UNSIGNED)")

    recent_online = {}
    cur.execute(f"SELECT mpid, last_online FROM players WHERE last_online >= {int(time.time()) - 3600}")
    t = cur.fetchall()
    for tt in t:
        recent_online[tt[0]] = tt[1]

    while 1:
        r = requests.get("https://tracker.ets2map.com/v3/fullmap")
        if r.status_code == 200:
            updates = []
            # 0: new player
            # 1: update player (long time no see)
            # 2: update player who is recently online
            # name will only be updated if the player is not seen for at least 1 hour

            recent_onlines = list(recent_online.keys())

            d = json.loads(r.text)
            for player in d["Data"]:
                mpid = player["MpId"]
                name = player["Name"]
                timestamp = player["Time"]
                if mpid not in recent_onlines:
                    cur.execute(f"SELECT mpid FROM players WHERE mpid = {mpid}")
                    t = cur.fetchall()
                    if len(t) == 0:
                        updates.append((0, mpid, name, timestamp))
                    else:
                        updates.append((1, mpid, name, timestamp))
                    recent_online[mpid] = timestamp
                else:
                    updates.append((2, mpid, name, timestamp))
                    recent_online[mpid] = timestamp
            
            conn.isolation_level = None
            for (op, mpid, name, timestamp) in updates:
                try:
                    if op == 0:
                        cur.execute("INSERT INTO players VALUES (?, ?, ?)", (mpid, name, timestamp, ))
                    elif op == 1:
                        cur.execute("UPDATE players SET name = ?, last_online = ? WHERE mpid = ?", (name, timestamp, mpid, ))
                    elif op == 2:
                        cur.execute("UPDATE players SET last_online = ? WHERE mpid = ?", (timestamp, mpid, ))
                except:
                    pass
            conn.commit()
            conn.isolation_level = 'DEFERRED'

            threshold = int(time.time()) - 3600
            recent_online = {mpid: last_online for (mpid, last_online) in recent_online.items() if last_online >= threshold}
            
        time.sleep(60)

@app.get("/")
async def index():
    return RedirectResponse(url="https://drivershub.charlws.com", status_code=302)

def convertToHex(intColor):
    if intColor == -1:
        return None
    else:
        return "#" + str(hex(intColor))[2:]
    
def updateRolesCache():
    global rolesCache
    rolesCache = {"lead_developer": [], "project_manager": [], "community_manager": [], "development_team": [], "support_manager": [], "marketing_manager": [], "support_team": [], "marketing_team": [], "graphic_team": [], "translation_team": [], "community_legend": [], "network_partner": [], "platinum_sponsor": [], "gold_sponsor": [], "silver_sponsor": [], "bronze_sponsor": [], "server_booster": [], "web_client_beta": []}
    ROLES = {"lead_developer": "1157885414854627438", "project_manager": "955724878043029505", "community_manager": "980036298754637844", "development_team": "1000051978845569164", "support_manager": "1047154886858510376", "marketing_manager": "1022498803447758968", "support_team": "1003703044338356254", "marketing_team": "1003703201771561010", "graphic_team": "1051528701692616744", "translation_team": "1041362203728683051", "community_legend": "992781163477344326", "network_partner": "1175115674994102363", "platinum_sponsor": "1128329358218633268", "gold_sponsor": "1128329030106615969", "silver_sponsor": "1031947700419186779", "bronze_sponsor": "1128328748110975006", "server_booster": "988263021010898995", "web_client_beta": "1127416037076389960"}
    ROLE_COLOR = {"lead_developer": "", "project_manager": "", "community_manager": "", "development_team": "", "support_manager": "", "marketing_manager": "", "support_team": "", "marketing_team": "", "graphic_team": "", "translation_team": "", "community_legend": "", "network_partner": "", "platinum_sponsor": "", "gold_sponsor": "", "silver_sponsor": "", "bronze_sponsor": "", "server_booster": "", "web_client_beta": ""}
    r = requests.get("https://discord.com/api/v10/guilds/955721720440975381/roles", headers={"Authorization": f"Bot {discord_bot_token}"})
    newReservedColor = []
    if r.status_code == 200:
        d = json.loads(r.text)
        for dd in d:
            for role in ROLES.keys():
                if dd["id"] == ROLES[role]:
                    ROLE_COLOR[role] = dd["color"]
                    newReservedColor.append(dd["color"])
                    break
    global reservedColor
    reservedColor = newReservedColor

    after = 0
    while True:
        r = requests.get(f"https://discord.com/api/v10/guilds/955721720440975381/members?limit=1000&after={after}", headers={"Authorization": f"Bot {discord_bot_token}"})
        if r.status_code == 200:
            d = json.loads(r.text)
            after = d[-1]["user"]["id"]

            for dd in d:
                username = dd["user"]["username"]
                if dd["nick"] is not None:
                    username = dd["nick"]
                elif dd["user"]["global_name"] is not None:
                    username = dd["user"]["global_name"]
                
                for role in ROLES.keys():
                    if ROLES[role] in dd["roles"]:
                        rolesCache[role].append({"id": dd["user"]["id"], "name": username, "avatar": dd["user"]["avatar"], "color": convertToHex(ROLE_COLOR[role])})

            if len(d) < 1000:
                break
        else:
            break
        time.sleep(0.1)

def updateUserConfigCache():
    global userConfigCache
    
    ucur.execute("SELECT discordid, abbr, name_color, profile_upper_color, profile_lower_color, profile_banner_url FROM users")
    t = ucur.fetchall()
    user_config = {}
    for tt in t:
        if tt[0] not in user_config.keys():
            user_config[tt[0]] = [{"abbr": tt[1], "name_color": convertToHex(tt[2]), "profile_upper_color": convertToHex(tt[3]), "profile_lower_color": convertToHex(tt[4]), "profile_banner_url": tt[5]}]
        else:
            user_config[tt[0]].append({"abbr": tt[1], "name_color": convertToHex(tt[2]), "profile_upper_color": convertToHex(tt[3]), "profile_lower_color": convertToHex(tt[4]), "profile_banner_url": tt[5]})
    
    userConfigCache = user_config

@app.get("/roles")
async def getRoles():
    global rolesLU
    if time.time() - rolesLU >= 60:
        rolesLU = time.time()
        updateRolesCache()
    return rolesCache

@app.get("/config/user")
async def getConfigUser():
    global userConfigLU
    if time.time() - userConfigLU >= 5:
        userConfigLU = time.time()
        updateUserConfigCache()
    return userConfigCache

@app.get("/truckersmp")
async def getTruckersMP(mpid: int, response: Response):
    for _ in range(5):
        try:
            gcur.execute(f"SELECT name, last_online FROM players WHERE mpid = {mpid}")
            t = gcur.fetchall()
            if len(t) == 0:
                response.status_code = 404
                return {"error": "Player has not been online since tracking started."}
            else:
                return {"mpid": mpid, "name": t[0][0], "last_online": t[0][1]}
        except:
            time.sleep(0.01)
    return {"error": "Service Unavailable"}
    
@app.patch("/config/user")
async def patchUserConfig(domain:str, request: Request, response: Response, authorization: str = Header(None)):
    # Validate domain
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": "Not Found"}
    
    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())
    abbr = config["abbr"]
    api_host = config["api_host"]

    # Authorization
    if authorization is None:
        response.status_code = 401
        return {"error": "No Authorization Header"}
    if len(authorization.split(" ")) != 2:
        response.status_code = 401
        return {"error": "Invalid Authorization Header"}

    tokentype = authorization.split(" ")[0]
    if tokentype.lower() != "ticket":
        response.status_code = 401
        return {"error": "Invalid Authorization Header"}
    token = authorization.split(" ")[1]

    if not api_host.endswith("charlws.com"):
        response.status_code = 400
        return {"error": "Invalid API Domain"}

    ok = False
    try:
        r = requests.get(f"{api_host}/{abbr}/auth/ticket?token="+token, timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        ok = True
    except:
        response.status_code = 503
        return {"error": "API Unavailable"}

    if not ok:
        response.status_code = 401
        return {"error": "Unauthorized"}
    discordid = resp["discordid"]

    data = await request.json()
    try:
        name_color = int(data["name_color"])
        profile_upper_color = int(data["profile_upper_color"])
        profile_lower_color = int(data["profile_lower_color"])
        profile_banner_url = data["profile_banner_url"]
    except:
        response.status_code = 400
        return {"error": "Invalid JSON data"}
    
    if name_color != -1:
        for color in reservedColor:
            if color_similarity(str(hex(color))[2:], str(hex(name_color))[2:]) >= 0.8:
                response.status_code = 400
                return {"error": "Name color is reserved, please use another one!"}

    ucur.execute(f"SELECT discordid FROM users WHERE discordid = {discordid} AND abbr = '{abbr}'")
    t = ucur.fetchall()
    if len(t) != 0:
        ucur.execute("UPDATE users SET name_color = ?, profile_upper_color = ?, profile_lower_color = ?, profile_banner_url = ? WHERE discordid = ? AND abbr = ?", (name_color, profile_upper_color, profile_lower_color, profile_banner_url, discordid, abbr, ))
    else:
        ucur.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?)", (discordid, abbr, name_color, profile_upper_color, profile_lower_color, profile_banner_url, ))
    uconn.commit()

    return Response(status_code=204)

@app.get("/config")
async def getConfig(domain: str, request: Request, response: Response):
    if os.path.exists(f"/var/hub/config/suspended-{domain}.json"):
        response.status_code = 402
        return {"error": "Service Suspended"}
    
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 404
        return {"error": "Not Found"}
    
    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())

    config_whitelist = ["abbr", "name", "color", "distance_unit", "domain", "api_host", "plugins", "logo_key", "banner_key"]
    config_keys = list(config.keys())
    for k in config_keys:
        if k not in config_whitelist:
            del config[k]
    sorted_keys = sorted(config.keys(), key=lambda x: config_whitelist.index(x))
    config = {key: config[key] for key in sorted_keys}
    
    return {"config": config}

DEFAULT_MANIFEST = {
    "short_name": "Drivers Hub",
    "name": "Powered by The Drivers Hub Project (CHub)",
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#2fc1f7",
    "background_color": "#2e3035",
    "icons": [
        {
            "src": "https://cdn.chub.page/assets/logo.png",
            "sizes": "500x500",
            "type": "image/png"
        }
    ]
}
@app.get("/manifest")
async def getManifest(request: Request, response: Response):
    referer = request.headers.get('Referer')
    if referer is None:
        return DEFAULT_MANIFEST
    else:
        domain = urllib.parse.urlparse(referer).netloc
    
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        return DEFAULT_MANIFEST
    
    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())

    return {
        "short_name": "Drivers Hub",
        "name": config["name"],
        "start_url": ".",
        "display": "standalone",
        "theme_color": config["color"],
        "background_color": config["color"],
        "icons": [
            {
                "src": f"https://cdn.chub.page/assets/{config['abbr']}/logo.png?{config['logo_key']}",
                "type": "image/png"
            }
        ]
    }

@app.patch("/config")
async def patchConfig(domain: str, request: Request, response: Response, authorization: str = Header(None)):
    # Validate domain
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": "Not Found"}
    
    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())
    abbr = config["abbr"]
    api_host = config["api_host"]

    # Authorization
    if authorization is None:
        response.status_code = 401
        return {"error": "No Authorization Header"}
    if len(authorization.split(" ")) != 2:
        response.status_code = 401
        return {"error": "Invalid Authorization Header"}

    tokentype = authorization.split(" ")[0]
    if tokentype.lower() != "ticket":
        response.status_code = 401
        return {"error": "Invalid Authorization Header"}
    token = authorization.split(" ")[1]

    if not api_host.endswith("charlws.com"):
        response.status_code = 400
        return {"error": "Invalid API Domain"}

    ok = False
    try:
        r = requests.get(f"{api_host}/{abbr}/auth/ticket?token="+token, timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        roles = resp["roles"]

        r = requests.get(f"{api_host}/{abbr}/member/perms", timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        perms = resp
        if "administrator" not in perms:
            response.status_code = 503
            return {"error": "Invalid Permission Configuration"}

        for role in perms["administrator"]:
            if int(role) in roles:
                ok = True
    except:
        response.status_code = 503
        return {"error": "API Unavailable"}

    if not ok:
        response.status_code = 401
        return {"error": "Unauthorized"}

    data = await request.json()
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
    }
    # Update assets
    logo_key = ""
    banner_key = ""
    try:
        if "logo_url" in data["config"].keys() and data["config"]["logo_url"].replace(" ", "") != "":
            resp = requests.head(data["config"]["logo_url"], headers=headers)
            if resp.status_code == 200:
                fs = int(resp.headers['Content-Length'])
                if fs > 1024 * 2048:
                    response.status_code = 400
                    return {"error": "Logo must not be larger than 2MB"}
                resp = requests.get(data["config"]["logo_url"], headers=headers)
                if resp.status_code == 200:
                    with open(f"/var/hub/cdn/assets/{abbr}/logo.png", "wb") as f:
                        f.write(resp.content)
                    logo_key = str(uuid.uuid4())[:8]
                else:
                    response.status_code = 400
                    return {"error": "Error occurred when downloading logo"}
            else:
                response.status_code = 400
                return {"error": "Error occurred when downloading logo"}
    except:
        response.status_code = 400
        return {"error": "Error occurred when downloading logo"}
    try:
        if "banner_url" in data["config"].keys() and data["config"]["banner_url"].replace(" ", "") != "":
            resp = requests.head(data["config"]["banner_url"], headers=headers)
            if resp.status_code == 200:
                fs = int(resp.headers['Content-Length'])
                if fs > 1024 * 2048:
                    response.status_code = 400
                    return {"error": "Banner must not be larger than 2MB"}
                resp = requests.get(data["config"]["banner_url"], headers=headers)
                if resp.status_code == 200:
                    with open(f"/var/hub/cdn/assets/{abbr}/banner.png", "wb") as f:
                        f.write(resp.content)
                    banner_key = str(uuid.uuid4())[:8]
                else:
                    response.status_code = 400
                    return {"error": "Error occurred when downloading banner"}
            else:
                response.status_code = 400
                return {"error": "Error occurred when downloading banner"}
    except:
        response.status_code = 400
        return {"error": "Error occurred when downloading banner"}
    
    try:
        newconfig = data["config"]
        toremove = ["abbr", "domain", "api_host", "plugins"]
        for t in toremove:
            if t in newconfig.keys():
                newconfig[t] = config[t]
        
        newconfig_keys = list(newconfig.keys())
        for t in newconfig_keys:
            if t not in config.keys():
                del newconfig[t]
        
        config_keys = list(config.keys())
        for t in config_keys:
            if t not in newconfig.keys():
                newconfig[t] = config[t]
        
        if logo_key != "":
            newconfig["logo_key"] = logo_key
        if banner_key != "":
            newconfig["banner_key"] = banner_key
        
        config_whitelist = ["abbr", "name", "color", "distance_unit", "domain", "api_host", "plugins", "logo_key", "banner_key"]
        config_keys = list(newconfig.keys())
        for k in config_keys:
            if k not in config_whitelist:
                del newconfig[k]
        sorted_keys = sorted(newconfig.keys(), key=lambda x: config_whitelist.index(x))
        newconfig = {key: newconfig[key] for key in sorted_keys}

        open(f"/var/hub/config/{domain}.json", "w").write(json.dumps(newconfig, indent=4))
    except:
        response.status_code = 400
        return {"error": "Error occurred when saving config"}

    return Response(status_code=204)

if __name__ == "__main__":
    threading.Thread(target=truckersmp_online_data, daemon=True).start()
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299, access_log = False)