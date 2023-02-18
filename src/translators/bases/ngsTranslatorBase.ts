import { TranslatorBase } from "./translatorBase";
import { MessageSender } from "../../helpers/messageSenders/MessageSender";
import { GuildMember, Message, PermissionFlagsBits, User } from "discord.js";
import { debug } from "console";
import { DiscordGuilds } from "../../enums/DiscordGuilds";

export abstract class ngsTranslatorBase extends TranslatorBase {

    public async Verify(message: Message) {
        if ((message.member?.permissions.has(PermissionFlagsBits.Administrator) && message.guild?.id == DiscordGuilds.NGS))
            return true;

        return false;
    }
}