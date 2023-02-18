import { Client, ChatInputApplicationCommandData, CommandInteraction, Interaction } from "discord.js";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { SlashCommandBase } from "./Base/SlashCommandBase";
import { CaptainsCommand } from "./Commands/CaptainsCommand";
import { GamesSlashCommand } from "./Commands/GamesSlashCommand";
import { HelloWorldCommand } from "./Commands/HelloWorldCommand";
import { RandomSlashCommand } from "./Commands/RandomSlashCommand";

type guildCommandContainer = { guild: string; commands: ChatInputApplicationCommandData[]; };
export class CommandCreatorService {

    private commands: SlashCommandBase[] = [];

    constructor(private client: Client, private dataStore: DataStoreWrapper, private mongoConnectionUri: string) {
        client.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isCommand() || interaction.isContextMenuCommand()) {
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
        this.commands.push(new RandomSlashCommand());
        this.commands.push(new CaptainsCommand(this.dataStore, this.mongoConnectionUri));
    }

    private async RunCommand(client: Client, interaction: CommandInteraction): Promise<void> {
        const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
        if (!slashCommand) {
            interaction.followUp({ content: "An error has occurred" });
            return;
        }

        await interaction.deferReply({ephemeral: slashCommand.Ephemeral});

        await slashCommand.RunCommand(client, interaction);
    };
}
