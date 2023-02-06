"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandDependencies = void 0;
class CommandDependencies {
    constructor(client, dataStore, apiKey, mongoConnectionString) {
        this.client = client;
        this.dataStore = dataStore;
        this.apiKey = apiKey;
        this.mongoConnectionString = mongoConnectionString;
    }
}
exports.CommandDependencies = CommandDependencies;
//# sourceMappingURL=TranslatorDependencies.js.map