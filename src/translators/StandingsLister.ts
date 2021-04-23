
import { Client } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import * as http from 'http';
import { INGSStanding } from "../interfaces/INGSStanding";
import { Translationhelpers } from "../helpers/TranslationHelpers";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { MessageStore } from "../MessageStore";
import { CommandDependencies } from "../helpers/TranslatorDependencies";
import { NGSQueryBuilder } from "../helpers/NGSQueryBuilder";

//Not in use atm
export class StandingsLister extends DeltaTranslatorBase {

    constructor(translatorDependencies: CommandDependencies) {
        super(translatorDependencies);
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
            "season": 11
        };

        var standings = await new NGSQueryBuilder().PostResponse<INGSStanding[]>('/standings/fetch/division', divisionObject)

        if (standings) {
            let message = this.CreateStandingsMessage(standings);
            messageSender.SendMessage(message);
        }
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