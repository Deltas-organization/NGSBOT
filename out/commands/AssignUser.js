"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignUserCommand = void 0;
class AssignUserCommand {
    constructor(translatorDependencies) {
        this.client = translatorDependencies.client;
        this.messageStore = translatorDependencies.messageStore;
        this.liveDataStore = translatorDependencies.liveDataStore;
        this.Init();
    }
}
exports.AssignUserCommand = AssignUserCommand;
//# sourceMappingURL=AssignUser.js.map