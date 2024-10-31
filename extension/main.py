# Drivers Hub: Frontend (Extension)
# Author: @CharlesWithC

import hashlib
import hmac
import json
import os
import sqlite3
import threading
import time
import urllib
import uuid
from typing import Optional

import freightmaster
import redis
import requests
import uvicorn
from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import RedirectResponse

app = FastAPI()
r = redis.Redis(decode_responses=True)

rolesCache = []
rolesLU = 0
patronsCache = []
patronsLU = 0
userConfigCache = []
userConfigLU = 0

feconfig = json.loads(open("./config.json", "r").read())
discord_bot_token = feconfig["discord_bot_token"]

patreon_tiers = {"9973097": "platinum", "9973090": "gold", "9360617": "silver", "9973080": "bronze"}
patreon_campaign_id = "8762284"

gconn = sqlite3.connect("truckersmp.db", check_same_thread=False)
gcur = gconn.cursor()

uconn = sqlite3.connect("user-settings.db", check_same_thread=False)
ucur = uconn.cursor()
# user-settings => set name color + profile upper/lower theme + profile banner url
# these data are synced into /roles endpoint
ucur.execute("CREATE TABLE IF NOT EXISTS users (uid BIGINT UNSIGNED, abbr VARCHAR(10), name_color INT, profile_upper_color INT, profile_lower_color INT, profile_banner_url TEXT, patreon_id BIGINT, patreon_name TEXT, patreon_email TEXT)")
# we might not really need to refresh their tokens since we use creator api to get list of patrons
ucur.execute("CREATE TABLE IF NOT EXISTS patreon_tokens (patreon_id BIGINT, patreon_access_token TEXT, patreon_refresh_token TEXT, patreon_token_expire_timestamp BIGINT)")
try:
    ucur.execute("CREATE INDEX users_uid ON users (uid)")
    ucur.execute("CREATE INDEX users_abbr ON users (abbr)")
    ucur.execute("CREATE INDEX patreon_tokens_id ON patreon_tokens (patreon_id)")
except:
    pass

def convertToHex(intColor):
    if intColor == -1:
        return None
    else:
        return "#" + str(hex(intColor))[2:].zfill(6)

@app.get("/")
async def index():
    return RedirectResponse(url="https://drivershub.charlws.com", status_code=302)

detailStats = {}
detailStatsLU = 0
@app.get("/detailStats")
async def getDetailStats(request: Request):
    global detailStats
    global detailStatsLU
    if time.time() - detailStatsLU >= 300:
        detailStatsLU = time.time()
        r = requests.get("https://drivershub.charlws.com/atm/dlog/statistics/details", headers={"User-Agent": request.headers.get("User-Agent"), "Client-Key": request.headers.get("Client-Key")})
        if r.status_code == 200:
            d = json.loads(r.text)
            detailStats = d
    return detailStats
    
def updateRolesCache():
    global rolesCache
    rolesCache = {"lead_developer": [], "project_manager": [], "community_manager": [], "development_team": [], "support_leader": [], "marketing_leader": [], "graphic_leader": [], "support_team": [], "marketing_team": [], "graphic_team": [], "community_legend": [], "network_partner": [], "translation_team": [], "platinum_access": [], "server_booster": []}
    ROLES = {"lead_developer": "1157885414854627438", "project_manager": "955724878043029505", "community_manager": "980036298754637844", "development_team": "1000051978845569164", "support_leader": "1047154886858510376", "marketing_leader": "1022498803447758968", "graphic_leader": "1177776474825183272", "support_team": "1003703044338356254", "marketing_team": "1003703201771561010", "graphic_team": "1051528701692616744", "community_legend": "992781163477344326", "network_partner": "1175115674994102363", "translation_team": "1041362203728683051", "platinum_access": "1301365321369784371", "server_booster": "988263021010898995"}
    ROLE_COLOR = {"lead_developer": "", "project_manager": "", "community_manager": "", "development_team": "", "support_leader": "", "marketing_leader": "", "graphic_leader": "", "support_team": "", "marketing_team": "", "graphic_team": "", "community_legend": "", "network_partner": "", "translation_team": "", "platinum_access": "", "server_booster": ""}
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

