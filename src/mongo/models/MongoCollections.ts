import { INGSPendingMember } from "../../interfaces/INGSPendingMember";
export enum MongoCollections {
    AssignRoleRequest = "AssignRoleRequest",
    CaptainList = "CaptainList",
    PendingMembers = "PendingMembers",
    ScheduleRequest = "ScheduleRequest",
    SeasonInformation = "SeasonInformation",
    RolesToIgnore = "RolesToIgnore"
}

export interface IMongoPendingMemberCollection extends INGSPendingMember {

}