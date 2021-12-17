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
exports.CoinFlip = void 0;
const nonNGSTranslatorBase_1 = require("./bases/nonNGSTranslatorBase");
class CoinFlip extends nonNGSTranslatorBase_1.NonNGSTranslatorBase {
    get commandBangs() {
        return ["flip"];
    }
    get description() {
        return "Will Flip a coin";
    }
    Interpret(commands, detailed, messageSender) {
        return __awaiter(this, void 0, void 0, function* () {
            const x = (Math.floor(Math.random() * 2) == 0);
            if (x) {
                yield messageSender.SendBasicMessage(`${messageSender.GuildMember} heads`);
            }
            else {
                yield messageSender.SendBasicMessage(`${messageSender.GuildMember} tails`);
            }
        });
    }
}
exports.CoinFlip = CoinFlip;
//# sourceMappingURL=CoinFlip.js.map