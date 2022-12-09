import os, sys, json, time
import win32clipboard

if len(sys.argv) == 1:
    print("Source code path not specified!")
    sys.exit(0)

codepath = sys.argv[1]

if not os.path.exists(codepath):
    print("Source code file not found!")
    sys.exit(0)

def purify(s):
    s = s.lower()
    s = s.replace(" ","_")
    s = ''.join(ch for ch in s if ch.isalnum() or ch == "_")
    return s

def append(key, val):
    if codepath.endswith(".js"):
        d = json.loads(open("./src/languages/en.json","r",encoding="utf-8").read())
        d[key] = val
        open("./src/languages/en.json","w",encoding="utf-8").write(json.dumps(d, indent=4))
        p = open(codepath,"r",encoding="utf-8").read()
        p = p.replace(f'"{val}"', f'mltr("{key}")')
        p = p.replace(f"'{val}'", f"mltr('{key}')")
        p = p.replace(f"`{val}`", f"mltr('{key}')")
        p = p.replace(f">{val}<", f">${{mltr('{key}')}}<")
        p = p.replace(f"> {val}<", f"> ${{mltr('{key}')}}<")
        open(codepath,"w",encoding="utf-8").write(p)

    elif codepath.endswith(".php"):
        d = json.loads(open("./src/languages/en.json","r",encoding="utf-8").read())
        d[key] = val
        open("./src/languages/en.json","w",encoding="utf-8").write(json.dumps(d, indent=4))
        p = open(codepath,"r",encoding="utf-8").read()
        p = p.replace(f"\"{val}\"", f'\"<?php echo mltr("{key}"); ?>\"')
        p = p.replace(f">{val}<", f'><?php echo mltr("{key}"); ?><')
        open(codepath,"w",encoding="utf-8").write(p)

data = ""
while 1:
    win32clipboard.OpenClipboard()
    try:
        newdata = win32clipboard.GetClipboardData()
    except:
        time.sleep(1)
        continue
    win32clipboard.CloseClipboard()

    if newdata == "":
        continue

    if data != newdata:
        key = purify(newdata)
        cmd = input(f"{newdata} -> {key}? (Yes/Skip/Custom)").lower()
        if cmd.startswith("y"):
            append(key, newdata)
            data = newdata
        elif cmd.startswith("s"):
            data = newdata
            continue
        elif cmd.startswith("c"):
            if len(cmd.split(" ")) == 1:
                print("Invalid custom key, retry.")
                continue
            key = purify(cmd.split(" ")[1])
            cmd = input(f"{newdata} -> {key}? (Yes/Skip/Custom)").lower()
            if cmd.startswith("y"):
                append(key, newdata)
                data = newdata
            elif cmd.startswith("s"):
                data = newdata
                continue
            elif cmd.startswith("c"):
                continue            

    time.sleep(0.5)