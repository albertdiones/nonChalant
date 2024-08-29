nonChallant HTTP Client


for fetches that never throttles

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