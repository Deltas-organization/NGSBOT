import { TranslatorBase } from "./translatorBase";
import { Message } from "discord.js";

export abstract class DeltaTranslatorBase extends TranslatorBase {

    public async Verify(message: Message)
    {        
        if(message.member.user.id == "163779571060178955")
            return true;

        return false;
    }
}