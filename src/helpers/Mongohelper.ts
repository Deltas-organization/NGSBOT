
import * as mongoDB from "mongodb";
import { DiscordGuilds } from "../enums/DiscordGuilds";
import { NGSDivisions } from "../enums/NGSDivisions";
import { INGSPendingMember } from "../interfaces/INGSPendingMember";
import { IMongoAssignRolesRequest, IMongoScheduleRequest } from "../mongo";
import { CaptainList } from "../mongo/models/captain-list";
import { IIgnoreRolesDocument } from "../mongo/models/ignore-roles-document";
import { MongoCollections } from "../mongo/models/MongoCollections";
import { SeasonInformation } from "../mongo/models/season-information";

export class Mongohelper {
    protected client: mongoDB.MongoClient;
    protected connectedDatabase: mongoDB.Db;
    protected connectedPromise: Promise<void>;


    constructor(connectionUri: string, databaseToConnectTo: "NGS" | "DBD" = "NGS") {
        this.client = new mongoDB.MongoClient(connectionUri, { useUnifiedTopology: true });
        this.setup(databaseToConnectTo);
    }

    private setup(databaseToConnectTo: "NGS" | "DBD") {
        this.connectedPromise = new Promise(async (resolver, rejector) => {
            await this.client.connect();
            if (databaseToConnectTo == "NGS")
                this.connectedDatabase = this.client.db("NGS");
            else if (databaseToConnectTo == "DBD")
                this.connectedDatabase = this.client.db("DeadByDaylight");
            resolver();
        });
    }

    public async GetAllFromCollection<T>(collectionName: string): Promise<T[]> {
        await this.connectedPromise;
        var collection = this.connectedDatabase.collection<T>(collectionName);
        return collection.find().toArray();
    }

    public async AddToCollection<T>(collectionName: string, newRecord: T) {
        await this.connectedPromise;
        var collection = this.connectedDatabase.collection<T>(collectionName);
        await collection.insertOne(newRecord);
    }

    public async AddMultipleToCollection<T>(collectionName: string, newRecords: T[]) {
        await this.connectedPromise;
        var collection = this.connectedDatabase.collection<T>(collectionName);
        await collection.insertMany(newRecords);
    }
}