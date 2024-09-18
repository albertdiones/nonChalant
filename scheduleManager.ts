
/**
 * 
 * 
 */
export interface AsyncTaskManagerInterface {


  /*
    * add(task)
    * e.g. 
    * add(() => fetch('http://google.com/api/blahblah')).then();
    * 
    * 
    */
  add(task: () => Promise<any>): Promise<any>;
}

/**
 * A task schedule manager, which enables management of asynchronous 
 * minTimeoutPerRequest - minimum delay for each task
 * maxRandomPreRequestTimeout - random time interval in before each task
 */
export class PaddedScheduleManager implements AsyncTaskManagerInterface {


  minTimeoutPerRequest: number;
  maxRandomPreRequestTimeout: number;

  lastFe
  
  constructor(
    minTimeoutPerRequest: number,
    maxRandomPreRequestTimeout: number
  ) {
    this.minTimeoutPerRequest = minTimeoutPerRequest;
    this.maxRandomPreRequestTimeout = maxRandomPreRequestTimeout;
  }
  add(task: () => Promise<any>): Promise<any> {

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
}