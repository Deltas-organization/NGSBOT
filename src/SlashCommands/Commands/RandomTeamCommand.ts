import { Client, CommandInteraction, CacheType, GuildMember } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { GamesWorker } from "../../workers/GamesWorker";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { GamesSlashWorker } from "../Workers/GamesSlashWorker";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { RandomTeamWorker } from "../Workers/RandomTeamWorker";

export class RandomTeamCommand extends SlashCommandBase {
    protected Description: string = "Will Split the Current users Chat Channel into numbered teams.";
    public Name: string = "random_teams";
    public GuildLocation = "All";
    public Ephemeral = true;
    private _membersWithPriority: string[] = [];

    constructor() {
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        let members: Map<string, GuildMember> = (<any>interaction.member!).voice.channel.members;
        let memberNames: string[] = [];
        for (var member of members) {
            if (member[1].nickname != null)
                memberNames.push(member[1].nickname);
        }

        const worker = new RandomTeamWorker();
        const result = await worker.Run(memberNames, this._membersWithPriority);
        this._membersWithPriority = result.unselectedPlayerNames;
        await interaction.followUp({
            ephemeral: this.Ephemeral,
            embeds: result.container.AsEmbed
        });
    }
}