import { MessageSender } from "../helpers/MessageSender";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";

export class RegisteredCount extends AdminTranslatorBase {

    public get commandBangs(): string[] {
        return ["registered"];
    }

    public get description(): string {
        return "Will Return number of registered teams and users.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        const numberOfTeams = (await this.dataStore.GetTeams()).length;
        const numberOfPlayers = (await this.dataStore.GetUsers()).length;

        await message.SendMessage(`Registered Team Count: ${numberOfTeams} \n Number of users on said teams: ${numberOfPlayers}`);
    }
}