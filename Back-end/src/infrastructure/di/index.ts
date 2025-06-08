/**
 * Dependency Injection Module
 * Exports all DI-related components for easy importing
 */

// Core DI functionality
export { Container, container } from './container';
export {
  ControllerFactory,
  resolveController,
  controllerFactory,
} from './controllerFactory';

// Types and tokens
export {
  SERVICE_TOKENS,
  ServiceToken,
  Injectable,
  Initializable,
  Disposable,
  ServiceFactory,
  ServiceConfiguration,
  DependencyMetadata,
} from './types';

// Import for internal use
import { container } from './container';
import { SERVICE_TOKENS } from './types';

// Re-export for convenience
export const DI = {
  container,
  resolve: <T>(token: string): T => container.resolve<T>(token),
  register: <T>(token: string, instance: T): void =>
    container.register(token, instance),
  registerFactory: <T>(token: string, factory: () => T): void =>
    container.registerFactory(token, factory),
  has: (token: string): boolean => container.has(token),
  tokens: SERVICE_TOKENS,
};
