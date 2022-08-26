import { Globals } from "../Globals";
import { RoleHelper } from "../helpers/RoleHelper";
import { RoleWorkerBase } from "./Bases/RoleWorkerBase";

export class DisplayUnusedRoles extends RoleWorkerBase {

    protected async Start(commands: string[]) {
        await this.BeginAssigning();
    }

    private async BeginAssigning() {
        const TeamHelper = await this.dataStore.GetTeams();
        const unusedRoles: string[] = [];
        try {
            if (!this.messageSender.originalMessage.guild)
                return;

            let allRoles = (await this.messageSender.originalMessage.guild.roles.fetch()).map((mem, _, __) => mem);
            for (var role of allRoles.sort((r1, r2) => r2.position - r1.position)) {
                if (this.myBotRole.comparePositionTo(role) > 0) {
                    let color = role.hexColor
                    const roleName = RoleHelper.GroomRoleNameAsLowerCase(role.name);
                    let found = await TeamHelper.LookForTeamByRole(roleName);
                    if (!found) {
                        unusedRoles.push(color + ":" + role.name);
                    }
                }
            }
        }
        catch (e) {
            Globals.log(e);
        }
        this.messageSender.SendMessage("unused Roles:" + unusedRoles.sort((n1, n2) => +n1 - +n2).map(role => role));
    }
}