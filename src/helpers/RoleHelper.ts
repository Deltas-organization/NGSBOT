import { Client, Guild, Role } from "discord.js";
import { DiscordChannels } from "../enums/DiscordChannels";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";
import { ClientHelper } from "./ClientHelper";

export class RoleHelper {
    constructor(private roles: Role[]) {
        Globals.logAdvanced(`helping with Roles: ${roles.map(role => role.name)}`);
    }

    public static async CreateFrom(guild: Guild) {
        const roleInformation = await guild.roles.fetch();
        const roles = roleInformation.map((role, _, __) => role);
        const roleHelper = new RoleHelper(roles);
        return roleHelper;
    }

    public static async CreateFromclient(client: Client, channelId: DiscordChannels) {
        return await this.CreateFrom(await ClientHelper.GetGuild(client, channelId));
    }

    public FindDivRole(divisionDisplayName: string): { div: NGSRoles | null, role: Role | null } {
        let divRoleName: NGSRoles | null = null;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
            case "a":
                divRoleName = NGSRoles.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
            case "b east":
                divRoleName = NGSRoles.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSRoles.DivC;
                break;
            case "d west":
            case "d east":
            case "d southeast":
            case "d northeast":
                divRoleName = NGSRoles.DivD;
                break;
            case "e west":
            case "e east":
            case "e":
                divRoleName = NGSRoles.DivE;
                break;
            case "nexus":
                divRoleName = NGSRoles.Nexus;
                break;
            case "heroic":
                divRoleName = NGSRoles.Heroic;
                break;
            case "storm":
                divRoleName = NGSRoles.Storm;
                break;
        }
        return { div: divRoleName, role: this.lookForRole(divRoleName) };
    }

    public lookForRole(roleName: string | null): Role | null {
        if (!roleName)
            return null;

        let groomedRoleName = RoleHelper.GroomRoleNameAsLowerCase(roleName);
        for (const role of this.roles) {
            let groomedServerRole = RoleHelper.GroomRoleNameAsLowerCase(role.name);
            if (groomedServerRole === groomedRoleName)
                return role;
        }
        return null;
    }

    public static GroomRoleNameAsLowerCase(roleName: string) {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }

        roleNameTrimmed = roleNameTrimmed.toLowerCase();
        roleNameTrimmed = roleNameTrimmed.replace(/ /g, '')
        return roleNameTrimmed;
    }
}