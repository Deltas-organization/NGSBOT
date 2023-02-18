import { TranslatorBase } from "./translatorBase";
import { Message, PermissionFlagsBits } from "discord.js";

export abstract class AdminTranslatorBase extends TranslatorBase {

    public async Verify(message: Message) {
        if (message.member?.permissions.has(PermissionFlagsBits.Administrator))
            return true;

        return false;
    }
}