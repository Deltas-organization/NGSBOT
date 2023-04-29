import { ButtonBuilder, ButtonInteraction, CacheType, Client, CommandInteraction, ComponentType } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { ButtonSlashCommandBase } from "../Base/ButtonSlashCommandBase";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { GamesSlashWorker } from "../Workers/GamesSlashWorker";
import { ReplayCommandWorker } from "../Workers/ReplayCommandWorker";

export class ReplaysSlashCommand extends ButtonSlashCommandBase {
    
    protected Description: string = "Will Download Replay for a team.";
    public Name: string = "Replays";
    public GuildLocation = DiscordGuilds.DeltasServer;
    public Ephemeral = true;
    public AllButtonID = "AllReplays";
    public NewReplayButtonId ="NewReplays";

    constructor(private dataStore: DataStoreWrapper, private mongoConnectionUri: string){
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        var worker = new ReplayCommandWorker(client, this.dataStore, this.mongoConnectionUri);
        // await interaction.followUp({
        //     content: "Please provide additional information.",
        //     components: [
        //         {
        //             type: ComponentType.Button,
        //         },
        //         {
        //             type: ComponentType.BUTTON,
        //         }
        //     ]
        // })
        var messages = await worker.Run();
        // await interaction.followUp({
        //     ephemeral: this.Ephemeral,
        //     embeds: messages.AsEmbed          
        // });
    }
    
    public RunButton(client: Client<boolean>, interaction: ButtonInteraction<CacheType>): Promise<void> {
        throw new Error("Method not implemented.");
    }

    protected CreateButtons():  Promise<ButtonBuilder[]> 
    {
        throw "not implemented";
    }

}