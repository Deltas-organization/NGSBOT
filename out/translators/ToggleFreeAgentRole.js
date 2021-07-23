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
exports.ToggleFreeAgentRole = void 0;
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const AssignFreeAgentRoleWorker_1 = require("../workers/AssignFreeAgentRoleWorker");
class ToggleFreeAgentRole extends ngsTranslatorBase_1.ngsTranslatorBase {
    get commandBangs() {
        return ["assign", "unassign"];
    }
    get description() {
        return "Will assign or unassign free agent role";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands[0].toLowerCase().startsWith("free")) {
                const assignRolesWorker = new AssignFreeAgentRoleWorker_1.AssignFreeAgentRoleWorker(this.translatorDependencies, detailed, messageSender);
                yield assignRolesWorker.Begin(commands);
            }
        });
    }
}
exports.ToggleFreeAgentRole = ToggleFreeAgentRole;
//# sourceMappingURL=ToggleFreeAgentRole.js.map