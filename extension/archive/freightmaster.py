# FreightMaster
# Author: @CharlesWithC

# freightmaster-config.json must be correctly set to manage seasons.
# data_folder must be a child of "freightmaster/"

# Use a different data folder for each season and move outdated config
# to the corresponding data folder for archive purpose.

# Remember to merge `latest/chub-fmd-rewards.json` and write the result
# to `latest/chub-fmd-rewards-history.json` for api query.

import hashlib
import hmac
import json
import os
import sys
import time
import traceback

import redis
import requests


def custom_if(compare, a, b):
    if compare == "==" and a == b or \
            compare == "<=" and a <= b or \
            compare == ">=" and a >= b or \
            compare == "<" and a < b or \
            compare == ">" and a > b:
        return True
    return False

def calculate_fmd_rewards():
    # this only applies to FMD
    # reward id must start with an identifiable season id, like fms0
    config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
    end_time = config["end_time"]
    rewards = [x for x in config["rewards"] if x["active"] and (end_time <= time.time() and x["finisher_reward"] or not x["finisher_reward"])]
    data_folder = config["data_folder"]
    if not os.path.exists(data_folder):
        return {"error": "Data folder does not exist"}
    if not os.path.exists(data_folder + "/latest"):
        return {"error": "No data available"}
    
    output = []

    fmd = json.loads(open(data_folder + "/latest/chub-fmd.json", "r", encoding="utf-8").read())

    allrank = 0
    alllast = -1
    for row in fmd:
        if alllast != row["point"]:
            alllast = row["point"]
            allrank += 1

    rank = 0
    last = -1
    for row in fmd:
        if last != row["point"]:
            last = row["point"]
            rank += 1

        for reward in rewards:
            qualify_compare = reward["qualify_value"][0:2]
            qualify_value = float(reward["qualify_value"][2:])
            if reward["qualify_type"] == "rank":
                if custom_if(qualify_compare, rank, qualify_value):
                    output.append({"abbr": row["abbr"], "uid": row["user"]["uid"], "reward": reward["id"]})
            elif reward["qualify_type"] == "percentage":
                if custom_if(qualify_compare, rank / allrank, qualify_value):
                    output.append({"abbr": row["abbr"], "uid": row["user"]["uid"], "reward": reward["id"]})
    
    open(data_folder + "/latest/chub-fmd-rewards.json", "w", encoding="utf-8").write(json.dumps(output))

def calculate_fmd():
    config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
    excluded_vtcs = config["excluded_vtcs"]
    data_folder = config["data_folder"]
    if not os.path.exists(data_folder):
        return {"error": "Data folder does not exist"}
    if not os.path.exists(data_folder + "/latest"):
        return {"error": "No data available"}
    
    all_data = {}
    vtcs = os.listdir(data_folder + "/latest")
    for vtc in vtcs:
        abbr = vtc.split(".")[0]
        if abbr in excluded_vtcs or not abbr.isalnum():
            continue

        d = json.loads(open(data_folder + "/latest/" + abbr + ".json", "r", encoding="utf-8").read())
        for dd in d["fmd"]:
            all_data[abbr + "-" + str(dd["user"]["uid"])] = {"abbr": abbr, "user": dd["user"], "point": dd["point"]}
    
    all_data = dict(sorted(all_data.items(),key=lambda x: (-x[1]["point"], x[0])))
    open(data_folder + "/latest/chub-fmd.json", "w", encoding="utf-8").write(json.dumps(list(all_data.values())))

    calculate_fmd_rewards()

    return True

