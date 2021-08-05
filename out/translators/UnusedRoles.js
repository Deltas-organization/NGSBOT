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
exports.UnUsedRoles = void 0;
const ngsTranslatorBase_1 = require("./bases/ngsTranslatorBase");
const DisplayUnusedRoles_1 = require("../workers/DisplayUnusedRoles");
const fs = require('fs');
class UnUsedRoles extends ngsTranslatorBase_1.ngsTranslatorBase {
    get commandBangs() {
        return ["roles"];
    }
    get description() {
        return "Will Check all roles in the server and compare to team on the webstie.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const rolesWorker = new DisplayUnusedRoles_1.DisplayUnusedRoles(this.translatorDependencies, detailed, messageSender);
            yield rolesWorker.Begin(commands);
        });
    }
}
exports.UnUsedRoles = UnUsedRoles;
//# sourceMappingURL=UnusedRoles.js.map