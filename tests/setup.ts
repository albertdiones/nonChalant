export class FakeCache {

    fakeCacheResponse:string;

    constructor(fakeCacheResponse: string) {
        this.fakeCacheResponse = fakeCacheResponse;
    }

    async getItem(key: string): Promise<string | null> {
        return Promise.resolve(this.fakeCacheResponse);
    }
  
    setItem(
        key: string, 
        value: string,
        expirationSeconds: number
    ): void { 
    }
}
