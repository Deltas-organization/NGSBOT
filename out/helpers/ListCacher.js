"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListCacher = void 0;
class ListCacher {
    constructor(refreshTimeInMinutes) {
        this.refreshTimeInMinutes = refreshTimeInMinutes;
        this.loading = false;
        this.resolversWaiting = [];
        this.cache = [];
        this.nextReloadTime = 0;
    }
    Clear() {
        this._reloadCache = true;
    }
    TryGetFromCache(key, setMethod) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentTime = new Date().getTime();
            const exists = this.cache.filter(item => item.key == key).length > 0;
            if (!exists || this._reloadCache || currentTime > this.nextReloadTime) {
                this.loading = true;
                this.nextReloadTime = currentTime + 1000 * 60 * this.refreshTimeInMinutes;
                var result = yield setMethod();
                this.cache.push({ key: key, value: result });
                this.loading = false;
                for (let resolver of this.resolversWaiting) {
                    resolver(result);
                }
                this._reloadCache = false;
            }
            if (this.loading) {
                return yield new Promise((resolver, rejector) => {
                    this.resolversWaiting.push(resolver);
                });
            }
            for (var item of this.cache) {
                if (item.key == key) {
                    return item.value;
                }
            }
            return {};
        });
    }
}
exports.ListCacher = ListCacher;
//# sourceMappingURL=ListCacher.js.map