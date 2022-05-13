import { Message } from "discord.js";
import { MessageSender } from "../helpers/messageSenders/MessageSender";

export interface ITranslate {
    commandBangs: string[];
    description: string;

    Translate(command: string, message: Message)

    Verify(mesage: Message): boolean | Promise<Boolean>;
}