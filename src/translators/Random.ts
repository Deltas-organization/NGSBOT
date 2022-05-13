import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { RandomWorker } from "../workers/RandomWorker";
import { TranslatorBase } from "./bases/translatorBase";


const fs = require('fs');

export class RandomTranslator extends TranslatorBase {
    public get commandBangs(): string[] {
        return ["random"];
    }

    public get description(): string {
        return "Will give a random thing. Supports: Map, hero, ranged, melee, assassin, healer, support, tank, bruiser.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const worker = new RandomWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}