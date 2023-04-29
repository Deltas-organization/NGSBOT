
export type DBDPerk = { characterName: string; perkType: "survivor" | "killer"; pageNumber?: number } & DBDSearchable & DBDDescriber;
export type DBDSearchable = { keywords: string[]; };
export type DBDDescriber = { name: string, longDescription: Description[], shortDescription: Description[] };
export type Description = { value: string | Description[], type: DescriptionType }
export enum DescriptionType {
    normal = "normal",
    header = "header",
    list = "list"
}