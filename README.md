nonChallant HTTP Client


for fetches that never throttles
(alternative for fetch())

2 unique features:
1. minTimeoutPerRequest - minimum delay for each requests initiated using the client
2. maxRandomPreRequestTimeout - support for random time interval in between requests

http client? ~ an object to help you fetch resources(json?) from apis or other http urls


```
new HttpClient({
        logger: console,
        cache: new CacheViaNothing(),
        minTimeoutPerRequest: 500,
        maxRandomPreRequestTimeout: 0,
    })
```


Todos:
 * [x] support POST method
 * [x] support other http methods (PATCH,DELETE)
 * [x] create schedule manager object, that decouples the scheduling aspect of the fetches
 * [] maxRandomPreRequestTimeout jest tests
 * [] Create automated functional tests (using apis listed here?? https://github.com/public-apis/public-apis?tab=readme-ov-file#finance)