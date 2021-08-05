import { NGSDivisions } from "../enums/NGSDivisions";

export class MessageDictionary {
    public static GetSavedMessage(ngsDivisions: NGSDivisions): string {
        switch (ngsDivisions) {
            case NGSDivisions.Storm:
                return "872980581397458974"
            case NGSDivisions.Heroic:
                return "845377088986677248";
            case NGSDivisions.Nexus:
                return "845377090941485116";
            case NGSDivisions.A:
                return "845377092539252757";
            case NGSDivisions.BSouthEast:
                return "845377113547604019";
            case NGSDivisions.BNorthEast:
                return "845377115858927696";
            case NGSDivisions.BWest:
                return "845377117305831469";
            case NGSDivisions.CEast:
                return "845377119696584754";
            case NGSDivisions.CWest:
                return "845377121030242345";
            case NGSDivisions.DNorthEast:
                return "845377140669284392";
            case NGSDivisions.DSouthEast:
                return "845377140669284392";
            case NGSDivisions.DWest:
                return "845377142434955334";
            case NGSDivisions.EEast:
                return "845377144305877032";
            case NGSDivisions.EWest:
                return "845377145957646336";
            default:
                return null;
        }
    }
}