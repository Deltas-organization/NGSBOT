import { Description, DescriptionType } from "../types";

export class DescriptionHelper {
    public static GenerateDescription(descriptions: Description[]): string[] {
        let result: string[] = [];
        for (const description of descriptions) {
            switch (description.type) {
                case DescriptionType.header: {
                    result.push(`**${description.value}**`);
                    break;
                }
                case DescriptionType.normal: {
                    result.push(`${description.value}`);
                    break;
                }
                case DescriptionType.list: {
                    var listItems = this.GenerateDescription(<Description[]>description.value);
                    let count = 1;
                    for(var item of listItems)
                    {
                        result.push(`  ${count}. ${item}`);
                        count++;
                    }
                    break;
                }
            }
        }
        return result;
    }
}