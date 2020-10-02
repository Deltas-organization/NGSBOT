"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGSScheduleDataStore = void 0;
const http = require("http");
var fs = require('fs');
class NGSScheduleDataStore {
    constructor() {
        this.cachedResult = null;
        this.lastCallTime = 0;
    }
    GetSchedule() {
        let currentTime = new Date().getTime();
        //15 minutes
        if (this.lastCallTime * 1000 * 60 - 15 > currentTime) {
            return this.cachedResult;
        }
        this.lastCallTime = currentTime;
        return new Promise((resolver, rejector) => {
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
                    var schedules = parsedObject.returnObject;
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
exports.NGSScheduleDataStore = NGSScheduleDataStore;
//# sourceMappingURL=NGSScheduleDataStore.js.map