def take_snapshot(start_time, end_time):
    config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
    excluded_vtcs = config["excluded_vtcs"]
    data_folder = config["data_folder"]
    if not os.path.exists(data_folder):
        os.mkdir(data_folder)
    if not os.path.exists(data_folder + "/latest"):
        os.mkdir(data_folder + "/latest")
        
    snapshots = [x for x in os.listdir(data_folder) if x.startswith("snapshot")]
    for snapshot in snapshots:
        t = snapshot.split("-")
        if start_time > int(t[1]) and start_time < int(t[2]) \
                or end_time > int(t[1]) and end_time < int(t[2]):
            return {"error": "Snapshot time range conflict"}

    if not os.path.exists(data_folder + f"/snapshot-{start_time}-{end_time}"):
        os.mkdir(data_folder + f"/snapshot-{start_time}-{end_time}")

    all_vtcs = []
    domains = os.listdir("/var/hub/config")
    for domain in domains:
        try:
            vtc_config = json.loads(open(f"/var/hub/config/{domain}", "r", encoding="utf-8").read())
            if vtc_config["abbr"] not in excluded_vtcs:
                all_vtcs.append(vtc_config["api_host"] + "/" + vtc_config["abbr"])
        except:
            pass

    success_vtcs = []
    failed_vtcs = []
    rlerror = []

    for vtc in all_vtcs:
        abbr = vtc.split('/')[-1]

        sig = hmac.new(str(int(time.time() / 60)).encode(), "CHub Frontend Extension".encode(), hashlib.sha256).digest()
        sig = ''.join(format(x, '02x') for x in sig)
        headers = {
            "Accept": "application/json",
            "Client-Key": sig,
            "User-Agent": "CHub Frontend Extension"
        }

        r = requests.get(f"{vtc}/freightmaster?after={start_time}&before={end_time}", headers = headers)

        if "The Drivers Hub Project (CHub)" in r.text:
            # suspended / deleted DH
            continue

        if r.status_code == 200:
            open(data_folder + f"/snapshot-{start_time}-{end_time}/{abbr}.json", "w", encoding="utf-8").write(r.text)

            base_fmd = {}
            base_fma = {}
            if os.path.exists(data_folder + f"/latest/{abbr}.json"):
                t = json.loads(open(data_folder + f"/latest/{abbr}.json", "r", encoding="utf-8").read())
                for tt in t["fmd"]:
                    base_fmd[tt["user"]["uid"]] = tt
                for tt in t["fma"]:
                    base_fma[tt["user"]["uid"]] = tt
            
            try:
                d = json.loads(r.text)
                fmd = base_fmd
                fma = base_fma
                for dd in d["fmd"]:
                    if dd["user"]["uid"] in base_fmd.keys():
                        fmd[dd["user"]["uid"]] = {"user": dd["user"], "point": base_fmd[dd["user"]["uid"]]["point"] + dd["point"]}
                    else:
                        fmd[dd["user"]["uid"]] = dd
                for dd in d["fma"]:
                    if dd["user"]["uid"] in base_fma.keys():
                        fma[dd["user"]["uid"]] = {"user": dd["user"], "point": base_fma[dd["user"]["uid"]]["point"] + dd["point"]}
                    else:
                        fma[dd["user"]["uid"]] = dd

                fmd = dict(sorted(fmd.items(),key=lambda x: (-x[1]["point"], x[0])))
                fma = dict(sorted(fma.items(),key=lambda x: (-x[1]["point"], x[0])))

                open(data_folder + f"/latest/{abbr}.json", "w", encoding="utf-8").write(json.dumps({"fmd": list(fmd.values()), "fma": list(fma.values())}))
                success_vtcs.append(vtc)
                print(f"Successfully snapshotted {abbr}")
            except:
                failed_vtcs.append(vtc)
                print(f"Failed to snapshot {abbr}")
                traceback.print_exc()
        elif r.status_code == 429:
            rlerror.append(vtc)
            print(f"Failed to snapshot {abbr}")
            print(r.text)
        elif r.status_code != 404: # ignore 404 (suspended hubs)
            failed_vtcs.append(vtc)
            print(f"Failed to snapshot {abbr}")
            print(r.text)

    calculate_fmd()

    if len(failed_vtcs) > 0 or len(rlerror) > 0:
        return {"success": success_vtcs, "failed": failed_vtcs, "rlerror": rlerror}
    else:
        return True

