import { describe, it, expect, log } from 'vitest';
import {discoverChromeCast} from '../src/lib/server/mdns.server'

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', async () => {
		const cast = discoverChromeCast;
		cast.onAvailable(log);
		expect(1 + 2).toBe(3);
	});
});
