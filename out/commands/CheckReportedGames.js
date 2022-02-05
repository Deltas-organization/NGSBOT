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
exports.ReportedGamesContainer = exports.CheckReportedGames = void 0;
const DiscordChannels_1 = require("../enums/DiscordChannels");
const ClientHelper_1 = require("../helpers/ClientHelper");
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
                this.guildMembers = yield ClientHelper_1.ClientHelper.GetMembers(this.client, DiscordChannels_1.DiscordChannels.NGSDiscord);
                return yield this.GetMessages();
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    GetMessages() {
        return __awaiter(this, void 0, void 0, function* () {
            const gamesInThePast = ScheduleHelper_1.ScheduleHelper.GetGamesByDaysSorted(yield this.dataStore.GetSchedule(), -10);
            const unReportedGames = gamesInThePast.filter(g => g.schedule.reported != true);
            //These messages go to the individual captains
            yield this.SendMessageFor1DayOldGames(unReportedGames);
            var captainMessages = [];
            captainMessages.push(...(yield this.CreateMessageFor2DayOldGames(unReportedGames)));
            captainMessages.push(...(yield this.CreateMessageFor3DayOldGames(unReportedGames)));
            var modMessages = [];
            modMessages.push(...(yield this.CreateMessageForOlderGames(unReportedGames)));
            return new ReportedGamesContainer(captainMessages.filter(m => m != null), modMessages.filter(m => m != null));
        });
    }
    SendMessageFor1DayOldGames(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesOneDayOld = allUnReportedGames.filter(g => g.days == 0);
            if (gamesOneDayOld.length <= 0)
                return null;
            for (const information of gamesOneDayOld) {
                const message = new MessageHelper_1.MessageHelper();
                const schedule = information.schedule;
                const homeCaptains = yield this.GetCaptain(schedule.home.teamName);
                const awayCaptain = yield this.GetCaptain(schedule.away.teamName);
                message.AddNew(`Your game yesterday, **${schedule.home.teamName}** vs **${schedule.away.teamName}** has not been reported.`);
                message.AddNewLine(`If you won the game please report it on the website.`);
                message.AddEmptyLine();
                yield homeCaptains.send({
                    embed: {
                        color: 0,
                        description: message.CreateStringMessage()
                    }
                });
                yield awayCaptain.send({
                    embed: {
                        color: 0,
                        description: message.CreateStringMessage()
                    }
                });
            }
        });
    }
    CreateMessageFor2DayOldGames(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesTwoDaysOld = allUnReportedGames.filter(g => g.days == 1);
            if (gamesTwoDaysOld.length <= 0)
                return [];
            var messages = [];
            for (const information of gamesTwoDaysOld) {
                const message = new MessageHelper_1.MessageHelper();
                const schedule = information.schedule;
                const homeCaptain = yield this.GetCaptain(schedule.home.teamName);
                const homeACs = yield this.GetAssistantCaptains(schedule.home.teamName);
                const awayCaptain = yield this.GetCaptain(schedule.away.teamName);
                const awayAcs = yield this.GetAssistantCaptains(schedule.home.teamName);
                message.AddNew(`A game has not been reported for 2 days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`Whoever won, You must report the match.`);
                message.AddNewLine(`${homeCaptain}`);
                homeACs.forEach(ac => {
                    message.AddNew(` ${ac} `);
                });
                message.AddNewLine(`${awayCaptain}`);
                awayAcs.forEach(ac => {
                    message.AddNew(` ${ac} `);
                });
                messages.push(message);
            }
            return messages.map(messages => messages.CreateStringMessage());
        });
    }
    CreateMessageFor3DayOldGames(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesThreeDaysOld = allUnReportedGames.filter(g => g.days == 2);
            if (gamesThreeDaysOld.length <= 0)
                return [];
            var messages = [];
            for (const information of gamesThreeDaysOld) {
                const message = new MessageHelper_1.MessageHelper();
                const schedule = information.schedule;
                const homeCaptain = yield this.GetCaptain(schedule.home.teamName);
                const homeACs = yield this.GetAssistantCaptains(schedule.home.teamName);
                const awayCaptain = yield this.GetCaptain(schedule.away.teamName);
                const awayAcs = yield this.GetAssistantCaptains(schedule.away.teamName);
                message.AddNew(`A game has not been reported for 3 days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`Whoever won, You must report the match, or the winning team will be penalized.`);
                message.AddNewLine(`${homeCaptain}`);
                homeACs.forEach(ac => {
                    message.AddNew(` ${ac} `);
                });
                message.AddNewLine(`${awayCaptain}`);
                awayAcs.forEach(ac => {
                    message.AddNew(` ${ac} `);
                });
                const divMods = yield this.GetDivMods(schedule.divisionDisplayName);
                message.AddNewLine('');
                divMods.forEach(divMod => {
                    message.AddNew(` ${divMod} `);
                });
                messages.push(message);
            }
            return messages.map(messages => messages.CreateStringMessage());
        });
    }
    CreateMessageForOlderGames(allUnReportedGames) {
        return __awaiter(this, void 0, void 0, function* () {
            var gamesTooOld = allUnReportedGames.filter(g => g.days > 3);
            if (gamesTooOld.length <= 0)
                return [];
            var messages = [];
            for (const information of gamesTooOld) {
                const message = new MessageHelper_1.MessageHelper();
                const schedule = information.schedule;
                message.AddNew(`This game has not been reported for ${information.days} days from **${schedule.home.teamName}** vs **${schedule.away.teamName}**`);
                message.AddNewLine(`The Division is: ${schedule.divisionDisplayName}`);
                messages.push(message);
            }
            return messages.map(messages => messages.CreateStringMessage());
        });
    }
    GetCaptain(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield this.GetTeamMembers(teamName);
            const captains = teamMembers.filter(mem => mem.IsCaptain);
            for (var captain of captains) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(captain, this.guildMembers);
                if (guildMember)
                    return guildMember.member;
            }
        });
    }
    GetAssistantCaptains(teamName) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield this.GetTeamMembers(teamName);
            const captains = teamMembers.filter(mem => mem.IsAssistantCaptain);
            const result = [];
            for (var captain of captains) {
                const guildMember = DiscordFuzzySearch_1.DiscordFuzzySearch.FindGuildMember(captain, this.guildMembers);
                if (guildMember)
                    result.push(guildMember.member);
            }
            return result;
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
    GetDivMods(division) {
        return __awaiter(this, void 0, void 0, function* () {
            const divisions = yield this.dataStore.GetDivisions();
            const divisionInformation = divisions.find(d => d.displayName == division);
            if (!divisionInformation)
                return [];
            const modsToLookFor = divisionInformation.moderator.split('&').map(item => item.replace(' ', '').toLowerCase());
            const divMods = this.guildMembers.filter(member => modsToLookFor.indexOf(DiscordFuzzySearch_1.DiscordFuzzySearch.GetDiscordId(member.user)) != -1);
            return divMods;
        });
    }
}
exports.CheckReportedGames = CheckReportedGames;
class ReportedGamesContainer {
    constructor(CaptainMessages, ModMessages) {
        this.CaptainMessages = CaptainMessages;
        this.ModMessages = ModMessages;
    }
}
exports.ReportedGamesContainer = ReportedGamesContainer;
//# sourceMappingURL=CheckReportedGames.js.map