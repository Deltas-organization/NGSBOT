import { Message } from "discord.js";
import { ScheduleHelper } from "../helpers/ScheduleHelper";
import { WorkerBase } from "./Bases/WorkerBase";

export class NonCastedWorker extends WorkerBase {    
    private _messageCommand: (message: string[], storeMessage?: boolean) => Promise<Message[]>;

    protected async Start(commands: string[]) {        
        this._messageCommand = (messages: string[], _?: boolean) => this.messageSender.DMMessages(messages);
        if (this.detailed) {
            this._messageCommand = (messages: string[], storeMessage?: boolean) => this.messageSender.SendMessages(messages, storeMessage);
        }

        let futureDays = 99;
        if (commands.length > 0) {
            let parsedNumber = parseInt(commands[0]);
            if (isNaN(parsedNumber)) {
                await this.messageSender.SendMessage(`The parameter ${commands[0]} is not a valid number`);
                return;
            }
            futureDays = parsedNumber - 1;
        }
        let nonCastedGames = await this.GetNonCastedGames(futureDays);
        if (nonCastedGames.length <= 0) {
            await this.messageSender.SendMessage("All games have a caster");
        }
        else {
            let messages = await ScheduleHelper.GetMessages(nonCastedGames);
            await this._messageCommand(messages);
        }
        this.messageSender.originalMessage.delete();
    }

    protected async GetNonCastedGames(futureDays: number) {
        let futureGames = ScheduleHelper.GetFutureGamesSorted(await this.dataStore.GetSchedule());
        futureGames = futureGames.filter(game => ScheduleHelper.GetGamesBetweenDates(game, futureDays));
        return futureGames.filter(game => !game.casterName);
    }
}