@app.get("/roles")
async def getRoles():
    global rolesLU
    if time.time() - rolesLU >= 300:
        rolesLU = time.time()
        updateRolesCache()
    return rolesCache

def updatePatronsCache():
    headers = {
        'Authorization': f'Bearer {feconfig["creator_access_token"]}',
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    if time.time() > feconfig["creator_token_expire"]:
        try:
            token_response = requests.post('https://www.patreon.com/api/oauth2/token', data={
                'refresh_token': feconfig["creator_refresh_token"],
                'grant_type': 'refresh_token',
                'client_id': feconfig["patreon_client_id"],
                'client_secret': feconfig["patreon_client_secret"],
            }, headers = {"Content-Type": "application/x-www-form-urlencoded"})
        
            token_json = token_response.json()
            if 'error' in token_json.keys():
                raise Exception(token_json['error'])
            feconfig["creator_access_token"] = token_json["access_token"]
            feconfig["creator_refresh_token"] = token_json["refresh_token"]
            feconfig["creator_token_expire"] = token_json["expires_in"] + int(time.time())
            open("./config.json", "w", encoding="utf-8").write(json.dumps(feconfig, indent=4, ensure_ascii=False))
            headers = {
                'Authorization': f'Bearer {feconfig["creator_access_token"]}',
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        except Exception as e:
            print(e)

    params = {
        'page[count]': 1000,
        'include': 'user,currently_entitled_tiers',
        'filter[free_or_paid]': 'paid_members',
        'fields[member]': 'full_name',
        'fields[user]': 'image_url',
        'sort': 'pledge_relationship_start'
    }

    patrons = {"platinum": [], "gold": [], "silver": [], "bronze": []}

    ucur.execute("SELECT abbr, uid, patreon_id FROM users")
    t = ucur.fetchall()
    connected_patrons = {}
    for tt in t:
        if tt[2] is not None:
            connected_patrons[tt[2]] = (tt[0], tt[1])

    # Initial URL
    url = f'https://www.patreon.com/api/oauth2/v2/campaigns/{patreon_campaign_id}/members'
    while url:
        resp = requests.get(url, headers=headers, params=params)
        d = json.loads(resp.text)
        avatars = {}
        for t in d["included"]:
            if t["type"] == "user":
                avatars[t["id"]] = t["attributes"]["image_url"]
        for t in d["data"]:
            if t["type"] == "member":
                tiers = t["relationships"]["currently_entitled_tiers"]["data"]
                if len(tiers) == 0:
                    continue
                patreon_id = t["relationships"]["user"]["data"]["id"]
                full_name = t["attributes"]["full_name"]
                avatar = avatars[patreon_id]
                (abbr, uid) = connected_patrons.get(int(patreon_id), (None, None))
                for tier in tiers:
                    if tier["id"] not in patreon_tiers.keys():
                        continue
                    patrons[patreon_tiers[tier["id"]]].append({"abbr": abbr, "uid": uid, "id": patreon_id, "name": full_name, "avatar": avatar})

        # Get the next page URL, if it exists
        if "links" in d.keys():
            if "next" in d["links"].keys():
                url = d["links"]["next"]
                params = {}
            else:
                url = None
        else:
            url = None

    global patronsCache
    patronsCache = patrons

@app.get("/patrons")
async def getPatrons():
    global patronsCache
    global patronsLU
    if time.time() - patronsLU >= 300:
        patronsLU = time.time()
        updatePatronsCache()
    return patronsCache

def updateTruckersMP():
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

async def validateTicket(domain: str, authorization: str, response: Response, perm = None):
    # Validate domain
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        return (400, {"error": "Invalid Domain Param"})

    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())
    abbr = config["abbr"]
    api_host = config["api_host"]

    # Authorization
    if authorization is None:
        return (401, {"error": "No Authorization Header"})
    if len(authorization.split(" ")) != 2:
        return (401, {"error": "Invalid Authorization Header"})

    tokentype = authorization.split(" ")[0]
    if tokentype.lower() != "ticket":
        return (401, {"error": "Invalid Authorization Header"})
    token = authorization.split(" ")[1]

    if not api_host.endswith("charlws.com"):
        return (400, {"error": "Invalid API Domain"})

    ok = False
    try:
        sig = hmac.new(str(int(time.time() / 60)).encode(), "CHub Frontend Extension".encode(), hashlib.sha256).digest()
        sig = ''.join(format(x, '02x') for x in sig)
        headers = {
            "Accept": "application/json",
            "Client-Key": sig,
            "User-Agent": "CHub Frontend Extension"
        }
        
        r = requests.get(f"{api_host}/{abbr}/auth/ticket?token="+token, timeout = 3, headers=headers)
        if r.status_code != 200:
            return (r.status_code, {"error": json.loads(r.text)["error"]})
        resp = json.loads(r.text)
        roles = resp["roles"]
        if roles is None:
            return (403, {"error": "You must set your profile to visible by external users to use this function."})
        
        if perm is not None:
            r = requests.get(f"{api_host}/{abbr}/member/perms", timeout = 3, headers=headers)
            if r.status_code != 200:
                return (r.status_code, {"error": json.loads(r.text)["error"]})
            resp = json.loads(r.text)
            perms = resp
            if isinstance(perm, str):
                if perm not in perms:
                    return (503, {"error": "Invalid Permission Configuration"})
                for role in perms[perm]:
                    if int(role) in roles:
                        ok = True
            elif isinstance(perm, list):
                for p in perm:
                    if p in perms.keys():
                        for role in perms[p]:
                            if int(role) in roles:
                                ok = True
                                break
                        if ok:
                            break

        else:
            ok = True
    except:
        import traceback
        traceback.print_exc()
        return (503, {"error": "API Unavailable"})

    if not ok:
        return (401, {"error": "Unauthorized"})

    return (200, config, resp)

@app.patch("/patreon")
async def updatePatreon(domain: str, code: str, request: Request, response: Response, authorization: str = Header(None)):
    validate = await validateTicket(domain, authorization, response)
    if validate[0] != 200:
        response.status_code = validate[0]
        return validate[1]
    (_, config, resp) = validate
    abbr = config["abbr"]
    uid = resp["uid"]

    try:
        token_response = requests.post('https://www.patreon.com/api/oauth2/token', data={
            'code': code,
            'grant_type': 'authorization_code',
            'client_id': feconfig["patreon_client_id"],
            'client_secret': feconfig["patreon_client_secret"],
            'redirect_uri': "https://oauth.chub.page/patreon-auth"
        }, headers = {"Content-Type": "application/x-www-form-urlencoded"})
    
        token_json = token_response.json()
        if 'error' in token_json.keys():
            response.status_code = 400
            return {"error": token_json['error']}

        user_response = requests.get('https://www.patreon.com/api/oauth2/v2/identity?fields[user]=full_name,email', headers={
            'Authorization': f'Bearer {token_json["access_token"]}'
        })
    except:
        response.status_code = 503
        return {"error": "Patreon API Unavailable"}

    user_json = user_response.json()
    patreon_id = user_json['data']['id']
    patreon_name = "Unknown"
    patreon_email = "/"
    if "full_name" in user_json['data']['attributes'].keys():
        patreon_name = user_json['data']['attributes']['full_name']
    if "email" in user_json['data']['attributes'].keys():
        patreon_email = user_json['data']['attributes']['email']

    ucur.execute("UPDATE users SET patreon_id = NULL WHERE patreon_id = ?", (patreon_id, ))
    ucur.execute(f"SELECT uid FROM users WHERE uid = {uid} AND abbr = '{abbr}'")
    t = ucur.fetchall()
    if len(t) == 0:
        ucur.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (uid, abbr, -1, -1, -1, "/", patreon_id, patreon_name, patreon_email, ))
    else:
        ucur.execute("UPDATE users SET patreon_id = ?, patreon_name = ?, patreon_email = ? WHERE uid = ? AND abbr = ?", (patreon_id, patreon_name, patreon_email, uid, abbr, ))
    ucur.execute("INSERT INTO patreon_tokens VALUES (?, ?, ?, ?)", (patreon_id, token_json["access_token"], token_json["refresh_token"], token_json["expires_in"] + int(time.time()), ))
    uconn.commit()

    global patronsCache
    for tier in ["platinum", "gold", "silver", "bronze"]:
        for i in range(len(patronsCache[tier])):
            if patronsCache[tier][i]["id"] == patreon_id:
                patronsCache[tier][i]["abbr"] = abbr
                patronsCache[tier][i]["uid"] = uid

    return {"patreon_id": patreon_id}

