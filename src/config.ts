import * as readline from "readline/promises"
import * as fs from "fs/promises"

const config = new Map<string, string>([
        ["syncDir", ""],
    ]
)

export async function readConfigFromConsole(): Promise<Map<string, string>> {
    let scanner = readline.createInterface(process.stdin, process.stdout)
    for (let key of config.keys()) {
        let value = await scanner.question(`${key}: `)
        config.set(key, value)
    }
    scanner.close()
    return config
}

export async function writeConfigToFile(path: string, config: Map<string, string>) {
    let file = await fs.open(path, "w")
    const obj = {}
    // @ts-ignore
    config.forEach((v, k) => obj[k] = v)
    await file.writeFile(JSON.stringify(obj))
}