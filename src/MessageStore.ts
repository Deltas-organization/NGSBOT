import { Message } from "discord.js";

export class MessageStore {

    private messages: Message[] = [];

    public AddMessage(message: Message) {
        this.messages.push(message);
    }

    public DeleteMessage(amountToDelete: number) {
        let messagesToDelete = this.messages.splice(this.messages.length - amountToDelete);
        for (var i = 0; i < messagesToDelete.length; i++) {
            messagesToDelete[i].delete();
        }
    }
}