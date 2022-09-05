import { debug } from "console";
import { Client, ChatInputApplicationCommandData, BaseCommandInteraction, Interaction, CacheType } from "discord.js";
import { ApplicationCommandTypes } from "discord.js/typings/enums";
import { DiscordGuilds } from "../enums/DiscordGuilds";

export class CommandCreatorService {

    private commands: Command[] = [];

    constructor(private client: Client) {
        client.on("interactionCreate", async (interaction: Interaction) => {
            if (interaction.isCommand() || interaction.isContextMenu()) {
                await this.RunCommand(client, interaction);
            }
        });
        client.on("ready", () =>
        {
            this.CreateCommands();
            this.Registercommands();
        });
    }
    private async Registercommands() {        
        const commandsToRegister: ChatInputApplicationCommandData[] = [];
        for(const command of this.commands)
        {
            commandsToRegister.push(command.GetCommand())
        }
        const guild  = await this.client.guilds.fetch(DiscordGuilds.DeltasServer);
        await guild?.commands.set(commandsToRegister);

        console.log("done");
    }

    private CreateCommands() {
        this.commands.push(new HelloCommand());
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


export abstract class Command {
    protected command: ChatInputApplicationCommandData;
    protected abstract Description: string;
    protected type: ApplicationCommandTypes = ApplicationCommandTypes.CHAT_INPUT;
    
    public abstract Name: string;

    public GetCommand() : ChatInputApplicationCommandData{
        this.command = {
            description: this.Description,
            name: this.Name
        }
        return this.command;
    }

    public abstract RunCommand(client: Client, interaction: BaseCommandInteraction): Promise<void>;
}

export class HelloCommand extends Command {
    protected Description: string = "Will Tell the User Hello";
    public Name: string = "helloworld";

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        await interaction.followUp({
            ephemeral: true,
            content: "Hello World"
        });
    }
}