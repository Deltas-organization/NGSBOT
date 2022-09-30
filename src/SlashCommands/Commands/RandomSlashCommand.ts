import { ApplicationCommandOptionData, Client, BaseCommandInteraction, CacheType } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { Random } from "../../helpers/RandomOptions";
import { OptionsCommandBase } from "../Base/OptionsCommandBase";
import { RandomSlashWorker } from "../Workers/RandomSlashworker";

export class RandomSlashCommand extends OptionsCommandBase {

    protected Description = "Return a Random Item from the list";
    public Name = "random_hots";
    public GuildLocation = "All";

    public async RunCommand(client: Client<boolean>, interaction: BaseCommandInteraction<CacheType>): Promise<void> {
        const worker = new RandomSlashWorker();
        const message = worker.Run(interaction.options.data);
        await interaction.followUp(
            {
                content: message.SingleMessage
            });
    }

    public CreateOptions(): ApplicationCommandOptionData[] {
        const options: ApplicationCommandOptionData[] = [];
        for (var option of Random.options) {
            options.push({
                name: option.name,
                description: option.description,
                type: "INTEGER"
            })
        }
        return options;
    }

}