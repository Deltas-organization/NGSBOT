import { GuildMember, User } from "discord.js";
import { Globals } from "../Globals";
import { INGSUser } from "../interfaces";
import { AugmentedNGSUser } from "../models/AugmentedNGSUser";

export class DiscordFuzzySearch {
    public static async FindGuildMember(user: INGSUser, guildMembers: GuildMember[]): Promise<FuzzySearchResult | null> {
        const ngsDiscordId = user.discordId;
        let returnResult: FuzzySearchResult | null = null;
        let foundById = false;
        if (ngsDiscordId) {
            let members = guildMembers.filter(member => member.user.id == ngsDiscordId);
            if (members.length == 1) {
                foundById = true;
                returnResult = { member: members[0], updateDiscordId: false };
            }
        }

        const ngsDiscordTag = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return null;

        var member = DiscordFuzzySearch.FindByDiscordTag(ngsDiscordTag, guildMembers);
        if (member) {
            if (foundById && returnResult) {
                if (returnResult.member.id != member.id) {
                    return { member: member, updateDiscordId: true };
                }
            }
            return { member: member, updateDiscordId: !foundById };
        }
        else if (foundById) {
            return returnResult;
        }
        else {
            return null;
        }
    }

    private static FindByDiscordTag(ngsDiscordTag: string, guildMembers: GuildMember[]): GuildMember | undefined {
        const foundGuildMember = guildMembers.filter(member => member.user.username == ngsDiscordTag);
        if (foundGuildMember.length == 1)
            return foundGuildMember[0];
    }

    private static SplitNameAndDiscriminator(ngsDiscordTag: string) {
        const splitNgsDiscord = ngsDiscordTag.split("#");
        if (splitNgsDiscord.length < 2)
            return null;

        const ngsUserName: string = splitNgsDiscord[0];

        return { name: ngsUserName, discriminator: splitNgsDiscord.pop() };
    }

    public static CompareGuildUser(user: INGSUser, guildUser: User): boolean {
        if (user.discordId) {
            if (user.discordId == guildUser.id)
                return true;
        }

        const ngsDiscordTag = user.discordTag?.replace(' ', '').toLowerCase();
        if (!ngsDiscordTag)
            return false;

        const information = DiscordFuzzySearch.SplitNameAndDiscriminator(ngsDiscordTag);
        if (!information || !information.discriminator || !information.name)
            return false;

        const discriminator = information.discriminator;
        const name = information.name;

        if (guildUser.discriminator != discriminator)
            return false;

        const discordName = DiscordFuzzySearch.GetDiscordId(guildUser);
        if (discordName == ngsDiscordTag) {
            return true;
        }
        else if (guildUser.username.toLowerCase().indexOf(name) > -1) {
            //Globals.log(`FuzzySearch!! Website has: ${name}, Found: ${guildUser.username}`)
            return true;
        }
        return false;
    }

    public static GetDiscordId(guildUser: User) {
        return `${guildUser.username}#${guildUser.discriminator}`.replace(' ', '').toLowerCase();
    }

    public static async GetNGSUser(user: User, users: AugmentedNGSUser[]): Promise<AugmentedNGSUser | null> {
        for (var ngsUser of users) {
            if (DiscordFuzzySearch.CompareGuildUser(ngsUser, user)) {
                return ngsUser;
            }
        }
        return null;
    }
}

export type FuzzySearchResult = { member: GuildMember, updateDiscordId: boolean };