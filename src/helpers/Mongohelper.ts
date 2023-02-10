
import * as mongoDB from "mongodb";
import { NGSDivisions } from "../enums/NGSDivisions";
import { INGSPendingMember } from "../interfaces/INGSPendingMember";
import { IMongoAssignRolesRequest, IMongoScheduleRequest } from "../mongo";
import { CaptainList } from "../mongo/models/captain-list";
import { MongoCollections } from "../mongo/models/MongoCollections";
import { SeasonInformation } from "../mongo/models/season-information";

export class Mongohelper {
    private client: mongoDB.MongoClient;
    private ngsDatabase: mongoDB.Db;
    private connectedPromise: Promise<void>;


    constructor(connectionUri: string) {
        this.client = new mongoDB.MongoClient(connectionUri, { useUnifiedTopology: true });
        this.setup();
    }

    private setup() {
        this.connectedPromise = new Promise(async (resolver, rejector) => {
            await this.client.connect();
            this.ngsDatabase = this.client.db("NGS");
            resolver();
        });
    }


    public async AddOrUpdateScheduleRequest(request: IMongoScheduleRequest): Promise<IMongoScheduleRequest | null> {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
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
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        await collection.find().forEach(item => {
            result.push(item);
        });
        return result;
    }

    public async AddOrUpdateAssignRoleRequest(request: IMongoAssignRolesRequest): Promise<IMongoAssignRolesRequest> {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<IMongoAssignRolesRequest>("AssignRoleRequest");
        var selectOneFilter = { guildId: { $eq: request.guildId } };
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
        var collection = this.ngsDatabase.collection<IMongoAssignRolesRequest>("AssignRoleRequest");
        var selectOneFilter = { guildId: { $eq: request.guildId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            var rolesToAssign = existingRecord.assignablesRoles;
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
        var collection = this.ngsDatabase.collection<IMongoAssignRolesRequest>("AssignRoleRequest");
        var selectOneFilter = { guildId: { $eq: guildId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord)
            return existingRecord.assignablesRoles;
        else
            return null;
    }

    public async GetCaptainListMessage(season: number, division: NGSDivisions) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        var selectOneFilter = { season: { $eq: season }, division: { $eq: division } };
        var existingMessage: CaptainList = await collection.findOne(selectOneFilter)
        return existingMessage;
    }

    public async CreateCaptainListRecord(messageId: string, season: number, division: NGSDivisions) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        var newRecord: CaptainList = <CaptainList>{
            season: season,
            messageId: messageId,
            division: division
        };
        await collection.insertOne(newRecord);
        return newRecord;
    }

    public async UpdateCaptainListRecord(record: CaptainList): Promise<CaptainList>    {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<CaptainList>(MongoCollections.CaptainList);
        var selectOneFilter = { season: { $eq: record.season }, division: { $eq: record.division } }
        const existingRecord = await collection.findOne(selectOneFilter);
        await collection.updateOne(selectOneFilter, { $set: record }, { upsert: true });
        return existingRecord;
    }

    public async GetNgsInformation(season: number): Promise<SeasonInformation> {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<SeasonInformation>(MongoCollections.SeasonInformation);
        var selectOneFilter = { season: { $eq: season } };
        var result = await collection.findOne(selectOneFilter)
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
        var collection = this.ngsDatabase.collection<SeasonInformation>(MongoCollections.SeasonInformation);
        var selectOneFilter = { season: { $eq: season } };
        const existingRecord = await collection.findOne(selectOneFilter);
        existingRecord.round += 1;
        await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
        return existingRecord;
    }

    public async RemovePendingMember(pendingMember: INGSPendingMember) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<INGSPendingMember>(MongoCollections.PendingMembers);
        var selectOneQuery = { $and: [{ teamName: { $eq: pendingMember.teamName } }, { userName: { $eq: pendingMember.userName } }] };
        await collection.deleteOne(selectOneQuery);
    }

    public async GetAllFromCollection<T>(collectionName: string): Promise<T[]> {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<T>(collectionName);
        return collection.find().toArray();
    }

    public async AddToCollection<T>(collectionName: string, newRecord: T) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<T>(collectionName);
        await collection.insertOne(newRecord);
    }

    public async AddMultipleToCollection<T>(collectionName: string, newRecords: T[]) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<T>(collectionName);
        await collection.insertMany(newRecords);
    }
}