import { MessageSender } from "../helpers/MessageSender";
import { LiveDataStore } from "../LiveDataStore";
import { TranslatorDependencies } from "../helpers/TranslatorDependencies";
import { DeltaTranslatorBase } from "./bases/deltaTranslatorBase";
import { Globals } from "../Globals";
import { INGSUser } from "../interfaces";
import { Message } from "discord.js";
import { TranslatorBase } from "./bases/translatorBase";

export class SearchPlayers extends TranslatorBase {

    public async Verify(message: Message) {
        if(message.member.user.id == "163779571060178955")
            return true;
            
        switch (message.guild.id) {
            case "674526786779873280":
                return true;
            case "618209192339046421":
                return true;
        }
        return false;
    }

    public get commandBangs(): string[] {
        return ["name"];
    }

    public get description(): string {
        return "searches for players by name.";
    }

    constructor(translatorDependencies: TranslatorDependencies, private liveDataStore: LiveDataStore) {
        super(translatorDependencies);
    }

    protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
        var message = "";
        for (var i = 0; i < commands.length; i++) {
            var playerName = commands[i];
            var players = await this.GetPlayers(playerName);
            if (players.length <= 0)
                message += `No players found for: ${playerName} \n`;
            else
                message += this.CreatePlayerMessage(players, detailed);

            message += "\n";
        }
        await messageSender.SendMessage(message);
    }

    private CreatePlayerMessage(players: INGSUser[], detailed: boolean) {
        let result = [];
        players.forEach(p => {
            let playerResult = '';
            playerResult += `**Name**: ${p.displayName}, \n**TeamName**: ${p.teamName} \n`;
            for (var rank of p.verifiedRankHistory) {
                if (rank.status == 'verified')
                    playerResult += `${rank.year} Season: ${rank.season}. **${rank.hlRankMetal} ${rank.hlRankDivision}** \n`;
            }
            result.push(playerResult);
        });
        return result.join("\n");
    }

    private async GetPlayers(playerName: string): Promise<INGSUser[]> {
        let lowerCase = playerName.toLowerCase();
        let users = await this.liveDataStore.GetUsers();
        return users.filter(p => p.displayName.toLowerCase().includes(lowerCase));
    }
}