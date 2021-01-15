import { Client, Guild, GuildMember, Role, TextChannel, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";
import { debug } from "console";

var fs = require('fs');

export class Roles extends AdminTranslatorBase {

    private _serverRoles: Role[];
    private _stopIteration = false;

    private _reservedRoleNames: string[] = [
        'Captains',
        'Caster Hopefuls',
        'Free Agents',
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        'Storm Division',
        'Heroic Division',
        'Division A',
        'Division B',
        'Division C',
        'Division D',
        'Division E',
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

    public get commandBangs(): string[] {
        return ["roles"];
    }

    public get description(): string {
        return "Will Check all teams for users with discord tags and will assign roles.";
    }

    constructor(translatorDependencies: TranslatorDependencies, private liveDataStore: LiveDataStore) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        this._stopIteration = false;
        const guildMembers = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        this.ReloadServerRoles(message.originalMessage.guild);
        this.ReloadResservedRoles(message.originalMessage.guild);
        this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
        const teams = await this.liveDataStore.GetTeams();
        const rolesNotFound = [];
        for (var team of teams) {
            await this.DisplayTeamInformation(message, team, guildMembers, rolesNotFound);
            if (this._stopIteration)
                break;
        }
        message.SendMessage(`Unable to find roles: ${rolesNotFound.join(', ')}`);
        console.log("Done");
    }

    ReloadResservedRoles(guild: Guild) {
        this._reserveredRoles = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this.lookForRole(this._serverRoles, roleName);
            if (foundRole)
                this._reserveredRoles.push(foundRole);
            else
                console.log(`didnt find role: ${roleName}`);
        }
    }

    private ReloadServerRoles(guild: Guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async DisplayTeamInformation(messageSender: MessageSender, team: INGSTeam, guildMembers: GuildMember[], rolesNotFound: string[]) {
        const teamName = team.teamName;
        const allUsers = await this.liveDataStore.GetUsers();
        const teamUsers = allUsers.filter(user => user.teamName == teamName);
        let roleOnServer = this.lookForRole(this._serverRoles, teamName)
        if (!roleOnServer) {
            rolesNotFound.push(teamName);
            return;
            roleOnServer = await messageSender.originalMessage.guild.roles.create({
                data: {
                    name: teamName,
                },
                reason: 'needed a new team role added'
            });
        }

        let message = "**Team Name** \n";
        message += `${teamName} \n`;
        message += await this.GetMembersMessage(teamUsers, guildMembers, roleOnServer);

        await messageSender.SendMessage(message);
        return false;
    }

    private lookForRole(userRoles: Role[], roleName: string): Role {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }

        roleNameTrimmed = roleNameTrimmed.toLowerCase();
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

    private async AskIfYouWantToAddRoleToServer(messageSender: MessageSender, teamName: string) {
        let role: Role;
        let reactionResponse = await messageSender.SendReactionMessage(`It looks like the team: ${teamName} has registered, but there is not currently a role for that team. Would you like me to create this role?`,
            (member) => this.IsAuthenticated(member),
            async () => {
                role = await messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: teamName,
                    },
                    reason: 'needed a new team role added'
                });
            });

        reactionResponse.message.delete();
        if (reactionResponse.response == null)
            this._stopIteration = true;
        return role;
    }

    private FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): GuildMember {
        const ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
        for (let member of guildMembers) {
            const guildUser = member.user;
            const discordName = `${guildUser.username}#${guildUser.discriminator}`.toLowerCase();
            if (discordName == ngsDiscordId) {
                return member;
            }
        }
        return null;
    }

    private async GetMembersMessage(teamUsers: INGSUser[], guildMembers: GuildMember[], teamRole: Role) {
        let message = "**Users** \n";
        for (let user of teamUsers) {
            const guildMember = this.FindGuildMember(user, guildMembers);
            message += `${user.displayName} \n`;
            if (guildMember) {
                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
                message += "\u200B \u200B \u200B \u200B **Current Roles** \n";
                message += `\u200B \u200B \u200B \u200B ${rolesOfUser.join(',')} \n`;
                if (!rolesOfUser.find(role => role == teamRole)) {
                    //await guildMember.roles.add(teamRole);
                    message += `\u200B \u200B \u200B \u200B **Assigned Role:** ${teamRole} \n`;
                }
                for (var role of rolesOfUser) {
                    if (role == teamRole)
                        continue;
                    if (!this._reserveredRoles.find(serverRole => serverRole.name == role.name)) {
                        if(this._myRole.comparePositionTo(role) > 0)                        
                        try {
                            //await guildMember.roles.remove(role);
                            message += `\u200B \u200B \u200B \u200B **Removed Role:** ${role} \n`
                        }
                        catch (e) {

                        }
                    }
                }
            }
            else {
                message += `\u200B \u200B \u200B \u200B **Not Found** \n`;
            }
        }
        return message;
    }

    public async CheckUsers(channelID: string) {
        var myChannel = this.translatorDependencies.client.channels.cache.find(channel => channel.id == channelID) as TextChannel;
        this._stopIteration = false;
        const ngsUsers = await this.liveDataStore.GetUsers();
        const guildMembers = myChannel.guild.members.cache.map((mem, _, __) => mem);
        this.ReloadServerRoles(myChannel.guild);
        let message = "";
        for (var ngsUser of ngsUsers) {
            const guildMember = this.FindGuildMember(ngsUser, guildMembers);
            if (guildMember) {
                const teamName = ngsUser.teamName;
                let roleOnServer = this.lookForRole(this._serverRoles, teamName)
                if (!roleOnServer) {
                    message += `Added role for team: ${teamName} \n`;
                    // roleOnServer = await myChannel.guild.roles.create({
                    //     data: {
                    //         name: teamName,
                    //     },
                    //     reason: 'needed a new team role added'
                    // });
                    this._serverRoles.push(roleOnServer);
                }
                message += `Assigned: ${ngsUser.displayName} to role: ${teamName}. \n`;
                // guildMember.roles.add(roleOnServer);
            }
        }
        await myChannel.send({
            embed: {
                color: 0,
                description: message
            }
        });
    }
}