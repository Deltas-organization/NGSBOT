// import { MessageHelper } from "../helpers/MessageHelper";
// import { MessageSender } from "../helpers/MessageSender";
// import { AdminTranslatorBase } from "./bases/adminTranslatorBase";

// export class UnscheduledTranslator extends AdminTranslatorBase {

//     public get commandBangs(): string[] {
//         return ['unscheduled', 'late']
//     }

//     public get description(): string {
//         return 'returns all of the games that have not been scheduled for next week, flex matches are ignored.';
//     }

//     protected async Interpret(commands: string[], detailed: boolean, messageSender: MessageSender) {
//         try {
//             const round = 9;
//             const unScheduledMatches = await this.GetUnscheduledMatches(round);
//             const messages: MessageHelper<unknown>[] = [];
//             for (var i = 0; i < 5; i++) {
//                 const messageHelper = new MessageHelper<unknown>("unscheduled");
//                 const match = unScheduledMatches[i];
//                 messageHelper.AddNewLine(`the game between: ${match.home.teamName} and ${match.away.teamName} still needs to be scheduled for round ${round}`);
//                 messages.push(messageHelper);
//             }

//             await messageSender.SendMessages(messages.map(m => m.CreateStringMessage()));
//         }
//         catch (e) {
//             console.log(e);
//         }
//     }

//     public async GetUnscheduledMatches(round: number) {
//         try {
//             var allMatches = await this.dataStore.GetMatches(round);
//         }
//         catch (e) {
//             console.log(`unscheduled ${e}`);
//         }
//         return allMatches.filter(matches => matches.scheduledTime == null);
//     }

// }