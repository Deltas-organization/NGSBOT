import { Role } from "discord.js";
import { WorkerBase } from "./Bases/WorkerBase";

export class CleanupRoleWorker extends WorkerBase {
    private _roles: Role[] = []
    protected async Start(commands: string[]) {
        this._roles = await this.messageSender.GuildMember.guild.roles.cache.map((role, _, __) => role);
        await this.removeRolesWithNoOneAssigned();
    }
    private async removeRolesWithNoOneAssigned() {
        for (var role of this._roles) {
            if (role.members.size == 0) {
                await role.delete("No one assigned");
            }
        }
    }
}