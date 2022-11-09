# Drivers Hub: Frontend (Extend)
# Author: @CharlesWithC

from fastapi import FastAPI, Request, Response, Header
from fastapi.responses import RedirectResponse
import uvicorn
import requests, json, os, urllib
from bs4 import BeautifulSoup

app = FastAPI()

frontend_version = "v2"

@app.get("/")
async def index():
    return RedirectResponse(url="https://drivershub.charlws.com", status_code=302)

@app.get("/{abbr}/config")
async def getConfig(abbr: str, domain: str, request: Request, response: Response):
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": True, "descriptor": "Invalid domain"}
        
    config = json.loads(open(f"/var/hub/config/{domain}.json","r").read())
    if config["abbr"] != abbr:
        response.status_code = 400
        return {"error": True, "descriptor": "Invalid domain"}

    application = ""
    if os.path.exists("/var/hub/cdn/assets/" + abbr + "/application.html"):
        application = open("/var/hub/cdn/assets/" + abbr + "/application.html", "r").read()
    else:
        application = open(f"/var/hub/{frontend_version}/default_application.html", "r").read()

    style = ""
    if os.path.exists("/var/hub/cdn/assets/" + abbr + "/style.css"):
        style = open("/var/hub/cdn/assets/" + abbr + "/style.css", "r").read()

    return {"error": False, "response": {"basic": config, "application": application, "style': style}}

@app.patch("/{abbr}/config")
async def patchConfig(abbr: str, domain: str, request: Request, \
        response: Response, authorization: str = Header(None)):
    # Validate domain
    if not os.path.exists(f"/var/hub/config/{domain}.json"):
        response.status_code = 400
        return {"error": True, "descriptor": "Invalid domain"}

    config = json.loads(open(f"/var/hub/config/{domain}.json","r").read())
    if config["abbr"] != abbr:
        response.status_code = 400
        return {"error": True, "descriptor": "Invalid domain"}

    # Authorization
    if authorization is None:
        response.status_code = 401
        return {"error": True, "descriptor": "No authorization header"}
    if len(authorization.split(" ")) != 2:
        response.status_code = 401
        return {"error": True, "descriptor": "Invalid authorization header"}

    token = authorization.split(" ")[1]

    form = await request.form()
    try:
        apidomain = form["apidomain"]
    except:
        response.status_code = 400
        return {"error": True, "descriptor": "Form field missing or cannot be parsed."}

    if not apidomain.endswith("charlws.com"):
        return {"error": True, "descriptor": "Invalid API Domain"}

    ok = False
    try:
        r = requests.get(f"https://{apidomain}/{abbr}/auth/tip?token="+token, timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": True, "descriptor": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        roles = resp["response"]["user"]["roles"]

        r = requests.get(f"https://{apidomain}/{abbr}/member/perms", timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": True, "descriptor": json.loads(r.text)["descriptor"]}
        resp = json.loads(r.text)
        perms = resp["response"]
        if not "admin" in perms:
            response.status_code = 503
            return {"error": True, "descriptor": "Invalid API permission configuration"}

        for role in perms["admin"]:
            if str(role) in roles:
                ok = True
    except:
        response.status_code = 503
        return {"error": True, "descriptor": "API Unavailable"}

    if not ok:
        response.status_code = 401
        return {"error": True, "descriptor": "Unauthorized"}

    # Update assets
    try:
        logo_url = form["logo_url"]
        banner_url = form["banner_url"]
    except:
        return {"error": True, "descriptor": "Form field missing or cannot be parsed."}
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
    }
    if logo_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(logo_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": True, "descriptor": "Maximum size of logo is 1 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{abbr}/logo.png {logo_url}")
        except:
            pass
    if banner_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(banner_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": True, "descriptor": "Maximum size of banner is 1 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{abbr}/banner.png {banner_url}")
        except:
            pass
    
    try:
        newconfig = form["config"]
    except:
        return {"error": True, "descriptor": "Form field missing or cannot be parsed."}
    
    toremove = ["abbr", "domain", "api_path", "plugins"]
    for t in toremove:
        if t in newconfig.keys():
            del newconfig[t]
    
    newconfig_keys = newconfig.keys()
    for t in newconfig_keys:
        if not t in config.keys():
            del newconfig[t]

    open(f"/var/hub/config/{domain}.json", "w").write(json.dumps(newconfig))

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
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299)