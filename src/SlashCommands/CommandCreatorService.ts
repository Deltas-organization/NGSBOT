import { debug } from "console";
import { Client, ChatInputApplicationCommandData, BaseCommandInteraction, Interaction, CacheType } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { DiscordGuilds } from "../enums/DiscordGuilds";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { SlashCommandBase } from "./Base/SlashCommandBase";
import { GamesSlashCommand } from "./Commands/GamesSlashCommand";
import { HelloWorldCommand } from "./Commands/HelloWorldCommand";
import { GamesSlashWorker } from "./Workers/GamesSlashWorker";

type guildCommandContainer = { guild: string; commands: ChatInputApplicationCommandData[]; };
export class CommandCreatorService {

    private commands: SlashCommandBase[] = [];

    constructor(private client: Client, private dataStore: DataStoreWrapper) {
        client.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isCommand() || interaction.isContextMenu()) {
                await this.RunCommand(client, interaction);
            }
        });
        client.on("ready", () => {
            this.CreateCommands();
            this.Registercommands();
        });
    }
    private async Registercommands() {
        var containers = this.CreateCommandContainers();
        for (var container of containers.guildCommands) {
            const guild = await this.client.guilds.fetch(container.guild);
            await guild?.commands.set(container.commands);
        }
        if (containers.applicationCommands.length > 0)
            await this.client.application?.commands.set(containers.applicationCommands);
        console.log("done");
    }

    private CreateCommandContainers(): { guildCommands: guildCommandContainer[], applicationCommands: ChatInputApplicationCommandData[] } {
        const guildCommandsToRegister: guildCommandContainer[] = [];
        const applicationcommandsToRegister: ChatInputApplicationCommandData[] = [];
        for (const command of this.commands) {
            if (command.GuildLocation === 'All') {
                applicationcommandsToRegister.push(command.GetCommand());
            }
            else {
                let found = false;
                for (const guildCommand of guildCommandsToRegister) {
                    if (guildCommand.guild == command.GuildLocation) {
                        guildCommand.commands.push(command.GetCommand());
                        found = true;
                        break;
                    }
                }
                if (!found)
                    guildCommandsToRegister.push({ guild: command.GuildLocation, commands: [command.GetCommand()] });
            }
        }

        return { guildCommands: guildCommandsToRegister, applicationCommands: applicationcommandsToRegister };
    }

    private CreateCommands() {
        this.commands.push(new HelloWorldCommand());
        this.commands.push(new GamesSlashCommand(this.dataStore));
    }

    private async RunCommand(client: Client, interaction: BaseCommandInteraction): Promise<void> {
        const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
        if (!slashCommand) {
            interaction.followUp({ content: "An error has occurred" });
            return;
        }

        await interaction.deferReply();

        await slashCommand.RunCommand(client, interaction);
    };
}
