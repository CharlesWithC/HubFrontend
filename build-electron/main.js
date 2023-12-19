const fs = require('fs');
const fse = require('fs-extra');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const semver = require('semver');

function incrementVersion(version) {
    return semver.inc(version, 'patch');
}

async function main() {
    if (!fs.existsSync(`./build-electron/output`)) {
        fs.mkdirSync(`./build-electron/output`);
    }

    // Step 0: Update version code
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    packageJson.version = incrementVersion(packageJson.version);
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

    // Step 1: Move ./package.json to ./package.json.bak
    fs.renameSync('./package.json', './package.json.bak');

    // Step 2: Read ./build-electron/config.json
    const config = JSON.parse(fs.readFileSync('./build-electron/config.json', 'utf8'));

    // Step 3: Iterate through the list
    for (const item of config) {
        console.log(`Building ${item.name}`);

        // i) Modify ./package.json
        const packageJson = JSON.parse(fs.readFileSync('./package.json.bak', 'utf8'));
        packageJson.build.icon = item.icon;
        packageJson.build.productName = item.name;
        fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

        // ii) Modify ./build/electron-config.json
        const electronConfig = JSON.parse(fs.readFileSync('./build/electron-config.json', 'utf8'));
        electronConfig.name = item.name;
        electronConfig.domain = item.domain;
        electronConfig.discordClientID = item.discordClientID;
        electronConfig.build = item.build;
        fs.writeFileSync('./build/electron-config.json', JSON.stringify(electronConfig, null, 2));

        // iii) Modify logo.png
        fs.renameSync("./build/logo.png", "./build/chub-logo.png");
        fs.copyFileSync(item.icon, "./build/logo.png");

        // iv) Run electron-builder
        try {
            await exec('electron-builder');
        } catch (error) {
            console.error(`electron-builder failed: ${error}`);
            continue;
        }

        // v) Move the built files from ./dist to ./build-electron/output
        try {
            let outputDir = `./build-electron/output/${item.build}`;
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            fse.moveSync(`./dist/DriversHub.exe`, `./build-electron/output/${item.build}/portable.exe`, { overwrite: true });
            fse.moveSync(`./dist/DriversHub.Setup.exe`, `./build-electron/output/${item.build}/setup.exe`, { overwrite: true });
            fse.moveSync(`./dist/latest.yml`, `./build-electron/output/${item.build}/latest.yml`, { overwrite: true });
            let data = fs.readFileSync(`./build-electron/output/${item.build}/latest.yml`, 'utf8');
            let result = data.replace(/DriversHub\.Setup\.exe/g, 'setup.exe');
            fs.writeFileSync(`./build-electron/output/${item.build}/latest.yml`, result, 'utf8');
        } catch (error) {
            console.error(`copy file failed: ${error}`);
            continue;
        }

        // vi) Clear up logo
        fse.moveSync("./build/chub-logo.png", "./build/logo.png", { overwrite: true });
    }

    // Step 4: Reset the changes
    const electronConfig = JSON.parse(fs.readFileSync('./build/electron-config.json', 'utf8'));
    electronConfig.domain = "";
    fs.writeFileSync('./build/electron-config.json', JSON.stringify(electronConfig, null, 2));
    fs.renameSync('./package.json.bak', './package.json');
}

main().catch(console.error);