import { Guild, Role } from "discord.js";
import { NGSRoles } from "../../enums/NGSRoles";
import { Globals } from "../../Globals";
import { RoleHelper } from "../../helpers/RoleHelper";
import { WorkerBase } from "./WorkerBase";

export abstract class RoleWorkerBase extends WorkerBase {

    protected reservedRoleNames: string[] = [
        'Caster Hopefuls',
        NGSRoles.FreeAgents,
        'Moist',
        'Supporter',
        'Interviewee',
        'Bots',
        'Storm Casters',
        'Ladies of the Nexus',
        'HL Staff',
        'Editor',
        'Nitro Booster',
        'It',
        'Has Cooties',
        'PoGo Raider',
        'Cupid Captain',
        'HCI Player',
        'Trait Value',
        NGSRoles.Storm,
        '@everyone'];

    protected reserveredRoles: Role[] = [];
    protected myBotRole: Role;
    protected captainRole: Role;
    protected stormRole: Role;

    protected roleHelper: RoleHelper;

    public async Begin(commands: string[]) {
        await this.Setup();
        await this.Start(commands);
    }

    private async Setup() {
        this.dataStore.Clear();
        await this.InitializeRoleHelper(this.messageSender.originalMessage.guild);
        this.captainRole = this.roleHelper.lookForRole(NGSRoles.Captain);
        this.myBotRole = this.roleHelper.lookForRole(NGSRoles.NGSBot);
        this.stormRole = this.roleHelper.lookForRole(NGSRoles.Storm);
        this.reserveredRoles = this.GetReservedRoles();
    }

    private async InitializeRoleHelper(guild: Guild) {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.cache.map((role, _, __) => role);
        this.roleHelper = new RoleHelper(roles);
    }

    private GetReservedRoles(): Role[] {
        const result = [];
        for (var roleName of this.reservedRoleNames) {
            let foundRole = this.roleHelper.lookForRole(roleName);
            if (foundRole) {
                result.push(foundRole);
            }
            else {
                Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }
}