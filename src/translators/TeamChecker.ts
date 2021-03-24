import { Client, Message } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";
import { MessageSender } from "../helpers/MessageSender";
import { Translationhelpers } from "../helpers/TranslationHelpers";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { LiveDataStore } from "../LiveDataStore";
import { INGSTeam } from "../interfaces/INGSTeam";
import { NGSHelpers } from "../helpers/NGSHelpers";

var fs = require('fs');

export class TeamNameChecker extends TranslatorBase
{

    public async Verify(message: Message)
    {
        if (message.member.user.id == "163779571060178955")
            return true;

        switch (message.guild.id)
        {
            case "674526786779873280":
                return true;
            case "618209192339046421":
                return true;
        }
        return false;
    }

    public get commandBangs(): string[]
    {
        return ["team"];
    }

    public get description(): string
    {
        return "Will List Teams containing the values, Supports multiple searches with the space delimeter. And can include spaces by wraping the search in double quotes.";
    }

    protected async Interpret(commands: string[], detailed: boolean, message: MessageSender)
    {
        const foundTeams = [];
        for (var i = 0; i < commands.length; i++)
        {
            const fields = [];
            const searchTerm = commands[i];
            const teams = NGSHelpers.SearchforTeam(await this.liveDataStore.GetTeams(), searchTerm);
            if (teams.length <= 0)
            {
                fields.push({ name: `No teams found for  \n`, value: searchTerm });
                await message.SendFields(``, fields);
            }
            else
            {
                for (var team of teams)
                {
                    if (foundTeams.indexOf(team) > -1)
                        continue;
                        
                    foundTeams.push(team);
                    let teamMessage = this.GetTeamMessage(team);
                    await message.SendFields(``, teamMessage);
                }
            }
        }
    }

    private GetTeamMessage(team: INGSTeam): any[]
    {
        let result = [];
        result.push({ name: "TeamName", value: `\u0009 ${Translationhelpers.GetTeamURL(team.teamName)}`, inline: true });
        result.push({ name: "Division", value: `\u0009 ${team.divisionDisplayName}`, inline: true });
        result.push({ name: "Description", value: `\u0009 ${team.descriptionOfTeam} -`, inline: true });
        let firstValueArray = [];
        let secondValueArray = [];
        let thirdValueArray = [];
        let playerLength = team.teamMembers.length;
        for (var i = 0; i < playerLength; i += 3)
        {
            let player = team.teamMembers[i];
            firstValueArray.push('\u0009' + player.displayName.split("#")[0]);
            if (i + 1 < playerLength)
            {
                player = team.teamMembers[i + 1];
                secondValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
            if (i + 2 < playerLength)
            {
                player = team.teamMembers[i + 2];
                thirdValueArray.push('\u0009' + player.displayName.split("#")[0]);
            }
        }
        result.push({ name: "Players", value: firstValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: secondValueArray.join("\n"), inline: true });
        result.push({ name: "\u200B", value: thirdValueArray.join("\n"), inline: true });
        return result;
    }
}