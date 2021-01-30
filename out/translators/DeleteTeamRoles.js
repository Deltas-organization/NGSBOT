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
exports.DeleteTeamRoles = void 0;
const Globals_1 = require("../Globals");
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
const fs = require('fs');
class DeleteTeamRoles extends deltaTranslatorBase_1.DeltaTranslatorBase {
    get commandBangs() {
        return ["TeamPurge"];
    }
    get description() {
        return "Will remove all NGS Team Roles";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this.ReloadServerRoles(messageSender.originalMessage.guild);
            this._myRole = this.lookForRole(this._serverRoles, "NGSBOT");
            const teams = yield this.liveDataStore.GetTeams();
            try {
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                    const teamName = team.teamName;
                    const teamRoleOnDiscord = yield this.FindTeamRole(teamName);
                    if (teamRoleOnDiscord)
                        yield teamRoleOnDiscord.delete();
                }
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
            yield messageSender.SendMessage(`Finished deleting Roles!`);
        });
    }
    ReloadServerRoles(guild) {
        this._serverRoles = guild.roles.cache.map((role, _, __) => role);
        Globals_1.Globals.logAdvanced(`available Roles: ${this._serverRoles.map(role => role.name)}`);
    }
    FindTeamRole(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            teamName = teamName.trim();
            const indexOfWidthdrawn = teamName.indexOf('(Withdrawn');
            if (indexOfWidthdrawn > -1) {
                teamName = teamName.slice(0, indexOfWidthdrawn).trim();
            }
            let teamRoleOnDiscord = this.lookForRole(this._serverRoles, teamName);
            if (!teamRoleOnDiscord) {
                return null;
            }
            return teamRoleOnDiscord;
        });
    }
    lookForRole(userRoles, roleName) {
        let roleNameTrimmed = roleName.trim().toLowerCase();
        const teamWithoutSpaces = roleNameTrimmed.replace(' ', '');
        for (const role of userRoles) {
            const lowerCaseRole = role.name.toLowerCase().trim();
            if (lowerCaseRole === roleNameTrimmed)
                return role;
            let roleWithoutSpaces = lowerCaseRole.replace(' ', '');
            if (roleWithoutSpaces === teamWithoutSpaces) {
                return role;
            }
        }
        return null;
    }
}
exports.DeleteTeamRoles = DeleteTeamRoles;
//# sourceMappingURL=DeleteTeamRoles.js.map