def recalculate_latest():
    config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
    excluded_vtcs = config["excluded_vtcs"]
    data_folder = config["data_folder"]

    if not os.path.exists(data_folder):
        return {"error": "Data folder does not exist"}

    snapshots = [x for x in os.listdir(data_folder) if x.startswith("snapshot")]

    if len(snapshots) == 0:
        return {"error": "No snapshot available"}
    
    for snapshot in snapshots:
        vtcs = os.listdir(data_folder + "/" + snapshot)
        for vtc in vtcs:
            abbr = vtc.split(".")[0]
            if abbr in excluded_vtcs:
                continue
            
            base_fmd = {}
            base_fma = {}
            if os.path.exists(data_folder + f"/latest/{abbr}.json"):
                t = json.loads(open(data_folder + f"/latest/{abbr}.json", "r", encoding="utf-8").read())
                for tt in t["fmd"]:
                    base_fmd[tt["user"]["uid"]] = tt
                for tt in t["fma"]:
                    base_fma[tt["user"]["uid"]] = tt
            
            d = json.loads(open(data_folder + "/" + snapshot + "/" + abbr + ".json", "r", encoding="utf-8").read())
            fmd = base_fmd
            fma = base_fma
            for dd in d["fmd"]:
                if dd["user"]["uid"] in base_fmd.keys():
                    fmd[dd["user"]["uid"]] = {"user": dd["user"], "point": base_fmd[dd["user"]["uid"]]["point"] + dd["point"]}
                else:
                    fmd[dd["user"]["uid"]] = dd
            for dd in d["fma"]:
                if dd["user"]["uid"] in base_fma.keys():
                    fma[dd["user"]["uid"]] = {"user": dd["user"], "point": base_fma[dd["user"]["uid"]]["point"] + dd["point"]}
                else:
                    fma[dd["user"]["uid"]] = dd

            # print(f"Parsed {abbr}'s snapshot {snapshot} - Original FMD/FMA: {len(base_fmd.keys())}/{len(base_fma.keys())} - New FMD/FMA: {len(fmd.keys())}/{len(fma.keys())}")

            fmd = dict(sorted(fmd.items(),key=lambda x: (-x[1]["point"], x[0])))
            fma = dict(sorted(fma.items(),key=lambda x: (-x[1]["point"], x[0])))

            open(data_folder + f"/latest/{abbr}.json", "w", encoding="utf-8").write(json.dumps({"fmd": list(fmd.values()), "fma": list(fma.values())}))
    
    calculate_fmd()

    return True

def control():
    while 1:
        config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
        start_time = config["start_time"]
        end_time = config["end_time"]
        data_folder = config["data_folder"]

        if not os.path.exists(data_folder):
            os.mkdir(data_folder)

        if start_time > time.time():
            print(f"Season {config['season_name']} not started yet, waiting {int(time.time()) - start_time} seconds...")
            time.sleep(int(time.time()) - start_time)
    
        if end_time < time.time():
            print(f"Season {config['season_name']} already ended, waiting for new config...\nRun `python3 freightmaster.py new-season` after creating `freightmaster-config-next.json` to start new season.")
            time.sleep(60)
            continue

        snapshots = [x for x in os.listdir(data_folder) if x.startswith("snapshot")]
        last_snapshot_end_time = 0
        for snapshot in snapshots:
            t = snapshot.split("-")
            last_snapshot_end_time = max(int(t[2]), last_snapshot_end_time)
        
        next_snapshot_start_time = max(last_snapshot_end_time, start_time)
        next_snapshot_end_time = next_snapshot_start_time + 86400
        if next_snapshot_end_time <= time.time():
            print(f"Taking snapshot from {next_snapshot_start_time} to {next_snapshot_end_time}")
            res = take_snapshot(next_snapshot_start_time, next_snapshot_end_time)
            print(res)
            while res is not True and (time.time() <= next_snapshot_end_time + 86400 or len(res["rlerror"]) > 0 or len(res["failed"]) > 0):
                print("Retrying in 600 seconds...")
                os.system(f"rm -rf ./{data_folder}/snapshot-{next_snapshot_start_time}-{next_snapshot_end_time}")
                time.sleep(600)
                print(f"Taking snapshot from {next_snapshot_start_time} to {next_snapshot_end_time}")
                res = take_snapshot(next_snapshot_start_time, next_snapshot_end_time)
                print(res)
        else:
            print(f"Next snapshot to be taken in {next_snapshot_end_time - int(time.time())} seconds...")
            time.sleep(next_snapshot_end_time - int(time.time()))

