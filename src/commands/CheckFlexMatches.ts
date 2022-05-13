import { Globals } from "../Globals";
import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { TeamSorter } from "../helpers/TeamSorter";
import { INGSSchedule } from "../interfaces";
import { MessageContainer, MessageGroup } from "../message-helpers/MessageContainer";

export class CheckFlexMatches {

    constructor(private dataStore: DataStoreWrapper) {

    }

    public async Check(): Promise<MessageContainer> {
        try {
            var result: MessageContainer;
            var unscheduledFlexMatch: INGSSchedule[] = [];
            var unscheduledFlexMatch = await this.dataStore.GetUnScheduledFlexMatches();
            unscheduledFlexMatch = unscheduledFlexMatch.sort((i1, i2) => TeamSorter.SortByDivisionConcat(i1.divisionConcat, i2.divisionConcat))
            var lastDivision: string;
            var currentDivisionMessage: MessageGroup;
            for (var match of unscheduledFlexMatch) {
                if (!match.divisionConcat)
                    continue;

                try {
                    if (lastDivision != match.divisionConcat) {
                        currentDivisionMessage = new MessageGroup();
                        currentDivisionMessage.AddOnNewLine(`UnScheduled Flex Matches For Division: **${match.divisionConcat}**`);
                        result.Append(currentDivisionMessage);
                        lastDivision = match.divisionConcat;
                    }
                    currentDivisionMessage.AddOnNewLine(`**${match.home.teamName}** vs **${match.away.teamName}**`);
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
}