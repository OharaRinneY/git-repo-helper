import * as child_process from "child_process"

export function exit(msg: string): never {
    console.log(msg)
    process.exit(-1)
}

export async function execAsync(cmd: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        child_process.exec(cmd, {cwd: cwd}, (error, stdout) => {
            if (error) {
                reject(cwd)
            }
            resolve(stdout.trim())
        })
    })
}