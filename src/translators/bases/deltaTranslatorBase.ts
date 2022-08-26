import { TranslatorBase } from "./translatorBase";
import { Message } from "discord.js";
import { DiscordMembers } from "../../enums/DiscordMembers";

export abstract class DeltaTranslatorBase extends TranslatorBase {

    public async Verify(message: Message) {
        if (message.member?.user.id == DiscordMembers.Delta)
            return true;

        return false;
    }
}