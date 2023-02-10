import { DataStoreWrapper } from "../helpers/DataStoreWrapper";
import { Mongohelper } from "../helpers/Mongohelper";
import { NGSQueryBuilder } from "../helpers/NGSQueryBuilder";
import { TeamSorter } from "../helpers/TeamSorter";
import { INGSTeam } from "../interfaces";
import { INGSPendingMember } from "../interfaces/INGSPendingMember";
import { MessageContainer, MessageGroup } from "../message-helpers/MessageContainer";
import { IMongoPendingMemberCollection, MongoCollections } from "../mongo/models/MongoCollections";

export class CheckPendingMembers {

    constructor(private apiKey: string, private dataStore: DataStoreWrapper, private mongoHelper: Mongohelper) {

    }

    public async GetMembersPendingMessage() {
        var currentPendingMembers = await this.GetMembersPendingFromNGS();
        var membersInMongo = await this.GetMembersPendingFromMongo();
        var pendingInBoth = this.PendingInBoth(currentPendingMembers, membersInMongo);
        await this.AddToMongoNewPendings(currentPendingMembers, membersInMongo);
        await this.RemoveMongoNoLongerPendings(currentPendingMembers, membersInMongo);
        var pendingsWithDivision = await this.AddDivisionToPendings(pendingInBoth);
        return this.CreateMessage(pendingsWithDivision);
    }

    private async GetMembersPendingFromNGS(): Promise<INGSPendingMember[]> {
        return await new NGSQueryBuilder().GetSecuredResponse<INGSPendingMember[]>("/admin/pendingMemberQueue", this.apiKey);
    }

    private async GetMembersPendingFromMongo(): Promise<INGSPendingMember[]> {
        var result = await this.mongoHelper.GetAllFromCollection<IMongoPendingMemberCollection>(MongoCollections.PendingMembers);
        if (!result) {
            result = [];
        }
        return result;
    }

    private PendingInBoth(ngsPendingMembers: INGSPendingMember[], mongoPendingMembers: INGSPendingMember[]): INGSPendingMember[] {
        var result: INGSPendingMember[] = [];
        for (var ngsPendingMember of ngsPendingMembers) {
            for (var mongoPendingMember of mongoPendingMembers) {
                if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                    result.push(ngsPendingMember);
                    continue;
                }
            }
        }
        return result;
    }

    private async AddToMongoNewPendings(ngsPendingMembers: INGSPendingMember[], mongoPendingMembers: INGSPendingMember[]) {
        var newMembersToAdd: INGSPendingMember[] = [];
        for (var ngsPendingMember of ngsPendingMembers) {
            var found = false;
            for (var mongoPendingMember of mongoPendingMembers) {
                if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                    found = true;
                    continue;
                }
            }
            if (!found)
                newMembersToAdd.push(ngsPendingMember);
        }
        if (newMembersToAdd.length > 0)
            await this.mongoHelper.AddMultipleToCollection(MongoCollections.PendingMembers, newMembersToAdd);
    }

    private async RemoveMongoNoLongerPendings(ngsPendingMembers: INGSPendingMember[], mongoPendingMembers: INGSPendingMember[]) {
        var removePromises: Promise<void>[] = [];
        for (var mongoPendingMember of mongoPendingMembers) {
            var found = false;
            for (var ngsPendingMember of ngsPendingMembers) {
                if (ngsPendingMember.teamName == mongoPendingMember.teamName && ngsPendingMember.userName == mongoPendingMember.userName) {
                    found = true;
                    continue;
                }
            }
            if (!found)
                removePromises.push(this.mongoHelper.RemovePendingMember(mongoPendingMember));
        }

        await Promise.all(removePromises);
    }


    private async AddDivisionToPendings(pendingInBoth: INGSPendingMember[]): Promise<PendingDivisionInformation[]> {
        var result: PendingDivisionInformation[] = [];
        var teams = await this.dataStore.GetTeams();
        for (var pending of pendingInBoth) {
            var found = false;
            for (var team of teams.Teams) {
                if (pending.teamName.toLowerCase() == team.teamName.toLowerCase()) {
                    found = true;
                    result.push({ pendingMember: pending, division: team.divisionDisplayName });
                }
            }
            if (!found)
                result.push({ pendingMember: pending, division: "UNPLACED" });
        }
        return result;
    }

    CreateMessage(pendingsWithDivision: PendingDivisionInformation[]): MessageContainer {
        const messageContainer = new MessageContainer();
        const sortedPendings = pendingsWithDivision.sort((item1, item2) => TeamSorter.SortByDivision(item1.division, item2.division));
        const groupedbyDivisionPendings = sortedPendings.reduce(function (r, a) {
            r[a.division] = r[a.division] || [];
            r[a.division].push(a.pendingMember);
            return r;
        }, Object.create(null));

        for (const pendingGroupKey in groupedbyDivisionPendings) {
            const divisionName = pendingGroupKey;
            let pendingMembers: INGSPendingMember[] = groupedbyDivisionPendings[pendingGroupKey];
            const groupedByTeamName = pendingMembers.reduce(function (r, a) {
                r[a.teamName] = r[a.teamName] || [];
                r[a.teamName].push(a);
                return r;
            }, Object.create(null));
            const newMessageGroup = new MessageGroup();
            newMessageGroup.AddOnNewLine(`Pending Roster Adds For Division: **${divisionName}**`);
            for (const groupedByTeamKey in groupedByTeamName) {
                var teamName = groupedByTeamKey;
                var groupedMembers: INGSPendingMember[] = groupedByTeamName[groupedByTeamKey];
                newMessageGroup.AddOnNewLine(`Team`, 2);
                newMessageGroup.AddOnNewLine(`**${teamName}**`, 2);
                newMessageGroup.AddOnNewLine(`Users`, 4);
                for (var member of groupedMembers) {
                    newMessageGroup.AddOnNewLine(`**${member.userName}**`, 4);
                }
                newMessageGroup.AddEmptyLine();
            }
            messageContainer.Append(newMessageGroup);
        }
        return messageContainer;
    }
}

interface PendingDivisionInformation {
    pendingMember: INGSPendingMember;
    division: string;
};
