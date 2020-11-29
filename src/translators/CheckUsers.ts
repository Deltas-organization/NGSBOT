import { Client, Guild, GuildMember, Message, User } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSUser } from "../interfaces";
import { AdminTranslatorBase } from "./bases/adminTranslatorBase";
import { Globals } from "../globals";

var fs = require('fs');

export class CheckUsers extends AdminTranslatorBase {

    public get commandBangs(): string[] {
        return ["check"];
    }

    public get description(): string {
        return "Will Check all users for discord tags and relevant team roles.";
    }

    constructor(translatorDependencies: TranslatorDependencies, private liveDataStore: LiveDataStore) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        let members = message.originalMessage.guild.members.cache.map((mem, _, __) => mem);
        let availableRoles = message.originalMessage.guild.roles.cache.map((role, _, __) => role.name);
        Globals.log(`available Roles: ${availableRoles}`);
        for (var member of members) {
            await this.findUserInNGS(message, member, availableRoles);
        }
    }

    private async findUserInNGS(message: MessageSender, guildMember: GuildMember, serverRoles: string[]) {
        const guildUser = guildMember.user;
        let users = await this.liveDataStore.GetUsers();
        let discordName = `${guildUser.username}#${guildUser.discriminator}`;
        let messageContainer = [];
        for (var user of users) {
            let ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
            if (ngsDiscordId == discordName.toLowerCase()) {

                var roles = guildMember.roles.cache.map((role, _, __) => role.name);

                const hasRole = this.lookForRole(roles, user.teamName);
                if (hasRole)
                    continue;

                const roleOnServer = this.lookForRole(serverRoles, user.teamName);

                Globals.log(`User: ${guildUser.username} on Team: ${user.teamName}. Doesn't have a matching role, current user Roles: ${roles}. Found Existing role: ${roleOnServer}`);

                //await this.askUserTheirTeam(message, guildMember, user);
                return true;
            }
        }
        // await message.SendMessage('unable to find user, no matching discord id registered.');
        return false;
    }

    private lookForRole(userRoles: string[], teamName: string): string {
        let team = teamName.trim();
        const indexOfWidthdrawn = team.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            team = team.slice(0, indexOfWidthdrawn).trim();
        }

        team = team.toLowerCase();
        const teamWithoutSpaces = team.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.toLowerCase().trim();
            if (lowerCaseRole === team)
                return role;

            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');

            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }

    private async askUserTheirTeam(message: MessageSender, guildMember: User, user: INGSUser) {
        let role = message.originalMessage.guild.roles.cache.find(r => r.name.toLowerCase() === user.teamName.toLowerCase());
        Globals.log(role)

        let sentMessage = await message.SendMessage(`${user.displayName.split("#")[0]} are you on team: ${user.teamName}?`);
        await sentMessage.react('✅');
        await sentMessage.react('❌');
        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === guildMember.id;
        };

        try {
            var collectedReactions = await sentMessage.awaitReactions(filter, { max: 1, time: 3e4, errors: ['time'] });
            if (collectedReactions.first().emoji.name === '✅') {
                message.originalMessage.member.roles.add(role);
            }
            if (collectedReactions.first().emoji.name === '❌') {
                message.originalMessage.member.roles.remove(role);
            }
        }
        catch {
            sentMessage.reactions.removeAll();
        }
    }
}