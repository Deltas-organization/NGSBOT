import { TranslatorBase } from "./translatorBase";
import { Message } from "discord.js";
import { DiscordMembers } from "../../enums/DiscordMembers";
import { DiscordGuilds } from "../../enums/DiscordGuilds";

export abstract class NonNGSTranslatorBase extends TranslatorBase {

    public async Verify(message: Message) {
        if(message.member.user.id == DiscordMembers.Delta)
            return true;

        switch (message.guild.id) {
            case DiscordGuilds.NGS:
                return false;
        }
        
        return true;
    }
}