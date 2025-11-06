import { describe, expect, it } from 'vitest';
import { withRetry } from '@utils/retry';
import { CircuitBreaker } from '@utils/circuit-breaker';

describe('retry helper', () => {
  it('retries until success', async () => {
    let attempts = 0;
    const result = await withRetry(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('fail');
      }
      return 'ok';
    }, { retries: 5 });

    expect(result).toBe('ok');
    expect(attempts).toBe(3);
  });
});

describe('circuit breaker', () => {
  it('opens circuit after failures', async () => {
    const breaker = new CircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 10 });
    await expect(breaker.exec(async () => { throw new Error('boom'); })).rejects.toThrow();
    await expect(breaker.exec(async () => { throw new Error('boom'); })).rejects.toThrow();

    await expect(breaker.exec(async () => 'ok')).rejects.toThrow('Circuit breaker: open');
  });
});
