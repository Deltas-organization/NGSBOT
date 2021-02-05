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

const fs = require('fs');

export class AssignRoles extends ngsTranslatorBase {
    private _serverRoles: Role[];
    private _stopIteration = false;
    private readonly _captainRoleName = 'Captains';

    private _reservedRoleNames: string[] = [
        this._captainRoleName,
        'Caster Hopefuls',
        'Free Agents',
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        DivisionRole.Storm,
        DivisionRole.Heroic,
        DivisionRole.DivA,
        DivisionRole.DivB,
        DivisionRole.DivC,
        DivisionRole.DivD,
        DivisionRole.DivE,
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'FA Combine',
        '@everyone'];

    private _reserveredRoles: Role[] = [];
    private _myRole: Role;
    private _captainRole: Role;

    public get commandBangs(): string[] {
        return ["assign"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        this._stopIteration = false;
        // this.liveDataStore.Clear();
        this.ReloadServerRoles(messageSender.originalMessage.guild);
        this.ReloadResservedRoles();
        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const rolesAdded = [];
        const messagesLog: MessageHelper<MessageOptions>[] = [];
        try {
            const guildMembers = (await messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
            for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                let messageHelper = await this.AssignValidRoles(messageSender, team, guildMembers, rolesAdded);
                if (messageHelper) {
                    messagesLog.push(messageHelper);
                    if (detailed) {
                        if (!messageHelper.Optional) {
                            await messageSender.SendMessage(messageHelper.CreateStringMessage());
                        }
                    }
                }
                if (this._stopIteration)
                    break;
            }
            if (!detailed) {
                fs.writeFileSync('./files/assignedRoles.json', JSON.stringify({
                    AddedRoles: rolesAdded,
                    discordIds: guildMembers.map(guildMember => this.GetDiscordId(guildMember) + " : " + guildMember.id),
                    detailedInformation: messagesLog.map(message => message.CreateJsonMessage())
                }));
                messageSender.TextChannel.send({
                    files: [{
                        attachment: './files/assignedRoles.json',
                        name: 'AssignRolesReport.json'
                    }]
                }).catch(console.error);
            }
        }
        catch (e) {
            Globals.log(e);
        }
        await messageSender.SendMessage(`Finished Assigning Roles! \n 
        Added ${messagesLog.map(m => m.Options.AssignedTeamCount).reduce((m1, m2) => m1 + m2, 0)} teamRoles \n
        Added ${messagesLog.map(m => m.Options.AssignedCaptainCount).reduce((m1, m2) => m1 + m2, 0)} Captain Roles`);
    }

    private ReloadResservedRoles() {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole) {
                this._reserveredRoles.push(foundRole);
                if (foundRole.name == this._captainRoleName)
                    this._captainRole = foundRole;
            }
            else
                Globals.logAdvanced(`didnt find role: ${roleName}`);
        }
    }

    private ReloadServerRoles(guild: Guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async AssignValidRoles(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[], rolesAdded: string[]) {
        const teamName = team.teamName;
        const teamRoleOnDiscord = await this.CreateOrFindTeamRole(messageSender, teamName, rolesAdded);
        const divRoleOnDiscord = null;//this.FindDivRole(team.divisionName);

        return await this.AssignUsersToRoles(team, guildMembers, teamRoleOnDiscord, divRoleOnDiscord);
    }

    private async CreateOrFindTeamRole(messageSender: MessageSender, teamName: string, rolesAdded: string[]) {
        teamName = teamName.trim();
        const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            teamName = teamName.slice(0, indexOfWidthdrawn).trim();
        }

        let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName)
        if (!teamRoleOnDiscord) {
            rolesAdded.push(teamName);
            teamRoleOnDiscord = await messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
                    mentionable: true,     
                    hoist: true               
                },
                reason: 'needed a new team role added'
            });
        }

        return teamRoleOnDiscord
    }

    private FindDivRole(divisionDisplayName: string) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
                divRoleName = divRoleName.DivA;
                break;
            case "b west":
            case "b east":
                divRoleName = divRoleName.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = divRoleName.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = divRoleName.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = divRoleName.DivE;
                break;
            case "storm":
            case "storm":
                divRoleName = divRoleName.Storm;
                break;
            case "heroic":
            case "heroic":
                divRoleName = divRoleName.Heroic;
                break;
        }
        return this.lookForRole(this._serverRoles, divRoleName);
    }

    private lookForRole(userRoles: Role[], roleName: string): Role {
        let roleNameTrimmed = roleName.trim().toLowerCase();

        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }

    private FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): GuildMember {
        const ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordId)
            return null;

        const splitNgsDiscord = ngsDiscordId.split("#");
        if (splitNgsDiscord.length != 2)
            return null;

        const ngsUserName = splitNgsDiscord[0].toLowerCase();
        const ngsDiscriminator = splitNgsDiscord[1];
        const filteredByDiscriminator = guildMembers.filter(member => member.user.discriminator == ngsDiscriminator);
        const possibleMembers = [];
        for (let member of filteredByDiscriminator) {
            const discordName = this.GetDiscordId(member);
            if (discordName == ngsDiscordId) {
                return member;
            }
            else if (member.user.username.toLowerCase().indexOf(ngsUserName) > -1) {
                Globals.log(`FuzzySearch!! Website has: ${ngsUserName}, Found: ${member.user.username}`)
                possibleMembers.push(member);
            }
        }
        if (possibleMembers.length == 1) {
            return possibleMembers[0];
        }
        return null;
    }

    private async AssignUsersToRoles(team: INGSTeam, guildMembers: GuildMember[], ...rolesToLookFor: Role[]): Promise<MessageHelper<MessageOptions>> {
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == team.teamName);

        let message = new MessageHelper<MessageOptions>(team.teamName);
        message.Options.AssignedTeamCount = 0;
        message.Options.AssignedCaptainCount = 0;
        message.AddNewLine("**Team Name**");;
        message.AddNewLine(team.teamName);
        message.AddNewLine("**Users**");
        let foundOne = false;
        for (let user of teamUsers) {
            const guildMember = this.FindGuildMember(user, guildMembers);
            message.AddNewLine(`${user.displayName} : ${user.discordTag}`);
            if (guildMember) {
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                message.AddNewLine(`**Current Roles**: ${rolesOfUser.join(',')}`, 4);
                message.AddJSONLine(`**Current Roles**: ${rolesOfUser.map(role => role.name).join(',')}`);
                for (var roleToLookFor of rolesToLookFor) {
                    if (roleToLookFor != null && !this.HasRole(rolesOfUser, roleToLookFor)) {
                        await guildMember.roles.add(roleToLookFor);
                        foundOne = true;
                        message.Options.AssignedTeamCount++;
                        message.AddNewLine(`**Assigned Role:** ${roleToLookFor}`, 4);
                        message.AddJSONLine(`**Assigned Role:**: ${roleToLookFor?.name}`);
                    }
                }
                if (user.IsCaptain || user.IsAssistantCaptain) {
                    if (this._captainRole && !this.HasRole(rolesOfUser, this._captainRole)) {
                        await guildMember.roles.add(this._captainRole);
                        foundOne = true;
                        message.Options.AssignedCaptainCount++;
                        message.AddNewLine(`**Assigned Role:** ${this._captainRole}`, 4);
                        message.AddJSONLine(`**Assigned Role:**: ${this._captainRole.name}`);
                    }
                }
            }
            else {
                message.AddNewLine(`**No Matching DiscordId Found**`, 4);
            }
        }
        if (!foundOne) {
            message.Optional = true;
            return message;
        }
        return message;
    }

    private HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }

    private GetDiscordId(member: GuildMember) {
        const guildUser = member.user;
        return `${guildUser.username}#${guildUser.discriminator}`.replace(' ', '').toLowerCase();
    }
}

enum DivisionRole {
    DivA = 'Division A',
    DivB = 'Division B',
    DivC = 'Division C',
    DivD = 'Division D',
    DivE = 'Division E',
    Heroic = 'Heroic Division',
    Storm = 'Storm Division',
}

class MessageOptions {
    public AssignedTeamCount: number;
    public AssignedCaptainCount: number;
}
