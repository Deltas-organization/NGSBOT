import { TranslatorBase } from "./translatorBase";
import { MessageSender } from "../../helpers/MessageSender";
import { Message } from "discord.js";
import { debug } from "console";

export abstract class AdminTranslatorBase extends TranslatorBase {

    public async Verify(message: Message)
    {        
        if(message.member.permissions.has('ADMINISTRATOR'))
            return true;

        return false;
    }
}