import { MessageSender } from "../helpers/MessageSender";
import { Client } from "discord.js";
import { execFile } from "child_process";
import { ITranslate } from "../interfaces/ITranslator";
import { TranslatorBase } from "./bases/translatorBase";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";

export class DeleteMessage extends AdminTranslatorBase {

    public get commandBangs(): string[] {
        return ["delete", "del"];
    }

    public get description(): string {
        return "Will delete the last message sent by the bot on this server";
    }

    constructor(translatorDependencies: TranslatorDependencies) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {

        let amountToDelete = 1;
        if (commands.length > 0) {
            let parsedNumber = parseInt(commands[0])
            if (!isNaN(parsedNumber)) {
                amountToDelete = parsedNumber;
            }
        }

        var message = await messageSender.SendMessage(`would you like me to delete my last ${amountToDelete} message${(amountToDelete > 1 && 's?') || '?'}`, false);
        message.react('✅');
        const filter = (reaction, user) => {
            return ['✅'].includes(reaction.emoji.name) && user.id === messageSender.originalMessage.author.id;
        };

        var collectedReactions = await message.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
        if (collectedReactions.first().emoji.name === '✅') {
            this.translatorDependencies.messageStore.DeleteMessage(amountToDelete);
        }
        message.delete();
        messageSender.originalMessage.delete();
    }
}