"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDictionary = void 0;
const NGSDivisions_1 = require("../enums/NGSDivisions");
class MessageDictionary {
    static GetSavedMessage(ngsDivisions) {
        switch (ngsDivisions) {
            case NGSDivisions_1.NGSDivisions.Storm:
                return "873262175031033856";
            case NGSDivisions_1.NGSDivisions.Heroic:
                return "873262180898852914";
            case NGSDivisions_1.NGSDivisions.Nexus:
                return "873262186754109501";
            case NGSDivisions_1.NGSDivisions.A:
                return "873262190818369546";
            case NGSDivisions_1.NGSDivisions.BSouthEast:
                return "873262194098311210";
            case NGSDivisions_1.NGSDivisions.BNorthEast:
                return "873262198678515742";
            case NGSDivisions_1.NGSDivisions.BWest:
                return "873262202260447242";
            case NGSDivisions_1.NGSDivisions.CEast:
                return "873262205854965781";
            case NGSDivisions_1.NGSDivisions.CWest:
                return "873262211454337074";
            case NGSDivisions_1.NGSDivisions.DSouthEast:
                return "873262215787057223";
            case NGSDivisions_1.NGSDivisions.DNorthEast:
                return "873262226012786709";
            case NGSDivisions_1.NGSDivisions.DWest:
                return "873262229657632799";
            case NGSDivisions_1.NGSDivisions.EEast:
                return "873262234250403931";
            case NGSDivisions_1.NGSDivisions.EWest:
                return "873262238448877629";
            default:
                return null;
        }
    }
}
exports.MessageDictionary = MessageDictionary;
//# sourceMappingURL=MessageDictionary.js.map