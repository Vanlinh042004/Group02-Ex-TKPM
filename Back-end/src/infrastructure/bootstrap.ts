/**
 * Bootstrap script để initialize Clean Architecture
 *
 * Script này sẽ được gọi khi application khởi động để setup:
 * - Dependency injection container
 * - Services registration
 * - Database connections
 * - Other infrastructure concerns
 */

import { connect } from '../config/database';
import { setupServices, serviceRegistry } from './di/serviceRegistry';
import logger from '../utils/logger';

/**
 * Initialize Clean Architecture infrastructure
 */
export async function bootstrapCleanArchitecture(): Promise<void> {
  try {
    logger.info('🚀 Starting Clean Architecture bootstrap...', {
      module: 'Bootstrap',
      operation: 'INITIALIZE',
    });

    // 1. Setup database connection
    logger.info('📊 Connecting to database...', {
      module: 'Bootstrap',
      operation: 'DATABASE_CONNECT',
    });
    await connect();

    // 2. Setup dependency injection container
    logger.info('🔧 Setting up dependency injection...', {
      module: 'Bootstrap',
      operation: 'SETUP_DI',
    });
    await setupServices();

    // 3. Verify all services are working
    logger.info('🔍 Running health checks...', {
      module: 'Bootstrap',
      operation: 'HEALTH_CHECK',
    });
    const healthCheckPassed = serviceRegistry.healthCheck();

    if (!healthCheckPassed) {
      throw new Error('Health check failed during bootstrap');
    }

    logger.info('✅ Clean Architecture bootstrap completed successfully', {
      module: 'Bootstrap',
      operation: 'INITIALIZE',
      details: {
        services: serviceRegistry.getContainer().getRegisteredTokens(),
      },
    });
  } catch (error) {
    logger.error('❌ Failed to bootstrap Clean Architecture', {
      module: 'Bootstrap',
      operation: 'INITIALIZE',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    throw error;
  }
}

/**
 * Get the current status of Clean Architecture services
 */
export function getCleanArchitectureStatus(): {
  isInitialized: boolean;
  services: string[];
  healthCheck: boolean;
} {
  try {
    const isInitialized =
      serviceRegistry.getContainer().getRegisteredTokens().length > 0;
    const services = serviceRegistry.getContainer().getRegisteredTokens();
    const healthCheck = serviceRegistry.healthCheck();

    return {
      isInitialized,
      services,
      healthCheck,
    };
  } catch (error) {
    return {
      isInitialized: false,
      services: [],
      healthCheck: false,
    };
  }
}

/**
 * Graceful shutdown of Clean Architecture services
 */
export async function shutdownCleanArchitecture(): Promise<void> {
  try {
    logger.info('🛑 Shutting down Clean Architecture...', {
      module: 'Bootstrap',
      operation: 'SHUTDOWN',
    });

    // Add any cleanup logic here if needed
    // For example: close database connections, clear caches, etc.

    serviceRegistry.clear();

    logger.info('✅ Clean Architecture shutdown completed', {
      module: 'Bootstrap',
      operation: 'SHUTDOWN',
    });
  } catch (error) {
    logger.error('❌ Error during Clean Architecture shutdown', {
      module: 'Bootstrap',
      operation: 'SHUTDOWN',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }
}
