import { Client } from "discord.js"
import { LiveDataStore } from "../LiveDataStore"
import { MessageStore } from "../MessageStore"
import { DataStoreWrapper } from "./DataStoreWrapper"

export class CommandDependencies {
    constructor(public client: Client, public dataStore: DataStoreWrapper, public apiKey: string, public mongoConnectionString: string) {}}