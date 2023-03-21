# Drivers Hub: Frontend (Extend)
# Author: @CharlesWithC

import json
import os
import time
import urllib
import uuid

import requests
import uvicorn
from bs4 import BeautifulSoup
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
    rolesCache = {"project_team": [], "community_manager": [], "development_team": [], "support_manager": [], "marketing_manager": [], "patron": [], "server_booster": []}
    ROLES = {"project_team": "955724878043029505", "community_manager": "980036298754637844", "development_team": "1000051978845569164", "support_manager": "1047154886858510376", "marketing_manager": "1022498803447758968", "patron": "1031947700419186779", "server_booster": "988263021010898995"}
    while True:
        r = requests.get(f"https://discord.com/api/v10/guilds/955721720440975381/members?limit=1000", headers={"Authorization": f"Bot {discord_bot_token}"})
        if r.status_code == 200:
            d = json.loads(r.text)
            for dd in d:
                for role in ROLES.keys():
                    if ROLES[role] in dd["roles"]:
                        rolesCache[role].append(dd["user"]["id"])
                        break
            if len(d) <= 1000:
                break

@app.get("/roles")
async def getRoles():
    global rolesLU
    if time.time() - rolesLU >= 300:
        rolesLU = time.time()
        updateRolesCache()
    return rolesCache
    
@app.get("/{abbr}/config")
async def getConfig(abbr: str, domain: str, request: Request, response: Response):
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": "Invalid domain"}
        
    config = json.loads(open(f"/var/hub/config/{domain}.json","r").read())
    if config["abbr"] != abbr:
        response.status_code = 400
        return {"error": "Invalid domain"}

    application = ""
    if os.path.exists("/var/hub/cdn/assets/" + abbr + "/application.html"):
        application = open("/var/hub/cdn/assets/" + abbr + "/application.html", "r").read()

    style = ""
    if os.path.exists("/var/hub/cdn/assets/" + abbr + "/style.css"):
        style = open("/var/hub/cdn/assets/" + abbr + "/style.css", "r").read()

    return {"config": config, "application": application, "style": style}

@app.patch("/{abbr}/config")
async def patchConfig(abbr: str, domain: str, api_host: str, request: Request, \
        response: Response, authorization: str = Header(None)):
    # Validate domain
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": "Invalid domain"}

    config = json.loads(open(f"/var/hub/config/{domain}.json","r").read())
    if config["abbr"] != abbr:
        response.status_code = 400
        return {"error": "Invalid domain"}

    # Authorization
    if authorization is None:
        response.status_code = 401
        return {"error": "No authorization header"}
    if len(authorization.split(" ")) != 2:
        response.status_code = 401
        return {"error": "Invalid authorization header"}

    tokentype = authorization.split(" ")[0]
    if tokentype != "Ticket":
        response.status_code = 401
        return {"error": "Only Ticket authorization method is allowed!"}
    token = authorization.split(" ")[1]

    if not api_host.endswith("charlws.com"):
        return {"error": "Invalid API Domain"}

    ok = False
    try:
        r = requests.get(f"{api_host}/{abbr}/auth/ticket?token="+token, timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        roles = resp["user"]["roles"]

        r = requests.get(f"{api_host}/{abbr}/member/perms", timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        perms = resp
        if not "admin" in perms:
            response.status_code = 503
            return {"error": "Invalid API permission configuration"}

        for role in perms["admin"]:
            if int(role) in roles:
                ok = True
    except:
        response.status_code = 503
        return {"error": "API Unavailable"}

    if not ok:
        response.status_code = 401
        return {"error": "Unauthorized"}

    form = await request.json()
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
    }
    # Update assets
    logo_key = ""
    banner_key = ""
    try:
        logo_url = form["logo_url"]
        if logo_url != "":
            f = urllib.request.urlopen(urllib.request.Request(logo_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": "Maximum size of logo is 1 MB"}
            os.system(f"wget --quiet -O /var/hub/cdn/assets/{abbr}/logo.png {logo_url}")
            logo_key = str(uuid.uuid4())[:8]
    except:
        pass
    try:
        banner_url = form["banner_url"]
        if banner_url != "":
            f = urllib.request.urlopen(urllib.request.Request(banner_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": "Maximum size of banner is 1 MB"}
            os.system(f"wget --quiet -O /var/hub/cdn/assets/{abbr}/banner.png {banner_url}")
            banner_key = str(uuid.uuid4())[:8]
    except:
        pass
    
    try:
        newconfig = json.loads(form["config"])
        toremove = ["abbr", "domain", "api_path", "plugins"]
        for t in toremove:
            if t in newconfig.keys():
                newconfig[t] = config[t]
        
        newconfig_keys = newconfig.keys()
        for t in newconfig_keys:
            if not t in config.keys():
                del newconfig[t]
        
        config_keys = config.keys()
        for t in config_keys:
            if not t in newconfig.keys():
                newconfig[t] = config[t]
        
        if logo_key != "":
            newconfig["logo_key"] = logo_key
        if banner_key != "":
            newconfig["banner_key"] = banner_key

        open(f"/var/hub/config/{domain}.json", "w").write(json.dumps(newconfig))
    except:
        pass

    try:
        custom_application = form["application"]
        soup = BeautifulSoup(custom_application, "html.parser")
        while soup.script:
            soup.script.replaceWith('')
        while soup.style:
            soup.style.replaceWith('')
        open(f"/var/hub/cdn/assets/{abbr}/application.html","w").write(str(soup))
    except:
        pass

    try:
        style = form["style"]
        soup = BeautifulSoup(style, "html.parser")
        while soup.script:
            soup.script.replaceWith('')
        while soup.style:
            soup.style.replaceWith('')
        open(f"/var/hub/cdn/assets/{abbr}/style.css","w").write(str(soup))
    except:
        pass

    return {"error": False}

if __name__ == "__main__":
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299, access_log = False, workers = 3)