import { Client, BaseCommandInteraction, CacheType } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { SlashCommandBase } from "../Base/SlashCommandBase";

export class HelloWorldCommand extends SlashCommandBase {
    protected Description: string = "Will Tell the User Hello";
    public Name: string = "helloworld";
    public GuildLocation = DiscordGuilds.DeltasServer;

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        await interaction.followUp({
            ephemeral: true,
            content: "Hello World!!!"
        });
    }
}