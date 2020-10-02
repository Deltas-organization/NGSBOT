
import { Client } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import * as http from 'http';
import { INGSStanding } from "../interfaces/INGSStanding";
import { Translationhelpers } from "../helpers/TranslationHelpers";

export class StandingsLister extends TranslatorBase {

    constructor(client: Client) {
        super(client);
    }

    public get commandBangs(): string[] {
        return ["St", "Standing", "Standings"];
    }

    public get description(): string {
        return 'Gets standing for Divisions. looks like "!st b west" "!st storm" "!st b ne" "!st b se"';
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        if (commands.length > 2 || commands.length == 0) {
            messageSender.SendMessage("unsupported param count");
            return;
        }

        var div = commands[0];
        if (commands.length == 2) {
            var coast = commands[1];
            if (coast.toLowerCase() == "ne")
                div += "-northeast";
            else if (coast.toLowerCase() == "se")
                div += "-southeast";
            else
                div += `-${coast}`;
        }

        var divisionObject = {
            "division": div,
            "season": 10
        };

        const postData = JSON.stringify(divisionObject);

        const options = {
            hostname: 'nexusgamingseries.org',
            port: 80,
            path: '/standings/fetch/division',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': postData.length
            }
        };

        const req = http.request(options, (result) => {
            result.setEncoding('utf8');
            var chunks = "";
            result.on('data', (chunk) => {
                chunks += chunk;
            });
            result.on('end', () => {
                var parsedObject = JSON.parse(chunks);
                var standings: INGSStanding[] = parsedObject.returnObject;
                if (standings) {
                    let message = this.CreateStandingsMessage(standings);
                    messageSender.SendMessage(message);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        // Write data to request body
        req.write(postData);
        req.end();
    }

    private CreateStandingsMessage(standings: INGSStanding[]): string {
        var message = "";
        for (var index = 0; index < standings.length; index++) {
            var title: string = index + 1 + "";
            if (index == 0)
                title += "st";
            else if (index == 1)
                title += "nd";
            else if (index == 2)
                title += "rd";
            else
                title += "th";

            let standing = standings[index];
            message += `${title} - ${Translationhelpers.GetTeamURL(standing.teamName)} \n`
            message += `\u200B \u200B \u200B \u200B Points: ${standing.points} \n`
        }
        return message;
    }
}