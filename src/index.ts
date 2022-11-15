#!/usr/bin/env node

import * as fs from "fs/promises"
import * as os from "os"
import path from "path"
import {
    readConfigFromConsole,
    readConfigFromFile,
    readMapFromFile,
    writeMapToFile,
    writeStringToFile
} from "./config.js"
import {Repos} from "./repo.js"
import {exit, mapToObj} from "./utils.js"
import {fetchRepo, updateRepo} from "./gists.js"
import {Actions, CreateRepoAction, DeleteRepoAction, UpdateRepoAction} from "./Actions.js"
import readline from "readline/promises"

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

let config = await readConfigFromFile(configPath).catch(async () => {
    console.log("unable to read config from file")
    let config = await readConfigFromConsole()
    await writeMapToFile(configPath, config)
    return config
})

// fetch repos config from gist
let res = await fetchRepo(config.get("gistId") ?? exit(""), config.get("token") ?? exit(""))
// @ts-ignore
let reposFromGist = JSON.parse(res.files["repo.json"].content)
let remoteTimestamp = Number(reposFromGist["timestamp"])
if (!remoteTimestamp) exit("No remoteTimestamp in repos from gist")

// search repos on disk
let repos = new Repos(config.get("syncDir") ?? exit("config parse error"))
await repos.init()
console.log(`found ${repos.repoCount} repos, ${repos.repos.size - 1} of which are remote repo.`)
let localRepos = repos.repos
// read repos config from disk
let reposFromDisk: Map<string, string>
try {
    reposFromDisk = await readMapFromFile(repoPath)
} catch (e) {
    // cannot find repos config locally
    console.log("Unable to read repos config locally, sync with remote.")
    await syncWithRemote(diff())
    process.exit()
}
let localTimestamp = Number(reposFromDisk.get("timestamp"))
if (!localTimestamp || remoteTimestamp > localTimestamp) {
    // remote is newer
    console.log("Remote is newer, sync with remote.")
    await syncWithRemote(diff())
    process.exit()
}

// other conflicts
// ask user which to use
let actions = diff()
if (actions.length == 0) {
    console.log("No actions needed.")
    process.exit()
}
let scanner = readline.createInterface(process.stdin, process.stdout)
console.log(`Remote: ${Object.keys(reposFromGist).length - 1} repos at ${new Date(remoteTimestamp)}`)
console.log(`Local:  ${localRepos.size - 1} repos at ${new Date(localTimestamp)}`)
let input = await scanner.question("Which one do you prefer? ([R]emote,[L]ocal)")
scanner.close()
if (input.toLowerCase() == "r") {
    await syncWithRemote(actions)
} else if (input.toLowerCase() == "l") {
    await updateFromLocal()
}


function diff(): Array<Actions> {
    let actions = Array<Actions>()
    for (let dir of Object.keys(reposFromGist)) {
        if (dir === "timestamp") continue
        if (localRepos.has(dir) && localRepos.get(dir) === reposFromGist[dir]) {
            // same, continue
            continue
        }
        if (!localRepos.has(dir)) {
            // not exist
            actions.push(new CreateRepoAction(dir, reposFromGist[dir]))
        }
        if (localRepos.has(dir) && localRepos.get(dir) !== reposFromGist[dir]) {
            // updated
            actions.push(new UpdateRepoAction(dir, localRepos.get(dir)!!, reposFromGist[dir]))
        }
    }
    for (let dir of localRepos.keys()) {
        if (dir == "timestamp") continue
        if (!Object.keys(reposFromGist).includes(dir)) {
            // delete
            actions.push(new DeleteRepoAction(dir))
        }
    }
    return actions
}

async function syncWithRemote(actions: Array<Actions>) {
    if (actions.length == 0) {
        console.log("No action need.")
        process.exit()
    }
    // confirm
    console.log("actions:")
    for (let action of actions) {
        console.log(action.description)
    }
    let scanner = readline.createInterface(process.stdin, process.stdout)
    let input = await scanner.question("Are you sure? [y/n] ")
    scanner.close()
    if (input.toLowerCase() == 'y') {
        for (let action of actions) {
            await action.invoke()
        }
        // update local config
        reposFromGist["timestamp"] = String(new Date().valueOf())
        await writeStringToFile(repoPath, JSON.stringify(reposFromGist))
        await updateRepo(JSON.stringify(reposFromGist), config) // update timestamp
    } else {
        console.log("interrupted")
    }
}

async function updateFromLocal() {
    // save repo
    let reposObj = mapToObj(repos.repos)
    await writeStringToFile(repoPath, JSON.stringify(reposObj))

    // update repo
    await updateRepo(JSON.stringify(reposObj), config)
    console.log("repos updated")
}

