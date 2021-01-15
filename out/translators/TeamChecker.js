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
exports.TeamNameChecker = void 0;
const translatorBase_1 = require("./bases/translatorBase");
const TranslationHelpers_1 = require("../helpers/TranslationHelpers");
var fs = require('fs');
class TeamNameChecker extends translatorBase_1.TranslatorBase {
    constructor(translatorDependencies, liveDataStore) {
        super(translatorDependencies);
        this.liveDataStore = liveDataStore;
    }
    Verify(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (message.member.user.id == "163779571060178955")
                return true;
            switch (message.guild.id) {
                case "674526786779873280":
                    return true;
                case "618209192339046421":
                    return true;
            }
            return false;
        });
    }
    get commandBangs() {
        return ["team"];
    }
    get description() {
        return "Will List Teams containing the values, Supports multiple searches with the space delimeter. And can include spaces by wraping the search in double quotes.";
    }
    Interpret(commands, detailed, message) {
        return __awaiter(this, void 0, void 0, function* () {
            for (var i = 0; i < commands.length; i++) {
                let fields = [];
                var searchTerm = commands[i];
                const searchRegex = new RegExp(searchTerm, 'i');
                var teams = yield (yield this.liveDataStore.GetTeams()).filter(team => searchRegex.test(team.teamName));
                if (teams.length <= 0) {
                    fields.push({ name: `No teams found for  \n`, value: searchTerm });
                    yield message.SendFields(``, fields);
                }
                else {
                    teams.forEach((t) => __awaiter(this, void 0, void 0, function* () {
                        let teamMessage = this.GetTeamMessage(t);
                        yield message.SendFields(``, teamMessage);
                    }));
                }
            }
        });
    }
    GetTeamMessage(team) {
        let result = [];
        result.push({ name: "TeamName", value: `\u0009 ${TranslationHelpers_1.Translationhelpers.GetTeamURL(team.teamName)}`, inline: true });
        result.push({ name: "Division", value: `\u0009 ${team.divisionDisplayName}`, inline: true });
        result.push({ name: "Description", value: `\u0009 ${team.descriptionOfTeam} -`, inline: true });
        let firstValueArray = [];
        let secondValueArray = [];
        let thirdValueArray = [];
        let playerLength = team.teamMembers.length;
        for (var i = 0; i < playerLength; i += 3) {
            let player = team.teamMembers[i];
            firstValueArray.push('\u0009' + player.displayName.split("#")[0]);
            if (i + 1 < playerLength) {
                player = team.teamMembers[i + 1];
                secondValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
            if (i + 2 < playerLength) {
                player = team.teamMembers[i + 2];
                thirdValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
        }
        result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
        return result;
    }
}
exports.TeamNameChecker = TeamNameChecker;
//# sourceMappingURL=TeamChecker.js.map