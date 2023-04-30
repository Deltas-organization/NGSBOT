import { ActionRowBuilder, ApplicationCommandOptionData, ApplicationCommandOptionType, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, ChatInputApplicationCommandData, Client, CommandInteraction, ComponentType, Guild, Role } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { ButtonSlashCommandBase } from "../Base/ButtonSlashCommandBase";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { GamesSlashWorker } from "../Workers/GamesSlashWorker";
import { ReplayCommandWorker } from "../Workers/ReplayCommandWorker";
import { HelloWorldCommand } from "./HelloWorldCommand";
import { RoleHelperWorker } from "../Workers/RoleHelperWorker";
import { SelectedButtons } from "../../enums/SelectedButtons";
import { RoleHelper } from "../../helpers/RoleHelper";
import { Mongohelper } from "../../helpers/Mongohelper";
import { NGSMongoHelper } from "../../helpers/NGSMongoHelper";

export class RoleHelperCommand extends ButtonSlashCommandBase {
    private _yesButtonId = "RoleHelperCommand_YesButton";
    private _noButtonId = "RoleHelperCommand_NoButton";

    protected Description: string = "Will Add Roles.";
    public Name: string = "addrole";
    public GuildLocation = DiscordGuilds.DeltasServer;
    public Ephemeral = false;

    constructor(private dataStore: DataStoreWrapper, private mongoConnectionUri: string) {
        super();
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
        options.push({
            name: "name",
            description: "The name of the new role",
            type: ApplicationCommandOptionType.String,
            required: true
        });
        return options;
    }

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {

        if (!interaction.guild) {
            await interaction.editReply({ content: "Something went wrong, I wasn't able to find the discord server to add the role to." })
            return;
        }

        var newRoleName = interaction.options.data[0].value;
        var role = await this.CreateRole(newRoleName, interaction.guild);

        var row = new ActionRowBuilder<ButtonBuilder>()
        row.addComponents(await this.CreateButtons(role.id));

        await interaction.editReply({ content: 'Make this role unpurgeable', components: [row] });
    }

    protected CreateButtons(roleId: string): ButtonBuilder[] | Promise<ButtonBuilder[]> {
        var buttons: ButtonBuilder[] = [];
        var yesButton = new ButtonBuilder()
            .setCustomId(`${this.Name}:${this._yesButtonId}:${roleId}`)
            .setLabel('Yes')
            .setStyle(ButtonStyle.Primary);

        var noButton = new ButtonBuilder()
            .setCustomId(`${this.Name}:${this._noButtonId}`)
            .setLabel('No')
            .setStyle(ButtonStyle.Primary);

        buttons.push(yesButton);
        buttons.push(noButton);

        return buttons;
    }

    public async RunButton(client: Client<boolean>, interaction: ButtonInteraction<CacheType>): Promise<void> {
        
        const buttonElements = interaction.customId.split(':');
        const clickedButton = buttonElements[1];

        if (clickedButton == this._yesButtonId) {
            if (!interaction.guild)
                return;

            const roleId = buttonElements[2];
            const mongoHelper = new NGSMongoHelper(this.mongoConnectionUri);
            await mongoHelper.AddRoleToIgnore(interaction.guild.id, roleId);
            await interaction.editReply({
                content: `The role will not be purged.`
            });
        }
    }

    private async CreateRole(roleName: string | any, guild: Guild | any): Promise<Role> {
        return await guild.roles.create({
            name: roleName,
            mentionable: true,
            hoist: true,
            reason: 'needed a new team role added'
        });
    }
}