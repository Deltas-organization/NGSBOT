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
exports.SelfAssignRolesCreator = void 0;
const SelfAssignRolesCreatorWorker_1 = require("../../workers/Mongo/SelfAssignRolesCreatorWorker");
const adminTranslatorBase_1 = require("../bases/adminTranslatorBase");
class SelfAssignRolesCreator extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["self"];
    }
    get description() {
        return "Will register which roles can be self assigned for your discord. Detailed (-d) will list the current roles that can be self assigned.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const watchWorker = new SelfAssignRolesCreatorWorker_1.SelfAssignRolesCreatorWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
            yield watchWorker.Begin(commands);
        });
    }
}
exports.SelfAssignRolesCreator = SelfAssignRolesCreator;
//# sourceMappingURL=SelfAssignRolesCreator.js.map