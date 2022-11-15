import * as readline from "readline/promises"
import * as fs from "fs/promises"
import {mapToObj} from "./utils.js"

export const config = new Map<string, string>([
        ["syncDir", ""],
        ["token", ""],
        ["gistId", ""]
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

export async function writeMapToFile(path: string, map: Map<string, string>) {
    await writeStringToFile(path, JSON.stringify(mapToObj(map)))
}

export async function readMapFromFile(path: string): Promise<Map<string, string>> {
    let configString = await fs.readFile(path, "utf-8")
    let configObj = JSON.parse(configString)
    for (let key of config.keys()) {
        config.set(key, configObj[key])
    }
    return config
}

export async function writeStringToFile(path: string, content: string) {
    let file = await fs.open(path, "w")
    await file.writeFile(content)
    await file.close()
}