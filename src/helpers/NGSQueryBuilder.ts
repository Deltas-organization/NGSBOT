import * as http from 'http';
import * as https from 'https';
import { Globals } from '../Globals';

export class NGSQueryBuilder {
    public GetResponse<T>(path: string): Promise<T> {
        Globals.logAdvanced(`retrieving: ${path}`);
        return new Promise<T>((resolver, rejector) => {
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

    public PostResponse<T>(path: string, objectToSerialize: any): Promise<T> {
        Globals.logAdvanced(`Posting To: ${path}`);

        const postData = JSON.stringify(objectToSerialize);
        return new Promise<T>((resolver, rejector) => {
            const options = {
                hostname: 'www.nexusgamingseries.org',
                path: `api${path}`,
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
            };

            const req = https.request(options, (result) => {
                result.setEncoding('utf8');
                var chunks = "";
                result.on('data', (chunk) => {
                    console.log('data');
                    console.log(chunk);
                    chunks += chunk;
                }).on('end', () => {
                    try {
                        console.error(chunks);
                        var parsedObject = JSON.parse(chunks);
                        var response: T = parsedObject.returnObject;
                        Globals.logAdvanced(`retrieved: ${path}`);
                        resolver(response);
                    }
                    catch (e) {
                        Globals.logAdvanced(`problem with request: ${path}`, e);
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