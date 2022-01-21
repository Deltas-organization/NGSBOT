import { EmojiIdentifierResolvable, Message } from "discord.js";
import { MessageSender } from "./MessageSender";

export class MessageWrapper {

    constructor(private _messageSender: MessageSender, public Message: Message) {

    }

    public async Edit(newMessage: string) {
        return await this._messageSender.Edit(this.Message, newMessage);
    }

    public async Delete() {
        return await this.Message.delete()
    }
}