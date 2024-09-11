import { test, expect } from '@jest/globals'
import HttpClient from '../index';

test(
    'get pikachu data with cache',
    async () => {
        const client = new HttpClient(
            {
                cache: new FakeCache(), // mock Cache
                logger: console
            }
        );

        const {response, fromCache} = await client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/pikachu'
        );

        expect(fromCache).toBe(true);

        expect(
            response
        ).not.toBeFalsy();

        expect(
            response.types
        ).not.toBeFalsy();

        expect(
            response.types.length
        ).toBeGreaterThanOrEqual(1);

        expect(
            response.types[0].type.name
        ).toBe('water');
    }
)

class FakeCache {
    async getItem(key: string): Promise<string | null> {
        return Promise.resolve(cachedResponse);
    }
  
    setItem(
        key: string, 
        value: string,
        expirationSeconds: number
    ): void { 
    }
}

const cachedResponse = `{
    "types": [
      {
        "slot": 1,
        "type": {
          "name": "water",
          "url": "https://pokeapi.co/api/v2/type/13/"
        }
      }
    ],
    "weight": 60
}`