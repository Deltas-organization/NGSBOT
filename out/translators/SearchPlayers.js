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
exports.SearchPlayers = void 0;
const translatorBase_1 = require("./bases/translatorBase");
class SearchPlayers extends translatorBase_1.TranslatorBase {
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
        return ["name"];
    }
    get description() {
        return "searches for players by name.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            var message = "";
            for (var i = 0; i < commands.length; i++) {
                var playerName = commands[i];
                var players = yield this.GetPlayers(playerName);
                if (players.length <= 0)
                    message += `No players found for: ${playerName} \n`;
                else
                    message += this.CreatePlayerMessage(players, detailed);
                message += "\n";
            }
            yield messageSender.SendMessage(message);
        });
    }
    CreatePlayerMessage(players, detailed) {
        let result = [];
        players.forEach(p => {
            let playerResult = '';
            playerResult += `**Name**: ${p.displayName}, \n**TeamName**: ${p.teamName} \n`;
            for (var rank of p.verifiedRankHistory) {
                if (rank.status == 'verified')
                    playerResult += `${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}** \n`;
            }
            result.push(playerResult);
        });
        return result.join("\n");
    }
    GetPlayers(playerName) {
        return __awaiter(this, void 0, void 0, function* () {
            let lowerCase = playerName.toLowerCase();
            let users = yield this.liveDataStore.GetUsers();
            return users.filter(p => p.displayName.toLowerCase().includes(lowerCase));
        });
    }
}
exports.SearchPlayers = SearchPlayers;
//# sourceMappingURL=SearchPlayers.js.map