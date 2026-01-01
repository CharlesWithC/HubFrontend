# Drivers Hub: Frontend (Extension)
# Author: @CharlesWithC

import asyncio
import base64
import hashlib
import hmac
import json
import os
import sqlite3
import threading
import time
import uuid
from urllib.parse import urlparse

import redis
import uvicorn
from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import RedirectResponse
from functions import arequests

app = FastAPI()
r = redis.Redis(decode_responses=True)

rolesCache = []
rolesLU = 0
sponsorsCache = []
sponsorsLU = 0
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
# we might not really need to refresh their tokens since we use creator api to get list of sponsors
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
    
async def updateRolesCache():
    global rolesCache
    rolesCache = {"lead_developer": [], "project_manager": [], "community_manager": [], "development_team": [], "support_leader": [], "marketing_leader": [], "graphic_leader": [], "support_team": [], "marketing_team": [], "graphic_team": [], "community_legend": [], "network_partner": [], "translation_team": [], "platinum_access": [], "server_booster": []}
    ROLES = {"lead_developer": "1157885414854627438", "project_manager": "955724878043029505", "community_manager": "980036298754637844", "development_team": "1000051978845569164", "support_leader": "1047154886858510376", "marketing_leader": "1022498803447758968", "graphic_leader": "1177776474825183272", "support_team": "1003703044338356254", "marketing_team": "1003703201771561010", "graphic_team": "1051528701692616744", "community_legend": "992781163477344326", "network_partner": "1175115674994102363", "translation_team": "1041362203728683051", "platinum_access": "1301365321369784371", "server_booster": "988263021010898995"}
    ROLE_COLOR = {"lead_developer": "", "project_manager": "", "community_manager": "", "development_team": "", "support_leader": "", "marketing_leader": "", "graphic_leader": "", "support_team": "", "marketing_team": "", "graphic_team": "", "community_legend": "", "network_partner": "", "translation_team": "", "platinum_access": "", "server_booster": ""}
    r = await arequests.get("https://discord.com/api/v10/guilds/955721720440975381/roles", headers={"Authorization": f"Bot {discord_bot_token}"})
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
        r = await arequests.get(f"https://discord.com/api/v10/guilds/955721720440975381/members?limit=1000&after={after}", headers={"Authorization": f"Bot {discord_bot_token}"})
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
        await updateRolesCache()
    return rolesCache

@app.get("/proxy")
async def getTruckersMPProxy(request: Request, url: str):
    domain = urlparse(url).netloc
    if domain not in ["api.truckersmp.com", "drivershub.charlws.com", "api.chub.page"]:
        return Response(status_code=403)
    headers = { "User-Agent": "The Drivers Hub Project (CHub)" }
    r = await arequests.get(url, headers=headers)
    response_headers = {key: value for key, value in r.headers.items() if key.lower() != "content-encoding"}
    return Response(content=r.content, status_code=r.status_code, headers=response_headers)

def getAvatarSrc(discordid, avatar):
    if avatar is None:
        return f"https://cdn.discordapp.com/embed/avatars/{discordid % 5}.png"
    if avatar.startswith("a_"):
        return f"https://cdn.discordapp.com/avatars/{discordid}/{avatar}.gif"
    return f"https://cdn.discordapp.com/avatars/{discordid}/{avatar}.png"

