import { TranslatorBase } from "./translatorBase";
import { Message } from "discord.js";

export abstract class AdminTranslatorBase extends TranslatorBase {

    public async Verify(message: Message)
    {        
        if(message.member.permissions.has('ADMINISTRATOR'))
            return true;

        return false;
    }
}