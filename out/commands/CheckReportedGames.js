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
const ClientHelper_1 = require("../helpers/ClientHelper");
const DiscordFuzzySearch_1 = require("../helpers/DiscordFuzzySearch");
const MessageHelper_1 = require("../helpers/MessageHelper");
const RoleHelper_1 = require("../helpers/RoleHelper");
const ScheduleHelper_1 = require("../helpers/ScheduleHelper");
class CheckReportedGames {
    constructor(client, dataStore) {
        this.client = client;
        this.dataStore = dataStore;
    }
    Check() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const guild = yield this.GetGuild(DiscordChannels_1.DiscordChannels.NGSDiscord);
                return yield this.GetMessags();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    GetMessags() {
        return __awaiter(this, void 0, void 0, function* () {
            const gamesInThePast = ScheduleHelper_1.ScheduleHelper.GetGamesByDaysSorted(yield this.dataStore.GetSchedule(), -50);
            const unReportedGames = gamesInThePast.filter(g => g.schedule.reported != true);
            //These messages go to the individual captains
            yield this.SendMessageFor1DayOldGames(unReportedGames);
            var messagesToSendToChannel = [];
            messagesToSendToChannel.push(yield this.CreateUnreportedCaptainMessage(unReportedGames));
            messagesToSendToChannel.push(yield this.CreateUnreportedTeamMessage(unReportedGames));
            return messagesToSendToChannel.filter(m => m != null);
        });
    }
    SendMessageFor1DayOldGames(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesOneDayOld = allUnReportedGames.filter(g => g.days == 1);
            const message = new MessageHelper_1.MessageHelper();
            for (const information of gamesOneDayOld) {
                const schedule = information.schedule;
                const homeCaptains = yield this.GetCaptain("death and delay");
                const awayCaptain = yield this.GetCaptain("death and delay");
                message.AddNew(`Your game yesterday, **${schedule.home.teamName}** vs **${schedule.away.teamName}** has not been reported.`);
                message.AddNewLine(`If you won the game please report it on the website.`);
                message.AddEmptyLine();
                homeCaptains.send({
                    embed: {
                        color: 0,
                        description: message.CreateStringMessage()
                    }
                });
                awayCaptain.send({
                    embed: {
                        color: 0,
                        description: message.CreateStringMessage()
                    }
                });
                return;
            }
            return message.CreateStringMessage();
        });
    }
    CreateUnreportedCaptainMessage(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesTwoDaysOld = allUnReportedGames.filter(g => g.days == 2);
            if (gamesTwoDaysOld.length <= 0)
                return null;
            const message = new MessageHelper_1.MessageHelper();
            for (const information of gamesTwoDaysOld) {
                const schedule = information.schedule;
                const homeCaptain = yield this.GetCaptain(schedule.home.teamName);
                const awayCaptain = yield this.GetCaptain(schedule.away.teamName);
                message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`Whoever won: ${homeCaptain} or ${awayCaptain}. You must report the match.`);
                message.AddEmptyLine();
            }
            return message.CreateStringMessage();
        });
    }
    CreateUnreportedTeamMessage(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesolderThen2Days = allUnReportedGames.filter(g => g.days >= 3);
            if (gamesolderThen2Days.length <= 0)
                return null;
            var roleHelper = yield RoleHelper_1.RoleHelper.CreateFromclient(this.client, DiscordChannels_1.DiscordChannels.NGSDiscord);
            const message = new MessageHelper_1.MessageHelper();
            for (const information of gamesolderThen2Days) {
                const schedule = information.schedule;
                const team1Role = roleHelper.lookForRole(schedule.home.teamName);
                const team2Role = roleHelper.lookForRole(schedule.away.teamName);
                message.AddNew(`A game has not been reported from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`Whoever won: ${team1Role} or ${team2Role}. You must report the match or it will be forfeit.`);
                message.AddEmptyLine();
            }
            return message.CreateStringMessage();
        });
    }
    GetCaptain(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const guildMembers = yield ClientHelper_1.ClientHelper.GetMembers(this.client, DiscordChannels_1.DiscordChannels.NGSDiscord);
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