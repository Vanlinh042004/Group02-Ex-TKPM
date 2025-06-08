/**
 * Simple Dependency Injection Container
 * Manages service instances and their dependencies
 */
export class Container {
  private services: Map<string, any> = new Map();
  private factories: Map<string, () => any> = new Map();

  /**
   * Register a service instance
   * @param token - Unique identifier for the service
   * @param instance - The service instance
   */
  register<T>(token: string, instance: T): void {
    this.services.set(token, instance);
  }

  /**
   * Register a factory function for lazy initialization
   * @param token - Unique identifier for the service
   * @param factory - Factory function that creates the service
   */
  registerFactory<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }

  /**
   * Resolve a service by its token
   * @param token - Unique identifier for the service
   * @returns The service instance
   * @throws Error if service is not registered
   */
  resolve<T>(token: string): T {
    // Check if instance is already registered
    if (this.services.has(token)) {
      return this.services.get(token);
    }

    // Check if factory is registered
    if (this.factories.has(token)) {
      const factory = this.factories.get(token);
      const instance = factory();
      // Cache the instance for future use
      this.services.set(token, instance);
      return instance;
    }

    throw new Error(`Service not registered: ${token}`);
  }

  /**
   * Check if a service is registered
   * @param token - Unique identifier for the service
   * @returns True if service is registered
   */
  has(token: string): boolean {
    return this.services.has(token) || this.factories.has(token);
  }

  /**
   * Remove a service from the container
   * @param token - Unique identifier for the service
   */
  remove(token: string): void {
    this.services.delete(token);
    this.factories.delete(token);
  }

  /**
   * Clear all registered services
   */
  clear(): void {
    this.services.clear();
    this.factories.clear();
  }

  /**
   * Get all registered service tokens
   * @returns Array of registered service tokens
   */
  getRegisteredTokens(): string[] {
    const serviceTokens = Array.from(this.services.keys());
    const factoryTokens = Array.from(this.factories.keys());
    return [...new Set([...serviceTokens, ...factoryTokens])];
  }
}

// Export a singleton instance of the container
export const container = new Container();
