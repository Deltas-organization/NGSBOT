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
exports.NonCastedGamesCommand = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
const SpecificChannelBase_1 = require("./bases/SpecificChannelBase");
class NonCastedGamesCommand extends SpecificChannelBase_1.SpecificChannelBase {
    get commandBangs() {
        return ["noncasted"];
    }
    get description() {
        return "Will Return the games that don't currently have a caster. Can Specify a number to clamp the result within that number of days in the future.";
    }
    getAllowedChannels() {
        return [DiscordChannels_1.DiscordChannels.DeltaServer];
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            let futureDays = 99;
            if (commands.length > 0) {
                let parsedNumber = parseInt(commands[0]);
                if (isNaN(parsedNumber)) {
                    yield messageSender.SendMessage(`The parameter ${commands[0]} is not a valid number`);
                    return;
                }
                futureDays = parsedNumber - 1;
            }
            let nonCastedGames = yield this.GetNonCastedGames(futureDays);
            let messages = yield ScheduleHelper_1.ScheduleHelper.GetMessages(nonCastedGames);
            yield messageSender.SendMessages(messages);
        });
    }
    GetNonCastedGames(futureDays) {
        return __awaiter(this, void 0, void 0, function* () {
            let futureGames = ScheduleHelper_1.ScheduleHelper.GetFutureGamesSorted(yield this.liveDataStore.GetSchedule());
            futureGames = futureGames.filter(game => ScheduleHelper_1.ScheduleHelper.GetGamesBetweenDates(game, futureDays));
            return futureGames.filter(game => !game.casterName);
        });
    }
}
exports.NonCastedGamesCommand = NonCastedGamesCommand;
//# sourceMappingURL=NonCastedGamesCommand.js.map