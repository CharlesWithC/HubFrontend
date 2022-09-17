import os

bundle = ""

def dfs(f):
    global bundle
    t = os.listdir(f)
    fi = []
    fo = []
    for tt in t:
        p = f + "/" + tt
        if "bundle" in p or "map" in p or "navio" in p or "functions.js" in p:
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
            t = open(p,"r").read()
            bundle += "\n" + t
        elif os.path.isdir(p):
            dfs(p)

dfs("src/js")

open("src/js/bundle@v1.5.1.js","w").write(bundle)