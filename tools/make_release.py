import os, shutil

os.system("python ./tools/genjsbundle.py noprefix")
shutil.copy("./src/nighty.php", "./src/index.php")
d = open("./src/index.php","r", encoding="utf-8").read()
d = d.replace("Nighty Release", "")
open("./src/index.php","w", encoding="utf-8").write(d)