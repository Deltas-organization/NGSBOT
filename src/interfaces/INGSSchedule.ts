import { INGSScheduleTeam } from "./INGSScheduleTeam";

export interface INGSSchedule
{
    home: INGSScheduleTeam;
    away: INGSScheduleTeam;
    casterName: string;
    casterUrl: string;
    scheduledTime: { startTime: number }
    divisionDisplayName: string;
    divisionConcat: string;    
    reported: boolean;
    forfeit: boolean;
}