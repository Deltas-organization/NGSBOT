import { Client, Guild, Message, User } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";

var fs = require('fs');

export class SelfTeamChecker extends TranslatorBase {

    public get commandBangs(): string[] {
        return ["self"];
    }

    public get description(): string {
        return "Will Return the team name that the player requesting is on.";
    }

    constructor(client: Client, private liveDataStore: LiveDataStore) {
        super(client);
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
        console.log(guild.members.cache.map((mem, _, __) => mem.user.username));
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
            console.log(ngsDiscordId);
            if (ngsDiscordId == discordName.toLowerCase()) {
                await message.SendMessage(`Looks like you they are on team: ${user.teamName}`);
                return true;
            }
        }
        await message.SendMessage('unable to find user, no matching discord id registered.');
        return false;
    }
}