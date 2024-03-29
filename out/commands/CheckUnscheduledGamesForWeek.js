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
exports.ReportedGamesContainer = exports.CheckUnscheduledGamesForWeek = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
const Globals_1 = require("../Globals");
const MessageHelper_1 = require("../helpers/MessageHelper");
const LiveDataStore_1 = require("../LiveDataStore");
class CheckUnscheduledGamesForWeek {
    constructor(mongoHelper, dataStore) {
        this.mongoHelper = mongoHelper;
        this.dataStore = dataStore;
        this._divisionsWithAllGamesScheduled = [];
    }
    Check() {
        return __awaiter(this, void 0, void 0, function* () {
            var season = +LiveDataStore_1.LiveDataStore.season;
            try {
                var information = yield this.mongoHelper.GetNgsInformation(season);
                var result = [];
                for (var value in NGSDivisions_1.NGSDivisions) {
                    var division = NGSDivisions_1.NGSDivisions[value];
                    try {
                        //We do +1 since the round hasn't been incremented yet and we are looking at next weeks scheduled games.
                        var message = yield this.SendMessageForDivision(division, information.round + 1);
                        if (message)
                            result.push(message);
                    }
                    catch (e) {
                        Globals_1.Globals.log(`problem reporting matches by round for division: ${division}`, e);
                    }
                }
                yield this.mongoHelper.UpdateSeasonRound(season);
                var successfulDivisions = new MessageHelper_1.MessageHelper();
                successfulDivisions.AddNewLine((`These Divisions have all their games scheduled.`));
                successfulDivisions.AddNewLine(this._divisionsWithAllGamesScheduled.join(", "));
                result.push(successfulDivisions);
                return result;
            }
            catch (e) {
                Globals_1.Globals.log("Problem reporting unschedule games", e);
                Globals_1.Globals.InformDelta("There was a problem with the bot reported the unscheduled games");
            }
        });
    }
    SendMessageForDivision(division, roundNumber) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            var unscheduledGames = [];
            var divisions = yield this.dataStore.GetDivisions();
            const divisionConcat = divisions.filter(d => d.displayName == division)[0].divisionConcat;
            var matches = yield this.dataStore.GetScheduleByRoundAndDivision(divisionConcat, roundNumber);
            for (var match of matches) {
                if (((_a = match.scheduledTime) === null || _a === void 0 ? void 0 : _a.startTime) || match.reported || match.forfeit)
                    continue;
                unscheduledGames.push(match);
            }
            if (unscheduledGames.length < 1) {
                this._divisionsWithAllGamesScheduled.push(division);
                return;
            }
            else {
                var messageToSend = new MessageHelper_1.MessageHelper();
                messageToSend.AddNew(`Found some unschedule games for Division: **${division}**`);
                for (var unscheduledGame of unscheduledGames) {
                    messageToSend.AddNewLine(`**${unscheduledGame.home.teamName}** VS **${unscheduledGame.away.teamName}**`);
                }
                return messageToSend;
            }
        });
    }
}
exports.CheckUnscheduledGamesForWeek = CheckUnscheduledGamesForWeek;
class ReportedGamesContainer {
    constructor(CaptainMessages, ModMessages) {
        this.CaptainMessages = CaptainMessages;
        this.ModMessages = ModMessages;
    }
}
exports.ReportedGamesContainer = ReportedGamesContainer;
//# sourceMappingURL=CheckUnscheduledGamesForWeek.js.map