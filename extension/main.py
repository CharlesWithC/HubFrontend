# Drivers Hub: Frontend (Extend)
# Author: @CharlesWithC

from fastapi import FastAPI, Request, Response, Header
from fastapi.responses import RedirectResponse
import uvicorn
import requests, json, os, urllib

app = FastAPI()

@app.get("/")
async def index():
    return RedirectResponse(url="https://drivershub.charlws.com", status_code=302)

@app.get("/{vtc_abbr}/config")
async def getConfig(vtc_abbr: str, domain: str, request: Request, response: Response):
    if not os.path.exists(f"/var/hub/html/configs/{domain}.php"):
        response.status_code = 401
        return {"error": True, "descriptor": "Invalid domain"}
    convert = {"vtcprefix": "vtc_abbr", "vtccolor": "vtc_color", "vtcname": "vtc_name", "vtcabbr": "vtc_abbr"}
    toremove = ["vtccolordark", "domain", "domainpure", "api", "apidomain", "status", "enabled_plugins"]

    config = {}

    o = open(f"/var/hub/html/configs/{domain}.php","r").read().split("\n")
    for oo in o:
        oo = oo.split(" = ")
        if len(oo) < 2:
            continue
        item = oo[0].replace("$","").replace(" ","")
        if item in toremove:
            continue
        if item in convert.keys():
            item = convert[item]
        value = oo[1]
        value = value[value.find('"') + 1 : value.rfind('"')]
        config[item] = value

    o = open(f"/var/hub/html/configs/{domain}.js","r").read().replace("\n",",").split(",")
    for oo in o:
        oo = oo.split("=")
        if len(oo) < 2:
            continue
        item = oo[0].replace("$","").replace(" ","")
        if item in toremove:
            continue
        if item in convert.keys():
            item = convert[item]
        value = oo[1]
        if item == "navio_company_id":
            value = int(value.replace(' ', "").replace(";",""))
        else:
            value = value[value.find('"') + 1 : value.rfind('"')]
        config[item] = value

    return {"error": False, "response": {"config": config}}

@app.patch("/{vtc_abbr}/config")
async def patchConfig(vtc_abbr: str, request: Request, response: Response, authorization: str = Header(None)):
    # Authorization
    if authorization is None:
        response.status_code = 401
        return {"error": True, "descriptor": "No authorization header"}
    if not authorization.startswith("Application"):
        response.status_code = 401
        return {"error": True, "descriptor": "Only application token is allowed"}

    token = authorization.split(" ")[1]

    form = await request.form()
    domain = form["domain"]
    apidomain = form["apidomain"]

    if not apidomain.endswith("charlws.com"):
        return {"error": True, "descriptor": "Invalid API Domain"}

    r = None
    try:
        r = requests.get(f"https://{apidomain}/{vtc_abbr}/user", timeout = 3, headers = {"Authorization": authorization})
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": True, "descriptor": json.loads(r.text)["descriptor"]}
    except:
        response.status_code = 503
        return {"error": True, "descriptor": "API Unavailable"}
    
    d = json.loads(r.text)["response"]
    roles = d["roles"]

    r = None
    try:
        r = requests.get(f"https://{apidomain}/{vtc_abbr}/member/perms", timeout = 3)
        if r.status_code != 200:
            response.status_code = r.status_code
            return {"error": True, "descriptor": json.loads(r.text)["descriptor"]}
    except:
        response.status_code = 503
        return {"error": True, "descriptor": "API Unavailable"}
    perms = json.loads(r.text)["response"]
    adminroles = perms["admin"]

    ok = False
    for role in roles:
        for adminrole in adminroles:
            if str(role) == str(adminrole):
                ok = True

    if not ok:
        response.status_code = 401
        return {"error": True, "descriptor": "Unauthorized"}

    # Update assets
    logo_url = form["logo_url"]
    banner_url = form["banner_url"]
    bg_url = form["bg_url"]
    teamupdate_url = form["teamupdate_url"]
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0'
    }
    if logo_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(logo_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": True, "descriptor": "Maximum size of logo is 1 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{vtc_abbr}/logo.png {logo_url}")
        except:
            pass
    if banner_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(banner_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": True, "descriptor": "Maximum size of banner is 1 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{vtc_abbr}/banner.png {banner_url}")
        except:
            pass
    if bg_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(bg_url, headers = headers))
            if f.length / 1024 > 4096:
                return {"error": True, "descriptor": "Maximum size of background is 4 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{vtc_abbr}/bg.jpg {bg_url}")
        except:
            import traceback
            traceback.print_exc()
            pass
    if teamupdate_url != "":
        try:
            f = urllib.request.urlopen(urllib.request.Request(teamupdate_url, headers = headers))
            if f.length / 1024 > 1024:
                return {"error": True, "descriptor": "Maximum size of team update banner is 1 MB"}
            os.system(f"wget -O /var/hub/cdn/assets/{vtc_abbr}/TeamUpdate.png {teamupdate_url}")
        except:
            pass
    
    # Validate domain
    if not os.path.exists(f"/var/hub/html/configs/{domain}.php"):
        response.status_code = 401
        return {"error": True, "descriptor": "Invalid domain"}
        
    ovtcabbr = ""
    enabled_plugins = ""
    o = open(f"/var/hub/html/configs/{domain}.php", "r").read().split("\n")
    for oo in o:
        if oo.find("$vtcabbr") != -1:
            ovtcabbr = oo[oo.find('"')+1:oo.rfind('"')]
        elif oo.find("$enabled_plugins") != -1:
            enabled_plugins = oo[oo.find('=')+2:oo.rfind(";")]
    if ovtcabbr != vtc_abbr:
        response.status_code = 401
        return {"error": True, "descriptor": "Unauthorized"}

    # Update php config
    vtc_name = form["vtc_name"]
    vtc_color = form["vtc_color"].replace("#", "")
    intcolor = tuple(int(vtc_color[i:i+2], 16) for i in (0, 2, 4))
    r, g, b = intcolor[0] + 32, intcolor[1] + 32, intcolor[2] + 32
    vtc_color = "#" + vtc_color
    vtc_color_dark = "#{:02x}{:02x}{:02x}".format(r, g, b)
    slogan = form["slogan"]
    
    frontend_conf_php = f"""<?php
    $vtcname = "{vtc_name}";
    $vtcabbr = "{vtc_abbr}";
    $vtccolor = "{vtc_color}";
    $vtccolordark = "{vtc_color_dark}";
    $slogan = "{slogan}";
    
    $domain = "https://{domain}";
    $domainpure = "{domain}";
    
    $api = "{apidomain}";
    $status = "status.charlws.com";
    
    $enabled_plugins = {enabled_plugins};
    ?>"""

    open(f"/var/hub/html/configs/{domain}.php", "w").write(frontend_conf_php)

    # Update js config
    company_distance_unit = form["company_distance_unit"]
    navio_company_id = form["navio_company_id"]
    frontend_conf_js = f"""vtcprefix = "{vtc_abbr}";
    company_distance_unit = "{company_distance_unit}";
    vtccolor = "{vtc_color}";
    apidomain = "https://{apidomain}";
    navio_company_id = {navio_company_id};"""

    open(f"/var/hub/html/configs/{domain}.js", "w").write(frontend_conf_js)

    return {"error": False}

if __name__ == "__main__":
    uvicorn.run("main:app", host = "127.0.0.1", port = 8299)