async def updateSponsorsCache():
    headers = {
        'Authorization': f'Bearer {feconfig["creator_access_token"]}',
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    if time.time() > feconfig["creator_token_expire"]:
        try:
            token_response = await arequests.post('https://www.patreon.com/api/oauth2/token', data={
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

    sponsors = {"platinum": [], "gold": [], "silver": [], "bronze": []}
    
    # In-house URL (place them before Patreon)
    url = "https://drivershub.charlws.com/api/membership/list"
    resp = await arequests.get(url, headers={"User-Agent": "CHub Frontend Extension"})
    if resp.status_code == 200:
        d = json.loads(resp.text)["list"]
        for t in d:
            if t["tier"] not in sponsors.keys():
                continue
            t["abbr"] = None
            t["uid"] = None
            if t["hub_key"] is not None:
                try:
                    decoded_key = json.loads(base64.b64decode(t["hub_key"].encode()))
                    t["abbr"] = decoded_key["abbr"]
                    t["uid"] = decoded_key["uid"]
                except:
                    pass
            del t["hub_key"]
            sponsors[t["tier"]].append({"abbr": t["abbr"], "uid": t["uid"], "name": t["name"], "avatar": getAvatarSrc(t["discordid"], t["avatar"])})

    ucur.execute("SELECT abbr, uid, patreon_id FROM users")
    t = ucur.fetchall()
    connected_sponsors = {}
    for tt in t:
        if tt[2] is not None:
            connected_sponsors[tt[2]] = (tt[0], tt[1])

    # Patreon URL
    url = f'https://www.patreon.com/api/oauth2/v2/campaigns/{patreon_campaign_id}/members'
    while url:
        resp = await arequests.get(url, headers=headers, params=params)
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
                (abbr, uid) = connected_sponsors.get(int(patreon_id), (None, None))
                for tier in tiers:
                    if tier["id"] not in patreon_tiers.keys():
                        continue
                    sponsors[patreon_tiers[tier["id"]]].append({"abbr": abbr, "uid": uid, "patreon_id": patreon_id, "name": full_name, "avatar": avatar})

        # Get the next page URL, if it exists
        if "links" in d.keys():
            if "next" in d["links"].keys():
                url = d["links"]["next"]
                params = {}
            else:
                url = None
        else:
            url = None

    global sponsorsCache
    sponsorsCache = sponsors

@app.get("/sponsors")
async def getSponsors():
    global sponsorsCache
    global sponsorsLU
    if time.time() - sponsorsLU >= 300:
        sponsorsLU = time.time()
        await updateSponsorsCache()
    return sponsorsCache

async def updateTruckersMP():
    conn = sqlite3.connect("truckersmp.db", check_same_thread=False)
    cur = conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS players (mpid INT PRIMARY KEY, name VARCHAR(64), last_online BIGINT UNSIGNED)")

    recent_online = {}
    cur.execute(f"SELECT mpid, last_online FROM players WHERE last_online >= {int(time.time()) - 3600}")
    t = cur.fetchall()
    for tt in t:
        recent_online[tt[0]] = tt[1]

    while 1:
        r = await arequests.get("https://tracker.ets2map.com/v3/fullmap")
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
    if "drivershub05" in api_host or "drivershub10" in api_host:
        api_host = "https://api.chub.page"

    # Authorization
    if authorization is None:
        return (401, {"error": "No Authorization Header"})
    if len(authorization.split(" ")) != 2:
        return (401, {"error": "Invalid Authorization Header"})

    tokentype = authorization.split(" ")[0]
    if tokentype.lower() != "ticket":
        return (401, {"error": "Invalid Authorization Header"})
    token = authorization.split(" ")[1]

    if not api_host.endswith(".charlws.com") and not api_host.endswith(".chub.page"):
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
        
        r = await arequests.get(f"{api_host}/{abbr}/auth/ticket?token="+token, timeout = 3, headers=headers)
        if r.status_code != 200:
            return (r.status_code, {"error": json.loads(r.text)["error"]})
        resp = json.loads(r.text)
        roles = resp["roles"]
        if roles is None:
            return (403, {"error": "You must set your profile to visible by external users to use this function."})
        
        if perm is not None:
            r = await arequests.get(f"{api_host}/{abbr}/member/perms", timeout = 3, headers=headers)
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
        token_response = await arequests.post('https://www.patreon.com/api/oauth2/token', data={
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

        user_response = await arequests.get('https://www.patreon.com/api/oauth2/v2/identity?fields[user]=full_name,email', headers={
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

    global sponsorsCache
    for tier in ["platinum", "gold", "silver", "bronze"]:
        for i in range(len(sponsorsCache[tier])):
            if "patreon_id" in sponsorsCache[tier][i] and sponsorsCache[tier][i]["patreon_id"] == patreon_id:
                sponsorsCache[tier][i]["abbr"] = abbr
                sponsorsCache[tier][i]["uid"] = uid

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

def async_threading():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(updateTruckersMP())
    loop.close()

if __name__ == "__main__":
    threading.Thread(target=async_threading, daemon=True).start()
    # threading.Thread(target=freightmaster.control, daemon=True).start()
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299, access_log = False)