"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageStore = void 0;
class MessageStore {
    constructor() {
        this.messages = [];
    }
    AddMessage(message) {
        this.messages.push(message);
    }
    DeleteMessage(amountToDelete) {
        let messagesToDelete = this.messages.splice(this.messages.length - amountToDelete);
        for (var i = 0; i < messagesToDelete.length; i++) {
            messagesToDelete[i].delete();
        }
    }
}
exports.MessageStore = MessageStore;
//# sourceMappingURL=MessageStore.js.map