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
exports.CheckFlexMatches = void 0;
const Globals_1 = require("../Globals");
const MessageHelper_1 = require("../helpers/MessageHelper");
const TeamSorter_1 = require("../helpers/TeamSorter");
class CheckFlexMatches {
    constructor(dataStore) {
        this.dataStore = dataStore;
    }
    Check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var result = [];
                var unscheduledFlexMatch = [];
                var scheduleList = yield this.dataStore.GetSchedule();
                for (var schedule of scheduleList) {
                    if (schedule.scheduledTime || schedule.reported || schedule.forfeit)
                        continue;
                    if (!schedule.scheduleDeadline)
                        unscheduledFlexMatch.push(schedule);
                }
                unscheduledFlexMatch = unscheduledFlexMatch.sort((i1, i2) => TeamSorter_1.TeamSorter.SortByDivisionConcat(i1.divisionConcat, i2.divisionConcat));
                var lastDivision;
                var currentDivisionMessage;
                for (var match of unscheduledFlexMatch) {
                    if (!match.divisionConcat)
                        continue;
                    try {
                        if (lastDivision != match.divisionConcat) {
                            currentDivisionMessage = new MessageHelper_1.MessageHelper();
                            currentDivisionMessage.AddNew(`UnScheduled Flex Matches For Division: **${match.divisionConcat}**`);
                            result.push(currentDivisionMessage);
                            lastDivision = match.divisionConcat;
                        }
                        currentDivisionMessage.AddNewLine(`**${match.home.teamName}** vs **${match.away.teamName}**`);
                    }
                    catch (e) {
                        Globals_1.Globals.log("Problem", match, e);
                    }
                }
                return result;
            }
            catch (e) {
                Globals_1.Globals.log(e);
            }
        });
    }
    SendMessageForDivision(division) {
        return __awaiter(this, void 0, void 0, function* () {
            // var unscheduledGames: INGSSchedule[] = [];
            // var divisions = await this.dataStore.GetDivisions();
            // const divisionConcat = divisions.filter(d => d.displayName == division)[0].divisionConcat;
            // var matches = await this.dataStore.GetScheduleByRoundAndDivision(divisionConcat, roundNumber);
            // for (var match of matches) {
            //     if (match.scheduledTime || match.reported || match.forfeit)
            //         continue;
            //     unscheduledGames.push(match);
            // }
            var messageToSend = new MessageHelper_1.MessageHelper();
            // if (unscheduledGames.length < 1) {
            //     messageToSend.AddNew(`**${division}** Division has all of their games scheduled for next week!`);
            // }
            // else {
            //     messageToSend.AddNew(`Found some unschedule games for Division: **${division}**`);
            //     for (var unscheduledGame of unscheduledGames) {
            //         messageToSend.AddNewLine(`**${unscheduledGame.home.teamName}** VS **${unscheduledGame.away.teamName}**`);
            //     }
            // }
            return messageToSend;
        });
    }
}
exports.CheckFlexMatches = CheckFlexMatches;
//# sourceMappingURL=CheckFlexMatches.js.map