# @app.get("/freightmaster/d")
# async def get_freightmaster_d(request: Request, page: int, page_size: int):
#     config = r.hgetall("freightmaster:config")
#     if len(config.keys()) == 0:
#         config = json.loads(open("./freightmaster-config.json", "r").read())
#         tconfig = json.loads(json.dumps(config))
#         tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
#         tconfig["rewards"] = json.dumps(config["rewards"])
#         r.hset("freightmaster:config", mapping = tconfig)
#         r.expire("freightmaster:config", 3600)
#     else:
#         config["start_time"] = int(config["start_time"])
#         config["end_time"] = int(config["end_time"])
#         config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
#         config["rewards"] = json.loads(config["rewards"])
#     data_folder = config["data_folder"]
    
#     if r.get("freightmaster:ok:d") is None:
#         if not os.path.exists(data_folder):
#             return {"error": "Data folder does not exist"}
#         if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/chub-fmd.json"):
#             return {"error": "No data available"}
#     r.set("freightmaster:ok:d", 1)
    
#     if request.client.host != "127.0.0.1":
#         if page_size > 1000:
#             return {"error": "Page size too large"}
#         if page_size < 10:
#             return {"error": "Page size too small"}
    
#     allvtcdomains = r.get("freightmaster:allvtcdomains")
#     cfgs = os.listdir("/var/hub/config")
#     if allvtcdomains != ",".join(cfgs):
#         r.delete("freightmaster:allvtcs")

#     allvtcs = r.hgetall("freightmaster:allvtcs")
#     if len(allvtcs.keys()) == 0:
#         for cfg in cfgs:
#             try:
#                 cfg = json.loads(open(f"/var/hub/config/{cfg}", "r", encoding="utf-8").read())
#                 if "abbr" in cfg.keys():
#                     allvtcs[cfg["abbr"]] = cfg["name"]
#             except:
#                 pass
#         r.hset("freightmaster:allvtcs", mapping = allvtcs)
#         r.set("freightmaster:allvtcdomains", ",".join(cfgs))
#         r.expire("freightmaster:allvtcs", 3600)
    
#     cache = r.hgetall("freightmaster:fmd")
#     if len(cache.keys()) == 0:
#         fmd = json.loads(open(data_folder + "/latest/chub-fmd.json", "r", encoding="utf-8").read())
#         last = -1
#         rank = 0
#         for i in range(len(fmd)):
#             if last != fmd[i]["point"]:
#                 rank += 1
#             fmd[i]["rank"] = rank
#             last = fmd[i]["point"]
#             if fmd[i]["abbr"] not in allvtcs:
#                 continue
#             fmd[i]["vtc"] = allvtcs[fmd[i]["abbr"]]
#             cache[i] = json.dumps(fmd[i])
#         r.hset("freightmaster:fmd", mapping = cache)
#         r.expire("freightmaster:fmd", 600)
    
#     # handle deleted rows
#     fmd = []
#     cache = [v for k, v in sorted(cache.items(), key=lambda item: int(item[0]))]
#     for v in cache:
#         v = json.loads(v)
#         v["user"]["uid"] = int(v["user"]["uid"])
#         v["user"]["userid"] = int(v["user"]["userid"])
#         v["point"] = int(v["point"])
#         fmd.append(v)
#     tot = len(fmd)
    
#     fmd = fmd[(page - 1) * page_size : page * page_size]

#     return {"list": fmd, "total_items": tot}

# @app.get("/freightmaster/a")
# async def get_freightmaster_a(request: Request, abbr: str, page: int, page_size: int):
#     config = r.hgetall("freightmaster:config")
#     if len(config.keys()) == 0:
#         config = json.loads(open("./freightmaster-config.json", "r").read())
#         tconfig = json.loads(json.dumps(config))
#         tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
#         tconfig["rewards"] = json.dumps(config["rewards"])
#         r.hset("freightmaster:config", mapping = tconfig)
#         r.expire("freightmaster:config", 3600)
#     else:
#         config["start_time"] = int(config["start_time"])
#         config["end_time"] = int(config["end_time"])
#         config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
#         config["rewards"] = json.loads(config["rewards"])
#     data_folder = config["data_folder"]
    
#     if r.get(f"freightmaster:ok:{abbr}") is None:
#         if not os.path.exists(data_folder):
#             return {"error": "Data folder does not exist"}
#         if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/" + abbr + ".json"):
#             return {"error": "No data available"}
#     else:
#         r.set(f"freightmaster:ok:{abbr}", 1)
    
