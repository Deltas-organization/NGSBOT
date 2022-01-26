"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDictionary = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
class MessageDictionary {
    static GetSavedMessage(ngsDivisions) {
        switch (ngsDivisions) {
            case NGSDivisions_1.NGSDivisions.Storm:
                return "935747122685444137";
            case NGSDivisions_1.NGSDivisions.Heroic:
                return "935747129916424202";
            case NGSDivisions_1.NGSDivisions.Nexus:
                return "935747136065269760";
            case NGSDivisions_1.NGSDivisions.AEast:
                return "935747145196273684";
            case NGSDivisions_1.NGSDivisions.AWest:
                return "935747149407326249";
            case NGSDivisions_1.NGSDivisions.BEast:
                return "935747154075607051";
            case NGSDivisions_1.NGSDivisions.BWest:
                return "935747159742107678";
            case NGSDivisions_1.NGSDivisions.CEast:
                return "935747165505089557";
            case NGSDivisions_1.NGSDivisions.CWest:
                return "935747171570057246";
            case NGSDivisions_1.NGSDivisions.DEast:
                return "935747179119775814";
            case NGSDivisions_1.NGSDivisions.DWest:
                return "935747187449663548";
            case NGSDivisions_1.NGSDivisions.EEast:
                return "935747191757242409";
            case NGSDivisions_1.NGSDivisions.EWest:
                return "935747200686915614";
            default:
                return null;
        }
    }
}
exports.MessageDictionary = MessageDictionary;
//# sourceMappingURL=MessageDictionary.js.map