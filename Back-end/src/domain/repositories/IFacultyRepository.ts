// Temporary Faculty interface based on existing model
export interface Faculty {
  id?: string;
  facultyId: string; // Unique faculty identifier
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
import { ISearchableRepository, QueryResult } from './base/IRepository';

/**
 * Faculty Search Criteria
 */
export interface FacultySearchCriteria {
  /** Search by faculty ID */
  facultyId?: string;
  /** Search by faculty name */
  name?: string;
}

/**
 * Faculty Statistics
 */
export interface FacultyStatistics {
  /** Total number of faculties */
  total: number;
  /** Student count by faculty */
  studentCountByFaculty: Record<string, number>;
}

/**
 * Faculty Repository Interface (Simplified)
 * Defines data access operations for Faculty domain entity
 */
export interface IFacultyRepository
  extends ISearchableRepository<Faculty, string> {
  // === Basic Faculty-specific Operations ===

  /**
   * Find faculty by faculty ID
   * @param facultyId - Faculty ID (unique identifier)
   * @returns Promise of faculty or null if not found
   */
  findByFacultyId(facultyId: string): Promise<Faculty | null>;

  /**
   * Check if faculty ID is already taken
   * @param facultyId - Faculty ID to check
   * @param excludeDbId - Optional database ID to exclude from check (for updates)
   * @returns Promise of boolean indicating if faculty ID exists
   */
  isFacultyIdTaken(facultyId: string, excludeDbId?: string): Promise<boolean>;

  /**
   * Find faculties by name (partial match)
   * @param name - Name to search for
   * @returns Promise of array of matching faculties
   */
  findByNameLike(name: string): Promise<Faculty[]>;

  // === Search and Filter Operations ===

  /**
   * Search faculties with criteria
   * @param criteria - Search criteria
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of query result with faculties
   */
  searchFaculties(
    criteria: FacultySearchCriteria,
    limit?: number,
    offset?: number
  ): Promise<QueryResult<Faculty>>;

  // === Statistics ===

  /**
   * Get faculty statistics
   * @returns Promise of faculty statistics
   */
  getStatistics(): Promise<FacultyStatistics>;

  /**
   * Get faculties with their student counts
   * @returns Promise of faculties with student counts
   */
  getFacultiesWithStudentCounts(): Promise<
    Array<{
      faculty: Faculty;
      studentCount: number;
    }>
  >;
}
