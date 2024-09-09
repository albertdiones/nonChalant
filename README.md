nonChallant HTTP Client


for fetches that never throttles
(alternative for fetch())

2 unique features:
1. minTimeoutPerRequest - minimum delay for each requests initiated using the client
2. maxRandomPreRequestTimeout - support for random time interval in between requests


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
 * [] Create automated functional tests (using apis listed here?? https://github.com/public-apis/public-apis?tab=readme-ov-file#finance)