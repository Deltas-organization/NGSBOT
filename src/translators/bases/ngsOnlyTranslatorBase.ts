import { TranslatorBase } from "./translatorBase";
import { Message } from "discord.js";
import { DiscordMembers } from "../../enums/DiscordMembers";
import { DiscordGuilds } from "../../enums/DiscordGuilds";

export abstract class NGSOnlyTranslatorBase extends TranslatorBase {

    public async Verify(message: Message) {
        switch (message.guild.id) {
            case DiscordGuilds.NGS:
                return true;
        }
        
        return false;
    }
}