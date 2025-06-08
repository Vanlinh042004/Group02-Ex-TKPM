# Repository Pattern Implementation

This directory contains repository interfaces that define data access operations for domain entities. The Repository Pattern provides an abstraction layer between the domain logic and data persistence concerns.

## Architecture Benefits

### 🎯 **Separation of Concerns**

- Domain logic is isolated from data access implementation
- Business rules remain independent of database specifics
- Clean separation between domain and infrastructure layers

### 🔄 **Dependency Inversion**

- Domain layer defines interfaces (contracts)
- Infrastructure layer implements these interfaces
- Dependencies point inward (toward domain)

### 🧪 **Testability**

- Easy to mock repository interfaces for unit testing
- Domain logic can be tested without database dependencies
- Integration tests can use in-memory implementations

### 🔧 **Flexibility**

- Can switch between different persistence technologies
- Multiple implementations (MongoDB, PostgreSQL, In-Memory, etc.)
- Easy to add caching layers or other cross-cutting concerns

## Directory Structure

```
repositories/
├── base/
│   └── IRepository.ts          # Base repository interface
├── specifications/
│   └── ISpecification.ts       # Specification pattern for complex queries
├── IStudentRepository.ts       # Student-specific repository interface
├── IFacultyRepository.ts       # Faculty-specific repository interface
├── ICourseRepository.ts        # Course-specific repository interface
├── IRegistrationRepository.ts  # Registration-specific repository interface
├── index.ts                    # Export all interfaces
└── README.md                   # This file
```

## Core Interfaces

### IRepository<TEntity, TId>

Base interface providing common CRUD operations:

- `findById(id)` - Find entity by ID
- `findAll(limit?, offset?)` - Get all entities with pagination
- `save(entity)` - Save (create or update) entity
- `delete(id)` - Delete entity by ID
- `count()` - Count total entities
- `exists(id)` - Check if entity exists

### ISearchableRepository<TEntity, TId>

Extended interface adding search capabilities:

- `search(options)` - Advanced search with filters and pagination
- `findByField(field, value)` - Find by specific field
- `findOneByField(field, value)` - Find single entity by field

## Usage Examples

### 1. Basic Repository Usage

```typescript
// In a service or use case
export class StudentService {
  constructor(private studentRepository: IStudentRepository) {}

  async getStudent(id: string): Promise<Student | null> {
    return await this.studentRepository.findById(id);
  }

  async createStudent(studentData: CreateStudentRequest): Promise<Student> {
    const student = Student.create(studentData);
    return await this.studentRepository.save(student);
  }
}
```

### 2. Search with Criteria

```typescript
async findStudentsByCriteria(criteria: StudentSearchCriteria): Promise<QueryResult<Student>> {
  return await this.studentRepository.searchStudents(criteria, 20, 0);
}

// Example criteria
const criteria: StudentSearchCriteria = {
  facultyId: 'FIT',
  status: StudentStatus.ACTIVE,
  gpaRange: { min: 3.0 },
  enrollmentYear: 2021
};
```

### 3. Specification Pattern Usage

```typescript
// Define reusable specifications
class ActiveStudentSpecification extends BaseSpecification<Student> {
  isSatisfiedBy(student: Student): boolean {
    return student.isActive;
  }
}

class HighPerformerSpecification extends BaseSpecification<Student> {
  constructor(private minGPA: number = 3.5) {
    super();
  }

  isSatisfiedBy(student: Student): boolean {
    return student.gpa !== undefined && student.gpa >= this.minGPA;
  }
}

// Combine specifications
const activeHighPerformers = new ActiveStudentSpecification().and(
  new HighPerformerSpecification(3.5)
);

const students = await repository.findBySpecification(activeHighPerformers);
```

### 4. Repository with Statistics

```typescript
// Get comprehensive statistics
const stats = await studentRepository.getStatistics('FIT');
console.log(`Total students: ${stats.total}`);
console.log(`Active students: ${stats.active}`);
console.log(`Average GPA: ${stats.averageGpa}`);
```

## Implementation Guidelines

### 1. Repository Implementations

Repository implementations should:

- Implement the appropriate interface (e.g., `IStudentRepository`)
- Handle data mapping between domain entities and persistence models
- Include proper error handling and logging
- Be placed in the infrastructure layer

```typescript
// Infrastructure layer implementation
export class MongoStudentRepository implements IStudentRepository {
  constructor(private db: MongoDatabase) {}

  async findById(id: string): Promise<Student | null> {
    const data = await this.db.collection('students').findOne({ _id: id });
    return data ? Student.fromPlainObject(data) : null;
  }

  // ... other methods
}
```

### 2. Dependency Injection Registration

```typescript
// In DI container setup
container.registerFactory(
  SERVICE_TOKENS.STUDENT_REPOSITORY,
  () => new MongoStudentRepository(container.resolve('Database'))
);
```

### 3. Testing with Mocks

```typescript
// Unit test example
describe('StudentService', () => {
  let service: StudentService;
  let mockRepository: jest.Mocked<IStudentRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      // ... other methods
    } as any;

    service = new StudentService(mockRepository);
  });

  it('should find student by ID', async () => {
    const student = Student.create(validStudentData);
    mockRepository.findById.mockResolvedValue(student);

    const result = await service.getStudent('123');

    expect(result).toBe(student);
    expect(mockRepository.findById).toHaveBeenCalledWith('123');
  });
});
```

## Advanced Features

### 1. Bulk Operations

Many repositories include bulk operation methods:

- `saveMany(entities)` - Save multiple entities
- `deleteMany(ids)` - Delete multiple entities
- `bulkUpdateStatus(ids, status)` - Update status for multiple entities

### 2. Statistics and Analytics

Repository interfaces include methods for getting insights:

- `getStatistics()` - Comprehensive statistics
- `countByStatus()` - Count entities by status
- `getEnrollmentTrends()` - Historical data analysis

### 3. Export Capabilities

Support for data export with configurable formats:

- `exportStudents(criteria, format)` - Export filtered data
- Configurable inclusion/exclusion of sensitive data
- Support for different output formats

## Best Practices

### ✅ Do:

- Keep repository interfaces focused on data access
- Use meaningful method names that express intent
- Include proper documentation and examples
- Design for both simple and complex queries
- Support pagination for list operations
- Include statistics and analytics methods where appropriate

### ❌ Don't:

- Put business logic in repository implementations
- Make repositories dependent on other repositories
- Expose database-specific details in interfaces
- Create overly complex method signatures
- Forget to handle null/not found cases
- Skip error handling in implementations

## Integration with Domain Layer

Repository interfaces are designed to work seamlessly with domain entities:

1. **Input**: Accept domain entities and value objects
2. **Output**: Return domain entities (not data models)
3. **Validation**: Domain entities validate themselves
4. **Business Rules**: Enforced at domain level, not repository level

This ensures that the domain layer remains the single source of truth for business logic while repositories handle only data persistence concerns.
