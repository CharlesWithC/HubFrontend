import os, shutil

os.system("python ./tools/bundle.py noprefix")
shutil.copy("./src/nightly.php", "./src/stable.php")
d = open("./src/stable.php","r", encoding="utf-8").read()
d = d.replace("(Nightly Release)", "")
open("./src/stable.php","w", encoding="utf-8").write(d)