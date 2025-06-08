import { ISearchableRepository, QueryResult } from './base/IRepository';

/**
 * Course Entity Interface (based on existing model)
 */
export interface Course {
  id?: string;
  courseId: string; // courseId instead of courseCode
  name: string; // name instead of courseName
  credits: number;
  description?: string;
  faculty: string; // Reference to Faculty (ObjectId as string)
  isActive: boolean;
  prerequisites?: string[]; // Array of course IDs (ObjectIds as strings)
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Course Search Criteria
 */
export interface CourseSearchCriteria {
  courseId?: string;
  name?: string;
  faculty?: string; // Faculty ObjectId as string
  credits?: number;
  isActive?: boolean;
  hasPrerequisites?: boolean;
}

/**
 * Course Repository Interface
 */
export interface ICourseRepository
  extends ISearchableRepository<Course, string> {
  /**
   * Find course by course ID
   */
  findByCourseId(courseId: string): Promise<Course | null>;

  /**
   * Find courses by faculty
   */
  findByFaculty(faculty: string): Promise<Course[]>;

  /**
   * Find courses by credits
   */
  findByCredits(credits: number): Promise<Course[]>;

  /**
   * Find active courses
   */
  findActive(): Promise<Course[]>;

  /**
   * Search courses with criteria
   */
  searchCourses(
    criteria: CourseSearchCriteria,
    limit?: number,
    offset?: number
  ): Promise<QueryResult<Course>>;

  /**
   * Check if course ID is taken
   */
  isCourseIdTaken(
    courseId: string,
    excludeCourseDbId?: string
  ): Promise<boolean>;
}
