# Dependency Injection Container

This module provides a simple but powerful dependency injection container for managing services and their dependencies in the application.

## Features

- **Service Registration**: Register service instances or factory functions
- **Lazy Initialization**: Services can be created on-demand using factory functions
- **Singleton Support**: Factory-created services are cached for reuse
- **Type Safety**: Full TypeScript support with proper type checking
- **Service Tokens**: Centralized token management for better organization

## Basic Usage

### Importing

```typescript
import { container, DI, SERVICE_TOKENS } from './infrastructure/di';
// or
import { Container } from './infrastructure/di/container';
```

### Registering Services

#### Register Instance

```typescript
const myService = new MyService();
container.register('MyService', myService);
```

#### Register Factory (Recommended)

```typescript
container.registerFactory('MyService', () => new MyService());
```

#### Using Service Tokens

```typescript
import { SERVICE_TOKENS } from './infrastructure/di';

container.registerFactory(
  SERVICE_TOKENS.STUDENT_SERVICE,
  () => new StudentService()
);
```

### Resolving Services

```typescript
// Resolve a service
const myService = container.resolve<MyService>('MyService');

// Using the DI helper
const myService = DI.resolve<MyService>('MyService');

// Using service tokens
const studentService = container.resolve<StudentService>(
  SERVICE_TOKENS.STUDENT_SERVICE
);
```

### Controller Factory

For controllers in route files:

```typescript
import { resolveController } from './infrastructure/di';

// In route file
const controller = resolveController<StudentController>('StudentController');
router.get('/', (req, res) => controller.getAllStudents(req, res));
```

## Service Tokens

All service identifiers are centralized in `SERVICE_TOKENS`:

```typescript
export const SERVICE_TOKENS = {
  // Repository tokens
  STUDENT_REPOSITORY: 'IStudentRepository',
  FACULTY_REPOSITORY: 'IFacultyRepository',

  // Service tokens
  STUDENT_SERVICE: 'IStudentService',
  FACULTY_SERVICE: 'IFacultyService',

  // Controller tokens
  STUDENT_CONTROLLER: 'StudentController',
  // ... more tokens
} as const;
```

## Advanced Usage

### Factory with Dependencies

```typescript
container.registerFactory(SERVICE_TOKENS.STUDENT_SERVICE, () => {
  const repository = container.resolve<IStudentRepository>(
    SERVICE_TOKENS.STUDENT_REPOSITORY
  );
  const validator = container.resolve<IValidationService>(
    SERVICE_TOKENS.VALIDATION_SERVICE
  );
  return new StudentService(repository, validator);
});
```

### Checking Service Registration

```typescript
if (container.has('MyService')) {
  const service = container.resolve('MyService');
}
```

### Getting All Registered Tokens

```typescript
const tokens = container.getRegisteredTokens();
console.log('Registered services:', tokens);
```

### Removing Services

```typescript
container.remove('MyService');
```

### Clearing All Services

```typescript
container.clear();
```

## Best Practices

1. **Use Service Tokens**: Always use the predefined tokens from `SERVICE_TOKENS`
2. **Register Factories**: Prefer `registerFactory` over `register` for better control
3. **Interface-based Registration**: Register services by their interfaces, not concrete types
4. **Single Setup Point**: Configure all services in one place (e.g., `setup.ts`)
5. **Type Safety**: Always specify generic types when resolving services

## Example Setup

```typescript
// setup.ts
import { container, SERVICE_TOKENS } from './infrastructure/di';
import { MongoStudentRepository } from './infrastructure/repositories/MongoStudentRepository';
import { StudentService } from './application/services/StudentService';
import { StudentController } from './application/controllers/StudentController';

export function setupDI() {
  // Register repositories
  container.registerFactory(
    SERVICE_TOKENS.STUDENT_REPOSITORY,
    () => new MongoStudentRepository()
  );

  // Register services
  container.registerFactory(
    SERVICE_TOKENS.STUDENT_SERVICE,
    () =>
      new StudentService(container.resolve(SERVICE_TOKENS.STUDENT_REPOSITORY))
  );

  // Register controllers
  container.registerFactory(
    SERVICE_TOKENS.STUDENT_CONTROLLER,
    () =>
      new StudentController(container.resolve(SERVICE_TOKENS.STUDENT_SERVICE))
  );
}
```

## Testing

The DI container includes comprehensive tests. Run them with:

```bash
npm test -- src/infrastructure/di/__tests__/container.spec.ts
```

## Migration Guide

If you're migrating from the old static service pattern:

### Before

```typescript
// Old way
import StudentService from './services/studentService';
const result = await StudentService.addStudent(data);
```

### After

```typescript
// New way
import { resolveController, SERVICE_TOKENS } from './infrastructure/di';
const controller = resolveController<StudentController>(
  SERVICE_TOKENS.STUDENT_CONTROLLER
);
const result = await controller.addStudent(req, res);
```
