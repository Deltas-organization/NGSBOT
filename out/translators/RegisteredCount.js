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
exports.RegisteredCount = void 0;
const adminTranslatorBase_1 = require("./bases/adminTranslatorBase");
class RegisteredCount extends adminTranslatorBase_1.AdminTranslatorBase {
    get commandBangs() {
        return ["registered"];
    }
    get description() {
        return "Will Return number of registered teams and users.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const numberOfTeams = (yield this.dataStore.GetTeams()).length;
            const numberOfPlayers = (yield this.dataStore.GetUsers()).length;
            yield message.SendMessage(`Registered Team Count: ${numberOfTeams} \n Number of users on said teams: ${numberOfPlayers}`);
        });
    }
}
exports.RegisteredCount = RegisteredCount;
//# sourceMappingURL=RegisteredCount.js.map