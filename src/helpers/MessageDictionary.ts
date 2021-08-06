import { NGSDivisions } from "../enums/NGSDivisions";

export class MessageDictionary {
    public static GetSavedMessage(ngsDivisions: NGSDivisions): string {
        switch (ngsDivisions) {
            case NGSDivisions.Storm:
                return "873262175031033856"
            case NGSDivisions.Heroic:
                return "873262180898852914";
            case NGSDivisions.Nexus:
                return "873262186754109501";
            case NGSDivisions.A:
                return "873262190818369546";
            case NGSDivisions.BSouthEast:
                return "873262194098311210";
            case NGSDivisions.BNorthEast:
                return "873262198678515742";
            case NGSDivisions.BWest:
                return "873262202260447242";
            case NGSDivisions.CEast:
                return "873262205854965781";
            case NGSDivisions.CWest:
                return "873262211454337074";
            case NGSDivisions.DSouthEast:
                return "873262215787057223";
            case NGSDivisions.DNorthEast:
                return "873262226012786709";
            case NGSDivisions.DWest:
                return "873262229657632799";
            case NGSDivisions.EEast:
                return "873262234250403931";
            case NGSDivisions.EWest:
                return "873262238448877629";
            default:
                return null;
        }
    }
}