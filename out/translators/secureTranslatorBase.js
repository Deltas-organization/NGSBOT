"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecureTranslatorBase = void 0;
const translatorBase_1 = require("./translatorBase");
class SecureTranslatorBase extends translatorBase_1.TranslatorBase {
    Verify(message) {
        if (message.member.roles.find(r => r.name === "Admin"))
            return true;
        return false;
    }
}
exports.SecureTranslatorBase = SecureTranslatorBase;
//# sourceMappingURL=secureTranslatorBase.js.map