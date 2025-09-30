type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  successThreshold?: number;
  cooldownPeriodMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = 0;

  constructor(private readonly options: CircuitBreakerOptions = {}) {}

  async exec<T>(operation: () => Promise<T>): Promise<T> {
    const failureThreshold = this.options.failureThreshold ?? 5;
    const successThreshold = this.options.successThreshold ?? 2;
    const cooldownPeriodMs = this.options.cooldownPeriodMs ?? 30_000;

    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker: open');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.recordSuccess(successThreshold);
      return result;
    } catch (error) {
      this.recordFailure(failureThreshold, cooldownPeriodMs);
      throw error;
    }
  }

  private recordSuccess(successThreshold: number) {
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= successThreshold) {
        this.reset();
      }
    } else {
      this.resetCounters();
    }
  }

  private recordFailure(failureThreshold: number, cooldownPeriodMs: number) {
    this.failureCount += 1;

    if (this.failureCount >= failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + cooldownPeriodMs;
    }
  }

  private reset() {
    this.state = 'CLOSED';
    this.resetCounters();
  }

  private resetCounters() {
    this.failureCount = 0;
    this.successCount = 0;
  }
}
