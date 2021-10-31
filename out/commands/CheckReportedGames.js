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
exports.CheckReportedGames = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
class CheckReportedGames {
    constructor(client, dataStore) {
        this.client = client;
        this.dataStore = dataStore;
    }
    Check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.GetMessags();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    GetMessags() {
        return __awaiter(this, void 0, void 0, function* () {
            const gamesInThePast = ScheduleHelper_1.ScheduleHelper.GetGamesByDaysSorted(yield this.dataStore.GetSchedule(), -14);
            const unReportedGames = gamesInThePast.filter(g => g.schedule.reported != true);
            return [yield this.CreateUnreportedMessage(unReportedGames)];
            // const gamesOneDayOld = unReportedGames.map(g => g.days == 1);
            // const gamesTwoDaysOld = unReportedGames.map(g => g.days == 2);
            // const gamesThreeDatsOld = unReportedGames.map(g => g.days == 3);
            // const gamesOlderThenThreeDays = unReportedGames.map(g => g.days > 3);
        });
    }
    CreateUnreportedMessage(scheduleInformation) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = new MessageHelper_1.MessageHelper();
            for (const information of scheduleInformation) {
                const schedule = information.schedule;
                const homeCaptains = yield this.GetCaptain(schedule.home.teamName);
                const awayCaptain = yield this.GetCaptain(schedule.away.teamName);
                message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`Whoever won: ${homeCaptains} or ${awayCaptain}. You must report the match.`);
                message.AddEmptyLine();
            }
            return message.CreateStringMessage();
        });
    }
    GetCaptain(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const guild = yield this.GetGuild(DiscordChannels_1.DiscordChannels.NGSDiscord);
            const guildMembers = (yield guild.members.fetch()).map((mem, _, __) => mem);
            const teamMembers = yield this.GetTeamMembers(teamName);
            const captains = teamMembers.filter(mem => mem.IsCaptain);
            for (var captain of captains) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(captain, guildMembers);
                return guildMember;
            }
        });
    }
    GetTeamMembers(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            const teams = yield this.dataStore.GetTeams();
            for (let team of teams) {
                if (teamName == team.teamName) {
                    const users = yield this.dataStore.GetUsersOnTeam(team);
                    for (var user of users) {
                        result.push(user);
                    }
                }
            }
            return result;
        });
    }
    GetGuild(channelId) {
        return __awaiter(this, void 0, void 0, function* () {
            const channel = (yield this.client.channels.fetch(channelId, false));
            return channel.guild;
        });
    }
}
exports.CheckReportedGames = CheckReportedGames;
//# sourceMappingURL=CheckReportedGames.js.map