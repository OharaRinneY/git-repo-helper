#!/usr/bin/env node

import * as fs from "fs/promises"
import * as os from "os"
import path from "path"

const configDir = path.join(os.homedir(), ".git-repo-helper")

console.log("reading config")

let dir = await fs.opendir(configDir).catch(async e => {
    if (e.errno == -2) {
        console.log("config path not exist.")
        await fs.mkdir(configDir)
        return fs.opendir(configDir)
    }
})

if (dir === undefined) {
    console.log("error: dir is undefined")
    process.exit(-1)
}




