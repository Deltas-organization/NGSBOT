import { ApplicationCommandOption, ApplicationCommandOptionData, ButtonBuilder, ButtonComponent, ButtonInteraction, ChatInputApplicationCommandData, Client, CommandInteraction } from "discord.js";
import { SlashCommandBase } from "./SlashCommandBase";

export abstract class ButtonSlashCommandBase extends SlashCommandBase {
    
    public abstract RunButton(client: Client, interaction: ButtonInteraction): Promise<void>;
}