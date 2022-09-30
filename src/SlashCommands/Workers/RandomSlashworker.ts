import { HotsCompetitiveMaps } from "../../enums/Maps";
import { AllHeroes, Assassin, Bruiser, Healer, MeleeAssassin, RangedAssassin, Support, Tank } from "../../enums/Heroes";
import { MessageContainer, MessageGroup } from "../../message-helpers/MessageContainer";
import { CacheType, CommandInteractionOption } from "discord.js";
import { Random } from "../../helpers/RandomOptions";

export class RandomSlashWorker {

    public Run(respondedOptions: readonly CommandInteractionOption<CacheType>[]) {
        const container = new MessageContainer();
        for (const data of respondedOptions) {
            var options = this.FindOption(data.name);
            const randomResult = this.GetRandomData(options.options, data.value as number);
            const group = new MessageGroup();
            group.Add(`Here are your **${options.friendlyName ?? options.name}**`);
            randomResult.forEach(r => {
                group.AddOnNewLine(r);
            })
            container.Append(group);
        }
        return container;
    };

    private GetRandomData(options: string[], numberOfResults: number): string[] {
        const result: string[] = [];
        for (let i = 0; i < numberOfResults; i++) {
            result.push(this.GetRandom(options));
        }
        return result;
    }

    private FindOption(name: string) {
        for (const option of Random.options) {
            if (option.name == name)
                return option;
        }
        throw "Unable To find option somehow";
    }

    private GetRandom(array: string[]) {
        return array[Math.floor(Math.random() * array.length)];
    }
}