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
exports.GetStandings = void 0;
const translatorBase_1 = require("./bases/translatorBase");
const http = require("http");
class GetStandings extends translatorBase_1.TranslatorBase {
    constructor(client, NGSDataStore) {
        super(client);
        this.NGSDataStore = NGSDataStore;
    }
    get commandBangs() {
        return ["St", "Standing", "Standings"];
    }
    get description() {
        return "Assigns discord account to their team if their BNET account is linked to discord.";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const postData = JSON.stringify({
                "division": "c-east",
                "season": 10
            });
            const options = {
                hostname: 'https://www.nexusgamingseries.org',
                port: 80,
                path: '/standings/fetch/division',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            const req = http.request(options, (res) => {
                console.log(`STATUS: ${res.statusCode}`);
                console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    console.log(`BODY: ${chunk}`);
                });
                res.on('end', () => {
                    console.log('No more data in response.');
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            // Write data to request body
            req.write(postData);
            req.end();
            yield messageSender.SendMessage("Data things");
        });
    }
    GetPlayers(playerName) {
        let lowerCase = playerName.toLowerCase();
        return this.NGSDataStore.PlayerData.filter(p => p.Name.toLowerCase().includes(lowerCase));
    }
}
exports.GetStandings = GetStandings;
//# sourceMappingURL=assignTeam.js.map