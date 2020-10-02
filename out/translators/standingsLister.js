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
exports.StandingsLister = void 0;
const translatorBase_1 = require("./bases/translatorBase");
const http = require("http");
const TranslationHelpers_1 = require("../helpers/TranslationHelpers");
class StandingsLister extends translatorBase_1.TranslatorBase {
    constructor(client) {
        super(client);
    }
    get commandBangs() {
        return ["St", "Standing", "Standings"];
    }
    get description() {
        return 'Gets standing for Divisions. looks like "!st b west" "!st storm" "!st b ne" "!st b se"';
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            if (commands.length > 2 || commands.length == 0) {
                messageSender.SendMessage("unsupported param count");
                return;
            }
            var div = commands[0];
            if (commands.length == 2) {
                var coast = commands[1];
                if (coast.toLowerCase() == "ne")
                    div += "-northeast";
                else if (coast.toLowerCase() == "se")
                    div += "-southeast";
                else
                    div += `-${coast}`;
            }
            var divisionObject = {
                "division": div,
                "season": 10
            };
            const postData = JSON.stringify(divisionObject);
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 80,
                path: '/standings/fetch/division',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };
            const req = http.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    chunks += chunk;
                });
                result.on('end', () => {
                    var parsedObject = JSON.parse(chunks);
                    var standings = parsedObject.returnObject;
                    if (standings) {
                        let message = this.CreateStandingsMessage(standings);
                        messageSender.SendMessage(message);
                    }
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            // Write data to request body
            req.write(postData);
            req.end();
        });
    }
    CreateStandingsMessage(standings) {
        var message = "";
        for (var index = 0; index < standings.length; index++) {
            var title = index + 1 + "";
            if (index == 0)
                title += "st";
            else if (index == 1)
                title += "nd";
            else if (index == 2)
                title += "rd";
            else
                title += "th";
            let standing = standings[index];
            message += `${title} - ${TranslationHelpers_1.Translationhelpers.GetTeamURL(standing.teamName)} \n`;
            message += `\u200B \u200B \u200B \u200B Points: ${standing.points} \n`;
        }
        return message;
    }
}
exports.StandingsLister = StandingsLister;
//# sourceMappingURL=StandingsLister.js.map