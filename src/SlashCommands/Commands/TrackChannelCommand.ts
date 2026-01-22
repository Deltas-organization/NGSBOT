import { ApplicationCommandOptionData, Client, CommandInteraction, CacheType, ApplicationCommandOptionType, PermissionResolvable, PermissionFlagsBits, GuildMember } from "discord.js";
import { DiscordGuilds } from "../../enums/DiscordGuilds";
import { Random } from "../../helpers/RandomOptions";
import { OptionsCommandBase } from "../Base/OptionsCommandBase";
import { RandomSlashWorker } from "../Workers/RandomSlashworker";
import { TrackChannelWorker } from "../Workers/TrackChannelWorker";
import { SlashCommandBase } from "../Base/SlashCommandBase";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { DiscordMembers } from "../../enums/DiscordMembers";

export class TrackedChannelCommand extends OptionsCommandBase {

    protected Description: string = "Will Track this channel";
    public Name: string = "track";
    public GuildLocation = DiscordGuilds.NGS;
    public Permissions: PermissionResolvable = PermissionFlagsBits.BanMembers;

    constructor(private mongoConnectionUri: string) {
        super();
    }

    public async RunCommand(client: Client<boolean>, interaction: CommandInteraction<CacheType>): Promise<void> {
        const member = interaction.member as GuildMember;
        //NGS REC RoleId
        if (member.id != DiscordMembers.Delta && member?.roles.cache.has("522579713554776064") !== true) {
            await interaction.followUp(
                {
                    content: 'you do not have permission to run this command'
                });
            return;
        }
        const worker = new TrackChannelWorker(this.mongoConnectionUri);
        const message = await worker.Run(interaction.channelId, interaction.options.data);
        if (message === "Added") {
            await interaction.followUp(
                {
                    content: 'This channel is now being tracked.'
                });
        }
        else {
            await interaction.followUp(
                {
                    content: 'This channel is no longer being tracked.'
                });
        }
    }

    public CreateOptions(): ApplicationCommandOptionData[] {
        const options: ApplicationCommandOptionData[] = [];
        options.push({
            name: "day_reminder",
            description: "Sets the Days Required of Interactions before posting",
            type: ApplicationCommandOptionType.Integer
        })
        return options;
    }

}