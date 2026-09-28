
import fs from "node:fs/promises"


export async function loadMessages() {
    try {
        const data = await fs.readFile("./data/messages.json", "utf-8");
        return JSON.parse(data);
    }
    catch {
        throw new Error("Kunne ikke hente samtalen. data/messages.json mangler eller er ugyldig.")
    }
}

export async function saveMessages(messages) {
    const json = JSON.stringify(messages, null, 2);
    await fs.writeFile("./data/messages.json", json);
}