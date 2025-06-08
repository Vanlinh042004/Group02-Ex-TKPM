/**
 * Repository Interfaces Index
 * Exports all repository interfaces for easy importing
 */

// Base repository interfaces
export {
  IRepository,
  ISearchableRepository,
  SearchOptions,
  QueryResult,
} from './base/IRepository';

// Specific repository interfaces
export {
  IStudentRepository,
  StudentSearchCriteria,
  StudentStatistics,
} from './IStudentRepository';

export {
  IFacultyRepository,
  FacultySearchCriteria,
  FacultyStatistics,
} from './IFacultyRepository';

export {
  ICourseRepository,
  Course,
  CourseSearchCriteria,
} from './ICourseRepository';

export {
  IRegistrationRepository,
  RegistrationSearchCriteria,
  RegistrationStatistics,
  TranscriptData,
  TranscriptCourse,
} from './IRegistrationRepository';

export { IEmailDomainRepository } from './IEmailDomainRepository';
export { IPhoneNumberConfigRepository } from './IPhoneNumberConfigRepository';

// Import interfaces for convenience object
import type { IRepository, ISearchableRepository } from './base/IRepository';
import type { IStudentRepository } from './IStudentRepository';
import type { IFacultyRepository } from './IFacultyRepository';
import type { ICourseRepository } from './ICourseRepository';
import type { IRegistrationRepository } from './IRegistrationRepository';

// Re-export for convenience (type-only)
export const RepositoryInterfaces = {
  // Note: These are TypeScript interfaces (types), not runtime values
  // They can only be used for type checking, not as runtime references
} as const;
