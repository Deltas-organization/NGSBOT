import { Client, Guild, GuildMember, MessageAttachment, Role, TextChannel, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { debug } from "console";
import { TeamNameChecker } from "./TeamChecker";
import { ngsTranslatorBase } from "./bases/ngsTranslatorBase";
import { MessageHelper } from "../helpers/MessageHelper";
import { isFunctionDeclaration } from "typescript";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";

const fs = require('fs');

export class DeleteTeamRoles extends DeltaTranslatorBase
{
    private _serverRoles: Role[];
    private _myRole: Role;
    
    public get commandBangs(): string[]
    {
        return ["TeamPurge"];
    }

    public get description(): string
    {
        return "Will remove all NGS Team Roles";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)
    {
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        try
        {
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName)))
            {
                const teamName = team.teamName;
                const teamRoleOnDiscord = await this.FindTeamRole(teamName);
                if(teamRoleOnDiscord)
                    await teamRoleOnDiscord.delete();
            }
        }
        catch (e)
        {
            Globals.log(e);
        }
        await messageSender.SendMessage(`Finished deleting Roles!`);
    }

    private ReloadServerRoles(guild: Guild)
    {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async FindTeamRole(teamName: string)
    {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1)
        {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName)
        if (!teamRoleOnDiscord)
        {
            return null;
        }
        return teamRoleOnDiscord
    }

    private lookForRole(userRoles: Role[], roleName: string): Role
    {
        let roleNameTrimmed = roleName.trim().toLowerCase();

        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles)
        {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces)
            {
                return role;
            }
        }
        return null;
    }
}