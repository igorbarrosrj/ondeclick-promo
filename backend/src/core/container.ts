export type Token<T> = symbol & { __type?: T };

type Provider<T> = T | ((container: Container) => T);

export class Container {
  private readonly registry = new Map<symbol, Provider<any>>();
  private readonly cache = new Map<symbol, unknown>();

  register<T>(token: Token<T>, provider: Provider<T>): this {
    this.registry.set(token, provider);
    return this;
  }

  registerValue<T>(token: Token<T>, value: T): this {
    this.registry.set(token, value);
    this.cache.set(token, value);
    return this;
  }

  resolve<T>(token: Token<T>): T {
    if (this.cache.has(token)) {
      return this.cache.get(token) as T;
    }

    const provider = this.registry.get(token);
    if (!provider) {
      throw new Error(`No provider registered for token ${token.description ?? token.toString()}`);
    }

    const value = typeof provider === 'function' ? (provider as (container: Container) => T)(this) : provider;
    this.cache.set(token, value as unknown as T);
    return value;
  }
}

export function createToken<T>(description: string): Token<T> {
  return Symbol(description) as Token<T>;
}
