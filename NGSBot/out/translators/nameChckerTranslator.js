"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nameCheckerTranslator = void 0;
const translatorBase_1 = require("./translatorBase");
var fs = require('fs');
class nameCheckerTranslator extends translatorBase_1.translatorBase {
    constructor(client) {
        super(client, "name");
        this.client = client;
        this._playerList = this.LoadData();
    }
    LoadData() {
        let rawdata = fs.readFileSync('C:/Data/NGSPlayers.json');
        return JSON.parse(rawdata);
    }
    Interpret(commands, authorId) {
    }
}
exports.nameCheckerTranslator = nameCheckerTranslator;
//# sourceMappingURL=nameChckerTranslator.js.map