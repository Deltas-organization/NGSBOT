"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const http = require("http");
class QueryBuilder {
    GetResponse(path) {
        return new Promise((resolver, rejector) => {
            const options = {
                hostname: 'nexusgamingseries.org',
                port: 80,
                path: path,
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
                    var response = parsedObject.returnObject;
                    resolver(response);
                });
            });
            req.on('error', (e) => {
                console.error(`problem with request: ${e.message}`);
            });
            req.end();
        });
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=QueryBuilder.js.map