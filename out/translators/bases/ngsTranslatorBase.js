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
exports.ngsTranslatorBase = void 0;
const translatorBase_1 = require("./translatorBase");
const discord_js_1 = require("discord.js");
const DiscordGuilds_1 = require("../../enums/DiscordGuilds");
class ngsTranslatorBase extends translatorBase_1.TranslatorBase {
    Verify(message) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if ((((_a = message.member) === null || _a === void 0 ? void 0 : _a.permissions.has(discord_js_1.PermissionFlagsBits.Administrator)) && ((_b = message.guild) === null || _b === void 0 ? void 0 : _b.id) == DiscordGuilds_1.DiscordGuilds.NGS))
                return true;
            return false;
        });
    }
}
exports.ngsTranslatorBase = ngsTranslatorBase;
//# sourceMappingURL=ngsTranslatorBase.js.map