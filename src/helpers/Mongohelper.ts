
import * as mongoDB from "mongodb";
import { NGSDivisions } from "../enums/NGSDivisions";
import { IMongoScheduleRequest } from "../mongo/models/schedule-request";

export class Mongohelper
{
    private client: mongoDB.MongoClient;
    private ngsDatabase: mongoDB.Db;
    private connectedPromise: Promise<void>;


    constructor(connectionUri: string)
    {
        this.client = new mongoDB.MongoClient(connectionUri, { useUnifiedTopology: true });
        this.setup();
    }

    private setup()
    {
        this.connectedPromise = new Promise(async (resolver, rejector) =>
        {
            await this.client.connect();
            this.ngsDatabase = this.client.db("NGS");
            resolver();
        });
    }

    public async getRequestedSchedules(): Promise<IMongoScheduleRequest[]>
    {
        await this.connectedPromise;
        const result: IMongoScheduleRequest[] = [];
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        await collection.find().forEach(item =>
        {
            result.push(item);
        });
        return result;
    }

    public async addScheduleRequest(request: IMongoScheduleRequest): Promise<IMongoScheduleRequest> 
    {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        var selectOneFilter = { channelId: { $eq: request.channelId } };
        const existingRecord = await collection.findOne(selectOneFilter);
        if (existingRecord)
        {
            existingRecord.divisions = [...new Set<NGSDivisions>([...existingRecord.divisions, ...request.divisions])];
            await collection.updateOne(selectOneFilter, {$set: existingRecord}, {upsert: true});
            return existingRecord;
        }
        else
        {
            await collection.insertOne(request);
            return request;
        }
    }
}