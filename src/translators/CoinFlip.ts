import { RespondToMessageSender } from "../helpers/messageSenders/RespondToMessageSender";
import { NonNGSTranslatorBase } from "./bases/nonNGSTranslatorBase";


export class CoinFlip extends NonNGSTranslatorBase {
    public get commandBangs(): string[] {
        return ["flip"];
    }

    public get description(): string {
        return "Will Flip a coin";
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: RespondToMessageSender) {
        const x = (Math.floor(Math.random() * 2) == 0);
        if (x) {
            await messageSender.SendBasicMessage(`${messageSender.GuildMember} heads`);
        } else {
            await messageSender.SendBasicMessage(`${messageSender.GuildMember} tails`);
        }
    }
}