#     if request.client.host != "127.0.0.1":
#         if page_size > 1000:
#             return {"error": "Page size too large"}
#         if page_size < 10:
#             return {"error": "Page size too small"}

#     cache = r.hgetall(f"freightmaster:fma:{abbr}")
#     if len(cache.keys()) == 0:
#         fma = json.loads(open(data_folder + "/latest/" + abbr + ".json", "r", encoding="utf-8").read())["fma"]
#         last = -1
#         rank = 0
#         tot = len(fma)
#         for i in range(len(fma)):
#             if last != fma[i]["point"]:
#                 rank += 1
#             fma[i]["rank"] = rank
#             last = fma[i]["point"]
#             cache[i] = json.dumps(fma[i])
#         r.hset(f"freightmaster:fma:{abbr}", mapping = cache)
#         r.expire(f"freightmaster:fma:{abbr}", 600)
#     else:
#         fma = []
#         cache = [v for k, v in sorted(cache.items(), key=lambda item: int(item[0]))]
#         for v in cache:
#             v = json.loads(v)
#             v["user"]["uid"] = int(v["user"]["uid"])
#             v["user"]["userid"] = int(v["user"]["userid"])
#             v["point"] = int(v["point"])
#             fma.append(v)
#         tot = len(fma)

#     fma = fma[(page - 1) * page_size : page * page_size]

#     return {"list": fma, "total_items": tot}

# @app.get("/freightmaster/position")
# async def get_frieghtmaster_position(abbr: str, uid: int):
#     config = r.hgetall("freightmaster:config")
#     if len(config.keys()) == 0:
#         config = json.loads(open("./freightmaster-config.json", "r").read())
#         tconfig = json.loads(json.dumps(config))
#         tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
#         tconfig["rewards"] = json.dumps(config["rewards"])
#         r.hset("freightmaster:config", mapping = tconfig)
#         r.expire("freightmaster:config", 3600)
#     else:
#         config["start_time"] = int(config["start_time"])
#         config["end_time"] = int(config["end_time"])
#         config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
#         config["rewards"] = json.loads(config["rewards"])
#     season_name = config["season_name"]
#     start_time = config["start_time"]
#     end_time = config["end_time"]
#     data_folder = config["data_folder"]
    
#     if r.get("freightmaster:ok:d") is None and r.get(f"freightmaster:ok:{abbr}") is None:
#         if not os.path.exists(data_folder):
#             return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "Data folder does not exist"}
#         if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/chub-fmd.json"):
#             return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "No data available"}
#         if not os.path.exists(data_folder + "/latest") or not os.path.exists(data_folder + "/latest/" + abbr + ".json"):
#             return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "error": "No data available"}
#     else:
#         r.set("freightmaster:ok:d", 1)
#         r.set(f"freightmaster:ok:{abbr}", 1)

#     rankd = None
#     pointd = None
#     try:
#         fmd = json.loads(await arequests.get("http://127.0.0.1:8299/freightmaster/d?page=1&page_size=100000").text)["list"]
#         for i in range(0, len(fmd)):
#             if fmd[i]["user"]["uid"] == uid and fmd[i]["abbr"] == abbr:
#                 rankd = i + 1
#                 pointd = fmd[i]["point"]
#                 break
#     except:
#         pass

#     ranka = None
#     pointa = None
#     try:
#         fma = json.loads(await arequests.get(f"http://127.0.0.1:8299/freightmaster/a?abbr={abbr}&page=1&page_size=100000").text)["list"]
#         for i in range(0, len(fma)):
#             if fma[i]["user"]["uid"] == uid:
#                 ranka = i + 1
#                 pointa = fma[i]["point"]
#                 break
#     except:
#         pass

#     return {"season_name": season_name, "start_time": start_time, "end_time": end_time, "rankd": rankd, "pointd": pointd, "ranka": ranka, "pointa": pointa}

# @app.get("/freightmaster/rewards")
# async def get_freightmaster_rewards():
#     config = r.hgetall("freightmaster:config")
#     if len(config.keys()) == 0:
#         config = json.loads(open("./freightmaster-config.json", "r").read())
#         tconfig = json.loads(json.dumps(config))
#         tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
#         tconfig["rewards"] = json.dumps(config["rewards"])
#         r.hset("freightmaster:config", mapping = tconfig)
#         r.expire("freightmaster:config", 3600)
#     else:
#         config["start_time"] = int(config["start_time"])
#         config["end_time"] = int(config["end_time"])
#         config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
#         config["rewards"] = json.loads(config["rewards"])
        
