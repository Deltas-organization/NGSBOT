import { NGSDivisions } from "../enums/NGSDivisions";
import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { MessageHelper } from "../helpers/MessageHelper";
import { TeamSorter } from "../helpers/TeamSorter";
import { INGSSchedule } from "../interfaces";

export class CheckFlexMatches {

    constructor(private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<MessageHelper<void>[]> {
        try {
            var result: MessageHelper<void>[] = [];
            var unscheduledFlexMatch: INGSSchedule[] = [];
            var scheduleList = await this.dataStore.GetSchedule();
            for (var schedule of scheduleList) {
                if (schedule.scheduledTime || schedule.reported || schedule.forfeit)
                    continue;
                if (!schedule.scheduleDeadline)
                    unscheduledFlexMatch.push(schedule);
            }
            unscheduledFlexMatch = unscheduledFlexMatch.sort((i1, i2) => TeamSorter.SortByDivisionConcat(i1.divisionConcat, i2.divisionConcat))
            var lastDivision: string;
            var currentDivisionMessage: MessageHelper<void>;
            for (var match of unscheduledFlexMatch) {
                if(!match.divisionConcat)
                    continue;

                try {
                    if (lastDivision != match.divisionConcat) {
                        currentDivisionMessage = new MessageHelper<void>();
                        currentDivisionMessage.AddNew(`UnScheduled Flex Matches For Division: **${match.divisionConcat}**`);
                        result.push(currentDivisionMessage);
                        lastDivision = match.divisionConcat;
                    }
                    currentDivisionMessage.AddNewLine(`**${match.home.teamName}** vs **${match.away.teamName}**`);
                }
                catch (e) {
                    Globals.log("Problem", match, e);
                }
            }
            return result;
        }
        catch (e) {
            Globals.log(e);
        }
    }

    private async SendMessageForDivision(division: string): Promise<MessageHelper<void>> {

        // var unscheduledGames: INGSSchedule[] = [];

        // var divisions = await this.dataStore.GetDivisions();
        // const divisionConcat = divisions.filter(d => d.displayName == division)[0].divisionConcat;

        // var matches = await this.dataStore.GetScheduleByRoundAndDivision(divisionConcat, roundNumber);
        // for (var match of matches) {
        //     if (match.scheduledTime || match.reported || match.forfeit)
        //         continue;

        //     unscheduledGames.push(match);

        // }

        var messageToSend = new MessageHelper<void>();
        // if (unscheduledGames.length < 1) {
        //     messageToSend.AddNew(`**${division}** Division has all of their games scheduled for next week!`);
        // }
        // else {
        //     messageToSend.AddNew(`Found some unschedule games for Division: **${division}**`);
        //     for (var unscheduledGame of unscheduledGames) {
        //         messageToSend.AddNewLine(`**${unscheduledGame.home.teamName}** VS **${unscheduledGame.away.teamName}**`);
        //     }
        // }
        return messageToSend;
    }
}