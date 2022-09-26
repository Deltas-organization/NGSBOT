import { Client, BaseCommandInteraction, CacheType } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { GamesWorker } from "../../workers/GamesWorker";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { GamesSlashWorker } from "../Workers/GamesSlashWorker";

export class GamesSlashCommand extends SlashCommandBase {
    protected Description: string = "Will Respond to the User with their teams games";
    public Name: string = "games";
    public GuildLocation = "All";
    public Ephemeral = true;

    constructor(private dataStore: DataStoreWrapper){
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        var worker = new GamesSlashWorker(interaction.user, this.dataStore);
        var messages = await worker.Run();
        await interaction.followUp({
            ephemeral: this.Ephemeral,
            embeds: messages.AsEmbed          
        });
    }
}