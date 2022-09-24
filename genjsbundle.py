import os, hashlib, sys

nohtmlupd = False
if "nohtmlupd" in sys.argv:
    nohtmlupd = True

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

l = os.listdir("src/js/bundles")
cur = l[0]
if cur != "" and not nohtmlupd:
    t = open(f"src/index.php","r").read()
    t = t.replace(cur, f"{hsh}.js")
    open(f"src/index.php","w").write(t)
    os.remove("src/js/bundles/" + cur)

open(f"src/js/bundles/{hsh}.js","w",encoding="utf-8").write(bundle)