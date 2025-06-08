import { Registration } from '../entities/Registration';

/**
 * Registration Search Criteria
 */
export interface RegistrationSearchCriteria {
  studentId?: string;
  classId?: string;
  status?: 'active' | 'cancelled';
  registrationDateRange?: {
    from?: Date;
    to?: Date;
  };
  gradeRange?: {
    min?: number;
    max?: number;
  };
}

/**
 * Registration Statistics
 */
export interface RegistrationStatistics {
  total: number;
  byStatus: Record<'active' | 'cancelled', number>;
  averageGrade?: number;
  gradeDistribution: Record<string, number>;
}

/**
 * Transcript Course Data
 */
export interface TranscriptCourse {
  classId: string;
  courseId: string;
  courseName: string;
  credits: number;
  grade: number;
  status: string;
}

/**
 * Student Transcript Data
 */
export interface TranscriptData {
  studentInfo: any;
  courses: TranscriptCourse[];
  gpa: number;
  totalCredits: number;
}

/**
 * Registration Repository Interface
 */
export interface IRegistrationRepository {
  // Basic CRUD operations
  create(registration: Registration): Promise<Registration>;
  findById(id: string): Promise<Registration | null>;
  findAll(criteria?: RegistrationSearchCriteria): Promise<Registration[]>;
  update(id: string, registration: Registration): Promise<Registration | null>;
  delete(id: string): Promise<boolean>;

  // Business-specific queries
  findByStudentId(studentId: string): Promise<Registration[]>;
  findByClassId(classId: string): Promise<Registration[]>;
  findByStatus(status: 'active' | 'cancelled'): Promise<Registration[]>;
  findByGradeRange(minGrade: number, maxGrade: number): Promise<Registration[]>;

  // Complex business queries
  findActiveRegistrationsByStudent(studentId: string): Promise<Registration[]>;
  findActiveRegistrationsByClass(classId: string): Promise<Registration[]>;
  findCompletedCoursesByStudent(studentId: string): Promise<Registration[]>;

  // Validation helpers
  isStudentRegisteredForClass(
    studentId: string,
    classId: string
  ): Promise<boolean>;
  getActiveRegistrationCount(classId: string): Promise<number>;
  hasStudentCompletedPrerequisites(
    studentId: string,
    prerequisiteIds: string[]
  ): Promise<boolean>;

  // Statistics and reporting
  getRegistrationStatistics(classId?: string): Promise<RegistrationStatistics>;

  // Transcript generation
  generateTranscriptData(studentId: string): Promise<TranscriptData>;

  // Legacy API compatibility
  findAllWithPopulation(): Promise<any[]>;
  findStudentsInClassWithPopulation(classId: string): Promise<any[]>;

  // Batch operations
  bulkUpdateStatus(registrationIds: string[], status: string): Promise<number>;

  // Advanced search
  searchRegistrations(
    criteria: RegistrationSearchCriteria,
    limit?: number,
    offset?: number
  ): Promise<{ results: Registration[]; total: number }>;
}
