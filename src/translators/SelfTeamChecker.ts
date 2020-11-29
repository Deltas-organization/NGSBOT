import { Client, Guild, Message, User } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { MessageStore } from "../MessageStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { INGSUser } from "../interfaces";
import { Globals } from "../globals";

var fs = require('fs');

export class SelfTeamChecker extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["self"];
    }

    public get description(): string {
        return "Will Return the team name that the player requesting is on.";
    }

    constructor(translatorDependencies: TranslatorDependencies, private liveDataStore: LiveDataStore) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender) {
        if (commands.length > 0) {
            for (var command of commands) {
                let guildMember = this.findUserInGuid(message.originalMessage.guild, command);
                if (guildMember) {
                    await this.findUserInNGS(message, guildMember);
                }
                else
                    await message.SendMessage(`Unable to find user: ${command}`);
            }
        }
        else {
            await this.findUserInNGS(message, message.Requester);
        }
    }

    private findUserInGuid(guild: Guild, name: string): User {
        Globals.log(guild.members.cache.map((mem, _, __) => mem.user.username));
        let filteredMembers = guild.members.cache.filter((member, _, __) => member.user.username.toLowerCase() == name.toLowerCase());
        if (filteredMembers.size == 1) {
            return filteredMembers.map((member, _, __) => {
                return member.user;
            })[0];
        }
    }

    private async findUserInNGS(message: MessageSender, guildMember: User) {
        let users = await this.liveDataStore.GetUsers();
        let discordName = `${guildMember.username}#${guildMember.discriminator}`;
        for (var user of users) {
            let ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
            Globals.log(ngsDiscordId);
            if (ngsDiscordId == discordName.toLowerCase()) {
                await this.askUserTheirTeam(message, guildMember, user);
                return true;
            }
        }
        await message.SendMessage('unable to find user, no matching discord id registered.');
        return false;
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