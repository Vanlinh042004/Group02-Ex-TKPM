import { container } from './container';

/**
 * Controller Factory
 * Provides a simple way to resolve controllers from the DI container
 */
export class ControllerFactory {
  /**
   * Resolve a controller by its token
   * @param controllerName - The controller token registered in the container
   * @returns The controller instance
   * @throws Error if controller is not registered
   */
  static resolve<T>(controllerName: string): T {
    try {
      return container.resolve<T>(controllerName);
    } catch (error) {
      throw new Error(
        `Controller not found: ${controllerName}. Make sure it's registered in the DI container.`
      );
    }
  }

  /**
   * Check if a controller is registered
   * @param controllerName - The controller token
   * @returns True if controller is registered
   */
  static has(controllerName: string): boolean {
    return container.has(controllerName);
  }

  /**
   * Get all registered controller names
   * @returns Array of registered controller tokens
   */
  static getRegisteredControllers(): string[] {
    return container
      .getRegisteredTokens()
      .filter((token) => token.toLowerCase().includes('controller'));
  }
}

/**
 * Helper function for quickly resolving controllers in route files
 * @param controllerName - The controller token
 * @returns The controller instance
 */
export const resolveController = <T>(controllerName: string): T => {
  return ControllerFactory.resolve<T>(controllerName);
};

/**
 * Legacy function name for backward compatibility
 * @deprecated Use resolveController instead
 */
export const controllerFactory = <T>(controllerName: string): T => {
  return resolveController<T>(controllerName);
};
