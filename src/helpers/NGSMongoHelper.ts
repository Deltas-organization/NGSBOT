import { NGSDivisions } from "../enums/NGSDivisions";
import { INGSPendingMember } from "../interfaces/INGSPendingMember";
import { IMongoAssignRolesRequest, IMongoScheduleRequest } from "../mongo";
import { MongoCollections } from "../mongo/models/MongoCollections";
import { CaptainList } from "../mongo/models/captain-list";
import { IIgnoreRolesDocument } from "../mongo/models/ignore-roles-document";
import { SeasonInformation } from "../mongo/models/season-information";
import { TrackedChannelInformation } from "../mongo/models/tracked-channel-information";
import { Mongohelper } from "./Mongohelper";

export class NGSMongoHelper extends Mongohelper {

    constructor(connectionUri: string) {
        super(connectionUri, "NGS");
    }

    public async AddOrUpdateScheduleRequest(request: IMongoScheduleRequest): Promise<IMongoScheduleRequest | null> {
        await this.connectedPromise;
        var collection = this.connectedDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        var selectOneFilter = { channelId: { $eq: request.channelId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            if (request.divisions) {
                existingRecord.divisions = [...new Set<NGSDivisions>([...existingRecord.divisions, ...request.divisions])];
                await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
                return existingRecord;
            }
            else {
                console.log("no divisions found in AddOrUpdateScheduleRequest");
            }
        }
        else {
            await collection.insertOne(request);
            return request;
        }
        return null;
    }

    public async getRequestedSchedules(): Promise<IMongoScheduleRequest[]> {
        await this.connectedPromise;
        const result: IMongoScheduleRequest[] = [];
        var collection = this.connectedDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        await collection.find().forEach(item => {
            result.push(item);
        });
        return result;
    }

    public async AddOrUpdateAssignRoleRequest(request: IMongoAssignRolesRequest): Promise<IMongoAssignRolesRequest> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<IMongoAssignRolesRequest>("AssignRoleRequest");
        const selectOneFilter = { guildId: { $eq: request.guildId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            existingRecord.assignablesRoles = [...new Set<string>([...existingRecord.assignablesRoles, ...request.assignablesRoles])];
            await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
            return existingRecord;
        }
        else {
            await collection.insertOne(request);
            return request;
        }
    }

    public async RemoveAssignedRoles(request: IMongoAssignRolesRequest): Promise<IMongoAssignRolesRequest | null> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<IMongoAssignRolesRequest>("AssignRoleRequest");
        const selectOneFilter = { guildId: { $eq: request.guildId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            const rolesToAssign = existingRecord.assignablesRoles;
            for (const roleToRemove of request.assignablesRoles) {
                const currentIndex = rolesToAssign.indexOf(roleToRemove);
                if (currentIndex > -1) {
                    rolesToAssign.splice(currentIndex, 1);
                }
            }
            existingRecord.assignablesRoles = rolesToAssign;
            await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
            return existingRecord;
        }
        else {
            return null;
        }
    }

    public async GetAssignedRoleRequests(guildId: string) {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<IMongoAssignRolesRequest>(MongoCollections.AssignRoleRequest);
        const selectOneFilter = { guildId: { $eq: guildId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord)
            return existingRecord.assignablesRoles;
        else
            return null;
    }

    public async AddRoleToIgnore(guildId: string, roleId: string) {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<IIgnoreRolesDocument>(MongoCollections.RolesToIgnore);
        const newRecord: IIgnoreRolesDocument = {
            guildId: guildId,
            roleId: roleId
        };
        await collection.insertOne(newRecord);
    }

    public async GetRolesToIgnore(guildToSearch: string) {
        const result: string[] = [];
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<IIgnoreRolesDocument>(MongoCollections.RolesToIgnore);
        const selectFilter = { guildId: { $eq: guildToSearch } };
        await collection.find(selectFilter).forEach(item => {
            result.push(item.roleId);
        });
        return result;
    }

    public async GetCaptainListMessage(season: number, division: NGSDivisions) {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        const selectOneFilter = { season: { $eq: season }, division: { $eq: division } };
        const existingMessage: CaptainList = await collection.findOne(selectOneFilter)
        return existingMessage;
    }

    public async CreateCaptainListRecord(messageId: string, season: number, division: NGSDivisions) {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        const newRecord: CaptainList = <CaptainList>{
            season: season,
            messageId: messageId,
            division: division
        };
        await collection.insertOne(newRecord);
        return newRecord;
    }

    public async UpdateCaptainListRecord(record: CaptainList): Promise<CaptainList> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        const selectOneFilter = { season: { $eq: record.season }, division: { $eq: record.division } }
        const existingRecord = await collection.findOne(selectOneFilter);
        await collection.updateOne(selectOneFilter, { $set: record }, { upsert: true });
        return existingRecord;
    }

    public async GetNgsInformation(season: number): Promise<SeasonInformation> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<SeasonInformation>(MongoCollections.SeasonInformation);
        const selectOneFilter = { season: { $eq: season } };
        let result = await collection.findOne(selectOneFilter)
        if (!result) {
            result = {
                season: season,
                round: 1
            };
            await collection.insertOne(result);
        }
        return result;
    }

    public async UpdateSeasonRound(season: number): Promise<SeasonInformation> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<SeasonInformation>(MongoCollections.SeasonInformation);
        const selectOneFilter = { season: { $eq: season } };
        const existingRecord = await collection.findOne(selectOneFilter);
        existingRecord.round += 1;
        await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
        return existingRecord;
    }

    public async RemovePendingMember(pendingMember: INGSPendingMember) {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<INGSPendingMember>(MongoCollections.PendingMembers);
        const selectOneQuery = { $and: [{ teamName: { $eq: pendingMember.teamName } }, { userName: { $eq: pendingMember.userName } }] };
        await collection.deleteOne(selectOneQuery);
    }

    public async GetTrackedChannelsInformation(): Promise<TrackedChannelInformation[]> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<TrackedChannelInformation>(MongoCollections.TrackedChannelInformation);
        const findAllTracking = { tracking: { $eq: true } };
        const result: TrackedChannelInformation[] = [];
        await collection.find(findAllTracking).forEach(item => {
            result.push(item);
        });

        return result;
    }

    public async AddorStopTrackedChannelsInformation(channelId: string, reminderDays: number): Promise<'Added' | 'Deleted'> {
        await this.connectedPromise;
        const collection = this.connectedDatabase.collection<TrackedChannelInformation>(MongoCollections.TrackedChannelInformation);
        const selectOneFilter = { channelId: { $eq: channelId }, tracking: { $eq: true } }
        const existingRecord: TrackedChannelInformation = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            const deletedRecord = { ...existingRecord, tracking: false };
            await collection.updateOne(selectOneFilter, { $set: deletedRecord }, { upsert: true });
            return 'Deleted';
        }
        else {
            const newRecord = { channelId, tracking: true, reminderDays };
            await collection.insertOne(newRecord);
            return 'Added';
        }
    }
}