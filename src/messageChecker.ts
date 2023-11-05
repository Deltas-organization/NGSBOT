import { Message } from "discord.js";
import { DiscordChannels } from "./enums/DiscordChannels";

export class MessageChecker {

    public Check(message: Message) {
        if (message.channel.id == DiscordChannels.NGSFlipChannel) {
            
        }
    }
}