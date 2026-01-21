import { INGSPendingMember } from "../../interfaces/INGSPendingMember";
export enum MongoCollections {
    AssignRoleRequest = "AssignRoleRequest",
    CaptainList = "CaptainList",
    PendingMembers = "PendingMembers",
    ScheduleRequest = "ScheduleRequest",
    SeasonInformation = "SeasonInformation",
    RolesToIgnore = "RolesToIgnore",
    TrackedChannelInformation = "TrackedChannelInformation",
}

export interface IMongoPendingMemberCollection extends INGSPendingMember {

}