// Temporary Student interface based on existing model
export interface Student {
  id?: string;
  studentId: string;
  fullName: string;
  dateOfBirth: Date;
  gender: 'Nam' | 'Nữ';
  nationality: string;
  faculty: string; // Reference to Faculty (ObjectId as string)
  course: string;
  program: string; // Reference to Program (ObjectId as string)
  email: string;
  phone: string;
  phoneNumberConfig: string; // Reference to PhoneNumberConfig (ObjectId as string)
  status: string; // Reference to Status (ObjectId as string)
  createdAt?: Date;
  updatedAt?: Date;
}

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  DROPPED_OUT = 'dropped_out',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave',
}
import { ISearchableRepository, QueryResult } from './base/IRepository';

/**
 * Student Search and Filter Criteria
 */
export interface StudentSearchCriteria {
  /** Search by student ID */
  studentId?: string;
  /** Search by first name */
  firstName?: string;
  /** Search by last name */
  lastName?: string;
  /** Search by email */
  email?: string;
  /** Filter by status */
  status?: StudentStatus;
  /** Filter by faculty ID */
  faculty?: string;
  /** Filter by program ID */
  program?: string;
  /** Filter by nationality */
  nationality?: string;
  /** Filter by course */
  course?: string;
}

/**
 * Student Statistics
 */
export interface StudentStatistics {
  /** Total number of students */
  total: number;
  /** Students by faculty */
  byFaculty: Record<string, number>;
  /** Students by status */
  byStatus: Record<string, number>;
  /** Students by program */
  byProgram: Record<string, number>;
}

/**
 * Student Repository Interface
 * Defines data access operations for Student domain entity
 */
export interface IStudentRepository
  extends ISearchableRepository<Student, string> {
  // === Basic Student-specific Operations ===

  /**
   * Find student by student ID (not database ID)
   * @param studentId - The student's unique identifier
   * @returns Promise of student or null if not found
   */
  findByStudentId(studentId: string): Promise<Student | null>;

  /**
   * Find student by email address
   * @param email - Email address to search
   * @returns Promise of student or null if not found
   */
  findByEmail(email: string): Promise<Student | null>;

  /**
   * Check if student ID is already taken
   * @param studentId - Student ID to check
   * @returns Promise of boolean indicating if ID exists
   */
  isStudentIdTaken(studentId: string): Promise<boolean>;

  /**
   * Check if email is already taken
   * @param email - Email to check
   * @param excludeStudentId - Optional student ID to exclude from check (for updates)
   * @returns Promise of boolean indicating if email exists
   */
  isEmailTaken(email: string, excludeStudentId?: string): Promise<boolean>;

  // === Search and Filter Operations ===

  /**
   * Search students with comprehensive criteria
   * @param criteria - Search criteria
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of query result with students
   */
  searchStudents(
    criteria: StudentSearchCriteria,
    limit?: number,
    offset?: number
  ): Promise<QueryResult<Student>>;

  /**
   * Find students by status
   * @param status - Student status to filter by
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of array of students
   */
  findByStatus(
    status: StudentStatus,
    limit?: number,
    offset?: number
  ): Promise<Student[]>;

  /**
   * Find students by faculty
   * @param facultyId - Faculty identifier
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of array of students
   */
  findByFaculty(
    facultyId: string,
    limit?: number,
    offset?: number
  ): Promise<Student[]>;

  /**
   * Find students by program
   * @param programId - Program identifier
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of array of students
   */
  findByProgram(
    programId: string,
    limit?: number,
    offset?: number
  ): Promise<Student[]>;

  /**
   * Find students by class
   * @param classId - Class identifier
   * @returns Promise of array of students
   */
  findByClass(classId: string): Promise<Student[]>;

  /**
   * Find students by enrollment year
   * @param year - Enrollment year
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of array of students
   */
  findByEnrollmentYear(
    year: number,
    limit?: number,
    offset?: number
  ): Promise<Student[]>;

  // === Academic Operations ===

  /**
   * Find students eligible for graduation
   * @param facultyId - Optional faculty filter
   * @returns Promise of array of students eligible for graduation
   */
  findEligibleForGraduation(facultyId?: string): Promise<Student[]>;

  /**
   * Find students on academic probation (low GPA)
   * @param threshold - GPA threshold (default: 2.0)
   * @returns Promise of array of students on probation
   */
  findOnAcademicProbation(threshold?: number): Promise<Student[]>;

  /**
   * Find students with high academic standing
   * @param threshold - GPA threshold (default: 3.5)
   * @returns Promise of array of high-performing students
   */
  findHighPerformers(threshold?: number): Promise<Student[]>;

  /**
   * Find students who need to renew documents (expiring soon)
   * @param daysAhead - Number of days to look ahead (default: 30)
   * @returns Promise of array of students with expiring documents
   */
  findWithExpiringDocuments(daysAhead?: number): Promise<Student[]>;

  // === Bulk Operations ===

  /**
   * Update GPA for multiple students
   * @param updates - Array of {studentId, gpa} objects
   * @returns Promise of number of students updated
   */
  bulkUpdateGPA(
    updates: Array<{ studentId: string; gpa: number }>
  ): Promise<number>;

  /**
   * Update status for multiple students
   * @param studentIds - Array of student IDs
   * @param status - New status
   * @returns Promise of number of students updated
   */
  bulkUpdateStatus(
    studentIds: string[],
    status: StudentStatus
  ): Promise<number>;

  /**
   * Assign students to class
   * @param studentIds - Array of student IDs
   * @param classId - Class identifier
   * @returns Promise of number of students updated
   */
  assignToClass(studentIds: string[], classId: string): Promise<number>;

  // === Statistics and Analytics ===

  /**
   * Get comprehensive student statistics
   * @param facultyId - Optional faculty filter
   * @returns Promise of student statistics
   */
  getStatistics(facultyId?: string): Promise<StudentStatistics>;

  /**
   * Count students by status
   * @param facultyId - Optional faculty filter
   * @returns Promise of status counts
   */
  countByStatus(facultyId?: string): Promise<Record<StudentStatus, number>>;

  /**
   * Count students by faculty
   * @returns Promise of faculty counts
   */
  countByFaculty(): Promise<Record<string, number>>;

  /**
   * Get average GPA by faculty
   * @returns Promise of faculty GPA averages
   */
  getAverageGPAByFaculty(): Promise<Record<string, number>>;

  /**
   * Get enrollment trends by year
   * @param years - Number of years to look back (default: 5)
   * @returns Promise of enrollment counts by year
   */
  getEnrollmentTrends(years?: number): Promise<Record<number, number>>;

  // === Advanced Queries ===

  /**
   * Find students with similar profiles (for recommendations, etc.)
   * @param studentId - Reference student ID
   * @param limit - Maximum number of similar students
   * @returns Promise of array of similar students
   */
  findSimilarStudents(studentId: string, limit?: number): Promise<Student[]>;

  /**
   * Find students who might be at risk (multiple criteria)
   * @param criteria - Risk assessment criteria
   * @returns Promise of array of at-risk students
   */
  findAtRiskStudents(criteria?: {
    lowGpa?: number;
    missedSemesters?: number;
    noRecentActivity?: number; // days
  }): Promise<Student[]>;

  /**
   * Export student data for reporting
   * @param criteria - Optional search criteria
   * @param format - Export format metadata
   * @returns Promise of serializable student data
   */
  exportStudents(
    criteria?: StudentSearchCriteria,
    format?: {
      includePersonalInfo?: boolean;
      includeAcademicInfo?: boolean;
      includeContactInfo?: boolean;
    }
  ): Promise<any[]>;
}
