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
exports.DeltaTranslatorBase = void 0;
const translatorBase_1 = require("./translatorBase");
const DiscordMembers_1 = require("../../enums/DiscordMembers");
class DeltaTranslatorBase extends translatorBase_1.TranslatorBase {
    Verify(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (((_a = message.member) === null || _a === void 0 ? void 0 : _a.user.id) == DiscordMembers_1.DiscordMembers.Delta)
                return true;
            return false;
        });
    }
}
exports.DeltaTranslatorBase = DeltaTranslatorBase;
//# sourceMappingURL=deltaTranslatorBase.js.map