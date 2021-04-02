import { MessageSender } from "../helpers/MessageSender";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { Globals } from "../Globals";

export class ConfigSetter extends DeltaTranslatorBase {

    public get commandBangs(): string[] {
        return ["config", "con"];
    }

    public get description(): string {
        return "Set config variables for more logging. Supports: basic (true), advanced (false), info";
    }

    constructor(translatorDependencies: CommandDependencies) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        var informAllState = false;
        for (var command of commands) {
            const lowerCaseCommand = command.toLowerCase();
            switch (lowerCaseCommand) {
                case 'basic':
                    Globals.EnableLogging = !Globals.EnableLogging;
                    this.InformLogState(messageSender);
                    break;
                case 'info':
                    informAllState = true;
                    break;
                case 'advanced':
                    Globals.EnableAdvancedLogging = !Globals.EnableAdvancedLogging;
                    this.InformAdvancedLogState(messageSender);
            }
        }
        if (informAllState) {
            this.InformLogState(messageSender);
            this.InformAdvancedLogState(messageSender);
        }
    }

    private InformLogState(messageSender: MessageSender) {
        messageSender.SendMessage(`Logging is: ${Globals.EnableLogging}`);
    }

    private InformAdvancedLogState(messageSender: MessageSender) {
        messageSender.SendMessage(`Advanced Logging is: ${Globals.EnableAdvancedLogging}`);
    }
}