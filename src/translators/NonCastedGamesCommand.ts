import { Message } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { MessageSender } from "../helpers/MessageSender";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { SpecificChannelBase } from "./bases/SpecificChannelBase";
import { TranslatorBase } from "./bases/translatorBase";

export class NonCastedGamesCommand extends SpecificChannelBase {
    private _multiMessageCommand: (message: string[], storeMessage?: boolean) => Promise<Message[]>;

    public get commandBangs(): string[] {
        return ["noncasted"];
    }

    public get description(): string {
        return "Will Return the games that don't currently have a caster. Can Specify a number to clamp the result within that number of days in the future.";
    }

    protected getAllowedChannels(): DiscordChannels[] {
        return [DiscordChannels.DeltaServer, DiscordChannels.NGSDiscord]
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        this._multiMessageCommand = (messages: string[], _?: boolean) => messageSender.DMMessages(messages);
        if (detailed) {
            this._multiMessageCommand = (messages: string[], storeMessage?: boolean) => messageSender.SendMessages(messages, storeMessage);
        }

        let futureDays = 99;
        if (commands.length > 0) {
            let parsedNumber = parseInt(commands[0])
            if (isNaN(parsedNumber)) {
                await messageSender.SendMessage(`The parameter ${commands[0]} is not a valid number`)
                return;
            }
            futureDays = parsedNumber - 1;
        }
        let nonCastedGames = await this.GetNonCastedGames(futureDays);
        if (nonCastedGames.length <= 0) {
            await messageSender.SendMessage("All games have a caster");
        }
        else {
            let messages = await ScheduleHelper.GetMessages(nonCastedGames);
            await this._multiMessageCommand(messages);
        }
        messageSender.originalMessage.delete();
    }

    protected async GetNonCastedGames(futureDays: number) {
        let futureGames = ScheduleHelper.GetFutureGamesSorted(await this.liveDataStore.GetSchedule());
        futureGames = futureGames.filter(game => ScheduleHelper.GetGamesBetweenDates(game, futureDays));
        return futureGames.filter(game => !game.casterName);
    }
}