@app.delete("/patreon")
async def deletePatreon(domain: str, request: Request, response: Response, authorization: str = Header(None)):
    validate = await validateTicket(domain, authorization, response)
    if validate[0] != 200:
        response.status_code = validate[0]  
        return validate[1]
    (_, config, resp) = validate
    abbr = config["abbr"]
    uid = resp["uid"]

    ucur.execute(f"SELECT uid FROM users WHERE uid = {uid} AND abbr = '{abbr}'")
    t = ucur.fetchall()
    if len(t) != 0:
        ucur.execute("UPDATE users SET patreon_id = NULL, patreon_name = NULL, patreon_email = NULL WHERE uid = ? AND abbr = ?", (uid, abbr, ))
        uconn.commit()

    return Response(status_code=204)

def updateUserConfigCache():
    global userConfigCache
    
    ucur.execute("SELECT uid, abbr, name_color, profile_upper_color, profile_lower_color, profile_banner_url FROM users")
    t = ucur.fetchall()
    user_config = {}
    for tt in t:
        if tt[1] not in user_config.keys():
            user_config[tt[1]] = {tt[0]: {"name_color": convertToHex(tt[2]), "profile_upper_color": convertToHex(tt[3]), "profile_lower_color": convertToHex(tt[4]), "profile_banner_url": tt[5]}}
        else:
            user_config[tt[1]][tt[0]] = {"name_color": convertToHex(tt[2]), "profile_upper_color": convertToHex(tt[3]), "profile_lower_color": convertToHex(tt[4]), "profile_banner_url": tt[5]}
    
    userConfigCache = user_config

