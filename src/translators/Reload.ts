import { MessageSender } from "../helpers/MessageSender";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";

export class Reload extends DeltaTranslatorBase {

    public get commandBangs(): string[] {
        return ["reload"];
    }

    public get description(): string {
        return "Will reload the user, teams, and divisions stored in the cache";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        this.dataStore.Clear();
        await this.dataStore.GetDivisions();
        let message = await messageSender.SendMessage("Reloaded 1/4");
        await this.dataStore.GetSchedule();
        await messageSender.Edit(message, "Reloaded 2/4");
        await this.dataStore.GetTeams();
        await messageSender.Edit(message, "Reloaded 3/4");
        await this.dataStore.GetUsers();
        await messageSender.Edit(message, "Reload Complete");
    }
}