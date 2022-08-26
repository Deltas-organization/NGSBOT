import { GuildMember, Role } from "discord.js";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";

export class LeaveWorker extends RoleWorkerBase {
    protected async Start(commands: string[]) {
        await this.BeginRemoving();
    }

    private async BeginRemoving() {

        let rolesOfUser = await this.GetUserRoles();
        if (!rolesOfUser)
            return;

        let foundOneRole = false;
        for (var role of rolesOfUser) {
            if (!this.reserveredRoles.find(serverRole => role == serverRole)) {
                if (this.myBotRole.comparePositionTo(role) > 0) {
                    foundOneRole = true;
                    await this.AskRoleRemoval(role);
                }
            }
        }

        if (!foundOneRole)
            await this.messageSender.SendMessage("No roles found to remove.");
        else
            await this.messageSender.SendMessage("Thats all the roles I found!");
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

    private async RemoveRole(guildMember: GuildMember, role: Role) {
        await guildMember.roles.remove(role);
    }
}