import { Client, Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";

var fs = require('fs');

export class RegisteredCount extends AdminTranslatorBase {

    private _serverRoles: Role[];

    public get commandBangs(): string[] {
        return ["registered"];
    }

    public get description(): string {
        return "Will Return number of registered teams and users.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        const numberOfTeams = (await this.liveDataStore.GetTeams()).length;
        const numberOfPlayers = (await this.liveDataStore.GetUsers()).length;

        await message.SendMessage(`Registered Team Count: ${numberOfTeams} \n Number of users on said teams: ${numberOfPlayers}`);
    }
}