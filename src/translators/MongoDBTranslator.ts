
import { MessageSender } from "../helpers/MessageSender";
import { MongoDBWorker } from "../workers/MongoDBWorker";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import * as Mongoose from "mongoose";
import { CommandDependencies } from "../helpers/TranslatorDependencies";


export class MongoDBTranslator extends DeltaTranslatorBase {
    private Connection: Mongoose.Mongoose;

    public get commandBangs(): string[] {
        return ["mongo", "mongodb"];
    }

    public get description(): string {
        return "Will run mongo queries.";
    }

    constructor(translatorDependencies: CommandDependencies, private connectionUri: string) {
        super(translatorDependencies);
        this.setup();
    }

    private async setup() {
        Mongoose.connect(this.connectionUri, {
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
        });
        const database = Mongoose.connection;
        database.once("open", async () => {
            console.log("Connected to database");
            let cursor = database.collection("restaurants").find();
            cursor.forEach(item => {
                console.log(item); 
            });
        });
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new MongoDBWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}