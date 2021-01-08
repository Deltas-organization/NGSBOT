"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGSQueryBuilder = void 0;
const http = require("http");
const Globals_1 = require("../Globals");
class NGSQueryBuilder {
    GetResponse(path) {
        Globals_1.Globals.logAdvanced(`retrieving: ${path}`);
        return new Promise((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 80,
                path: `/api${path}`,
                method: 'GET'
            };
            const req = http.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    chunks += chunk;
                });
                result.on('end', () => {
                    try {
                        var parsedObject = JSON.parse(chunks);
                        var response = parsedObject.returnObject;
                        Globals_1.Globals.logAdvanced(`retrieved: ${path}`);
                        resolver(response);
                    }
                    catch (e) {
                        rejector();
                    }
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            req.end();
        });
    }
    PostResponse(path, objectToSerialize) {
        Globals_1.Globals.logAdvanced(`Posting To: ${path}`);
        const postData = JSON.stringify(objectToSerialize);
        return new Promise((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 80,
                path: `api/${path}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': postData.length
                }
            };
            const req = http.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    chunks += chunk;
                });
                result.on('end', () => {
                    try {
                        var parsedObject = JSON.parse(chunks);
                        var response = parsedObject.returnObject;
                        Globals_1.Globals.logAdvanced(`retrieved: ${path}`);
                        resolver(response);
                    }
                    catch (e) {
                        rejector();
                    }
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            req.write(postData);
            req.end();
        });
    }
}
exports.NGSQueryBuilder = NGSQueryBuilder;
//# sourceMappingURL=NGSQueryBuilder.js.map