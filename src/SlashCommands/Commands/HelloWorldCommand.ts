import { Client, CommandInteraction, CacheType, ButtonBuilder, ButtonInteraction, ActionRowBuilder, ButtonStyle } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { ButtonSlashCommandBase } from "../Base/ButtonSlashCommandBase";
import { SlashCommandBase } from "../Base/SlashCommandBase";

export class HelloWorldCommand extends ButtonSlashCommandBase {
    private _yesButtonId = "YesButton";
    private _noButtonId = "NoButton";

    protected Description: string = "Will Tell the User Hello";
    public Name: string = "helloworldtest";
    public GuildLocation = DiscordGuilds.DeltasServer;
    public Ephemeral: boolean = true;

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        await interaction.editReply({
            content: "Hello World!!!"
        });
        
        var row = new ActionRowBuilder<ButtonBuilder>()
        row.addComponents(await this.CreateButtons());

        var worker = new HelloWorldCommand();//client, this.dataStore, this.mongoConnectionUri);
        await interaction.editReply({ content: 'Make this role unpurgeable', components: [row] });
    }
    
    protected CreateButtons(): ButtonBuilder[] | Promise<ButtonBuilder[]> {
        var buttons: ButtonBuilder[] = [];
        var yesButton = new ButtonBuilder()
        .setCustomId(this._yesButtonId)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Primary);

        var noButton = new ButtonBuilder()
        .setCustomId(this._noButtonId)
        .setLabel('No')
        .setStyle(ButtonStyle.Primary);        
        
        buttons.push(yesButton);
        buttons.push(noButton);

        return buttons;
    }

    public async RunButton(client: Client<boolean>, interaction: ButtonInteraction<CacheType>): Promise<void> {
        var buttonName = "No";
        if(interaction.customId == this._yesButtonId)
            buttonName = "Yes"

        await interaction.editReply({
            content: `You pressed the ${buttonName} button.`
        });
    }


}