import { INGSScheduleFileResponse } from "./interfaces/INGSScheduleFileResponse";
import { INGSSchedule } from "./interfaces/INGSSchedule";
import * as http from 'http';
import { debug } from "console";

var fs = require('fs');

export class NGSScheduleDataStore {

    private cachedResult: INGSSchedule[] = null;
    public lastCallTime = 0;

    public GetSchedule(): Promise<INGSSchedule[]> | INGSSchedule[] {
        let currentTime = new Date().getTime();
        //15 minutes
        if(this.lastCallTime * 1000 * 60 - 15 > currentTime)
        {
            return this.cachedResult;
        }
        this.lastCallTime = currentTime;

        return new Promise<INGSSchedule[]>((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 80,
                path: '/schedule/get/matches/scheduled?season=10',
                method: 'GET'
            };

            const req = http.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    chunks += chunk;
                });
                result.on('end', () => {
                    var parsedObject = JSON.parse(chunks);
                    var schedules: INGSSchedule[] = parsedObject.returnObject;
                    this.cachedResult = schedules;
                    resolver(schedules);
                });
            });

            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });

            req.end();
        });
    }


}