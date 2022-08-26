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
exports.LeaveWorker = void 0;
const RoleWorkerBase_1 = require("./Bases/RoleWorkerBase");
class LeaveWorker extends RoleWorkerBase_1.RoleWorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.BeginRemoving();
        });
    }
    BeginRemoving() {
        return __awaiter(this, void 0, void 0, function* () {
            let rolesOfUser = yield this.GetUserRoles();
            if (!rolesOfUser)
                return;
            let foundOneRole = false;
            for (var role of rolesOfUser) {
                if (!this.reserveredRoles.find(serverRole => role == serverRole)) {
                    if (this.myBotRole.comparePositionTo(role) > 0) {
                        foundOneRole = true;
                        yield this.AskRoleRemoval(role);
                    }
                }
            }
            if (!foundOneRole)
                yield this.messageSender.SendMessage("No roles found to remove.");
            else
                yield this.messageSender.SendMessage("Thats all the roles I found!");
        });
    }
    AskRoleRemoval(role) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageResult = yield this.messageSender.SendReactionMessage(`would you like me to remove Role: ${role.name}`, (member) => member == this.messageSender.GuildMember, () => {
                if (this.messageSender.GuildMember)
                    this.RemoveRole(this.messageSender.GuildMember, role);
            });
            if (messageResult)
                messageResult.message.delete();
        });
    }
    RemoveRole(guildMember, role) {
        return __awaiter(this, void 0, void 0, function* () {
            yield guildMember.roles.remove(role);
        });
    }
}
exports.LeaveWorker = LeaveWorker;
//# sourceMappingURL=LeaveWorker.js.map