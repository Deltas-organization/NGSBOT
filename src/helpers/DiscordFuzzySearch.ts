import { GuildMember, User } from "discord.js";
import { Globals } from "../Globals";
import { INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class DiscordFuzzySearch {
    public static FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): GuildMember {
        const ngsDiscordId = user.discordId;
        if (ngsDiscordId) {
            let members = guildMembers.filter(member => member.user.id == ngsDiscordId);
            if (members.length == 1)
                return members[0];

            Globals.log(`Unable to find user by discordID: ${ngsDiscordId}, name: ${user.displayName}`);
        }

        const ngsDiscordTag = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return null;

        return DiscordFuzzySearch.FindByDiscordTag(ngsDiscordTag, guildMembers);
    }

    private static FindByDiscordTag(ngsDiscordTag: string, guildMembers: GuildMember[]): GuildMember {

        const { name, discriminator } = DiscordFuzzySearch.SplitNameAndDiscriminator(ngsDiscordTag);
        if (!discriminator)
            return null;

        const filteredByDiscriminator = guildMembers.filter(member => member.user.discriminator == discriminator);
        const possibleMembers = [];
        for (let member of filteredByDiscriminator) {
            const discordName = DiscordFuzzySearch.GetDiscordId(member.user);
            if (discordName == ngsDiscordTag) {
                return member;
            }
            else if (member.user.username.toLowerCase().indexOf(name) > -1) {
                Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${member.user.username}`)
                possibleMembers.push(member);
            }
        }
        if (possibleMembers.length == 1) {
            return possibleMembers[0];
        }
    }

    private static SplitNameAndDiscriminator(ngsDiscordTag: string) {
        const splitNgsDiscord = ngsDiscordTag.split("#");
        if (splitNgsDiscord.length != 2)
            return null;

        const ngsUserName = splitNgsDiscord[0].toLowerCase();
        return { name: ngsUserName, discriminator: splitNgsDiscord[1] };
    }

    public static CompareGuildUser(user: INGSUser, guildUser: User): boolean {
        if (user.discordId) {
            if (user.discordId == guildUser.id)
                return true;
        }

        const ngsDiscordTag = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return false;

        const { name, discriminator } = DiscordFuzzySearch.SplitNameAndDiscriminator(ngsDiscordTag);
        if (!discriminator)
            return false;

        if (guildUser.discriminator != discriminator)
            return false;

        const discordName = DiscordFuzzySearch.GetDiscordId(guildUser);
        if (discordName == ngsDiscordTag) {
            return true;
        }
        else if (guildUser.username.toLowerCase().indexOf(name) > -1) {
            Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${guildUser.username}`)
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