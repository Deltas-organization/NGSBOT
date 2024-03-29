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
const AssignFreeAgentRoleWorker_1 = require("../workers/AssignFreeAgentRoleWorker");
const ngsOnlyTranslatorBase_1 = require("./bases/ngsOnlyTranslatorBase");
class ToggleFreeAgentRole extends ngsOnlyTranslatorBase_1.NGSOnlyTranslatorBase {
    get commandBangs() {
        return ["assign", "unassign"];
    }
    get description() {
        return "Will assign or unassign free agent role";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length <= 0)
                return;
            if (commands[0].toLowerCase().startsWith("free")) {
                const assignRolesWorker = new AssignFreeAgentRoleWorker_1.AssignFreeAgentRoleWorker(this.translatorDependencies, detailed, messageSender, this.CreateMongoHelper());
                yield assignRolesWorker.Begin(commands);
            }
        });
    }
}
exports.ToggleFreeAgentRole = ToggleFreeAgentRole;
//# sourceMappingURL=ToggleFreeAgentRole.js.map