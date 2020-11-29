import { Client, Message } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "./inversify/types";
import { ITranslate } from "./interfaces/ITranslator";
import { ScheduleLister } from "./translators/ScheduleLister";
import { CommandLister } from "./translators/commandLister";
import { MessageSender } from "./helpers/MessageSender";
import { LiveDataStore } from "./LiveDataStore";
import { SelfTeamChecker } from "./translators/SelfTeamChecker";
import { MessageStore } from "./MessageStore";
import { TranslatorDependencies } from "./helpers/TranslatorDependencies";
import { DeleteMessage } from "./translators/DeleteMessage";
import { CheckUsers } from "./translators/CheckUsers";
import { ConfigSetter } from "./translators/ConfigSetter";

var fs = require('fs');

@injectable()
export class Bot {
    private translators: ITranslate[] = [];
    private scheduleLister: ScheduleLister;
    private dependencies: TranslatorDependencies;

    constructor(
        @inject(TYPES.Client) public client: Client,
        @inject(TYPES.Token) public token: string,
    ) {
        const liveDataStore = new LiveDataStore();
        this.dependencies = new TranslatorDependencies(client,  new MessageStore())

        this.scheduleLister = new ScheduleLister(this.dependencies, liveDataStore);
        this.translators.push(this.scheduleLister);
        this.translators.push(new SelfTeamChecker(this.dependencies, liveDataStore));
        this.translators.push(new CheckUsers(this.dependencies, liveDataStore));
        this.translators.push(new DeleteMessage(this.dependencies));
        this.translators.push(new ConfigSetter(this.dependencies))

        this.translators.push(new CommandLister(this.dependencies, this.translators));
    }

    public listen(): Promise<string> {
        this.client.on('message', async (message: Message) => {
            this.OnMessageReceived(message);
        });

        return this.client.login(this.token);
    }

    public OnMessageReceived(message: Message) {
        let originalContent = message.content;
        if (/^\>/.test(originalContent)) {
            var trimmedValue = originalContent.substr(1);
            this.translators.forEach(translator => {
                translator.Translate(trimmedValue, message);
            });
        }
    }

    public async sendSchedule() {
        await this.dependencies.client.login(this.token);
        let messages = await this.scheduleLister.getGameMessagesForToday();
        //My Test Server and NGS HypeChannel
        let channelsToReceiveMessage = ["761410049926889544", "522574547405242389"];
        for (var channelIndex = 0; channelIndex < channelsToReceiveMessage.length; channelIndex++) {
            for (var index = 0; index < messages.length; index++) {
                await MessageSender.SendMessageToChannel(this.dependencies, messages[index], channelsToReceiveMessage[channelIndex])
            }
        }
    }
}