import { LoggerInterface } from 'add_logger';
import CacheViaRedis from 'cache-via-redis';
import { noDelayScheduleManager, type AsyncTaskManagerInterface, type PaddedScheduleManager } from './scheduleManager';

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
    scheduleManager: PaddedScheduleManager;

    constructor(
      options:{
        cache: CacheAdapterInterface,
        logger?: LoggerInterface,
        scheduleManager?: PaddedScheduleManager
      }
    ) {
        this.cache = options.cache;
        this.logger = options?.logger ?? null; 


        
        this.maxRandomPreRequestTimeout = options.scheduleManager?.maxRandomPreRequestTimeout 
          ?? 0;

        this.minTimeoutPerRequest = 
          options.scheduleManager?.minTimeoutPerRequest
            ?? 0;

        this.scheduleManager = options.scheduleManager ?? noDelayScheduleManager;
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
      return this._getWithDelay(url, {});
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

      return this._fetchWithDelay(
        url, {
          fetchOptions: fetchOptions ?? null
        }
      );
    }

    _getWithDelay(url: string, options: { fetchOptions?: FetchOptions | null}) {
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

    
    _fetchWithDelay(url: string, options: { fetchOptions?: FetchOptions | null}) {
      const {fetchOptions} = options;


      const fetchTask = () => {
        this.logger?.info(`Fetching ${url}`)
        return this._fetch(url, fetchOptions);
      }

      
      return this.scheduleManager.add(fetchTask,`fetch ${url}`);
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
