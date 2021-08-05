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
import { DisplayUnusedRoles } from "../workers/DisplayUnusedRoles";

const fs = require('fs');

export class UnUsedRoles extends ngsTranslatorBase
{
    public get commandBangs(): string[]
    {
        return ["roles"];
    }

    public get description(): string
    {
        return "Will Check all roles in the server and compare to team on the webstie.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        const rolesWorker = new DisplayUnusedRoles(this.translatorDependencies, detailed, messageSender);
        await rolesWorker.Begin(commands);
    }
}