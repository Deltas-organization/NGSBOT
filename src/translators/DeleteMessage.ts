import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { execFile } from "child_process";
import { ITranslate } from "../interfaces/ITranslator";
import { TranslatorBase } from "./bases/translatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { DeleteMessageWorker } from "../workers/DeleteMessageWorker";

export class DeleteMessage extends AdminTranslatorBase {

    public get commandBangs(): string[] {
        return ["delete", "del"];
    }

    public get description(): string {
        return "Will delete the last message sent by the bot on this server";
    }

    constructor(translatorDependencies: CommandDependencies) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new DeleteMessageWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}