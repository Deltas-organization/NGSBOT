import { Role } from "discord.js";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";
import { WorkerBase } from "./Bases/WorkerBase";

export class CleanupRoleWorker extends RoleWorkerBase {
    protected async Start(commands: string[]) {
        await this.removeRolesWithNoOneAssigned();
    }
    private async removeRolesWithNoOneAssigned() {
        var roles = await this.GetGuildRoles();
        if (roles) {
            for (var role of roles) {
                if (role.members.size == 0) {
                    await role.delete("No one assigned");
                }
            }
        }
    }
}