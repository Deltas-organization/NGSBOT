import { Client } from "discord.js"
import { MessageStore } from "../MessageStore"

export class TranslatorDependencies {
    constructor(public client: Client, public messageStore: MessageStore) {}}