import { LoggerInterface } from 'add_logger';
import CacheViaRedis from 'cache-via-redis';
import type { AsyncTaskManagerInterface, PaddedScheduleManager } from './scheduleManager';

export interface ResponseDataWithCache {
  response: {[key: string]: any},
  fromCache: boolean
}

interface FetchOptions {method: string, headers?:object, body?: string}

interface CacheAdapterInterface {
  getItem(key: string): Promise<string | null>;

  setItem(
      key: string, 
      value: string,
      expirationSeconds: number
  ): void;
}


class HttpClient {
    logger: LoggerInterface | null;
    cache: CacheAdapterInterface;
    maxRandomPreRequestTimeout: number = 0;
    minTimeoutPerRequest: number = 0;
    currentFetches: {[url: string]: Promise<any>} = {};
    lastFetchSchedule: number | null;

    constructor(
      options:{
        cache: CacheAdapterInterface,
        logger?: LoggerInterface,
        minTimeoutPerRequest?: number, 
        maxRandomPreRequestTimeout?: number,
        scheduleManager?: PaddedScheduleManager
      }
    ) {
        this.cache = options.cache;
        this.logger = options?.logger ?? null; 
        
        this.maxRandomPreRequestTimeout = options.scheduleManager?.maxRandomPreRequestTimeout 
          ?? options.maxRandomPreRequestTimeout 
          ?? 0;
          
        this.minTimeoutPerRequest = 
          options.scheduleManager?.minTimeoutPerRequest
            ?? options.minTimeoutPerRequest 
            ?? 0;

        this.lastFetchSchedule = null;
    }


    getWithCache(url: string): Promise<ResponseDataWithCache> {
        return this.cache.getItem(url).then(
          (cache: string | null) => {
            if (!cache) {
              return this.getNoCache(url).then((response) => ({response, fromCache: false}));
            }
            else {
              this.logger?.info("found from cache: " + url);
              return Promise.resolve({response: JSON.parse(cache), fromCache: true});
            }
          }
        );
        
    }

    getNoCache(url: string): Promise<object> {
      const delay = this.maxRandomPreRequestTimeout > 0 ? Math.random()*this.maxRandomPreRequestTimeout : 0;

      return this._getWithDelay(url, {randomDelay: delay});
    }

    
    

    get(url: string, fetchOptions?: FetchOptions ): Promise<object> {
      return this.fetch(
        url,
        {...fetchOptions, method: 'GET'}
      );
    }

    post(url: string, fetchOptions?: FetchOptions ): Promise<object> {
      return this.fetch(
        url,
        {...fetchOptions, method: 'POST'}
      );
    }

    

    patch(url: string, fetchOptions?: FetchOptions ): Promise<object> {
      return this.fetch(
        url,
        {...fetchOptions, method: 'PATCH'}
      );
    }

    delete(url: string, fetchOptions?: FetchOptions ): Promise<object> {
      return this.fetch(
        url,
        {...fetchOptions, method: 'DELETE'}
      );
    }

    async fetch(
      url,
      fetchOptions: FetchOptions
    ): Promise<any> {
      const delay = this.maxRandomPreRequestTimeout > 0 ? Math.random()*this.maxRandomPreRequestTimeout : 0;

      return this._fetchWithDelay(url, { fetchOptions: fetchOptions ?? null, randomDelay: delay });
    }

    _getWithDelay(url: string, options: { fetchOptions?: FetchOptions | null, randomDelay: number}) {
      if (!this.currentFetches[url]) {
        this.currentFetches[url] = this._fetchWithDelay(url, options)
          .finally(
            () => {
              delete this.currentFetches[url]; // Use delete to remove the entry
            }
          );
      }
      return this.currentFetches[url];
    }   

    
    _fetchWithDelay(url: string, options: { fetchOptions?: FetchOptions | null, randomDelay: number}) {
      const {randomDelay, fetchOptions} = options;

      // first fetch = no delay
      let delayBeforeFetch = 0;   
      if (this.lastFetchSchedule) {
        // existing queue = calculate the delay
        delayBeforeFetch = 
          (this.lastFetchSchedule - Date.now())
          + this.minTimeoutPerRequest 
          + randomDelay;
      }     

      this.lastFetchSchedule = Date.now() + delayBeforeFetch;

      this.logger?.info(`Fetching ${url} (delay: ${delayBeforeFetch})`);

      return (
        delayBeforeFetch <= 0 // negative delay will also be done instantly
        ? this._fetch(url, fetchOptions) 
        : Bun.sleep(delayBeforeFetch).then(
            () => this._fetch(url, fetchOptions)
        )
      ).catch(
        (e: Error) => {
          this.logger?.warn(`Error occurred trying to access ${url} : ${e}`)
        }
      )
    }   

    _fetch(url: string, options?: FetchOptions | null) {
      this.logger?.info("fetching(native): " + url);
      return fetch(url, options ?? {method: 'GET'}).then(
        (response) => {
          return response.json()
        }
      ).then(
        (jsonData) => {          
          this.cache.setItem(url,JSON.stringify(jsonData),300);
          return jsonData;
        }
      );
    }
    
}

export default HttpClient;
