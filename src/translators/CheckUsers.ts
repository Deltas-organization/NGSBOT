import { Client, Guild, GuildMember, Role, User } from "discord.js";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../Globals";

var fs = require('fs');

export class CheckUsers extends AdminTranslatorBase {

    private _serverRoles: Role[];

    public get commandBangs(): string[] {
        return ["check"];
    }

    public get description(): string {
        return "Will Check all users for discord tags and relevant team roles.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        let members = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        this.ReloadServerRoles(message);
        for (var member of members) {
            await this.EnsureUserRoles(message, member, detailed);
        }
    }

    private ReloadServerRoles(message: MessageSender) {
        this._serverRoles = message.originalMessage.guild.roles.cache.map((role, _, __) => role);
        Globals.log(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }

    private async EnsureUserRoles(message: MessageSender, guildMember: GuildMember, promptEvenIfAlreadyAssignedRole: boolean) {
        const guildUser = guildMember.user;
        try {
            var users = await this.liveDataStore.GetUsers();
        }
        catch {
            Globals.log("Problem with retrieving users");
            return;
        }

        let discordName = `${guildUser.username}#${guildUser.discriminator}`;
        for (var user of users) {
            let ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
            if (ngsDiscordId == discordName.toLowerCase()) {

                var rolesOfUser = guildMember.roles.cache.map((role, _, __) => role);

                let roleOnServer = this.lookForRole(this._serverRoles, user.teamName);
                if (!roleOnServer) {
                    let role = await this.AskIfYouWantToAddRoleToServer(message, user);
                    if (role) {
                        this._serverRoles.push(role);
                        roleOnServer = role;
                    }
                    else {
                        continue;
                    }
                }

                const hasRole = this.lookForRole(rolesOfUser, user.teamName);
                if (!hasRole || promptEvenIfAlreadyAssignedRole) {
                    Globals.log(`User: ${guildUser.username} on Team: ${user.teamName}. Doesn't have a matching role, current user Roles: ${rolesOfUser.map(role => role.name)}. Found Existing role: ${roleOnServer.name}`);

                    var added = await this.AskIfYouWantToAddUserToRole(message, guildMember, roleOnServer, promptEvenIfAlreadyAssignedRole);
                    if (added) {
                        await message.SendMessage(`${guildMember.displayName} has been added to role: ${roleOnServer.name}`);
                    }
                    else if (added == false) {
                        await message.SendMessage(`${guildMember.displayName} has been removed from role: ${roleOnServer.name}`);
                    }
                }
                return true;
            }
        }

        Globals.logAdvanced(`unable to find user: ${user.displayName}, no matching discord id registered.`);
        return false;
    }

    private lookForRole(userRoles: Role[], teamName: string): Role {
        let team = teamName.trim();
        const indexOfWidthdrawn = team.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            team = team.slice(0, indexOfWidthdrawn).trim();
        }

        team = team.toLowerCase();
        const teamWithoutSpaces = team.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === team)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }

    private async AskIfYouWantToAddRoleToServer(messageSender: MessageSender, user: INGSUser) {
        let role: Role;
        let reactionResponse = await messageSender.SendReactionMessage(`It looks like the user: ${user.displayName} is on team: ${user.teamName}, but there is not currently a role for that team. Would you like me to create this role?`,
            (member) => this.IsAuthenticated(member),
            async () => {
                role = await messageSender.originalMessage.guild.roles.create({
                    data: {
                        name: user.teamName,
                    },
                    reason: 'needed a new team role added'
                });
            });

        reactionResponse.message.delete();
        return role;
    }

    private async AskIfYouWantToAddUserToRole(messageSender: MessageSender, memberToAskAbout: GuildMember, roleToManipulate: Role, andRemove: boolean): Promise<boolean> {
        let reactionResponse = await messageSender.SendReactionMessage(`From what I can see, ${memberToAskAbout.displayName} belongs to team: ${roleToManipulate.name}, but they don't have the role at the moment.  Would you like to add${(andRemove && '/remove') || ''} them to the role?`,
            (member) => this.IsAuthenticated(member),
            () => memberToAskAbout.roles.add(roleToManipulate),
            () => {
                if (andRemove)
                    memberToAskAbout.roles.remove(roleToManipulate);
            });

        reactionResponse.message.delete();
        return reactionResponse.response;
    }
}