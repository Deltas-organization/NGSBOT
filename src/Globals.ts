import { globalAgent } from "http";

export class Globals {
    public static EnableLogging: boolean = true;
    public static EnableAdvancedLogging: boolean = false;

    public static log(message: any, ...optionalParams: any[]) {
        if (Globals.EnableLogging) {
            if (optionalParams && optionalParams.length > 0)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }

    public static logAdvanced(message: any, ...optionalParams: any[])
    {
        if (Globals.EnableAdvancedLogging) {
            if (optionalParams)
                console.log(message, optionalParams);
            else
                console.log(message);
        }
    }
}