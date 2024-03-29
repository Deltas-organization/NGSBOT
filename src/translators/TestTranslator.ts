import { MessageSender } from "../helpers/messageSenders/MessageSender";
import { TranslatorBase } from "./bases/translatorBase";
import { RandomWorker } from "../workers/RandomWorker";
import { ChangeCaptainNickNameWorker } from "../workers/ChangeCaptainNickNameWorker";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";


export class TestTranslator extends DeltaTranslatorBase {
    public get commandBangs(): string[] {
        return ["test"];
    }

    public get description(): string {
        return "Will run the current command that is being tested";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        // await messageSender.SendBasicMessage("hello test \n \n this is new line?");
    }
}