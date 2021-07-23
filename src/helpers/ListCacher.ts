export class ListCacher<Key, T>
{
    private loading = false;
    private resolversWaiting: ((item: T) => void)[] = [];
    private _reloadCache: boolean;

    constructor(private refreshTimeInMinutes: number) {

    }

    private cache: {key: Key, value: T}[] = [];
    private nextReloadTime = 0;

    public Clear() {
        this._reloadCache = true;
    }

    public async TryGetFromCache(key: Key, setMethod: () => Promise<T>): Promise<T> {
        let currentTime = new Date().getTime();
        const exists = this.cache.filter(item => item.key == key).length > 0;
        if (!exists || this._reloadCache || currentTime > this.nextReloadTime) {
            this.loading = true;
            this.nextReloadTime = currentTime + 1000 * 60 * this.refreshTimeInMinutes;
            var result = await setMethod();
            this.cache.push({key: key, value: result});
            this.loading = false;
            for (let resolver of this.resolversWaiting) {
                resolver(result);
            }
            this._reloadCache = false;
        }

        if (this.loading) {
            return await new Promise<T>((resolver, rejector) => {
                this.resolversWaiting.push(resolver);
            });
        }
        for(var item of this.cache)
        {
            if(item.key == key)
            {
                return item.value;
            }
        }
        return {} as T;
    }
}