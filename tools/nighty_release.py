import os, sys

os.system("python ./tools/bundle.py prevent_recurse")

pfx = "nightly"

if len(sys.argv) > 1:
    pfx = sys.argv[1]

l = os.listdir("./src/js/bundles")

for ll in l:
    d = open("./src/js/bundles/" + ll, "r", encoding="utf-8").read()
    d = d.replace(f"""window.history.pushState("", "", '/{pfx}""", """window.history.pushState("", "", '""")
    d = d.replace("""window.history.pushState("", "", '""", f"""window.history.pushState("", "", '/{pfx}""")
    d = d.replace(f'if (p == "/{pfx}', 'if (p == "')
    d = d.replace('if (p == "', f'if (p == "/{pfx}')
    d = d.replace(f'if (p.startsWith("/{pfx}', 'if (p.startsWith("')
    d = d.replace('if (p.startsWith("', f'if (p.startsWith("/{pfx}')
    d = d.replace("Drivers Hub: Frontend (Nightly Release) ", "Drivers Hub: Frontend ")
    d = d.replace("Drivers Hub: Frontend ", "Drivers Hub: Frontend (Nightly Release) ")
    open("./src/js/bundles/" + ll, "w", encoding="utf-8").write(d)
    d = open("./src/nightly.php","r", encoding="utf-8").read()
    d = d.replace("""<a href="https://charlws.com" target="_blank">CharlesWithC</a>&nbsp;&nbsp;(Nightly Release)""", """<a href="https://charlws.com" target="_blank">CharlesWithC</a>""")
    d = d.replace("""<a href="https://charlws.com" target="_blank">CharlesWithC</a>""", """<a href="https://charlws.com" target="_blank">CharlesWithC</a>&nbsp;&nbsp;(Nightly Release)""")
    open("./src/nightly.php","w", encoding="utf-8").write(d)