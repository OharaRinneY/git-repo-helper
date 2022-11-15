import axios from "axios"

export async function updateRepo(content: any, gist_id: string, token: string): Promise<any> {
    return await axios.patch(`https://api.github.com/gists/${gist_id}`, {
        "files": {
            "repo.json": {
                "content": content
            }
        }
    }, {
        headers: {
            "accept": "application/vnd.github+json",
            "Authorization": `Bearer ${token}`
        }
    })
}