
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
  
  constructor(
    minTimeoutPerRequest: number,
    maxRandomPreRequestTimeout: number
  ) {
    this.minTimeoutPerRequest = minTimeoutPerRequest;
    this.maxRandomPreRequestTimeout = maxRandomPreRequestTimeout;
  }
  add(task: () => Promise<any>): Promise<any> {
    throw new Error("Method not implemented.");
  }
}


export const noDelayScheduleManager = new PaddedScheduleManager(0,0);