import { NGSDivisions } from "../../enums/NGSDivisions";

export interface IMongoScheduleRequest {
    channelId: string;
    requestType: 'teams' | 'divisions';
    divisions?: NGSDivisions[];
    teams?: string[];
}