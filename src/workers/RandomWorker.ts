import { AllHeroes, Assassin, Bruiser, Healer, MeleeAssassin, RangedAssassin, Support, Tank } from "../enums/Heroes";
import { HotsCompetitiveMaps } from "../enums/Maps";
import { MessageHelper } from "../helpers/MessageHelper";
import { WorkerBase } from "./Bases/WorkerBase";

export class RandomWorker extends WorkerBase {
    private messageHelper: MessageHelper<any>;

    protected async Start(commands: string[]) {
        this.messageHelper = new MessageHelper();
        this.messageHelper.AddNewLine(`Here are the random results for: ${this.messageSender.GuildMember}`);
        for (const command of commands) {
            switch (command.toLowerCase()) {
                case "map":
                case "maps":
                    const map = this.GetRandomMap();
                    this.messageHelper.AddNewLine(`Your **map** is: ${map}.`);
                    break;
                case "hero":
                case "heroes":
                    {
                        const random = this.GetRandom(AllHeroes);
                        this.messageHelper.AddNewLine(`Your **hero** is: ${random}.`);
                    }
                    break;
                case "assassin":
                    {
                        const random = this.GetRandom(Assassin);
                        this.messageHelper.AddNewLine(`Your **assassin** is: ${random}.`);
                    }
                    break;
                case "melee":
                    {
                        const random = this.GetRandom(MeleeAssassin);
                        this.messageHelper.AddNewLine(`Your **melee assassin** is: ${random}.`);
                    }
                    break;
                case "ranged":
                    {
                        const random = this.GetRandom(RangedAssassin);
                        this.messageHelper.AddNewLine(`Your **ranged assassin** is: ${random}.`);
                    }
                    break;
                case "healer":
                    {
                        const random = this.GetRandom(Healer);
                        this.messageHelper.AddNewLine(`Your **healer** is: ${random}.`);
                    }
                    break;
                case "support":
                    {
                        const random = this.GetRandom(Support);
                        this.messageHelper.AddNewLine(`Your **support** is: ${random}.`);
                    }
                    break;
                case "bruiser":
                    {
                        const random = this.GetRandom(Bruiser);
                        this.messageHelper.AddNewLine(`Your **bruiser** is: ${random}.`);
                    }
                    break;
                case "tank":
                    {
                        const random = this.GetRandom(Tank);
                        this.messageHelper.AddNewLine(`Your **tank** is: ${random}.`);
                    }
                    break;
            }
        }
        await this.messageSender.SendMessage(this.messageHelper.CreateStringMessage());
    }

    private GetRandomMap() {
        let maps = HotsCompetitiveMaps;
        if (this.detailed) {
            maps.push("BlackHearts Bay", "Haunted Mines", "ARAM");
        }
        return maps[Math.floor(Math.random() * maps.length)];
    }

    private GetRandom(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}