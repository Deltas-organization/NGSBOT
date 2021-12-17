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
exports.SelfAssignRolesRemoverWorker = void 0;
const WorkerBase_1 = require("../Bases/WorkerBase");
class SelfAssignRolesRemoverWorker extends WorkerBase_1.WorkerBase {
    constructor(mongoHelper, workerDependencies, detailed, messageSender) {
        super(workerDependencies, detailed, messageSender);
        this.mongoHelper = mongoHelper;
        this.detailed = detailed;
        this.messageSender = messageSender;
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const assignableRoles = yield this.GetAssignablesRoles(commands);
                if (assignableRoles == null)
                    return;
                yield this.RemoveRoles(assignableRoles);
                this.messageSender.SendBasicMessage("I have removed the roles from the list.");
            }
            catch (e) {
            }
        });
    }
    GetAssignablesRoles(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            const allRoles = yield this.guild.roles.fetch();
            const rolesToWatch = [];
            let allRolesValid = true;
            for (const command of commands) {
                if (command.startsWith('<@&') && command.endsWith('>')) {
                    const commandName = command.slice(3, -1);
                    const existingRole = yield allRoles.fetch(commandName);
                    if (existingRole) {
                        rolesToWatch.push(commandName);
                    }
                    else {
                        allRolesValid = false;
                    }
                }
                else {
                    allRolesValid = false;
                }
            }
            if (!allRolesValid) {
                yield this.messageSender.SendBasicMessage("Unable to find all valid roles, Aborting...");
                return null;
            }
            return rolesToWatch;
        });
    }
    RemoveRoles(rolesToWatch) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignRolesRequest = {
                guildId: this.guild.id,
                assignablesRoles: rolesToWatch
            };
            return yield this.mongoHelper.RemoveAssignedRoles(assignRolesRequest);
        });
    }
}
exports.SelfAssignRolesRemoverWorker = SelfAssignRolesRemoverWorker;
//# sourceMappingURL=SelfAssignRolesRemoverWorker.js.map