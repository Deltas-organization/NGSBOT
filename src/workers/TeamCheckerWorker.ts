import { debug } from "console";
import { Collection, CollectorFilter, Message, MessageReaction, User } from "discord.js";
import { Translationhelpers } from "../helpers/TranslationHelpers";
import { INGSTeam, INGSUser } from "../interfaces";
import { MessageContainer } from "../message-helpers/MessageContainer";
import { WorkerBase } from "./Bases/WorkerBase";
import { SearchPlayersWorker } from "./SearchPlayersWorker";

export class TeamCheckerWorker extends WorkerBase {
    protected async Start(commands: string[]) {
        const foundTeams: INGSTeam[] = [];
        var reactionsWaiting: Promise<void>[] = [];
        var number = parseInt(commands[0]);
        var searchMethod = (term: string) => this.SearchForRegisteredTeams(term);
        if (!isNaN(number)) {
            searchMethod = (term: string) => this.SearchForTeamBySeason(number, term);
            commands.shift();
            if (commands.length < 1)
                await this.messageSender.SendMessage("invalid search");
        }
        for (var i = 0; i < commands.length; i++) {
            const fields: { name: string, value: string }[] = [];
            const searchTerm = commands[i];
            const teams = await searchMethod(searchTerm);
            if (!teams || teams.length <= 0) {
                fields.push({ name: `No teams found for  \n`, value: searchTerm });
                await this.messageSender.SendFields(``, fields);
            }
            else {
                for (var team of teams) {
                    if (foundTeams.indexOf(team) > -1)
                        continue;

                    foundTeams.push(team);
                    let teamMessage = this.GetTeamMessage(team);
                    let sentMessage = await this.messageSender.SendFields(``, teamMessage);
                    var reactionPromise = this.reactToMessage(sentMessage, team);
                    reactionsWaiting.push(reactionPromise);
                }
            }
        }
        await Promise.all(reactionsWaiting);
    }

    private async reactToMessage(sentMessage: Message, team: INGSTeam) {
        await sentMessage.react('✅');
        const filter: CollectorFilter<[MessageReaction, User]> = (reaction, user) => {
            if (user.bot)
                return false;
            if (reaction.emoji.name) {
                if (['✅'].includes(reaction.emoji.name))
                    return true;
            }
            return false;
        };

            var result = await sentMessage.awaitReactions({ filter, max: 1, time: 3e4 });
            if(result.size > 0)
                this.DisplayPlayerInformation(team);
    }

    private GetTeamMessage(team: INGSTeam): any[] {
        let result: { name: string, value: string, inline: boolean }[] = [];
        result.push({ name: "TeamName", value: `\u0009 ${Translationhelpers.GetTeamURL(team.teamName)}`, inline: true });
        result.push({ name: "Division", value: `\u0009 ${team.divisionDisplayName}`, inline: true });
        result.push({ name: "Description", value: `\u0009 ${team.descriptionOfTeam} -`, inline: true });
        let firstValueArray: string[] = [];
        let secondValueArray: string[] = [];
        let thirdValueArray: string[] = [];
        let playerLength = team.teamMembers.length;
        for (var i = 0; i < playerLength; i += 3) {
            let player = team.teamMembers[i];
            firstValueArray.push(this.AddPlayerMessage(player));
            if (i + 1 < playerLength) {
                player = team.teamMembers[i + 1];
                secondValueArray.push(this.AddPlayerMessage(player));
            }
            if (i + 2 < playerLength) {
                player = team.teamMembers[i + 2];
                thirdValueArray.push(this.AddPlayerMessage(player));
            }
        }
        result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
        return result;
    }


    private AddPlayerMessage(player: { displayName: string; }): string {
        return '\u0009' + player.displayName.split("#")[0];
    }

    private async DisplayPlayerInformation(team: INGSTeam) {
        const users = await this.dataStore.GetUsers();
        const foundUsers: INGSUser[] = [];
        for (let user of users) {
            if (user.teamName == team.teamName)
                foundUsers.push(user);
        }

        const container = new MessageContainer();
        const message = SearchPlayersWorker.CreatePlayerMessage(foundUsers, false);
        container.Append(message);
        await this.messageSender.SendMessageFromContainer(container);
    }
}