import * as fs from "fs/promises"
import * as fss from "fs"
import path from "path"
import {execAsync} from "./utils.js"

export class Repos {
    repos: Map<string, string> = new Map<string, string>() // path: git url
    rootDir: string
    repoCount: number = 0

    constructor(dir: string) {
        this.rootDir = dir
        this.repos.set("timestamp", String(new Date().valueOf()))
    }

    async init() {
        await this.searchRepos(this.rootDir)
    }

    async searchRepos(dir: string) {
        let files = await fs.readdir(dir)
        let subDirs = files.filter(file => {
            let stats = fss.statSync(path.join(dir, file))
            return stats.isDirectory()
        })
        if (subDirs.includes(".git")) {
            // this dir is a git repo
            this.repoCount++
            // get remote url
            let url = ""
            try {
                url = await execAsync("git config --get remote.origin.url", dir)
            } catch (e) {
                // not a remote repo
                return
            }
            this.repos.set(dir, url)
            return
        }
        // recursion
        for (let subDir of subDirs) {
            await this.searchRepos(path.join(dir, subDir))
        }
    }
}