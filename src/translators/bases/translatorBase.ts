import { ITranslate } from "../../interfaces/ITranslator";
import { Client, TextChannel, Message, MessageMentions } from "discord.js";
import { MessageSender } from "../../helpers/MessageSender";
import { MessageStore } from "../../MessageStore";
import { CommandDependencies } from "../../helpers/TranslatorDependencies";
import { LiveDataStore } from "../../LiveDataStore";
import { INGSTeam, INGSUser } from "../../interfaces";
import { DiscordMembers } from "../../enums/DiscordMembers";
import { DataStoreWrapper } from "../../helpers/DataStoreWrapper";
import { Globals } from "../../Globals";
import { Mongohelper } from "../../helpers/Mongohelper";

export abstract class TranslatorBase implements ITranslate {
    public abstract get commandBangs(): string[];
    public abstract get description(): string;
    public get delimiter() {
        return null;
    }

    protected readonly dataStore: DataStoreWrapper;
    protected readonly client: Client;
    protected readonly messageStore: MessageStore;
    protected readonly apiKey: string;
    private readonly mongoConnectionUri: string;

    constructor(protected translatorDependencies: CommandDependencies) {
        this.client = translatorDependencies.client;
        this.messageStore = translatorDependencies.messageStore;
        this.dataStore = translatorDependencies.dataStore;
        this.apiKey = translatorDependencies.apiKey;
        this.mongoConnectionUri = translatorDependencies.mongoConnectionString;

        this.Init();
    }

    protected Init() {

    }

    public async Translate(messageText: string, message: Message) {
        if (message.member.user.id != DiscordMembers.Delta) {
            //not enough permissions
            if (await this.Verify(message) == false)
                return;
        }

        let foundBang = false;
        let detailed = false;
        this.commandBangs.forEach(bang => {
            const command = messageText.split(" ")[0];
            const regularCommand = new RegExp(`^${bang}$`, 'i').test(command);
            const detailedCommand = new RegExp(`^${bang}-d$`, 'i').test(command);
            if (regularCommand || detailedCommand) {
                Globals.log("Running", this.constructor.name);
                foundBang = true;
                if (!detailed && detailedCommand) {
                    detailed = true;
                }
            }
        });

        if (foundBang) {
            let commands = this.RetrieveCommands(messageText);
            let messageSender = new MessageSender(this.client, message, this.messageStore);
            await this.Interpret(commands, detailed, messageSender);
            Globals.log("Might be done running", this.constructor.name);

        }
    }

    private RetrieveCommands(command: string): string[] {
        var firstSpace = command.indexOf(' ');
        if (firstSpace == -1) {
            return [];
        }
        if (this.delimiter) {
            const splitCommand = command.split(this.delimiter).map(item => item.trim());
            splitCommand[0] = splitCommand[0].split(' ').slice(1).join(' ');
            return splitCommand;
        }
        else {
            //Get and remove quoted strings as one word
            const myRegexp = /[^\s"]+|"([^"]*)"/gi;
            let myResult = [];
            do {
                var match = myRegexp.exec(command);
                if (match != null) {
                    //Index 1 in the array is the captured group if it exists
                    //Index 0 is the matched text, which we use if no captured group exists
                    myResult.push(match[1] ? match[1] : match[0]);
                }
            } while (match != null);
            return myResult.slice(1)
        }
    }


    public async Verify(messageSender: Message) {
        return true;
    }

    protected abstract Interpret(commands: string[], detailed: boolean, messageSender: MessageSender)

    protected async SearchForPlayers(searchTerm: string): Promise<INGSUser[]> {
        const users = await this.dataStore.GetUsers();
        const searchRegex = new RegExp(searchTerm, 'i');
        return users.filter(p => searchRegex.test(p.displayName));
    }

    protected CreateMongoHelper() {
        return new Mongohelper(this.mongoConnectionUri);
    }
}