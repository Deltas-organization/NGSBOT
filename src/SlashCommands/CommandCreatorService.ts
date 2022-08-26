import { Client } from "discord.js";
import { DiscordGuilds } from "../enums/DiscordGuilds";

export class CommandCreatorService {
    constructor(private client: Client) {
        this.CreateCommands()
    }

    private CreateCommands() {
    }
}