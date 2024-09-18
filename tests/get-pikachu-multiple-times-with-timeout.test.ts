import { test, expect } from '@jest/globals'
import HttpClient from '../index';
import { CacheViaNothing } from './setup';



test(
    'get pikachu data',
    async () => {
        const client = new HttpClient(
            {
                cache: new CacheViaNothing(),
                minTimeoutPerRequest: 400,
                logger: console
            }
        );
        const startTime = Date.now();

        // right away
        client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/pikachu'
        );
        
        // after 400 ms...
        client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/bulbasaur'
        );

        // after 800ms
        client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/charmander'
        );

        // after 1200ms
        client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/squirtle'
        );

        // after 1600ms
        await client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/nidorino'
        );

        const timeElapsed = Date.now() - startTime;

        expect(
            timeElapsed
        ).toBeGreaterThanOrEqual(1600);

        
        expect(
            timeElapsed
        ).toBeLessThanOrEqual(1700);

    }
)