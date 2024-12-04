import { Client, CommandInteraction, CacheType, PermissionResolvable, PermissionFlagsBits } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { CaptainsListWorker } from "../Workers/CaptainListWorker";

export class CaptainsCommand extends SlashCommandBase {
    protected Description: string = "Will Update Captain List";
    public Name: string = "captains";
    public GuildLocation = DiscordGuilds.NGS;
    public Permissions: PermissionResolvable = PermissionFlagsBits.ManageRoles;

    constructor(private dataStore: DataStoreWrapper, private mongoConnectionUri: string){
        super();
    }
    
    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        var worker = new CaptainsListWorker(client, this.dataStore, this.mongoConnectionUri);
        await worker.Run();
        await interaction.followUp({
            ephemeral: this.Ephemeral,
            content: "Finished Updating the list"
        });
    }
}