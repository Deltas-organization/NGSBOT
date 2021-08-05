"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDictionary = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
class MessageDictionary {
    static GetSavedMessage(ngsDivisions) {
        switch (ngsDivisions) {
            case NGSDivisions_1.NGSDivisions.Storm:
                return "872980581397458974";
            case NGSDivisions_1.NGSDivisions.Heroic:
                return "845377088986677248";
            case NGSDivisions_1.NGSDivisions.Nexus:
                return "845377090941485116";
            case NGSDivisions_1.NGSDivisions.A:
                return "845377092539252757";
            case NGSDivisions_1.NGSDivisions.BSouthEast:
                return "845377113547604019";
            case NGSDivisions_1.NGSDivisions.BNorthEast:
                return "845377115858927696";
            case NGSDivisions_1.NGSDivisions.BWest:
                return "845377117305831469";
            case NGSDivisions_1.NGSDivisions.CEast:
                return "845377119696584754";
            case NGSDivisions_1.NGSDivisions.CWest:
                return "845377121030242345";
            case NGSDivisions_1.NGSDivisions.DNorthEast:
                return "845377140669284392";
            case NGSDivisions_1.NGSDivisions.DSouthEast:
                return "845377140669284392";
            case NGSDivisions_1.NGSDivisions.DWest:
                return "845377142434955334";
            case NGSDivisions_1.NGSDivisions.EEast:
                return "845377144305877032";
            case NGSDivisions_1.NGSDivisions.EWest:
                return "845377145957646336";
            default:
                return null;
        }
    }
}
exports.MessageDictionary = MessageDictionary;
//# sourceMappingURL=MessageDictionary.js.map