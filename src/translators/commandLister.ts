import { ITranslate } from "../interfaces/ITranslator";
import { TranslatorBase } from "./bases/translatorBase";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";

export class CommandLister extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["commands"];
    }

    public get description(): string {
        return "Lists the available commands";
    }

    constructor(translatorDependencies: CommandDependencies, private translators: ITranslate[]) {
        super(translatorDependencies);
    }

    protected Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        let fields = [];
        this.translators.forEach(translator => {
            if (translator.Verify(messageSender.originalMessage))
                fields.push({ name: translator.commandBangs.map(c => c += " "), value: translator.description });
        });
        messageSender.SendFields(`Available Commands. \n appending -d will perform the command but return more detail if available \n Ex: >games-d`, fields);
    }
}