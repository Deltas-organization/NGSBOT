import { Client, ChatInputApplicationCommandData, CommandInteraction, Interaction, ButtonInteraction } from "discord.js";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { ButtonSlashCommandBase } from "./Base/ButtonSlashCommandBase";
import { SlashCommandBase } from "./Base/SlashCommandBase";
import { CaptainsCommand } from "./Commands/CaptainsCommand";
import { GamesSlashCommand } from "./Commands/GamesSlashCommand";
import { HelloWorldCommand } from "./Commands/HelloWorldCommand";
import { RandomSlashCommand } from "./Commands/RandomSlashCommand";
import { RoleHelperCommand } from "./Commands/RoleHelperCommand";
import { SearchDBDCommand } from "./Commands/SearchDBDCommand";

type guildCommandContainer = { guild: string; commands: ChatInputApplicationCommandData[]; };
export class CommandCreatorService {

    private commands: SlashCommandBase[] = [];

    constructor(private client: Client, private dataStore: DataStoreWrapper, private mongoConnectionUri: string) {
        client.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isCommand() || interaction.isContextMenuCommand() || interaction.isButton()) {
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
            this.client.application?.commands.cache.forEach(command => {
                console.log(`commandName: ${command.name}, applicationId: ${command.id}`)
            });
            this.client.guilds.cache.forEach(guild => {
                guild.commands.cache.forEach(command => {
                    console.log(`Guild information: commandName: ${command.name}, applicationId: ${command.id}`)
                });
            });
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
        this.commands.push(new GamesSlashCommand(this.dataStore));
        this.commands.push(new RandomSlashCommand());
        this.commands.push(new CaptainsCommand(this.dataStore, this.mongoConnectionUri));
        this.commands.push(new RoleHelperCommand(this.dataStore, this.mongoConnectionUri));
        this.commands.push(new SearchDBDCommand(this.mongoConnectionUri));
    }

    private async RunCommand(client: Client, interaction: CommandInteraction | ButtonInteraction): Promise<void> {
        if (interaction instanceof CommandInteraction) {
            const slashCommand = this.commands.find(c => c.Name === interaction.commandName);
            if (!slashCommand) {
                interaction.followUp({ content: "An error has occurred" });
                return;
            }

            await interaction.deferReply({ ephemeral: slashCommand.Ephemeral });

            await slashCommand.RunCommand(client, interaction);
        }

        if (interaction instanceof ButtonInteraction) {
            const buttonCommand = <ButtonSlashCommandBase | undefined>this.commands.find(c => {
                if (c instanceof ButtonSlashCommandBase) {
                    return true;
                }
                return false;
            });

            if (buttonCommand) {
                await interaction.deferReply({ ephemeral: buttonCommand.Ephemeral });
                await buttonCommand.RunButton(client, interaction);
            }
        }
    };
}