@app.get("/config/user")
async def getConfigUser(abbr: str):
    global userConfigLU
    if time.time() - userConfigLU >= 30:
        userConfigLU = time.time()
        updateUserConfigCache()
    if abbr in userConfigCache.keys():
        return userConfigCache[abbr]
    else:
        return []

@app.patch("/config/user")
async def patchUserConfig(domain: str, request: Request, response: Response, authorization: str = Header(None)):
    validate = await validateTicket(domain, authorization, response)
    if validate[0] != 200:
        response.status_code = validate[0]
        return validate[1]
    (_, config, resp) = validate
    abbr = config["abbr"]
    uid = resp["uid"]
    
    data = await request.json()
    try:
        name_color = int(data["name_color"])
        profile_upper_color = int(data["profile_upper_color"])
        profile_lower_color = int(data["profile_lower_color"])
        profile_banner_url = data["profile_banner_url"]
    except:
        response.status_code = 400
        return {"error": "Invalid JSON data"}
    
    ucur.execute(f"SELECT uid FROM users WHERE uid = {uid} AND abbr = '{abbr}'")
    t = ucur.fetchall()
    if len(t) != 0:
        ucur.execute("UPDATE users SET name_color = ?, profile_upper_color = ?, profile_lower_color = ?, profile_banner_url = ? WHERE uid = ? AND abbr = ?", (name_color, profile_upper_color, profile_lower_color, profile_banner_url, uid, abbr, ))
    else:
        ucur.execute("INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (uid, abbr, name_color, profile_upper_color, profile_lower_color, profile_banner_url, None, "", "" ))
    uconn.commit()

    return Response(status_code=204)

DEFAULT_MANIFEST = {
    "short_name": "Drivers Hub",
    "name": "Powered by The Drivers Hub Project (CHub)",
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#2fc1f7",
    "background_color": "#2e3035",
    "icons": [
        {
            "src": "./logo.png",
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

@app.get("/config")
async def getConfig(domain: str, request: Request, response: Response):
    if os.path.exists(f"/var/hub/config/suspended-{domain}.json"):
        response.status_code = 402
        return {"error": "Service Suspended"}
    
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 404
        return {"error": "Not Found"}
    
    config = json.loads(open(f"/var/hub/config/{domain}.json", "r").read())

    config_whitelist = ["abbr", "name", "color", "name_color", "theme_main_color", "theme_background_color", "theme_darken_ratio", "distance_unit", "use_highest_role_color", "domain", "api_host", "plugins", "truckersmp_vtc_id", "logo_key", "banner_key", "bgimage_key", "gallery"]
    config_keys = list(config.keys())
    for k in config_keys:
        if k not in config_whitelist:
            del config[k]
    sorted_keys = sorted(config.keys(), key=lambda x: config_whitelist.index(x))
    config = {key: config[key] for key in sorted_keys}
    try:
        config["name_color"] = convertToHex(config["name_color"])
        config["theme_main_color"] = convertToHex(config["theme_main_color"])
        config["theme_background_color"] = convertToHex(config["theme_background_color"])
    except:
        config["name_color"] = None
        config["theme_main_color"] = None
        config["theme_background_color"] = None
    if "theme_darken_ratio" not in config.keys():
        config["theme_darken_ratio"] = 0
    if "bgimage_key" not in config.keys():
        config["bgimage_key"] = ""
    if "use_highest_role_color" not in config.keys():
        config["use_highest_role_color"] = True
    if "truckersmp_vtc_id" not in config.keys():
        config["truckersmp_vtc_id"] = ""
    if "gallery" not in config.keys():
        config["gallery"] = []

    return {"config": config}

@app.patch("/config")
async def patchConfig(domain: str, request: Request, response: Response, authorization: str = Header(None)):
    validate = await validateTicket(domain, authorization, response, "administrator")
    if validate[0] != 200:
        response.status_code = validate[0]
        return validate[1]
    (_, config, resp) = validate
    abbr = config["abbr"]

    data = await request.json()
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
    }
    # Update assets
    logo_key = ""
    banner_key = ""
    bgimage_key = ""
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
        if "bgimage_url" in data["config"].keys() and data["config"]["bgimage_url"].replace(" ", "") != "":
            resp = requests.head(data["config"]["bgimage_url"], headers=headers)
            if resp.status_code == 200:
                fs = int(resp.headers['Content-Length'])
                if fs > 1024 * 2048:
                    response.status_code = 400
                    return {"error": "Banner must not be larger than 2MB"}
                resp = requests.get(data["config"]["bgimage_url"], headers=headers)
                if resp.status_code == 200:
                    with open(f"/var/hub/cdn/assets/{abbr}/bgimage.png", "wb") as f:
                        f.write(resp.content)
                    bgimage_key = str(uuid.uuid4())[:8]
                else:
                    response.status_code = 400
                    return {"error": "Error occurred when downloading background image"}
            else:
                response.status_code = 400
                return {"error": "Error occurred when downloading background image"}
    except:
        response.status_code = 400
        return {"error": "Error occurred when downloading background image"}
    
    try:
        newconfig = data["config"]
        config_whitelist = ["abbr", "name", "color", "name_color", "theme_main_color", "theme_background_color", "theme_darken_ratio", "distance_unit", "use_highest_role_color", "domain", "api_host", "plugins", "logo_key", "banner_key", "bgimage_key", "truckersmp_vtc_id", "gallery"]
        toremove = ["abbr", "domain", "api_host", "plugins"]
        for t in toremove:
            if t in newconfig.keys():
                newconfig[t] = config[t]

        try:
            newconfig["name_color"] = int(newconfig["name_color"])
            newconfig["theme_main_color"] = int(newconfig["theme_main_color"])
            newconfig["theme_background_color"] = int(newconfig["theme_background_color"])
            newconfig["theme_darken_ratio"] = float(newconfig["theme_darken_ratio"])
        except:
            response.status_code = 400
            return {"error": "Invalid JSON data"}
        
        try:
            newconfig["truckersmp_vtc_id"] = int(newconfig["truckersmp_vtc_id"])
        except:
            newconfig["truckersmp_vtc_id"] = ""
        
        newconfig_keys = list(newconfig.keys())
        for t in newconfig_keys:
            if t not in config_whitelist or t in toremove:
                del newconfig[t]
        
        config_keys = list(config.keys())
        for t in config_keys:
            if t not in newconfig.keys():
                newconfig[t] = config[t]
        
        if logo_key != "":
            newconfig["logo_key"] = logo_key
        if banner_key != "":
            newconfig["banner_key"] = banner_key
        if bgimage_key != "":
            newconfig["bgimage_key"] = bgimage_key
        
        config_keys = list(newconfig.keys())
        for k in config_keys:
            if k not in config_whitelist:
                del newconfig[k]
        sorted_keys = sorted(newconfig.keys(), key=lambda x: config_whitelist.index(x))
        newconfig = {key: newconfig[key] for key in sorted_keys}

        open(f"/var/hub/config/{domain}.json", "w", encoding="utf-8").write(json.dumps(newconfig, indent=4, ensure_ascii=False))
    except:
        response.status_code = 400
        return {"error": "Error occurred when saving config"}

    return Response(status_code=204)

@app.patch("/config/gallery")
async def patchConfigGallery(domain: str, request: Request, response: Response, authorization: str = Header(None)):
    validate = await validateTicket(domain, authorization, response, ["administrator", "manage_gallery"])
    if validate[0] != 200:
        response.status_code = validate[0]
        return validate[1]
    (_, config, resp) = validate

    data = await request.json()
    try:
        gallery = data["gallery"]
        if len(json.dumps(gallery, indent=4)) >= 100000:
            response.status_code = 400
            return {"error": "Too many URLs or URL too long"}
        config["gallery"] = gallery
        open(f"/var/hub/config/{domain}.json", "w", encoding="utf-8").write(json.dumps(config, indent=4, ensure_ascii=False))
    except:
        response.status_code = 400
        return {"error": "Error occurred when saving config"}

    return Response(status_code=204)

@app.get("/freightmaster/d")
def get_freightmaster_d(request: Request, page: int, page_size: int):
    config = r.hgetall("freightmaster:config")
    if len(config.keys()) == 0:
        config = json.loads(open("./freightmaster-config.json", "r").read())
        tconfig = json.loads(json.dumps(config))
        tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
        tconfig["rewards"] = json.dumps(config["rewards"])
        r.hset("freightmaster:config", mapping = tconfig)
        r.expire("freightmaster:config", 3600)
    else:
        config["start_time"] = int(config["start_time"])
        config["end_time"] = int(config["end_time"])
        config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
        config["rewards"] = json.loads(config["rewards"])
    data_folder = config["data_folder"]
    
    if r.get("freightmaster:ok:d") is None:
        if not os.path.exists(data_folder):
            return {"error": "Data folder does not exist"}
        if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/chub-fmd.json"):
            return {"error": "No data available"}
    r.set("freightmaster:ok:d", 1)
    
    if request.client.host != "127.0.0.1":
        if page_size > 1000:
            return {"error": "Page size too large"}
        if page_size < 10:
            return {"error": "Page size too small"}
    
    allvtcdomains = r.get("freightmaster:allvtcdomains")
    cfgs = os.listdir("/var/hub/config")
    if allvtcdomains != ",".join(cfgs):
        r.delete("freightmaster:allvtcs")

    allvtcs = r.hgetall("freightmaster:allvtcs")
    if len(allvtcs.keys()) == 0:
        for cfg in cfgs:
            try:
                cfg = json.loads(open(f"/var/hub/config/{cfg}", "r", encoding="utf-8").read())
                if "abbr" in cfg.keys():
                    allvtcs[cfg["abbr"]] = cfg["name"]
            except:
                pass
        r.hset("freightmaster:allvtcs", mapping = allvtcs)
        r.set("freightmaster:allvtcdomains", ",".join(cfgs))
        r.expire("freightmaster:allvtcs", 3600)
    
    cache = r.hgetall("freightmaster:fmd")
    if len(cache.keys()) == 0:
        fmd = json.loads(open(data_folder + "/latest/chub-fmd.json", "r", encoding="utf-8").read())
        last = -1
        rank = 0
        for i in range(len(fmd)):
            if last != fmd[i]["point"]:
                rank += 1
            fmd[i]["rank"] = rank
            last = fmd[i]["point"]
            if fmd[i]["abbr"] not in allvtcs:
                continue
            fmd[i]["vtc"] = allvtcs[fmd[i]["abbr"]]
            cache[i] = json.dumps(fmd[i])
        r.hset("freightmaster:fmd", mapping = cache)
        r.expire("freightmaster:fmd", 600)
    
    # handle deleted rows
    fmd = []
    cache = [v for k, v in sorted(cache.items(), key=lambda item: int(item[0]))]
    for v in cache:
        v = json.loads(v)
        v["user"]["uid"] = int(v["user"]["uid"])
        v["user"]["userid"] = int(v["user"]["userid"])
        v["point"] = int(v["point"])
        fmd.append(v)
    tot = len(fmd)
    
    fmd = fmd[(page - 1) * page_size : page * page_size]

    return {"list": fmd, "total_items": tot}

@app.get("/freightmaster/a")
def get_freightmaster_a(request: Request, abbr: str, page: int, page_size: int):
    config = r.hgetall("freightmaster:config")
    if len(config.keys()) == 0:
        config = json.loads(open("./freightmaster-config.json", "r").read())
        tconfig = json.loads(json.dumps(config))
        tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
        tconfig["rewards"] = json.dumps(config["rewards"])
        r.hset("freightmaster:config", mapping = tconfig)
        r.expire("freightmaster:config", 3600)
    else:
        config["start_time"] = int(config["start_time"])
        config["end_time"] = int(config["end_time"])
        config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
        config["rewards"] = json.loads(config["rewards"])
    data_folder = config["data_folder"]
    
    if r.get(f"freightmaster:ok:{abbr}") is None:
        if not os.path.exists(data_folder):
            return {"error": "Data folder does not exist"}
        if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/" + abbr + ".json"):
            return {"error": "No data available"}
    else:
        r.set(f"freightmaster:ok:{abbr}", 1)
    
    if request.client.host != "127.0.0.1":
        if page_size > 1000:
            return {"error": "Page size too large"}
        if page_size < 10:
            return {"error": "Page size too small"}

    cache = r.hgetall(f"freightmaster:fma:{abbr}")
    if len(cache.keys()) == 0:
        fma = json.loads(open(data_folder + "/latest/" + abbr + ".json", "r", encoding="utf-8").read())["fma"]
        last = -1
        rank = 0
        tot = len(fma)
        for i in range(len(fma)):
            if last != fma[i]["point"]:
                rank += 1
            fma[i]["rank"] = rank
            last = fma[i]["point"]
            cache[i] = json.dumps(fma[i])
        r.hset(f"freightmaster:fma:{abbr}", mapping = cache)
        r.expire(f"freightmaster:fma:{abbr}", 600)
    else:
        fma = []
        cache = [v for k, v in sorted(cache.items(), key=lambda item: int(item[0]))]
        for v in cache:
            v = json.loads(v)
            v["user"]["uid"] = int(v["user"]["uid"])
            v["user"]["userid"] = int(v["user"]["userid"])
            v["point"] = int(v["point"])
            fma.append(v)
        tot = len(fma)

    fma = fma[(page - 1) * page_size : page * page_size]

    return {"list": fma, "total_items": tot}

@app.get("/freightmaster/position")
def get_frieghtmaster_position(abbr: str, uid: int):
    config = r.hgetall("freightmaster:config")
    if len(config.keys()) == 0:
        config = json.loads(open("./freightmaster-config.json", "r").read())
        tconfig = json.loads(json.dumps(config))
        tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
        tconfig["rewards"] = json.dumps(config["rewards"])
        r.hset("freightmaster:config", mapping = tconfig)
        r.expire("freightmaster:config", 3600)
    else:
        config["start_time"] = int(config["start_time"])
        config["end_time"] = int(config["end_time"])
        config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
        config["rewards"] = json.loads(config["rewards"])
    season_name = config["season_name"]
    start_time = config["start_time"]
    end_time = config["end_time"]
    data_folder = config["data_folder"]
    
    if r.get("freightmaster:ok:d") is None and r.get(f"freightmaster:ok:{abbr}") is None:
        if not os.path.exists(data_folder):
            return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "Data folder does not exist"}
        if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/chub-fmd.json"):
            return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "No data available"}
        if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/" + abbr + ".json"):
            return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "No data available"}
    else:
        r.set("freightmaster:ok:d", 1)
        r.set(f"freightmaster:ok:{abbr}", 1)

    rankd = None
    pointd = None
    try:
        fmd = json.loads(requests.get("http://127.0.0.1:8299/freightmaster/d?page=1&page_size=100000").text)["list"]
        for i in range(0, len(fmd)):
            if fmd[i]["user"]["uid"] == uid and fmd[i]["abbr"] == abbr:
                rankd = i + 1
                pointd = fmd[i]["point"]
                break
    except:
        pass

    ranka = None
    pointa = None
    try:
        fma = json.loads(requests.get(f"http://127.0.0.1:8299/freightmaster/a?abbr={abbr}&page=1&page_size=100000").text)["list"]
        for i in range(0, len(fma)):
            if fma[i]["user"]["uid"] == uid:
                ranka = i + 1
                pointa = fma[i]["point"]
                break
    except:
        pass

    return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "rankd": rankd, "pointd": pointd, "ranka": ranka, "pointa": pointa}

