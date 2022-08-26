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
exports.SelfAssignRolesWatcherWorker = void 0;
const Globals_1 = require("../../Globals");
const MessageHelper_1 = require("../../helpers/MessageHelper");
const RoleWorkerBase_1 = require("../Bases/RoleWorkerBase");
class SelfAssignRolesWatcherWorker extends RoleWorkerBase_1.RoleWorkerBase {
    constructor(mongoHelper, workerDependencies, detailed, messageSender) {
        super(workerDependencies, detailed, messageSender, mongoHelper);
        this.mongoHelper = mongoHelper;
        this.detailed = detailed;
        this.messageSender = messageSender;
    }
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.detailed) {
                    yield this.DisplayRolesAssignable();
                }
                else {
                    const resultMessage = yield this.AssignOrUnassignRolesFromUser(commands);
                    if (resultMessage)
                        this.messageSender.SendMessage(resultMessage.CreateStringMessage());
                }
            }
            catch (e) {
                Globals_1.Globals.log("Error", e);
            }
        });
    }
    DisplayRolesAssignable() {
        return __awaiter(this, void 0, void 0, function* () {
            const currentRolesToWatch = yield this.mongoHelper.GetAssignedRoleRequests(this.guild.id);
            const allRoles = yield this.guild.roles.fetch();
            const roleNames = [];
            for (var roleNameWatching of currentRolesToWatch) {
                let role = yield allRoles.find(r => r.id == roleNameWatching);
                if (role)
                    roleNames.push(role.name);
            }
            const message = `The roles currently assignable are: ${roleNames.join(', ')}.`;
            this.messageSender.SendBasicMessage(message);
        });
    }
    AssignOrUnassignRolesFromUser(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentRolesToWatch = yield this.mongoHelper.GetAssignedRoleRequests(this.guild.id);
            const assignedRoles = [];
            const removedRoles = [];
            var rolesOfMember = yield this.GetUserRoles();
            if (!rolesOfMember || !this.messageSender.GuildMember)
                return;
            for (const command of commands) {
                const commandName = command.toLowerCase();
                for (const roleNameWatching of currentRolesToWatch) {
                    const role = this.roleHelper.lookForRole(commandName);
                    if (role && role.id == roleNameWatching) {
                        if (rolesOfMember.find(r => r == role)) {
                            this.messageSender.GuildMember.roles.remove(role);
                            removedRoles.push(role.name);
                        }
                        else {
                            this.messageSender.GuildMember.roles.add(role);
                            assignedRoles.push(role.name);
                        }
                    }
                }
            }
            const messageToSend = new MessageHelper_1.MessageHelper();
            if (assignedRoles.length <= 0 && removedRoles.length <= 0) {
                messageToSend.AddNew("No roles found to assign.");
                return messageToSend;
            }
            if (assignedRoles.length > 0) {
                messageToSend.AddNew(`I have assigned you the following roles: ${assignedRoles.join(", ")}`);
            }
            if (removedRoles.length > 0) {
                messageToSend.AddNewLine(`I have removed the following roles: ${removedRoles.join(", ")}`);
            }
            return messageToSend;
        });
    }
}
exports.SelfAssignRolesWatcherWorker = SelfAssignRolesWatcherWorker;
//# sourceMappingURL=SelfAssignRolesWatcherWorker.js.map