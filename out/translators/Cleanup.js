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
exports.CleanupTranslator = void 0;
const CleanupRoleWorker_1 = require("../workers/CleanupRoleWorker");
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
class CleanupTranslator extends deltaTranslatorBase_1.DeltaTranslatorBase {
    get commandBangs() {
        return ["cleanup"];
    }
    get description() {
        return "Will Ask a series of questions on what you want to cleanup. Currently only delete empty roles.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            yield messageSender.SendReactionMessage("Would you cleanup empty roles?", (user) => user == messageSender.GuildMember, () => __awaiter(this, void 0, void 0, function* () {
                var cleanupRoleWorker = new CleanupRoleWorker_1.CleanupRoleWorker(this.translatorDependencies, detailed, messageSender);
                yield cleanupRoleWorker.Begin(commands);
            }));
        });
    }
}
exports.CleanupTranslator = CleanupTranslator;
//# sourceMappingURL=Cleanup.js.map