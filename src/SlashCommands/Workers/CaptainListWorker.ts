import { Client, Guild, GuildChannel, Message, User } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { NGSDivisions } from "../../enums/NGSDivisions";
import { Globals } from "../../Globals";
import { ChannelHelper } from "../../helpers/ChannelHelper";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordFuzzySearch } from "../../helpers/DiscordFuzzySearch";
import { MessageHelper } from "../../helpers/MessageHelper";
import { ChannelMessageSender } from "../../helpers/messageSenders/ChannelMessageSender";
import { Mongohelper } from "../../helpers/Mongohelper";
import { RoleHelper } from "../../helpers/RoleHelper";
import { ScheduleHelper } from "../../helpers/ScheduleHelper";
import { INGSTeam } from "../../interfaces";
import { LiveDataStore } from "../../LiveDataStore";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { AugmentedNGSUser } from "../../models/AugmentedNGSUser";
import { CaptainList } from "../../mongo/models/captain-list";

export class CaptainsListWorker {

    private _season: number;
    private _mongoHelper: Mongohelper;
    private _guild: Guild;
    private _roleHelper: RoleHelper;
    private _messageSender: ChannelMessageSender;

    public constructor(private client: Client<boolean>, private dataStore: DataStoreWrapper, private mongoConnectionUri: string) {
        this._season = +LiveDataStore.season;
        this._mongoHelper = new Mongohelper(this.mongoConnectionUri);
        this._messageSender = new ChannelMessageSender(this.client);
    }

    public async Run(): Promise<void> {
        this._guild = await this.GetGuild(DiscordChannels.NGSDiscord);
        this._roleHelper = await RoleHelper.CreateFrom(this._guild);

        for (var value in NGSDivisions) {
            const division = NGSDivisions[value];
            try {
                await this.AttemptToUpdateCaptainMessage(division);
            }
            catch {
                await this.AttemptToUpdateCaptainMessage(division);
            }
        }
    }

    private async AttemptToUpdateCaptainMessage(division: NGSDivisions) {
        const message = await this.CreateDivisionList(division, DiscordChannels.NGSDiscord);
        if (message) {
            let mongoMessage = await this._mongoHelper.GetCaptainListMessage(this._season, division);
            if (!mongoMessage) {
                mongoMessage = <CaptainList>{
                    season: this._season,
                    division: division
                };
            }
             var captainChannelDivisionMessages = await this.UpdateCaptainChannel(mongoMessage.messageId, message);
            var discordChannel = ChannelHelper.GetDiscordChannelForDivision(division);
            if (discordChannel) {
                var divisionChannelDivisionMessages = await this.UpdateDivisionChannelMessage(mongoMessage.divisionChannelMessageId, message, discordChannel);
                var updateDatabase = false;
                if (captainChannelDivisionMessages?.length == 1 && !mongoMessage.messageId) {
                    updateDatabase = true;
                    mongoMessage.messageId = captainChannelDivisionMessages[0].id;
                }
                if (divisionChannelDivisionMessages.length == 1 && !mongoMessage.divisionChannelMessageId) {
                    updateDatabase = true;
                    mongoMessage.divisionChannelMessageId = divisionChannelDivisionMessages[0].id;
                }
                if (updateDatabase) {
                    await this._mongoHelper.UpdateCaptainListRecord(mongoMessage);
                }
            }
        }
    }

    private async UpdateCaptainChannel(messageId: string, message: string): Promise<Message<boolean>[]> {
        var result: Message<boolean>[] = [];
        if (message) {
            if (messageId)
                await this._messageSender.OverwriteBasicMessage(message, messageId, DiscordChannels.NGSCaptainList);
            else {
                result = await this._messageSender.SendToDiscordChannelAsBasic(message, DiscordChannels.NGSCaptainList);
            }
        }
        return result;
    }

    private async UpdateDivisionChannelMessage(messageId: string, message: string, discordChannel: DiscordChannels): Promise<Message<boolean>[]> {
        var result: Message<boolean>[] = [];
        if (messageId)
            await this._messageSender.OverwriteBasicMessage(message, messageId, discordChannel);
        else {
            result = await this._messageSender.SendToDiscordChannelAsBasic(message, discordChannel);
        }
        return result;
    }

    private async CreateDivisionList(division: NGSDivisions, channelToUserForGuildRetrieval: string): Promise<string | undefined> {
        try {

            const teams = await this.GetTeamsInDivision(division);
            const divisions = await this.dataStore.GetDivisions();
            const divisionInformation = divisions.find(d => d.displayName == division);
            if (!divisionInformation)
                return `Unable to find division: ${division}`;

            const guildMembers = (await this._guild.members.fetch()).map((mem, _, __) => mem);
            const modsToLookFor = divisionInformation.moderator.split('&').map(item => item.replace(' ', '').toLowerCase());
            const divMods = guildMembers.filter(member => modsToLookFor.indexOf(DiscordFuzzySearch.GetDiscordId(member.user)) != -1);
            const messageHelper = new MessageHelper<unknown>('captainList');
            messageHelper.AddNewLine(`**${division}** Moderator: ${divMods.join("&")}`);
            for (let team of teams) {
                const teamRole = this._roleHelper.lookForRole(team.teamName);
                messageHelper.AddNewLine(teamRole?.toString() ?? team.teamName);
                const users = await this.dataStore.GetUsersOnTeam(team);
                let hasAssistant = false;
                for (let user of users.sort((user1, user2) => this.userSort(user1, user2))) {
                    if (user.IsCaptain) {
                        let guildMember = await DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        if (guildMember)
                            messageHelper.AddNew(` - captain ${guildMember.member}`)
                        else
                            messageHelper.AddNew(` - captain ${user.displayName}`)
                    }
                    if (user.IsAssistantCaptain) {
                        let guildMember = await DiscordFuzzySearch.FindGuildMember(user, guildMembers);
                        if (hasAssistant) {
                            if (guildMember)
                                messageHelper.AddNew(` and ${guildMember.member}`)
                            else
                                messageHelper.AddNew(` and ${user.displayName}`)

                        }
                        else {
                            if (guildMember)
                                messageHelper.AddNew(` / ${guildMember.member}`);
                            else
                                messageHelper.AddNew(` / ${user.displayName}`);

                            hasAssistant = true;
                        }
                    }
                }
            }
            messageHelper.AddNewLine(`-----------------------------------`);
            return messageHelper.CreateStringMessage();
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async GetTeamsInDivision(division: NGSDivisions) {
        const teamHelper = await this.dataStore.GetTeams();
        return teamHelper.GetTeamsSortedByTeamNames().filter(team => team.divisionDisplayName == division);
    }

    private async GetGuild(channelId: string) {
        const channel = (await this.client.channels.fetch(channelId)) as GuildChannel;
        return channel.guild;
    }

    private userSort(user1: AugmentedNGSUser, user2: AugmentedNGSUser) {
        if (user1.IsCaptain)
            return -1;
        if (user2.IsCaptain)
            return 1;
        return 0;
    }
}