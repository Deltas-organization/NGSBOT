import { INGSSchedule } from "./INGSSchedule";

export interface INGSScheduleFileResponse
{
    DateTicks: number;
    LastFileName: string[];
    Schedule: INGSSchedule[];
}
