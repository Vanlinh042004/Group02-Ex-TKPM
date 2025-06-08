# Application Services Layer

## Overview

The Application Services layer is a crucial component of Clean Architecture that orchestrates business operations by coordinating between domain entities, value objects, and infrastructure repositories. This layer implements the use cases of the system and contains the business logic that doesn't belong in domain entities.

## Architecture Principles

### Clean Architecture Compliance

- **Dependency Rule**: Application services depend on domain entities, not on infrastructure
- **Business Logic**: Contains application-specific business rules and workflows
- **Orchestration**: Coordinates domain objects and repositories to fulfill use cases
- **Input/Output**: Uses DTOs for clean interfaces with external layers

### Design Patterns Implemented

1. **Service Layer Pattern**: Encapsulates business operations in service classes
2. **Dependency Injection**: Services depend on abstractions (interfaces) not concrete implementations
3. **DTO Pattern**: Data Transfer Objects provide clean interfaces between layers
4. **Exception Handling**: Domain-specific exceptions for business rule violations

## Directory Structure

```
src/application/
├── services/           # Service implementations
│   ├── interfaces/     # Service interfaces for DI
│   ├── StudentService.ts
│   └── index.ts
├── dtos/              # Data Transfer Objects
│   └── StudentDto.ts
├── exceptions/        # Application-specific exceptions
│   └── StudentExceptions.ts
└── README.md         # This file
```

## Components

### 1. Service Interfaces (`interfaces/`)

Define contracts for application services to enable:

- **Dependency Injection**: Controllers depend on interfaces, not implementations
- **Testing**: Easy mocking of services for unit tests
- **Flexibility**: Can swap implementations without changing clients

```typescript
export interface IStudentService {
  createStudent(studentData: CreateStudentDto): Promise<Student>;
  getStudentById(id: string): Promise<Student | null>;
  // ... other methods
}
```

### 2. Service Implementations (`StudentService.ts`)

Implement business use cases by:

- **Validating** business rules before operations
- **Orchestrating** domain objects and repositories
- **Handling** errors and exceptions appropriately
- **Converting** between DTOs and domain entities

#### Key Responsibilities:

- Validate uniqueness constraints (email, student ID)
- Enforce business rules (age limits, enrollment logic)
- Coordinate multiple repository operations
- Handle domain-specific exceptions

### 3. Data Transfer Objects (`dtos/`)

Provide clean interfaces between layers:

#### `CreateStudentDto`

- Contains all data needed to create a new student
- Includes nested objects for address and identity documents
- Uses primitive types and simple structures

#### `UpdateStudentDto`

- All fields optional for partial updates
- Maintains same structure as create DTO
- Enables flexible update operations

#### `StudentFilterDto`

- Search and filtering criteria
- Pagination support
- Sorting options

#### `StudentResponseDto`

- Clean output format for API responses
- Computed fields (age, fullName, etc.)
- Formatted/masked sensitive data

### 4. Application Exceptions (`exceptions/`)

Domain-specific exceptions for business rule violations:

```typescript
export class StudentNotFoundError extends Error
export class DuplicateStudentIdError extends Error
export class DuplicateEmailError extends Error
export class InvalidStudentDataError extends Error
// ... etc
```

## Current Implementation Status

### ✅ Completed

- Service interface definitions
- DTO structures for all operations
- Exception classes for error handling
- Service architecture and patterns
- Comprehensive documentation

### ⚠️ Limitations

The current implementation demonstrates the intended architecture but faces type conflicts between the new domain entities and existing repository interfaces. This is a common situation during architectural refactoring.

**Specific Issues:**

1. Domain entities use different structure than repository interfaces
2. Repository methods may not exist or have different signatures
3. Value objects have different property names than DTOs

### 🔧 Next Steps

To complete the implementation:

1. **Create Mappers**: Convert between domain entities and repository models
2. **Update Repository Interfaces**: Align with domain entities
3. **Implement Adapter Layer**: Bridge gap between domain and infrastructure
4. **Add Integration Tests**: Verify end-to-end functionality

## Usage Examples

### Creating a Student

```typescript
const studentService = container.resolve<IStudentService>('studentService');

const createData: CreateStudentDto = {
  studentId: '21120001',
  firstName: 'Nguyen',
  lastName: 'Van A',
  email: 'nguyenvana@example.com',
  // ... other fields
};

try {
  const student = await studentService.createStudent(createData);
  console.log('Student created:', student.studentId);
} catch (error) {
  if (error instanceof DuplicateEmailError) {
    console.error('Email already exists');
  }
}
```

### Searching Students

```typescript
const filter: StudentFilterDto = {
  grade: 3,
  isActive: true,
  search: 'Nguyen',
  sortBy: 'lastName',
  page: 1,
  limit: 20,
};

const students = await studentService.getAllStudents(filter);
```

## Testing Strategy

### Unit Tests

- Mock repository dependencies
- Test business logic in isolation
- Verify exception handling
- Test validation rules

### Integration Tests

- Test with real repository implementations
- Verify data flow between layers
- Test transaction handling
- Validate mapping correctness

## Best Practices

1. **Keep Services Thin**: Delegate complex logic to domain entities
2. **Use DTOs**: Don't expose domain entities directly to external layers
3. **Handle Exceptions**: Convert domain exceptions to appropriate HTTP responses
4. **Validate Early**: Check business rules before expensive operations
5. **Use Transactions**: Ensure data consistency for multi-step operations

## Benefits of This Architecture

1. **Separation of Concerns**: Clear separation between business logic and data access
2. **Testability**: Easy to unit test business logic in isolation
3. **Maintainability**: Changes to business rules are localized to service layer
4. **Flexibility**: Can change data storage without affecting business logic
5. **Scalability**: Services can be distributed or cached independently

## Integration with Other Layers

### Controllers (Presentation Layer)

- Controllers depend on service interfaces
- Convert HTTP requests to DTO objects
- Handle HTTP-specific concerns (status codes, headers)

### Repositories (Infrastructure Layer)

- Services depend on repository interfaces
- Repositories handle data persistence concerns
- Services orchestrate multiple repository operations

### Domain Layer

- Services use domain entities and value objects
- Domain entities contain business rules and validation
- Services coordinate domain objects to fulfill use cases
