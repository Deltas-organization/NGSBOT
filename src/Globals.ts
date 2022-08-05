import { globalAgent } from "http";
import { DiscordChannels } from "./enums/DiscordChannels";
import { ChannelMessageSender } from "./helpers/messageSenders/ChannelMessageSender";

export class Globals {
    public static EnableLogging: boolean = true;
    public static EnableAdvancedLogging: boolean = false;
    public static ChannelSender: ChannelMessageSender;

    public static log(message: any, ...optionalParams: any[]) {
        if (Globals.EnableLogging) {
            if (optionalParams && optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }

    public static logAdvanced(message: any, ...optionalParams: any[]) {
        if (Globals.EnableAdvancedLogging) {
            if (optionalParams)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }

    public static InformDelta(message: string) {
        this.ChannelSender.SendToDiscordChannel(message, DiscordChannels.DeltaPmChannel);
    }
}