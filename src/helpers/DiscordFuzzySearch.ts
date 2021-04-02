import { GuildMember, User } from "discord.js";
import { Globals } from "../Globals";
import { INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class DiscordFuzzySearch {
    public static FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): GuildMember {
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
            const discordName = DiscordFuzzySearch.GetDiscordId(member.user);
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

    public static CompareGuildUser(user: INGSUser, guildUser: User): boolean {
        const ngsDiscordId = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordId)
            return false;

        const splitNgsDiscord = ngsDiscordId.split("#");
        if (splitNgsDiscord.length != 2)
            return false;

        const ngsUserName = splitNgsDiscord[0].toLowerCase();
        const ngsDiscriminator = splitNgsDiscord[1];

        if (guildUser.discriminator != ngsDiscriminator)
            return false;

        const discordName = DiscordFuzzySearch.GetDiscordId(guildUser);
        if (discordName == ngsDiscordId) {
            return true;
        }
        else if (guildUser.username.toLowerCase().indexOf(ngsUserName) > -1) {
            Globals.log(`FuzzySearch!! Website has: ${ngsUserName}, Found: ${guildUser.username}`)
            return true;
        }
        return false;
    }

    public static GetDiscordId(guildUser: User) {
        return `${guildUser.username}#${guildUser.discriminator}`.replace(' ', '').toLowerCase();
    }
    
    public static async GetNGSUser(user: User, users: AugmentedNGSUser[]): Promise<AugmentedNGSUser | undefined> {
        for (var ngsUser of users) {
            if (DiscordFuzzySearch.CompareGuildUser(ngsUser, user)) {
                return ngsUser;
            }
        }
        return null;
    }
}