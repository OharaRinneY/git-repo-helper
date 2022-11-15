import axios from "axios"

export async function updateRepo(content: any, config: Map<string,string>): Promise<any> {
    return await axios.patch(`https://api.github.com/gists/${config.get("gistId")}`, {
        "files": {
            "repo.json": {
                "content": content
            }
        }
    }, {
        headers: {
            "accept": "application/vnd.github+json",
            "Authorization": `Bearer ${config.get("token")}`
        }
    })
}

export async function fetchRepo(gist_id: string, token: string): Promise<string> {
    let {data: res} = await axios.get(`https://api.github.com/gists/${gist_id}`, {
        headers: {
            "accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`
        }
    })
    return res
}