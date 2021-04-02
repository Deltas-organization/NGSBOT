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
exports.AssignUserCommand = void 0;
const NGSRoles_1 = require("../enums/NGSRoles");
const MessageHelper_1 = require("../helpers/MessageHelper");
const RoleHelper_1 = require("../helpers/RoleHelper");
class AssignUserCommand {
    constructor(dependencies) {
        this.messageStore = dependencies.messageStore;
        this.liveDataStore = dependencies.liveDataStore;
    }
    AssignUser(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Setup(guildMember);
        });
    }
    Setup(guildMember) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.InitializeRoleHelper(guildMember.guild);
            this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
        });
    }
    InitializeRoleHelper(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            this._serverRoleHelper = new RoleHelper_1.RoleHelper(roles);
        });
    }
    LookForTeam() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teams = yield this.liveDataStore.GetTeams();
                for (var team of teams.sort((t1, t2) => t1.teamName.localeCompare(t2.teamName))) {
                }
            }
            catch (_a) {
            }
        });
    }
    AssignValidRoles(messageSender, team, guildMembers) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamName = team.teamName;
            let result = new MessageHelper_1.MessageHelper(team.teamName);
            const teamRoleOnDiscord = yield this.CreateOrFindTeamRole(messageSender, result, teamName);
            const roleRsponse = this._serverRoleHelper.FindDivRole(team.divisionDisplayName);
            const divRoleOnDiscord = roleRsponse.div == NGSRoles_1.NGSRoles.Storm ? null : roleRsponse.role;
            yield this.AssignUsersToRoles(team, guildMembers, result, teamRoleOnDiscord, divRoleOnDiscord);
            return result;
        });
    }
    AssignRole(guildMember, divRole) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._testing)
                yield guildMember.roles.add(divRole);
        });
    }
}
exports.AssignUserCommand = AssignUserCommand;
//# sourceMappingURL=AssignUserCommand.js.map