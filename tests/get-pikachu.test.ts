import { test, expect } from '@jest/globals'
import HttpClient, { CacheViaNothing } from '../index';

test(
    'get pikachu data',
    () => {
        const client = new HttpClient(
            {
                cache: new CacheViaNothing()
            }
        )
    }
)