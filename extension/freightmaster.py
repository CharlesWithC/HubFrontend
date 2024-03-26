# FreightMaster
# Author: @CharlesWithC

# freightmaster-config.json must be correctly set to manage seasons.
# Use a different data folder for each season and move outdated config
# to the corresponding data folder for archive purpose.

import hashlib
import hmac
import json
import os
import time
import traceback

import requests


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
                fmd = {}
                fma = {}
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
        else:
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
            fmd = {}
            fma = {}
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
            print(f"Season {config['season_name']} already ended, waiting for new config...")
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
            while res is not True and (time.time() <= next_snapshot_end_time + 86400 or len(res["rlerror"]) > 0):
                print("Retrying in 600 seconds...")
                os.system(f"rm -rf ./{data_folder}/snapshot-{next_snapshot_start_time}-{next_snapshot_end_time}")
                time.sleep(600)
                print(f"Taking snapshot from {next_snapshot_start_time} to {next_snapshot_end_time}")
                res = take_snapshot(next_snapshot_start_time, next_snapshot_end_time)
                print(res)
        else:
            print(f"Next snapshot to be taken in {next_snapshot_end_time - int(time.time())} seconds...")
            time.sleep(next_snapshot_end_time - int(time.time()))