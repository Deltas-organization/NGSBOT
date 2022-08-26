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
exports.NGSOnlyTranslatorBase = void 0;
const translatorBase_1 = require("./translatorBase");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
class NGSOnlyTranslatorBase extends translatorBase_1.TranslatorBase {
    Verify(message) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            switch ((_a = message.guild) === null || _a === void 0 ? void 0 : _a.id) {
                case DiscordGuilds_1.DiscordGuilds.NGS:
                    return true;
            }
            return false;
        });
    }
}
exports.NGSOnlyTranslatorBase = NGSOnlyTranslatorBase;
//# sourceMappingURL=ngsOnlyTranslatorBase.js.map