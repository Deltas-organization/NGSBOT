import { MessageSender } from "../helpers/MessageSender";
import { TranslatorBase } from "./bases/translatorBase";
import { RandomWorker } from "../workers/RandomWorker";


const fs = require('fs');

export class RandomTranslator extends TranslatorBase {
    public get commandBangs(): string[] {
        return ["random"];
    }

    public get description(): string {
        return "Will give a random thing. Supports: Map, hero, ranged, melee, assassin, healer, support, tank, bruiser.";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        const worker = new RandomWorker(this.translatorDependencies, detailed, messageSender);
        await worker.Begin(commands);
    }
}