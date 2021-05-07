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
exports.Leave = void 0;
const Globals_1 = require("../Globals");
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const NGSRoles_1 = require("../enums/NGSRoles");
const RoleHelper_1 = require("../helpers/RoleHelper");
const fs = require('fs');
class Leave extends ngsTranslatorBase_1.ngsTranslatorBase {
    constructor() {
        super(...arguments);
        this._reservedRoleNames = [
            'Caster Hopefuls',
            NGSRoles_1.NGSRoles.FreeAgents,
            'Moist',
            'Supporter',
            'Interviewee',
            'Bots',
            'Storm Casters',
            'Ladies of the Nexus',
            'HL Staff',
            'Editor',
            'Nitro Booster',
            'It',
            'Has Cooties',
            'PoGo Raider',
            'Cupid Captain',
            'Trait Value',
            NGSRoles_1.NGSRoles.Storm,
            '@everyone'
        ];
        this._reserveredRoles = [];
    }
    get commandBangs() {
        return ["leave"];
    }
    get description() {
        return "Will prompt user for role removals.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Setup(messageSender);
            const message = yield this.Begin(messageSender);
            yield messageSender.SendMessage(message);
        });
    }
    Setup(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dataStore.Clear();
            yield this.InitializeRoleHelper(messageSender.originalMessage.guild);
            this._captainRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
            this._myBotRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.NGSBot);
            this._stormRole = this._serverRoleHelper.lookForRole(NGSRoles_1.NGSRoles.Storm);
            this._reserveredRoles = this.GetReservedRoles();
        });
    }
    InitializeRoleHelper(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleInformation = yield guild.roles.fetch();
            const roles = roleInformation.cache.map((role, _, __) => role);
            this._serverRoleHelper = new RoleHelper_1.RoleHelper(roles);
        });
    }
    GetReservedRoles() {
        const result = [];
        for (var roleName of this._reservedRoleNames) {
            let foundRole = this._serverRoleHelper.lookForRole(roleName);
            if (foundRole) {
                result.push(foundRole);
            }
            else {
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }
    Begin(messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesOfUser = messageSender.GuildMember.roles.cache.map((role, _, __) => role);
            let foundOneRole = false;
            for (var role of rolesOfUser) {
                if (!this._reserveredRoles.find(serverRole => role == serverRole)) {
                    if (this._myBotRole.comparePositionTo(role) > 0) {
                        foundOneRole = true;
                        yield this.AskRoleRemoval(messageSender, role);
                    }
                }
            }
            if (!foundOneRole)
                return "No roles found to remove.";
            else
                return "Thats all the roles I found!";
        });
    }
    AskRoleRemoval(messageSender, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const messageResult = yield messageSender.SendReactionMessage(`would you like me to remove Role: ${role.name}`, (member) => member == messageSender.GuildMember, () => this.RemoveRole(messageSender.GuildMember, role));
            messageResult.message.delete();
        });
    }
    RemoveRole(guildMember, role) {
        return __awaiter(this, void 0, void 0, function* () {
            yield guildMember.roles.remove(role);
        });
    }
}
exports.Leave = Leave;
//# sourceMappingURL=Leave.js.map