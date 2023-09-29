# Drivers Hub: Frontend (Extension)
# Author: @CharlesWithC

import json
import os
import time
import uuid

import requests
import uvicorn
from fastapi import FastAPI, Header, Request, Response
from fastapi.responses import RedirectResponse

app = FastAPI()

rolesCache = []
rolesLU = 0

discord_bot_token = os.getenv("BOT_TOKEN")

@app.get("/")
async def index():
    return RedirectResponse(url="https://drivershub.charlws.com", status_code=302)

# #2fc1f7 #e488b9 #e75757 #f6529a #ecb484

def updateRolesCache():
    global rolesCache
    rolesCache = {"project_team": [], "community_manager": [], "development_team": [], "support_manager": [], "marketing_manager": [], "support_team": [], "marketing_team": [], "graphic_team": [], "translation_team": [], "community_legend": [], "patron": [], "server_booster": [], "fv3ea": []}
    ROLES = {"project_team": "955724878043029505", "community_manager": "980036298754637844", "development_team": "1000051978845569164", "support_manager": "1047154886858510376", "marketing_manager": "1022498803447758968", "support_team": "1003703044338356254", "marketing_team": "1003703201771561010", "graphic_team": "1051528701692616744", "translation_team": "1041362203728683051", "community_legend": "992781163477344326", "patron": "1031947700419186779", "server_booster": "988263021010898995", "fv3ea": "1127416037076389960"}
    after = 0
    while True:
        r = requests.get(f"https://discord.com/api/v10/guilds/955721720440975381/members?limit=1000&after={after}", headers={"Authorization": f"Bot {discord_bot_token}"})
        if r.status_code == 200:
            d = json.loads(r.text)
            after = d[-1]["user"]["id"]
            for dd in d:
                for role in ROLES.keys():
                    if ROLES[role] in dd["roles"]:
                        rolesCache[role].append(dd["user"]["id"])
            if len(d) < 1000:
                break
        else:
            break
        time.sleep(0.1)

@app.get("/roles")
async def getRoles():
    global rolesLU
    if time.time() - rolesLU >= 60:
        rolesLU = time.time()
        updateRolesCache()
    return rolesCache
    
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
        if not "admin" in perms:
            response.status_code = 503
            return {"error": "Invalid Permission Configuration"}

        for role in perms["admin"]:
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
            if not t in config.keys():
                del newconfig[t]
        
        config_keys = list(config.keys())
        for t in config_keys:
            if not t in newconfig.keys():
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
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299, access_log = False)