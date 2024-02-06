import { Client, CommandInteraction, CacheType, PermissionResolvable, PermissionFlagsBits } from "discord.js";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { CaptainsListWorker } from "../Workers/CaptainListWorker";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { AssignRolesWorker } from "../../workers/AssignRolesWorker";
import { SlashAssignRolesWorker } from "../Workers/Slash_AssignRolesWorker";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";

export class AssignRolesCommand extends SlashCommandBase {
    protected Description: string = "Will Assign Roles";
    public Name: string = "assign_roles";
    public GuildLocation = DiscordGuilds.DeltasServer;
    public Permissions: PermissionResolvable = PermissionFlagsBits.ManageRoles;

    constructor(private _dependencies: CommandDependencies){
        super();
    }
    
    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        var worker = new SlashAssignRolesWorker(this._dependencies, interaction);
        await worker.Run();
        await interaction.followUp({
            ephemeral: this.Ephemeral,
            content: "Finished Updating the list"
        });
    }
}