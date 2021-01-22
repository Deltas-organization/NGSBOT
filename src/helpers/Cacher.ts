export class Cacher<T>
{
    private loading = false;
    private resolversWaiting: ((item: T) => void)[] = [];

    constructor(private refreshTimeInMinutes: number)
    {

    }

    private cache: T;
    private nextReloadTime = 0;

    public async TryGetFromCache(setMethod: () => Promise<T>, reloadCache: boolean = false)
    {       
        let currentTime = new Date().getTime();
        if (reloadCache || currentTime > this.nextReloadTime) {
            this.loading = true;
            this.nextReloadTime = currentTime + 1000 * 60 * this.refreshTimeInMinutes;
            this.cache = await setMethod();
            this.loading = false;
            for(let resolver of this.resolversWaiting)
            {
                resolver(this.cache);
            }
        }

        if(this.loading)
        {
            return await new Promise<T>((resolver, rejector) => 
            {
                this.resolversWaiting.push(resolver);
            });
        }
        return this.cache;
    }
}