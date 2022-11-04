import { INGSPendingMember } from "../../interfaces/INGSPendingMember";
export enum MongoCollections {
    AssignRoleRequest = "AssignRoleRequest",
    CaptainList = "CaptainList",
    PendingMembers = "PendingMembers",
    ScheduleRequest = "ScheduleRequest",
    SeasonInformation = "SeasonInformation",
}

export interface IMongoPendingMemberCollection extends INGSPendingMember {

}