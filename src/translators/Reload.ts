import { MessageSender } from "../helpers/messageSenders/MessageSender";
import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";

export class Reload extends DeltaTranslatorBase {

    public get commandBangs(): string[] {
        return ["reload"];
    }

    public get description(): string {
        return "Will reload the user, teams, and divisions stored in the cache";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        this.dataStore.Clear();
        await this.dataStore.GetDivisions();
        let message = await messageSender.SendMessage("Reloaded 1/4");
        await this.dataStore.GetScheduledGames();
        await message.Edit("Reloaded 2/4");
        await this.dataStore.GetTeams();
        await message.Edit("Reloaded 3/4");
        await this.dataStore.GetUsers();
        await message.Edit("Reload Complete");
    }
}