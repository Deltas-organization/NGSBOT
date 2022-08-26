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
exports.AssignFreeAgentRoleWorker = void 0;
const NGSRoles_1 = require("../enums/NGSRoles");
const Globals_1 = require("../Globals");
const RoleWorkerBase_1 = require("./Bases/RoleWorkerBase");
const fs = require('fs');
class AssignFreeAgentRoleWorker extends RoleWorkerBase_1.RoleWorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.BeginWorker();
        });
    }
    BeginWorker() {
        return __awaiter(this, void 0, void 0, function* () {
            let message = "Unable To Assign Free Agent Role";
            try {
                const guildMember = (yield this.messageSender.GuildMember);
                let freeAgentRole = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.FreeAgents);
                var rolesOfUser = yield this.GetUserRoles();
                if (freeAgentRole != null && rolesOfUser) {
                    if (!this.HasRole(rolesOfUser, freeAgentRole)) {
                        yield this.AssignRole(guildMember, freeAgentRole);
                        message = "Assigned Free Agent Role";
                    }
                    else {
                        yield this.RemoveRole(guildMember, freeAgentRole);
                        message = "Removed Free Agent Role";
                    }
                }
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
            yield this.messageSender.SendMessage(message);
        });
    }
    AssignRole(guildMember, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (guildMember)
                yield guildMember.roles.add(divRole);
        });
    }
    RemoveRole(guildMember, role) {
        return __awaiter(this, void 0, void 0, function* () {
            if (guildMember)
                yield guildMember.roles.remove(role);
        });
    }
    HasRole(rolesOfUser, roleToLookFor) {
        return rolesOfUser.find(role => role == roleToLookFor);
    }
}
exports.AssignFreeAgentRoleWorker = AssignFreeAgentRoleWorker;
//# sourceMappingURL=AssignFreeAgentRoleWorker.js.map