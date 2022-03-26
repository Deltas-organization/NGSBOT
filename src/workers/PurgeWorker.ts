import { GuildMember, Role, User } from "discord.js";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";
import { DiscordFuzzySearch } from "../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../helpers/MessageHelper";
import { INGSTeam } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";

const fs = require('fs');

export class PurgeWorker extends RoleWorkerBase {
    private _testing: boolean = false;
    private _mutedRole: Role;

    protected async Start(commands: string[]) {
        if (commands.length > 0)
            this._testing = true;

        this._mutedRole = this.roleHelper.lookForRole(NGSRoles.Muted);
        await this.BeginPurge();
    }

    private async BeginPurge() {
        const progressMessage = await this.messageSender.SendMessage("Beginning Purge \n  Loading teams now.");
        const teams = await this.dataStore.GetTeams();
        await progressMessage.Edit(`Purging STARTED... STAND BY...`);
        const messages: MessageHelper<IPurgeInformation>[] = [];
        const guildMembers = (await this.messageSender.originalMessage.guild.members.fetch()).map((mem, _, __) => mem);
        let count = 0;
        let progressCount = 1;
        for (let member of guildMembers) {
            count++;
            const teamInformation = await this.FindInTeam(member.user, teams);
            const messageHelper = new MessageHelper<IPurgeInformation>(member.user.username);
            const rolesOfUser = member.roles.cache.map((role, _, __) => role);
            messageHelper.Options.rolesRemovedCount = 0;
            var muted = this.HasRole(rolesOfUser, this._mutedRole);
            var hasTeam = teamInformation != null;
            if (!hasTeam || muted) {
                if (muted)
                    messageHelper.AddNewLine('Removed Roles as the person is muted')
                if (!hasTeam)
                    messageHelper.AddNewLine(`No Team Found.`);
                await this.PurgeAllRoles(member, messageHelper);
            }
            else {
                messageHelper.AddNewLine(`Team Found: ** ${teamInformation.NGSTeam.teamName} ** `);
                await this.PurgeUnrelatedRoles(member, teamInformation, messageHelper);
            }

            messages.push(messageHelper);
            if (count > (guildMembers.length / 4) * progressCount) {
                await progressMessage.Edit(`Purging \n Progress: ${progressCount * 25}%`);
                progressCount++;
            }
        }

        let removedRoles = messages.filter(message => message.Options.rolesRemovedCount > 0);
        let ignoredUsers = messages.filter(messages => messages.Options.ignoredUser);

        fs.writeFileSync('./files/purgedRoles.json', JSON.stringify({
            affectedUserCount: removedRoles.length,
            detailedInformation: removedRoles.map(message => message.CreateJsonMessage()),
            ignoredUsers: ignoredUsers.map(message => message.CreateJsonMessage())
        }));
        this.messageSender.TextChannel.send({
            files: [{
                attachment: './files/purgedRoles.json',
                name: 'purgedRoles.json'
            }]
        }).catch(console.error);

        await this.messageSender.SendMessage(`Finished Purging Roles! \n
            Removed ${removedRoles.map(m => m.Options.rolesRemovedCount).reduce((m1, m2) => m1 + m2, 0)} Roles`);

        await progressMessage.Delete();
    }

    HasRole(rolesOfUser: Role[], roleToLookFor: any): Role {
        return rolesOfUser.find(role => role == roleToLookFor);
    }

    private async ShouldRemoveRoles(guildMember: GuildMember) {
        if (guildMember.user.username == "Murda") {
            Globals.log("didnt remove murdas roles");
            return false;
        }

        return true;
    }

    private async FindInTeam(guildUser: User, teams: INGSTeam[]): Promise<teamInformation> {
        for (var team of teams) {
            const teamName = team.teamName;
            const allUsers = await this.dataStore.GetUsers();
            const teamUsers = allUsers.filter(user => user.teamName == teamName);
            for (var ngsUser of teamUsers) {
                const foundGuildUser = DiscordFuzzySearch.CompareGuildUser(ngsUser, guildUser)
                if (foundGuildUser) {
                    return new teamInformation(team, ngsUser);
                }
            }
        }

        return null;
    }

    private async PurgeAllRoles(guildMember: GuildMember, messageHelper: MessageHelper<IPurgeInformation>): Promise<void> {
        const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
        for (var role of rolesOfUser) {
            if (!this.reserveredRoles.find(serverRole => serverRole == role)) {
                if (this.myBotRole.comparePositionTo(role) > 0) {
                    try {
                        if (await this.ShouldRemoveRoles(guildMember)) {
                            await this.RemoveRole(guildMember, role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed Role: ${role.name}`, 4);
                        }
                        else {
                            messageHelper.Options.ignoredUser = true;
                            messageHelper.AddNewLine(`Wanted to remove role: ${role.name}, but didn't.`, 4)
                        }
                    }
                    catch (e) {
                        Globals.log("Error removing roles", e);
                    }
                }
            }
        }
    }

    private async PurgeUnrelatedRoles(guildMember: GuildMember, teamInformation: teamInformation, messageHelper: MessageHelper<any>): Promise<void> {
        try {
            const teamName = teamInformation.NGSTeam.teamName.toLowerCase().replace(/ /g, '');
            let teamDivRole = this.roleHelper.FindDivRole(teamInformation.NGSTeam.divisionDisplayName)?.role;
            let teamRole = this.roleHelper.lookForRole(teamName);
            const rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);
            for (var role of rolesOfUser) {
                if (!this.reserveredRoles.find(serverRole => role == serverRole)) {
                    if (role == teamRole) {
                        messageHelper.AddNewLine(`Kept Team: ${role.name}`, 4);
                    }
                    else if (role == teamDivRole) {
                        messageHelper.AddNewLine(`Kept Div: ${role.name}.`, 4);
                    }
                    else if (role == this.captainRole && (teamInformation.NGSUser.IsCaptain || teamInformation.NGSUser.IsAssistantCaptain)) {
                        messageHelper.AddNewLine("Kept Captain Role.", 4);
                    }
                    else if (this.myBotRole.comparePositionTo(role) > 0) {
                        if (await this.ShouldRemoveRoles(guildMember)) {
                            await this.RemoveRole(guildMember, role);
                            messageHelper.Options.rolesRemovedCount++;
                            messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                        }
                        else {
                            messageHelper.Options.ignoredUser = true;
                            messageHelper.AddJSONLine(`Wanted to remove role: ${role.name}, but didn't.`);
                        }
                    }
                }
                else if (role.name == NGSRoles.FreeAgents) {
                    if (this.myBotRole.comparePositionTo(role) > 0) {
                        await this.RemoveRole(guildMember, role);
                        messageHelper.Options.rolesRemovedCount++;
                        messageHelper.AddNewLine(`Removed: ${role.name}`, 4);
                    }
                }
            }
        }
        catch (e) {
            Globals.log("Error removing roles", e);
        }
    }

    private async RemoveRole(guildMember: GuildMember, role: Role) {
        if (!this._testing)
            await guildMember.roles.remove(role);
    }
}

class teamInformation {
    constructor(public NGSTeam: INGSTeam, public NGSUser: AugmentedNGSUser) { }
}

interface IPurgeInformation {
    rolesRemovedCount: number;
    ignoredUser: boolean;
}