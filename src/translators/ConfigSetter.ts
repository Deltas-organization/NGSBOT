import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { execFile } from "child_process";
import { ITranslate } from "../interfaces/ITranslator";
import { TranslatorBase } from "./bases/translatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { Globals } from "../Globals";
import { globalAgent } from "http";

export class ConfigSetter extends DeltaTranslatorBase {

    public get commandBangs(): string[] {
        return ["config", "con"];
    }

    public get description(): string {
        return "Will delete the last message sent by the bot on this server";
    }

    constructor(translatorDependencies: TranslatorDependencies) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        var informAllState = false;
        for (var command of commands) {
            const lowerCaseCommand = command.toLowerCase();
            switch (lowerCaseCommand) {
                case 'log':
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