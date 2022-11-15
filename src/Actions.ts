export abstract class Actions {
    abstract description: string
    abstract repoDir: string

    abstract invoke(): string
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

    invoke(): string {
        return ""
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

    invoke(): string {
        return ""
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

    invoke(): string {
        return ""
    }

}