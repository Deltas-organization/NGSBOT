"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleHelper = void 0;
const NGSRoles_1 = require("../enums/NGSRoles");
const Globals_1 = require("../Globals");
class RoleHelper {
    constructor(roles) {
        this.roles = roles;
        Globals_1.Globals.logAdvanced(`helping with Roles: ${roles.map(role => role.name)}`);
    }
    static CreateFrom(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            const roleHelper = new RoleHelper(roles);
            return roleHelper;
        });
    }
    FindDivRole(divisionDisplayName) {
        let divRoleName;
        switch (divisionDisplayName.toLowerCase()) {
            case "a west":
            case "a east":
            case "a":
                divRoleName = NGSRoles_1.NGSRoles.DivA;
                break;
            case "b west":
            case "b southeast":
            case "b northeast":
                divRoleName = NGSRoles_1.NGSRoles.DivB;
                break;
            case "c west":
            case "c east":
                divRoleName = NGSRoles_1.NGSRoles.DivC;
                break;
            case "d west":
            case "d east":
            case "d southeast":
            case "d northeast":
                divRoleName = NGSRoles_1.NGSRoles.DivD;
                break;
            case "e west":
            case "e east":
                divRoleName = NGSRoles_1.NGSRoles.DivE;
                break;
            case "nexus":
                divRoleName = NGSRoles_1.NGSRoles.Nexus;
                break;
            case "heroic":
                divRoleName = NGSRoles_1.NGSRoles.Heroic;
                break;
            case "storm":
                divRoleName = NGSRoles_1.NGSRoles.Storm;
                break;
        }
        return { div: divRoleName, role: this.lookForRole(divRoleName) };
    }
    lookForRole(roleName) {
        let groomedRoleName = this.GroomRoleNameAsLowerCase(roleName);
        for (const role of this.roles) {
            let groomedServerRole = this.GroomRoleNameAsLowerCase(role.name);
            if (groomedServerRole === groomedRoleName)
                return role;
        }
        return null;
    }
    GroomRoleNameAsLowerCase(roleName) {
        let roleNameTrimmed = roleName.trim();
        const indexOfWidthdrawn = roleNameTrimmed.indexOf('(Withdrawn');
        if (indexOfWidthdrawn > -1) {
            roleNameTrimmed = roleNameTrimmed.slice(0, indexOfWidthdrawn).trim();
        }
        roleNameTrimmed = roleNameTrimmed.toLowerCase();
        roleNameTrimmed = roleNameTrimmed.replace(/ /g, '');
        return roleNameTrimmed;
    }
}
exports.RoleHelper = RoleHelper;
//# sourceMappingURL=RoleHelper.js.map