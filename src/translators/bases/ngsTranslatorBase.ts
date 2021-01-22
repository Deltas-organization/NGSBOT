import { TranslatorBase } from "./translatorBase";
import { MessageSender } from "../../helpers/MessageSender";
import { GuildMember, Message, User } from "discord.js";
import { debug } from "console";

export abstract class ngsTranslatorBase extends TranslatorBase {

    public async Verify(message: Message)
    {        
        if(message.member.user.id == "163779571060178955" || (message.member.permissions.has('ADMINISTRATOR') && message.guild.id == "325846370730901504"))
            return true;

        return false;
    }

    protected IsAuthenticated(memberToCheck: GuildMember): boolean
    {
        if(memberToCheck.user.id == "163779571060178955" || memberToCheck.permissions.has('ADMINISTRATOR'))
            return true;

        return false;
    }
}