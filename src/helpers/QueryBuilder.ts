import * as http from 'http';
import { Globals } from '../globals';

export class QueryBuilder {
    public GetResponse<T>(path: string): Promise<T> {
        Globals.logAdvanced(`retrieving: ${path}`);
        return new Promise<T>((resolver, rejector) => {
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
                    try {
                        var parsedObject = JSON.parse(chunks);
                        var response: T = parsedObject.returnObject;                        
                        Globals.logAdvanced(`retrieved: ${path}`);
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
}