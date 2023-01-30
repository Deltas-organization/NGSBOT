import { BaseCommandInteraction, CacheType, Guild, GuildMember, Role, User } from "discord.js";

export class UserHelper {
    private _user: User;
    private _guild: Guild;

    public constructor(interaction: BaseCommandInteraction<CacheType>) {
        this._user = interaction.user;
        if (interaction.guild)
            this._guild = interaction.guild;
    }

    public async GetRoles() {
        const member = await this.GetMember();
        return await member.roles.cache.map((role, _, __) => role);
    }

    private _guildMember: GuildMember;
    private async GetMember(): Promise<GuildMember> {
        if (!this._guildMember) {
            const members = await this._guild.members.cache.map((member, _, __) => member);
            for (const member of members) {
                if (member.id == this._user.id) {
                    this._guildMember = member;
                    break;
                }
            }
        }
        
        return this._guildMember;
    }

    private _guildRoles: Role[];
    private async GetGuildRoles() {
        if (!this._guildRoles)
            this._guildRoles = await this._guild.roles.cache.map((role, _, __) => role);

        return this._guildRoles;
    }
}