import * as http from 'http';

export class QueryBuilder
{
    public GetResponse<T>(path: string): Promise<T>
    {
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
                var parsedObject = JSON.parse(chunks);
                var response: T = parsedObject.returnObject;
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