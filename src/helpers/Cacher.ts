export class Cacher<T>
{
    constructor(private refreshTimeInMinutes: number)
    {

    }

    private cache: T;
    private nextReloadTime = 0;

    public async TryGetFromCache(setMethod: () => Promise<T>)
    {       
        let currentTime = new Date().getTime();
        if (currentTime > this.nextReloadTime) {
            this.nextReloadTime = currentTime + 1000 * 60 * this.refreshTimeInMinutes;
            this.cache = await setMethod();
        }

        return this.cache;
    }
}