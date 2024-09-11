import { test, expect } from '@jest/globals'
import HttpClient from '../index';

export class CacheViaNothing {
    async getItem(key: string): Promise<string | null> {
        return null;
    }
  
    setItem(
        key: string, 
        value: string,
        expirationSeconds: number
    ): void { 
    }
}

test(
    'get pikachu data',
    async () => {
        const client = new HttpClient(
            {
                cache: new CacheViaNothing()
            }
        );

        const {response, fromCache} = await client.getWithCache(
            'https://pokeapi.co/api/v2/pokemon/pikachu'
        );

        expect(fromCache).toBe(false);

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
        ).toBe('electric');
    }
)