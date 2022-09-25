import { BaseCommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { DiscordGuilds } from "../../enums/DiscordGuilds";

export abstract class SlashCommandBase {
    protected command: ChatInputApplicationCommandData;
    protected abstract Description: string;
    protected type: ApplicationCommandTypes = ApplicationCommandTypes.CHAT_INPUT;
    
    public abstract Name: string;
    public abstract GuildLocation: string;

    public GetCommand() : ChatInputApplicationCommandData{
        this.command = {
            description: this.Description,
            name: this.Name
        }
        return this.command;
    }

    public abstract RunCommand(client: Client, interaction: BaseCommandInteraction): Promise<void>;
}