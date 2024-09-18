
/**
 * A task schedule manager, which enables management of asynchronous 
 * 
 * minTimeoutPerRequest - minimum delay for each task
 * maxRandomPreRequestTimeout - random time interval in before each task
 */
interface ScheduleManagerInterface {


    /*
     * add(task)
     * e.g. 
     * add(() => fetch('http://google.com/api/blahblah')).then();
     * 
     * 
     */
    add(task: () => Promise<any>): Promise<any>;
  }

  
export const scheduleManager: ScheduleManagerInterface = {
    add: function (task: () => Promise<any>): Promise<any> {
      throw new Error('Function not implemented.');
    }
  }