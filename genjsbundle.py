import os, hashlib, sys

genonly = False
if "genonly" in sys.argv:
    genonly = True

eid = "bundle"
if "beta" in sys.argv:
    eid = "bundle_beta"

bundle = ""

def dfs(f):
    global bundle
    t = os.listdir(f)
    fi = []
    fo = []
    for tt in t:
        p = f + "/" + tt
        if "login" in p or "bundle" in p or "map" in p or "navio" in p or "functions.js" in p:
            continue
        if p.endswith(".js"):
            fi.append(tt)
        elif os.path.isdir(p):
            fo.append(tt)
    l = []
    if f == "src/js":
        l.append("functions.js")
    for tt in fo:
        l.append(tt)
    for tt in fi:
        l.append(tt)
    for ll in l:
        p = f + "/" + ll
        if p.endswith(".js"):
            t = open(p,"r",encoding="utf-8").read()
            bundle += t + "\n"
        elif os.path.isdir(p):
            dfs(p)

dfs("src/js")

hsh = hashlib.sha256(bundle.encode()).hexdigest()[:16]

if not genonly:
    f = open(f"src/index.php","r").read()
    t = f.split("\n")
    for tt in t:
        if f'id="{eid}"' in tt:
            cur = tt.split("bundles/")[1].split(".js")[0] + ".js"
            f = f.replace(cur, hsh + ".js")
    open(f"src/index.php","w").write(f)
    f = open(f"src/beta.php","r").read()
    t = f.split("\n")
    for tt in t:
        if f'id="{eid}"' in tt:
            cur = tt.split("bundles/")[1].split(".js")[0] + ".js"
            f = f.replace(cur, hsh + ".js")
    open(f"src/beta.php","w").write(f)
    os.remove("src/js/bundles/" + cur)

open(f"src/js/bundles/{hsh}.js","w",encoding="utf-8").write(bundle)