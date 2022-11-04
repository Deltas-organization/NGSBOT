import { BaseCommandInteraction, CacheType, Client } from "discord.js";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { GamesSlashWorker } from "../Workers/GamesSlashWorker";

export class ReplaysSlashCommand extends SlashCommandBase {
    protected Description: string = "Will Respond to the User with their teams games";
    public Name: string = "games";
    public GuildLocation = "All";
    public Ephemeral = true;

    constructor(private dataStore: DataStoreWrapper){
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        // var worker = new GamesSlashWorker(interaction.user, this.dataStore);
        // var messages = await worker.Run();
        // await interaction.followUp({
        //     ephemeral: this.Ephemeral,
        //     embeds: messages.AsEmbed          
        // });
    }
}