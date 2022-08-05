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
exports.DisplayUnusedRoles = void 0;
const Globals_1 = require("../Globals");
const RoleHelper_1 = require("../helpers/RoleHelper");
const RoleWorkerBase_1 = require("./Bases/RoleWorkerBase");
class DisplayUnusedRoles extends RoleWorkerBase_1.RoleWorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.BeginAssigning();
        });
    }
    BeginAssigning() {
        return __awaiter(this, void 0, void 0, function* () {
            const TeamHelper = yield this.dataStore.GetTeams();
            const unusedRoles = [];
            try {
                let allRoles = (yield this.messageSender.originalMessage.guild.roles.fetch()).cache.map((mem, _, __) => mem);
                for (var role of allRoles.sort((r1, r2) => r2.position - r1.position)) {
                    if (this.myBotRole.comparePositionTo(role) > 0) {
                        let color = role.hexColor;
                        const roleName = RoleHelper_1.RoleHelper.GroomRoleNameAsLowerCase(role.name);
                        let found = yield TeamHelper.LookForTeamByRole(roleName);
                        if (!found) {
                            unusedRoles.push(color + ":" + role.name);
                        }
                    }
                }
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
            this.messageSender.SendMessage("unused Roles:" + unusedRoles.sort((n1, n2) => +n1 - +n2).map(role => role));
        });
    }
}
exports.DisplayUnusedRoles = DisplayUnusedRoles;
//# sourceMappingURL=DisplayUnusedRoles.js.map