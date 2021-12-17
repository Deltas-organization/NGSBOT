
import * as mongoDB from "mongodb";
import { NGSDivisions } from "../enums/NGSDivisions";
import { IMongoAssignRolesRequest, IMongoScheduleRequest } from "../mongo";

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


    public async AddOrUpdateScheduleRequest(request: IMongoScheduleRequest): Promise<IMongoScheduleRequest> {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        var selectOneFilter = { channelId: { $eq: request.channelId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord) {
            existingRecord.divisions = [...new Set<NGSDivisions>([...existingRecord.divisions, ...request.divisions])];
            await collection.updateOne(selectOneFilter, { $set: existingRecord }, { upsert: true });
            return existingRecord;
        }
        else {
            await collection.insertOne(request);
            return request;
        }
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

    public async RemoveAssignedRoles(request: IMongoAssignRolesRequest): Promise<IMongoAssignRolesRequest> {
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
}