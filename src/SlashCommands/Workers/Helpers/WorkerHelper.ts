import { Client, Guild, GuildChannel, GuildMember, Role } from "discord.js";
import { DiscordChannels } from "../../../enums/DiscordChannels";
import { RoleHelper } from "../../../helpers/RoleHelper";

export class WorkerHelper {

    private _guild: Guild | undefined = undefined;
    get Guild(): Promise<Guild> {
        return new Promise<Guild>(async (Resolver, rejector) => {
            if (!this._guild)
                this._guild = await this.GetGuild();
            Resolver(this._guild);
        });
    }

    public constructor(private client: Client<boolean>, private _channelId: string) {
    }

    public async Setup() {
    }

    private async GetGuild() {
        const channel = (await this.client.channels.fetch(this._channelId)) as GuildChannel;
        return channel.guild;
    }

    public async GetGuildMembers() {
        var guild = await this.Guild;
        if (guild)
            return (await guild.members.fetch()).map((mem, _, __) => mem);
    }

    public async AssignRole(guildMember: GuildMember, roleToAssign: Role) {
        await guildMember.roles.add(roleToAssign);
    }

    public HasRole(rolesOfUser: Role[], roleToLookFor: Role) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}