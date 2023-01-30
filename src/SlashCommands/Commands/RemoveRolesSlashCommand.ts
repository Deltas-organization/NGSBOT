import { BaseCommandInteraction, CacheType, Client } from "discord.js";
import { DiscordChannels } from "../../enums/DiscordChannels";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { RemoveRolesSlashWorker } from "../Workers/RemoveRolesSlashWorker";

export class RemoveRolesSlashCommand extends SlashCommandBase {
    protected Description: string = "Will Prompt User for each Role asking if they would like it removed.";
    public Name: string = "remove";
    public GuildLocation = DiscordGuilds.NGS;
    public Ephemeral = true;

    constructor(private dataStore: DataStoreWrapper){
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        var worker = new RemoveRolesSlashWorker(interaction);
        var messages = await worker.Run();
        await interaction.followUp({
            ephemeral: this.Ephemeral,
            embeds: messages.AsEmbed          
        });
    }
}