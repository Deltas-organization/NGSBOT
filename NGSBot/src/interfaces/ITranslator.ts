import { Message } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";

export interface ITranslate {
    commandBangs: string[];
    description: string;

    Translate(command: string, message: Message)

    Verify(mesage: Message): boolean | Promise<Boolean>;
}