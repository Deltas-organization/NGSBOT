import { HotsCompetitiveMaps } from "../../enums/Maps";
import { AllHeroes, Assassin, Bruiser, Healer, MeleeAssassin, RangedAssassin, Support, Tank } from "../../enums/Heroes";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { CacheType, CommandInteractionOption } from "discord.js";
import { Random } from "../../helpers/RandomOptions";

export class RandomTeamWorker {
    private _teamSize = 5;

    public Run(memberNames: string[], membersWithPriority: string[]): { container: MessageContainer, unselectedPlayerNames: string[] } {
        const container = new MessageContainer();
        const numberOfTeams = Math.floor(memberNames.length / this._teamSize);
        const availableTeamMembers = [...memberNames];
        const teams: string[][] = [];
        const guaranteedTeamMembers: { memberName: string, teamNumber: number }[] = [];
        for (let member of membersWithPriority) {
            const randomTeamNumbers: number[] = [];
            for (var i2 = 0; i2 < numberOfTeams; i2++) {
                randomTeamNumbers.push(i2);
            }
            guaranteedTeamMembers.push({ memberName: member, teamNumber: this.GetRandom(randomTeamNumbers) });
        }

        for (let i = 0; i < numberOfTeams; i++) {
            const team: string[] = [];
            let teamFull = false;
            for (var guaranteedTeamMember of guaranteedTeamMembers) {
                if (guaranteedTeamMember.teamNumber <= i) {
                    if (team.length != this._teamSize) {
                        const index = availableTeamMembers.indexOf(guaranteedTeamMember.memberName);
                        if (index != -1) {
                            availableTeamMembers.splice(index, 1);
                            team.push(guaranteedTeamMember.memberName);
                        }
                    }
                    else {
                        teamFull = true;
                        break;
                    }
                }
            }
            teams.push(team);
            if (!teamFull) {
                const membersToAdd = this._teamSize - team.length;
                for (let i2 = 0; i2 < membersToAdd; i2++) {
                    let randomMember = this.GetRandom(availableTeamMembers);
                    const index = availableTeamMembers.indexOf(randomMember);
                    availableTeamMembers.splice(index, 1);
                    team.push(randomMember);
                }
            }

            const group = new MessageGroup();
            group.Add("Here is Team: " + (+i + 1));
            for (let teamMember of team) {
                group.AddOnNewLine(teamMember, 2);
            }
            container.Append(group);
        }

        const group = new MessageGroup();
        group.Add("Here are the missing players");
        for (let teamMember of availableTeamMembers) {
            group.AddOnNewLine(teamMember, 2);
        }
        container.Append(group);
        return { container, unselectedPlayerNames: availableTeamMembers };
    };

    private GetRandom<T>(array: T[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}