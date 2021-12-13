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
exports.RoleWorkerBase = void 0;
const NGSRoles_1 = require("../../enums/NGSRoles");
const Globals_1 = require("../../Globals");
const RoleHelper_1 = require("../../helpers/RoleHelper");
const WorkerBase_1 = require("./WorkerBase");
class RoleWorkerBase extends WorkerBase_1.WorkerBase {
    constructor() {
        super(...arguments);
        this.reservedRoleNames = [
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
            'HCI Player',
            'Trait Value',
            NGSRoles_1.NGSRoles.Storm,
            'MemberList',
            '@everyone'
        ];
        this.reserveredRoles = [];
    }
    Begin(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.Setup();
            yield this.Start(commands);
        });
    }
    Setup() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dataStore.Clear();
            this.roleHelper = yield RoleHelper_1.RoleHelper.CreateFrom(this.messageSender.originalMessage.guild);
            this.captainRole = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.Captain);
            this.myBotRole = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.NGSBot);
            this.stormRole = this.roleHelper.lookForRole(NGSRoles_1.NGSRoles.Storm);
            this.reserveredRoles = this.GetReservedRoles();
        });
    }
    GetReservedRoles() {
        const result = [];
        for (var roleName of this.reservedRoleNames) {
            let foundRole = this.roleHelper.lookForRole(roleName);
            if (foundRole) {
                result.push(foundRole);
            }
            else {
                Globals_1.Globals.logAdvanced(`didnt find role: ${roleName}`);
            }
        }
        return result;
    }
}
exports.RoleWorkerBase = RoleWorkerBase;
//# sourceMappingURL=RoleWorkerBase.js.map