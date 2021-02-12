import { Role } from "discord.js";
import { NGSRoles } from "../enums/NGSRoles";
import { Globals } from "../Globals";

export class RoleHelper
{
    constructor(private roles: Role[])
    {        
        Globals.logAdvanced(`helping with Roles: ${roles.map(role => role.name)}`);
    }

    
    public FindDivRole(divisionDisplayName: string)
    {
        let divRoleName: NGSRoles;
        switch (divisionDisplayName.toLowerCase())
        {
            case "a west":
            case "a east":
                divRoleName = NGSRoles.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = NGSRoles.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSRoles.DivC;
                break;
            case "d west":
            case "d east":
                divRoleName = NGSRoles.DivD;
                break;
            case "e west":
            case "e east":
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
                return null;
        }
        return this.lookForRole(divRoleName);
    }

    public lookForRole(roleName: string): Role
    {
        let groomedRoleName = this.GroomRoleNameAsLowerCase(roleName);
        for (const role of this.roles)
        {
            let groomedServerRole = this.GroomRoleNameAsLowerCase(role.name);
            if (groomedServerRole === groomedRoleName)
                return role;
        }
        return null;
    }

    private GroomRoleNameAsLowerCase(roleName: string)
    {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1)
        {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }

        roleNameTrimmed = roleNameTrimmed.toLowerCase();
        roleNameTrimmed = roleNameTrimmed.replace(/ /g, '')
        return roleNameTrimmed;
    }
}