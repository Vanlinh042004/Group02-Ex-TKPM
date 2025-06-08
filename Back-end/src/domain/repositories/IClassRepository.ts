import { Class } from '../entities/Class';

/**
 * Class Repository Interface
 */
export interface IClassRepository {
  // Basic CRUD operations
  create(classEntity: Class): Promise<Class>;
  findById(id: string): Promise<Class | null>;
  findByClassId(classId: string): Promise<Class | null>;
  findAll(filters?: ClassFilters): Promise<Class[]>;
  update(id: string, classEntity: Class): Promise<Class | null>;
  delete(id: string): Promise<boolean>;

  // Business-specific queries
  findByCourseId(courseId: string): Promise<Class[]>;
  findByAcademicYearAndSemester(
    academicYear: string,
    semester: string
  ): Promise<Class[]>;
  findByInstructor(instructor: string): Promise<Class[]>;
  findByClassroom(classroom: string): Promise<Class[]>;

  // Enrollment-related queries
  getEnrollmentCount(classId: string): Promise<number>;
  hasAvailableSlots(classId: string): Promise<boolean>;

  // Advanced queries
  searchClasses(searchTerm: string): Promise<Class[]>;
  findClassesWithPopulatedCourse(): Promise<any[]>; // For legacy API compatibility

  // Validation helpers
  exists(classId: string): Promise<boolean>;
  courseExists(courseId: string): Promise<boolean>;
  isCourseActive(courseId: string): Promise<boolean>;
}

/**
 * Class filters interface
 */
export interface ClassFilters {
  courseId?: string;
  academicYear?: string;
  semester?: string;
  instructor?: string;
  classroom?: string;
  maxStudents?: {
    min?: number;
    max?: number;
  };
}
