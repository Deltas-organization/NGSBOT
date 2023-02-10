import { NGSDivisions } from "../../enums/NGSDivisions";

export interface CaptainList {
    season: number;
    messageId: string;
    division: NGSDivisions;
    divisionChannelMessageId: string;
}