#     return config["rewards"]

# @app.get("/freightmaster/rewards/distributed")
# async def get_freightmaster_distributed_rewards(abbr: str, uid: Optional[int] = None):
#     config = r.hgetall("freightmaster:config")
#     if len(config.keys()) == 0:
#         config = json.loads(open("./freightmaster-config.json", "r").read())
#         tconfig = json.loads(json.dumps(config))
#         tconfig["excluded_vtcs"] = json.dumps(config["excluded_vtcs"])
#         tconfig["rewards"] = json.dumps(config["rewards"])
#         r.hset("freightmaster:config", mapping = tconfig)
#         r.expire("freightmaster:config", 3600)
#     else:
#         config["start_time"] = int(config["start_time"])
#         config["end_time"] = int(config["end_time"])
#         config["excluded_vtcs"] = json.loads(config["excluded_vtcs"])
#         config["rewards"] = json.loads(config["rewards"])
#     data_folder = config["data_folder"]

#     history_rewards = []
#     if os.path.exists(data_folder + "/latest/chub-fmd-rewards-history.json"):
#         history_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards-history.json", "r", encoding="utf-8").read())

#     current_rewards = []
#     if os.path.exists(data_folder + "/latest/chub-fmd-rewards.json"):
#         current_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards.json", "r", encoding="utf-8").read())

#     all_rewards = current_rewards + history_rewards

#     ret = []
#     for reward in all_rewards:
#         if reward["abbr"] == abbr and (uid is None or uid == reward["uid"]):
#             ret.append(reward)
    
#     ret = sorted(ret, key=lambda x: -int(x["reward"].split("-")[0][3:]))

#     return ret

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "new-season":
        # archive current season (that HAS ENDED)
        # AND move freightmaster-next-config.json to freightmaster-config.json
        if not os.path.exists("freightmaster-config-next.json"):
            print("Next season config not found. Complete freightmaster-config-next.json and re-run the command.")
            sys.exit(1)

        config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
        data_folder = config["data_folder"]
        rewards = [{**x, "active": False} for x in config["rewards"]]
        if not os.path.exists(data_folder):
            print("Data folder does not exist.")
            sys.exit(1)
        
        if config["end_time"] > int(time.time()):
            print("Season has not ended.")
            sys.exit(1)
        
        calculate_fmd_rewards()
        os.system(f"mv freightmaster-config.json {data_folder}/freightmaster-config.json")

        history_rewards = []
        if os.path.exists(data_folder + "/latest/chub-fmd-rewards-history.json"):
            history_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards-history.json", "r", encoding="utf-8").read())

        current_rewards = json.loads(open(data_folder + "/latest/chub-fmd-rewards.json", "r", encoding="utf-8").read())

        new_history_rewards = current_rewards + history_rewards

        os.system("mv freightmaster-config-next.json freightmaster-config.json")
        new_config = json.loads(open("./freightmaster-config.json", "r", encoding="utf-8").read())
        new_data_folder = new_config["data_folder"]
        if not os.path.exists(new_data_folder):
            os.mkdir(new_data_folder)
        if not os.path.exists(new_data_folder + "/latest"):
            os.mkdir(new_data_folder + "/latest")
        open(new_data_folder + "/latest/chub-fmd-rewards-history.json", "w", encoding="utf-8").write(json.dumps(new_history_rewards))
        new_config_reward_ids = [x["id"] for x in new_config["rewards"]]
        new_config["rewards"] = new_config["rewards"] + [x for x in rewards if x["id"] not in new_config_reward_ids]
        open("./freightmaster-config.json", "w", encoding="utf-8").write(json.dumps(new_config, indent=4))

        r = redis.Redis()
        for key in r.scan_iter("freightmaster:*"):
            r.delete(key)

        print("Next season started.")
    
    elif cmd == "recalculate-rewards":
        calculate_fmd_rewards()
        print("Recalculated rewards.")

    elif cmd == "recalculate-latest":
        recalculate_latest()
        print("Recalculated latest.")
    
    else:
        print("Unknown command.")