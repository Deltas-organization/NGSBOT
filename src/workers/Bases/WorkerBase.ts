import { Client, Guild } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { ChannelMessageSender } from "../../helpers/messageSenders/ChannelMessageSender";
import { RespondToMessageSender } from "../../helpers/messageSenders/RespondToMessageSender";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { INGSTeam, INGSUser } from "../../interfaces";
import { MessageStore } from "../../MessageStore";

export abstract class WorkerBase {

    protected readonly dataStore: DataStoreWrapper;
    protected readonly client: Client;
    protected readonly messageStore: MessageStore;
    protected readonly guild: Guild;
    private _channelMessageSender: ChannelMessageSender;

    constructor(workerDependencies: CommandDependencies, protected detailed: boolean, protected messageSender: RespondToMessageSender) {
        this.client = workerDependencies.client;
        this.messageStore = workerDependencies.messageStore;
        this.dataStore = workerDependencies.dataStore;
        if (messageSender.originalMessage.guild)
            this.guild = messageSender.originalMessage.guild;
        this._channelMessageSender = new ChannelMessageSender(this.client, this.messageStore);
    }

    public async Begin(commands: string[]) {
        await this.Start(commands);
    }

    protected abstract Start(commands: string[]);


    protected async SearchForRegisteredTeams(searchTerm: string): Promise<INGSTeam[] | undefined> {
        return this.dataStore.SearchForRegisteredTeams(searchTerm);
    }

    protected async SearchForTeamBySeason(season: number, searchTerm: string): Promise<INGSTeam[] | undefined> {
        return this.dataStore.SearchForTeamBySeason(season, searchTerm);
    }

    protected async SearchForPlayersInCurrentSeason(searchTerm: string): Promise<INGSUser[]> {
        const users = await this.dataStore.GetUsers();
        const searchRegex = new RegExp(searchTerm, 'i');
        return users.filter(p => searchRegex.test(p.displayName));
    }

    protected async SendMessageToDelta(message: string) {
        await this._channelMessageSender.SendToDiscordChannel(message, DiscordChannels.DeltaPmChannel);
    }
}