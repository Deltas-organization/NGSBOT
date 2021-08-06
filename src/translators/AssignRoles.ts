import { Guild, GuildMember, Role } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { MessageHelper } from "../helpers/MessageHelper";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { NGSRoles } from "../enums/NGSRoles";
import { RoleHelper } from "../helpers/RoleHelper";
import { AssignRolesOptions } from "../message-helpers/AssignRolesOptions";
import { AssignRolesWorker } from "../workers/AssignRolesWorker";

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase
{
    public get commandBangs(): string[]
    {
        return ["assign"];
    }

    public get description(): string
    {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        const assignRolesWorker = new AssignRolesWorker(this.translatorDependencies, detailed, messageSender, this.apiKey);
        await assignRolesWorker.Begin(commands);
    }
}