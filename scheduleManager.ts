import type { Logger, LoggerInterface } from "add_logger";

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
  add(task: () => Promise<any>, name?: string): Promise<any>;
}

/**
 * A task schedule manager, which enables management of asynchronous 
 * minTimeoutPerRequest - minimum delay for each task
 * maxRandomPreRequestTimeout - random time interval in before each task
 */
export class PaddedScheduleManager implements AsyncTaskManagerInterface {


  minTimeoutPerRequest: number;
  maxRandomPreRequestTimeout: number;
  logger: LoggerInterface | null;
  
  lastFetchSchedule: number | null;

  constructor(
    minTimeoutPerRequest: number,
    maxRandomPreRequestTimeout: number,
    options: {
      logger?: LoggerInterface
    } = {}
  ) {
    this.minTimeoutPerRequest = minTimeoutPerRequest;
    this.maxRandomPreRequestTimeout = maxRandomPreRequestTimeout;
    this.logger = options.logger ?? null;
    this.lastFetchSchedule = null;
  }

  add(task: () => any, name?: string): Promise<any> {
      const randomDelay = this.maxRandomPreRequestTimeout > 0 ? Math.random()*this.maxRandomPreRequestTimeout : 0;

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

      this.logger?.info(`Scheduling task: ${name} (delay: ${delayBeforeFetch})`);

      return (
        delayBeforeFetch <= 0 // negative delay will also be done instantly
        ? task()
        : Bun.sleep(delayBeforeFetch).then(
            () => task()
        )
      ).catch(
        (e: Error) => {
          this.logger?.warn(`Error occurred trying to access ${name} : ${e}`)
        }
      )
    }
}


export const noDelayScheduleManager = new PaddedScheduleManager(0,0);