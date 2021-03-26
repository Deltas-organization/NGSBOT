import { Message } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { DiscordMembers } from "../../enums/DiscordMembers";
import { TranslatorBase } from "./translatorBase";

export abstract class SpecificChannelBase extends TranslatorBase {


    public async Verify(message: Message) {

        if (this.getAllowedChannels().find(channel => channel == message.channel.id))
            return true;

        return false;
    }

    protected abstract getAllowedChannels(): DiscordChannels[];
}