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
exports.Reload = void 0;
const deltaTranslatorBase_1 = require("./bases/deltaTranslatorBase");
class Reload extends deltaTranslatorBase_1.DeltaTranslatorBase {
    get commandBangs() {
        return ["reload"];
    }
    get description() {
        return "Will reload the user, teams, and divisions stored in the cache";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            this.dataStore.Clear();
            yield this.dataStore.GetDivisions();
            let message = yield messageSender.SendMessage("Reloaded 1/4");
            yield this.dataStore.GetSchedule();
            yield messageSender.Edit(message, "Reloaded 2/4");
            yield this.dataStore.GetTeams();
            yield messageSender.Edit(message, "Reloaded 3/4");
            yield this.dataStore.GetUsers();
            yield messageSender.Edit(message, "Reload Complete");
        });
    }
}
exports.Reload = Reload;
//# sourceMappingURL=Reload.js.map