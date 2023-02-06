import { BaseCommandInteraction, ChatInputApplicationCommandData, Client, PermissionResolvable } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { DiscordGuilds } from "../../enums/DiscordGuilds";

export abstract class SlashCommandBase {
    protected command: ChatInputApplicationCommandData;
    protected abstract Description: string;
    protected type: ApplicationCommandTypes = ApplicationCommandTypes.CHAT_INPUT;

    public Ephemeral = false;    
    public abstract Name: string;
    public abstract GuildLocation: string;
    public Permissions: PermissionResolvable;

    public GetCommand() : ChatInputApplicationCommandData{
        this.command = {
            description: this.Description,
            name: this.Name,
            defaultMemberPermissions: this.Permissions
        }
        return this.command;
    }

    public abstract RunCommand(client: Client, interaction: BaseCommandInteraction): Promise<void>;
}