import { Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { INGSTeam, INGSUser } from "../interfaces";
import { Globals } from "../Globals";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { NGSRoles } from "../enums/NGSRoles";
import { RoleHelper } from "../helpers/RoleHelper";
import { LeaveWorker } from "../workers/LeaveWorker";


const fs = require('fs');

export class Leave extends ngsTranslatorBase {

    public get commandBangs(): string[] {
        return ["leave"];
    }

    public get description(): string {
        return "Will prompt user for role removals.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new LeaveWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}