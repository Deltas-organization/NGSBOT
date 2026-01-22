import { ApplicationCommandOption, ApplicationCommandOptionData, ChatInputApplicationCommandData } from "discord.js";
import { SlashCommandBase } from "./SlashCommandBase";

export abstract class OptionsCommandBase extends SlashCommandBase {
    
    public GetCommand() : ChatInputApplicationCommandData{
        this.command = {
            description: this.Description,
            name: this.Name,
            options: this.CreateOptions(),
            defaultMemberPermissions: this.Permissions
        }
        return this.command;
    }

    public abstract CreateOptions(): ApplicationCommandOptionData[];
}