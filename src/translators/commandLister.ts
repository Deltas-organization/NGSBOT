import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { execFile } from "child_process";
import { ITranslate } from "../interfaces/ITranslator";
import { TranslatorBase } from "./bases/translatorBase";

export class CommandLister extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["commands"];
    }

    public get description(): string {
        return "Lists the available commands";
    }

    constructor(client: Client, private translators: ITranslate[]) {
        super(client);
    }

    protected Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        let fields = [];
        this.translators.forEach(translator => {
            if (translator.Verify(messageSender.originalMessage))
                fields.push({ name: translator.commandBangs.map(c => c += " "), value: translator.description });
        });
        messageSender.SendFields(`Available Commands. \n appending -d will perform the command but return more detail if available \n Ex: !name-d`, fields);
    }
}