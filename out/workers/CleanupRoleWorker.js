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
exports.CleanupRoleWorker = void 0;
const WorkerBase_1 = require("./Bases/WorkerBase");
class CleanupRoleWorker extends WorkerBase_1.WorkerBase {
    constructor() {
        super(...arguments);
        this._roles = [];
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this._roles = yield this.messageSender.GuildMember.guild.roles.cache.map((role, _, __) => role);
            yield this.removeRolesWithNoOneAssigned();
        });
    }
    removeRolesWithNoOneAssigned() {
        return __awaiter(this, void 0, void 0, function* () {
            for (var role of this._roles) {
                if (role.members.size == 0) {
                    yield role.delete("No one assigned");
                }
            }
        });
    }
}
exports.CleanupRoleWorker = CleanupRoleWorker;
//# sourceMappingURL=CleanupRoleWorker.js.map