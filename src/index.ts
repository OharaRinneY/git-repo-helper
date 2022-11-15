#!/usr/bin/env node

import * as fs from "fs/promises"
import * as os from "os"
import path from "path"
import {readConfigFromConsole, readConfigFromFile, writeConfigToFile} from "./config.js"
import {Repos} from "./repo.js"
import {exit} from "./utils.js"

const configDir = path.join(os.homedir(), ".git-repo-helper")

let dir = await fs.opendir(configDir).catch(async e => {
    if (e.errno == -2) {
        console.log("config path not exist.")
        await fs.mkdir(configDir)
        return fs.opendir(configDir)
    }
})

if (dir === undefined) {
    exit("error: dir is undefined")
}

let configPath = path.join(dir.path, "config.json")
let config = await readConfigFromFile(configPath).catch(async () => {
    console.log("unable to read config from file")
    let config = await readConfigFromConsole()
    await writeConfigToFile(configPath, config)
    return config
})
// search repos
let repos = new Repos(config.get("syncDir") ?? exit("config parse error"))
await repos.init()
console.log(`found ${repos.repoCount} repos, of which ${repos.repos.size} is remote repo.`)

