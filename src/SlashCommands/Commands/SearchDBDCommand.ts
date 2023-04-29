import { ApplicationCommandOptionData, ApplicationCommandOptionType, CacheType, ChatInputApplicationCommandData, Client, CommandInteraction } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { CommandInteractionOption } from "discord.js";
import { describe } from "node:test";
import { Mongohelper } from "../../helpers/Mongohelper";
import { DBDMongoHelper } from "../../helpers/DBDMongoHelper";
import { DescriptionHelper } from "../../DBD/helpers/DescriptionHelper";
import { DBDSearchable, DBDDescriber, DescriptionType, DBDPerk } from "../../DBD/types";

export class SearchDBDCommand extends SlashCommandBase {

    private longDescriptionOption: ApplicationCommandOptionData = {
        name: "long_description",
        description: "Will return a long description",
        type: ApplicationCommandOptionType.Boolean
    };
    private searchWordOption: ApplicationCommandOptionData = {
        name: "keywords",
        description: "the keywords to search for",
        type: ApplicationCommandOptionType.String,
        required: true
    };
    private mongo: DBDMongoHelper;

    protected Description: string = "Will Search DBD database";
    public Name: string = "dbdsearch";
    public GuildLocation = DiscordGuilds.DeltasServer;
    public Ephemeral = false;

    constructor(mongoConnectionUri: string) {
        super();
        this.mongo = new DBDMongoHelper(mongoConnectionUri);
    }

    public GetCommand(): ChatInputApplicationCommandData {
        this.command = {
            description: this.Description,
            name: this.Name,
            options: this.CreateOptions()
        }
        return this.command;
    }

    public CreateOptions(): ApplicationCommandOptionData[] {
        var options: ApplicationCommandOptionData[] = [];
        options.push(this.searchWordOption);
        options.push(this.longDescriptionOption);
        return options;
    }

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        const perksFound = await this.searchPerks(interaction);
        let content = "Nothing Found";
        if (perksFound != null && perksFound.length > 0)
            content = this.createContent(interaction, perksFound[0]);

        await interaction.editReply({
            content: content
        });
    }

    private async searchPerks(interaction: CommandInteraction<CacheType>): Promise<DBDPerk[] | null> {
        let searchTerm = this.getOptionValue(interaction, this.searchWordOption);
        if (typeof searchTerm != "string") {
            return null;
        }
        searchTerm = searchTerm.toLowerCase();
        const searchRegex = new RegExp(searchTerm, 'g');
        const result: DBDPerk[] = [];
        const perks = await this.mongo.GetPerks();
        for (let perk of perks) {
            if (perk.keywords.find(k => k.search(searchRegex) != -1))
                result.push(perk);
        }

        return result;
    }

    private createContent(interaction: CommandInteraction<CacheType>, perk: DBDPerk): string {
        const descripton = this.getDescription(interaction, perk);
        return `**${perk.name}** \n Page Number: ${perk.pageNumber} \n \n ${descripton}`;
    }

    private getDescription(interaction: CommandInteraction<CacheType>, information: DBDDescriber): string {
        const showLongDescription = this.getOptionValue(interaction, this.longDescriptionOption)
        if (showLongDescription === true)
            return DescriptionHelper.GenerateDescription(information.longDescription).join("\n");
        else
            return DescriptionHelper.GenerateDescription(information.shortDescription).join("\n");
    }

    private getOptionValue(interaction: CommandInteraction<CacheType>, option: ApplicationCommandOptionData) {
        return interaction.options.data.find(interactedOption => interactedOption.name == option.name)?.value;
    }

    private appendPageSize(survivorPerks: DBDPerk[]) {
        throw new Error("Method not implemented.");
    }

    private sortAlphabetically(perk1: DBDPerk, perk2: DBDPerk) {
        if (perk1.name < perk2.name) {
            return -1;
        }
        if (perk1.name > perk1.name) {
            return 1;
        }
        return 0;
    }
}
