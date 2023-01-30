import { BaseCommandInteraction, CacheType, Guild, Message, User } from "discord.js";
import { NGSRoles } from "../../enums/NGSRoles";
import { RoleHelper } from "../../helpers/RoleHelper";
import { UserHelper } from "../../helpers/UserHelper";
import { MessageContainer } from "../../message-helpers/MessageContainer";

export class RemoveRolesSlashWorker {
    private _userHelper: UserHelper;
    private _guild: Guild;

    public constructor(_interaction: BaseCommandInteraction<CacheType>) {
        this._userHelper = new UserHelper(_interaction);
        if (_interaction.guild)
            this._guild = _interaction.guild;
    }

    public async Run(): Promise<MessageContainer> {
        const container = new MessageContainer();
        const rolesOfUser = await this._userHelper.GetRoles();
        if (!rolesOfUser) {
            container.AddSimpleGroup("No roles found for user");
            return container;
        }

        const roleHelper = await RoleHelper.CreateFrom(this._guild);
        const reservedRoles = roleHelper.GetReservedRoles();
        const botRole = roleHelper.lookForRole(NGSRoles.NGSBot);

        let foundOneRole = false;
        for (var role of rolesOfUser) {
            if (!reservedRoles.find(serverRole => role == serverRole)) {
                if (botRole && botRole.comparePositionTo(role) > 0) {
                    foundOneRole = true;
                    await this.AskRoleRemoval(role);
                }
            }
        }

        return container;
    }
    
    private async AskRoleRemoval(role: Role) {
        const messageResult = await this.messageSender.SendReactionMessage(
            `would you like me to remove Role: ${role.name}`,
            (member) => member == this.messageSender.GuildMember,
            () => {
                if (this.messageSender.GuildMember)
                    this.RemoveRole(this.messageSender.GuildMember, role)
            });
        if (messageResult)
            messageResult.message.delete();
    }
}