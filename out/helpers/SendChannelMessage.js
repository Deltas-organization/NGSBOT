// import { Client, Message, TextChannel } from "discord.js";
// import { DiscordChannels } from "../enums/DiscordChannels";
// import { MessageStore } from "../MessageStore";
// export class SendChannelMessage {
//     constructor(public client: Client, public messageStore: MessageStore) {
//     }
//     public async SendMessageToChannel(message: string, channelToSendTo: DiscordChannels | string, basic = false): Promise<Message[]> {
//         const myChannel = await this.client.channels.fetch(channelToSendTo) as TextChannel;
//         let sendMessage = async (channel, message) => await this.SendMessage(channel, message);
//         if (basic)
//             sendMessage = async (channel, message) => await this.SendBasicMessage(channel, message);
//         var result: Message[] = [];
//         if (myChannel != null) {
//             while (message.length > 2048) {
//                 let newMessage = message.slice(0, 2048);
//                 message = message.substr(2048);
//                 result.push(await sendMessage(myChannel, newMessage));
//             }
//             result.push(await sendMessage(myChannel, message));
//         }
//         return result;
//     }
//     public async OverwriteMessage(newMessageText: string, messageId: string, messageChannel: DiscordChannels, basic = false) {
//         const myChannel = await this.client.channels.fetch(messageChannel) as TextChannel;
//         const message = await myChannel.messages.fetch(messageId);
//         if (basic) {
//             await message.edit(newMessageText);
//         }
//         else {
//             await message.edit({
//                 embed: {
//                     color: 0,
//                     description: newMessageText
//                 }
//             });
//         }
//     }
//     private async SendMessage(myChannel: TextChannel, message: string) {
//         var sentMessage = await myChannel.send({
//             embed: {
//                 color: 0,
//                 description: message
//             }
//         });
//         this.messageStore.AddMessage(sentMessage);
//         return sentMessage;
//     }
//     private async SendBasicMessage(myChannel: TextChannel, message: string) {
//         var sentMessage = await myChannel.send(message);
//         this.messageStore.AddMessage(sentMessage);
//         return sentMessage;
//     }
// }
//# sourceMappingURL=SendChannelMessage.js.map