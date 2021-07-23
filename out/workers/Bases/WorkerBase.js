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
exports.WorkerBase = void 0;
class WorkerBase {
    constructor(workerDependencies, detailed, messageSender) {
        this.detailed = detailed;
        this.messageSender = messageSender;
        this.client = workerDependencies.client;
        this.messageStore = workerDependencies.messageStore;
        this.dataStore = workerDependencies.dataStore;
    }
    Begin(commands) {
        this.Start(commands);
    }
    SearchForRegisteredTeams(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataStore.SearchForRegisteredTeams(searchTerm);
        });
    }
    SearchForTeamBySeason(season, searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.dataStore.SearchForTeamBySeason(season, searchTerm);
        });
    }
    SearchForPlayers(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.dataStore.GetUsers();
            const searchRegex = new RegExp(searchTerm, 'i');
            return users.filter(p => searchRegex.test(p.displayName));
        });
    }
}
exports.WorkerBase = WorkerBase;
//# sourceMappingURL=WorkerBase.js.map