
import * as mongoDB from "mongodb";
import { IMongoScheduleRequest } from "../mongo/models/schedule-request";

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

    public async getRequestedSchedules(): Promise<IMongoScheduleRequest[]> {
        await this.connectedPromise;
        const result: IMongoScheduleRequest[] = [];
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        await collection.find().forEach(item => {
            result.push(item);
        });
        return result;
    }

    public async addScheduleRequest(request: IMongoScheduleRequest) {
        await this.connectedPromise;
        var collection = this.ngsDatabase.collection<IMongoScheduleRequest>("ScheduleRequest");
        await collection.insertOne(request);
    }
}