@app.get("/freightmaster/rewards")
def get_freightmaster_rewards():
    config = r.hgetall("freightmaster:config")
    if len(config.keys()) == 0:
        config = json.loads(open("./freightmaster-config.json", "r").read())
        tconfig = json.loads(json.dumps(config))
        tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
        tconfig["rewards"] = json.dumps(config["rewards"])
        r.hset("freightmaster:config", mapping = tconfig)
        r.expire("freightmaster:config", 3600)
    else:
        config["start_time"] = int(config["start_time"])
        config["end_time"] = int(config["end_time"])
        config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
        config["rewards"] = json.loads(config["rewards"])
        
    return config["rewards"]

@app.get("/freightmaster/rewards/distributed")
def get_freightmaster_distributed_rewards(abbr: str, uid: Optional[int] = None):
    config = r.hgetall("freightmaster:config")
    if len(config.keys()) == 0:
        config = json.loads(open("./freightmaster-config.json", "r").read())
        tconfig = json.loads(json.dumps(config))
        tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
        tconfig["rewards"] = json.dumps(config["rewards"])
        r.hset("freightmaster:config", mapping = tconfig)
        r.expire("freightmaster:config", 3600)
    else:
        config["start_time"] = int(config["start_time"])
        config["end_time"] = int(config["end_time"])
        config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
        config["rewards"] = json.loads(config["rewards"])
    data_folder = config["data_folder"]

    history_rewards = []
    if os.path.exists(data_folder + "/latest/chub-fmd-rewards-history.json"):
        history_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards-history.json", "r", encoding="utf-8").read())

    current_rewards = []
    if os.path.exists(data_folder + "/latest/chub-fmd-rewards.json"):
        current_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards.json", "r", encoding="utf-8").read())

    all_rewards = current_rewards + history_rewards

    ret = []
    for reward in all_rewards:
        if reward["abbr"] == abbr and (uid is None or uid == reward["uid"]):
            ret.append(reward)
    
    ret = sorted(ret, key=lambda x: -int(x["reward"].split("-")[0][3:]))

    return ret

if __name__ == "__main__":
    threading.Thread(target=updateTruckersMP, daemon=True).start()
    threading.Thread(target=freightmaster.control, daemon=True).start()
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299, access_log = False)