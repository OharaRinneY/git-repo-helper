import {config} from "./config.js"
import * as fs from "fs/promises"
import path from "path"
import {execAsync} from "./utils.js"

export abstract class Actions {
    abstract description: string
    abstract repoDir: string
    rootDir: string = config.get("syncDir")!!

    abstract invoke(): Promise<void>
}


export class CreateRepoAction extends Actions {
    description: string
    repoDir: string
    url: string

    constructor(repoDir: string, url: string) {
        super()
        this.repoDir = repoDir
        this.url = url
        this.description = `create ${repoDir} -> ${url}`
    }

    async invoke(): Promise<void> {
        // mkdir
        let realPath = path.join(this.rootDir, this.repoDir)
        await fs.mkdir(realPath, {recursive: true})
        // init git repo
        await execAsync("git init", realPath)
        // set remote
        await execAsync(`git remote add origin ${this.url}`, realPath)

    }
}

export class UpdateRepoAction extends Actions {
    description: string
    repoDir: string
    newUrl: string

    constructor(repoDir: string, origin: string, newUrl: string) {
        super()
        this.repoDir = repoDir
        this.newUrl = newUrl
        this.description = `update ${repoDir} from ${origin} to ${newUrl}`
    }

    async invoke(): Promise<void> {
        let realPath = path.join(this.rootDir, this.repoDir)
        await execAsync("git remote rm origin", realPath)
        await execAsync(`git remote add origin ${this.newUrl}`, realPath)
    }
}

export class DeleteRepoAction extends Actions {
    description: string
    repoDir: string


    constructor(repoDir: string) {
        super()
        this.repoDir = repoDir
        this.description = `DELETE ${repoDir}`
    }

    async invoke(): Promise<void> {
        let realPath = path.join(this.rootDir, this.repoDir)
        let paths = realPath.split(path.sep)
        paths[paths.length - 1] = `.${paths[paths.length - 1]}`
        await fs.rename(realPath, "/" + path.join(...paths))
    }

}