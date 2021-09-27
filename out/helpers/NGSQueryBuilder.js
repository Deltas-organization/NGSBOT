"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NGSQueryBuilder = void 0;
const https = require("https");
const Globals_1 = require("../Globals");
class NGSQueryBuilder {
    GetResponse(path) {
        if (path[0] != '/')
            path = "/" + path;
        Globals_1.Globals.logAdvanced(`retrieving: ${path}`);
        return new Promise((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 443,
                path: `/api${path}`,
                method: 'GET'
            };
            const req = https.request(options, (result) => {
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
        const postData = JSON.stringify(objectToSerialize);
        if (path[0] != '/')
            path = "/" + path;
        Globals_1.Globals.logAdvanced(`Posting To: ${path} with: ${postData}`);
        return new Promise((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                path: `/api${path}`,
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': Buffer.byteLength(postData)
                },
            };
            const req = https.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    chunks += chunk;
                }).on('end', () => {
                    try {
                        console.error(chunks);
                        var parsedObject = JSON.parse(chunks);
                        var response = parsedObject.returnObject;
                        Globals_1.Globals.logAdvanced(`retrieved: ${path}`);
                        resolver(response);
                    }
                    catch (e) {
                        Globals_1.Globals.logAdvanced(`problem with request: ${path}, response: ${chunks}`, e);
                        rejector(e);
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