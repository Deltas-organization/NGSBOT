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
exports.SelfAssignRolesWatcher = void 0;
const SelfAssignRolesWatcherWorker_1 = require("../../workers/Mongo/SelfAssignRolesWatcherWorker");
const translatorBase_1 = require("../bases/translatorBase");
class SelfAssignRolesWatcher extends translatorBase_1.TranslatorBase {
    get commandBangs() {
        return ['assign'];
    }
    get description() {
        return 'Will assign you a role if the role is available. -d will list available roles to assign.';
    }
    get delimiter() {
        return ';';
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const watchWorker = new SelfAssignRolesWatcherWorker_1.SelfAssignRolesWatcherWorker(this.CreateMongoHelper(), this.translatorDependencies, detailed, messageSender);
            yield watchWorker.Begin(commands);
        });
    }
}
exports.SelfAssignRolesWatcher = SelfAssignRolesWatcher;
//# sourceMappingURL=SelfAssignRolesWatcher.js.map