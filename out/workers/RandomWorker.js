"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RandomWorker = void 0;
const Heroes_1 = require("../enums/Heroes");
const Maps_1 = require("../enums/Maps");
const MessageHelper_1 = require("../helpers/MessageHelper");
const WorkerBase_1 = require("./Bases/WorkerBase");
class RandomWorker extends WorkerBase_1.WorkerBase {
    Start(commands) {
        return __awaiter(this, void 0, void 0, function* () {
            this.messageHelper = new MessageHelper_1.MessageHelper();
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
                            const random = this.GetRandom(Heroes_1.AllHeroes);
                            this.messageHelper.AddNewLine(`Your **hero** is: ${random}.`);
                        }
                        break;
                    case "assassin":
                        {
                            const random = this.GetRandom(Heroes_1.Assassin);
                            this.messageHelper.AddNewLine(`Your **assassin** is: ${random}.`);
                        }
                        break;
                    case "melee":
                        {
                            const random = this.GetRandom(Heroes_1.MeleeAssassin);
                            this.messageHelper.AddNewLine(`Your **melee assassin** is: ${random}.`);
                        }
                        break;
                    case "ranged":
                        {
                            const random = this.GetRandom(Heroes_1.RangedAssassin);
                            this.messageHelper.AddNewLine(`Your **ranged assassin** is: ${random}.`);
                        }
                        break;
                    case "healer":
                        {
                            const random = this.GetRandom(Heroes_1.Healer);
                            this.messageHelper.AddNewLine(`Your **healer** is: ${random}.`);
                        }
                        break;
                    case "support":
                        {
                            const random = this.GetRandom(Heroes_1.Support);
                            this.messageHelper.AddNewLine(`Your **support** is: ${random}.`);
                        }
                        break;
                    case "bruiser":
                        {
                            const random = this.GetRandom(Heroes_1.Bruiser);
                            this.messageHelper.AddNewLine(`Your **bruiser** is: ${random}.`);
                        }
                        break;
                    case "tank":
                        {
                            const random = this.GetRandom(Heroes_1.Tank);
                            this.messageHelper.AddNewLine(`Your **tank** is: ${random}.`);
                        }
                        break;
                }
            }
            yield this.messageSender.SendMessage(this.messageHelper.CreateStringMessage());
        });
    }
    GetRandomMap() {
        let maps = Maps_1.HotsCompetitiveMaps;
        if (this.detailed) {
            maps = [...maps, "BlackHearts Bay", "Haunted Mines", "ARAM"];
        }
        return maps[Math.floor(Math.random() * maps.length)];
    }
    GetRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}
exports.RandomWorker = RandomWorker;
//# sourceMappingURL=RandomWorker.js.map