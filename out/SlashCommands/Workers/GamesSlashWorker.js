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
exports.GamesSlashWorker = void 0;
const DiscordFuzzySearch_1 = require("../../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../../helpers/MessageHelper");
const ScheduleHelper_1 = require("../../helpers/ScheduleHelper");
const MessageContainer_1 = require("../../message-helpers/MessageContainer");
class GamesSlashWorker {
    constructor(user, dataStore) {
        this.user = user;
        this.dataStore = dataStore;
    }
    Run() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = new MessageContainer_1.MessageContainer();
            const ngsUser = yield DiscordFuzzySearch_1.DiscordFuzzySearch.GetNGSUser(this.user, yield this.dataStore.GetUsers());
            if (!ngsUser) {
                response.AddSimpleGroup("Unable to find your ngsUser, please ensure you have your discordId populated on the ngs website.");
                return response;
            }
            const team = yield this.dataStore.LookForRegisteredTeam(ngsUser);
            if (!team) {
                response.AddSimpleGroup("Unable to find your ngsTeam");
                return response;
            }
            response.AddSimpleGroup(`Games for: **${team.teamName}**`);
            var messages = yield this.GetScheduleMessages(team);
            response.Append(messages);
            return response;
        });
    }
    CreateTeamMessage(ngsTeam) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = new MessageHelper_1.MessageHelper("Team");
            message.AddNew(`Games for: **${ngsTeam.teamName}**`);
            message.AddEmptyLine();
            return message;
        });
    }
    GetScheduleMessages(ngsTeam) {
        return __awaiter(this, void 0, void 0, function* () {
            var response = new MessageContainer_1.MessageGroup();
            let games = ScheduleHelper_1.ScheduleHelper.GetGamesSorted(yield this.dataStore.GetScheduledGames(), 99);
            games = games.filter(game => game.home.teamName == ngsTeam.teamName || game.away.teamName == ngsTeam.teamName);
            var messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(games);
            messages.forEach(m => {
                response.AddOnNewLine(m);
            });
            return response;
        });
    }
}
exports.GamesSlashWorker = GamesSlashWorker;
//# sourceMappingURL=GamesSlashWorker.js.map