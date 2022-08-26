import { Client, GuildChannel } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";

export class ClientHelper {

    public static async GetGuild(client: Client, channelId: DiscordChannels) {
        const channel = (await client.channels.fetch(channelId)) as GuildChannel;
        return channel.guild;
    }

    public static async GetMembers(client: Client, discordChannel: DiscordChannels) {
        return await (await (await this.GetGuild(client, discordChannel)).members.fetch()).map((mem, _, __) => mem);
    }
}