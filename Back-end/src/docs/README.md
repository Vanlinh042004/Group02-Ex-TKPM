# Project Document

`https://deepwiki.com/Vanlinh042004/Ex02-Refactor`

# API Documentation

This project uses Swagger/OpenAPI 3.0 for API documentation.

## Accessing the Documentation

Once the server is running, you can access the API documentation at:

- **Swagger UI**: `http://localhost:5000/api-docs`
- **OpenAPI JSON**: `http://localhost:5000/api-docs.json`

## Project Structure

```
src/docs/
├── swagger.config.ts          # Main Swagger configuration
├── schemas/                   # Schema definitions
│   ├── common.yaml           # Common schemas and responses
│   ├── student.yaml          # Student-related schemas
│   └── entities.yaml         # Other entity schemas
└── routes/                   # API endpoint documentation
    ├── students.yaml         # Student API endpoints
    ├── faculties.yaml        # Faculty API endpoints
    └── courses.yaml          # Course API endpoints
```

## API Overview

### Available APIs

The system provides both legacy APIs and Clean Architecture APIs (v2):

#### Legacy APIs

- `/api/students` - Student management (legacy)
- `/api/faculties` - Faculty management (legacy)
- `/api/programs` - Program management (legacy)
- `/api/statuses` - Status management (legacy)
- `/api/courses` - Course management (legacy)
- `/api/classes` - Class management (legacy)
- `/api/registrations` - Registration management (legacy)
- `/api/email-domains` - Email domain management (legacy)
- `/api/phone-numbers` - Phone number config management (legacy)

#### Clean Architecture APIs (v2)

- `/api/v2/faculties` - Faculty management (Clean Architecture)
- `/api/v2/programs` - Program management (Clean Architecture)
- `/api/v2/statuses` - Status management (Clean Architecture)
- `/api/v2/courses` - Course management (Clean Architecture)
- `/api/v2/classes` - Class management (Clean Architecture)
- `/api/v2/registrations` - Registration management (Clean Architecture)
- `/api/v2/email-domains` - Email domain management (Clean Architecture)
- `/api/v2/phone-numbers` - Phone number config management (Clean Architecture)

### Key Features

1. **Student Management**

   - Create, read, update, delete students
   - Search students by various criteria
   - Import/export student data (CSV, JSON)
   - Handle complex student information including addresses and identity documents

2. **Faculty Management**

   - Manage academic faculties
   - Rename faculty operations
   - Both legacy and clean architecture implementations

3. **Course Management**

   - Course CRUD operations
   - Prerequisites handling
   - Course activation/deactivation

4. **Class Management**

   - Class scheduling and management
   - Enrollment tracking
   - Academic year and semester handling

5. **Registration Management**

   - Student course registration
   - Grade assignment
   - Registration cancellation
   - Transcript generation

6. **Configuration Management**
   - Email domain validation
   - Phone number format configuration
   - Student status management
   - Program management

### Response Formats

All APIs follow a consistent response format:

#### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error messages"]
}
```

### Authentication

Currently, the APIs do not require authentication, but the documentation includes bearer token authentication schema for future implementation.

### Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Development

### Adding New API Documentation

1. **Add Schema**: Create or update schema files in `src/docs/schemas/`
2. **Add Routes**: Create or update route documentation in `src/docs/routes/`
3. **Update Config**: The main configuration in `swagger.config.ts` will automatically include new files

### Schema Guidelines

- Use `$ref` to reference common schemas
- Include examples for all properties
- Specify required fields
- Use appropriate data types and formats

### Route Guidelines

- Include comprehensive descriptions
- Document all parameters and request bodies
- Specify all possible response codes
- Use appropriate tags for grouping

## Testing

You can test the APIs directly from the Swagger UI interface at `http://localhost:5000/api-docs`.

## Notes

- The documentation covers both legacy and Clean Architecture implementations
- Some endpoints may have different response formats between legacy and v2 APIs
- The v2 APIs follow Domain-Driven Design principles and Clean Architecture patterns
