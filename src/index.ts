#!/usr/bin/env node

import * as fs from "fs/promises"
import * as os from "os"
import path from "path"
import {readConfigFromConsole, readMapFromFile, writeMapToFile, writeStringToFile} from "./config.js"
import {Repos} from "./repo.js"
import {exit, mapToObj} from "./utils.js"

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

const configPath = path.join(dir.path, "config.json")
const repoPath = path.join(dir.path, "repos.json")

let config = await readMapFromFile(configPath).catch(async () => {
    console.log("unable to read config from file")
    let config = await readConfigFromConsole()
    await writeMapToFile(configPath, config)
    return config
})
// search repos
let repos = new Repos(config.get("syncDir") ?? exit("config parse error"))
await repos.init()
console.log(`found ${repos.repoCount} repos, of which ${repos.repos.size} is remote repo.`)

// save repo
let reposObj = mapToObj(repos.repos)
await writeStringToFile(repoPath, JSON.stringify(reposObj))
