export class Cacher<T>
{
    private loading = false;
    private resolversWaiting: ((item: T) => void)[] = [];
    private _reloadCache: boolean;

    constructor(private refreshTimeInMinutes: number) {

    }

    private cache: T;
    private nextReloadTime = 0;

    public Clear() {
        this._reloadCache = true;
    }

    public async TryGetFromCache(setMethod: () => Promise<T>) {
        let currentTime = new Date().getTime();
        if (this._reloadCache || currentTime > this.nextReloadTime) {
            this.loading = true;
            this.nextReloadTime = currentTime + 1000 * 60 * this.refreshTimeInMinutes;
            this.cache = await setMethod();
            this.loading = false;
            for (let resolver of this.resolversWaiting) {
                resolver(this.cache);
            }
            this._reloadCache = false;
        }

        if (this.loading) {
            return await new Promise<T>((resolver, rejector) => {
                this.resolversWaiting.push(resolver);
            });
        }
        return this.cache;
    }
}