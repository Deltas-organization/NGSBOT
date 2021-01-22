import { Client } from "discord.js"
import { LiveDataStore } from "../LiveDataStore"
import { MessageStore } from "../MessageStore"

export class TranslatorDependencies {
    constructor(public client: Client, public messageStore: MessageStore, public liveDataStore: LiveDataStore) {}}