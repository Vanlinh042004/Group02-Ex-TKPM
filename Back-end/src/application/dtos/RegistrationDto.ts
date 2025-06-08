/**
 * DTO for creating a new registration (course enrollment)
 */
export interface CreateRegistrationDto {
  studentId: string;
  classId: string;
}

/**
 * DTO for updating a registration
 */
export interface UpdateRegistrationDto {
  grade?: number;
  status?: 'active' | 'cancelled';
  cancellationReason?: string;
}

/**
 * DTO for grade assignment
 */
export interface AssignGradeDto {
  grade: number;
}

/**
 * DTO for registration cancellation
 */
export interface CancelRegistrationDto {
  reason: string;
}

/**
 * DTO for registration filters
 */
export interface RegistrationFilterDto {
  studentId?: string;
  classId?: string;
  status?: 'active' | 'cancelled';
  minGrade?: number;
  maxGrade?: number;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
}

/**
 * DTO for registration API responses
 */
export interface RegistrationResponseDto {
  id: string;
  studentId: string;
  classId: string;
  registrationDate: Date;
  grade?: number;
  status: 'active' | 'cancelled';
  cancellationDate?: Date;
  cancellationReason?: string;
  gradeStatus: 'pending' | 'passed' | 'failed';
  isPassing: boolean;
  canBeModified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for registration with populated data (legacy API compatibility)
 */
export interface RegistrationWithPopulationDto {
  _id: string;
  student: {
    _id: string;
    studentId: string;
    fullName: string;
    email: string;
  };
  class: {
    _id: string;
    classId: string;
    course: {
      _id: string;
      courseId: string;
      name: string;
      credits: number;
    };
    instructor: string;
  };
  registrationDate: Date;
  grade?: number;
  status: 'active' | 'cancelled';
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for transcript course entry
 */
export interface TranscriptCourseDto {
  classId: string;
  courseId: string;
  courseName: string;
  credits: number;
  grade: number;
  status: string;
}

/**
 * DTO for student transcript
 */
export interface TranscriptDto {
  studentInfo: {
    studentId: string;
    fullName: string;
    email: string;
    faculty: any;
    program: any;
    phoneNumberConfig: any;
    status: any;
  };
  courses: TranscriptCourseDto[];
  gpa: number;
  totalCredits: number;
}

/**
 * DTO for registration statistics
 */
export interface RegistrationStatisticsDto {
  total: number;
  active: number;
  cancelled: number;
  averageGrade?: number;
  gradeDistribution: {
    excellent: number; // 9-10
    good: number; // 7-8.99
    average: number; // 5-6.99
    poor: number; // 0-4.99
  };
}

/**
 * DTO for bulk operations
 */
export interface BulkUpdateStatusDto {
  registrationIds: string[];
  status: 'active' | 'cancelled';
  reason?: string; // Required for cancellation
}

/**
 * DTO for search operations
 */
export interface SearchRegistrationsDto {
  query?: string;
  filters?: RegistrationFilterDto;
  limit?: number;
  offset?: number;
}

/**
 * DTO for search results
 */
export interface SearchResultsDto<T> {
  results: T[];
  total: number;
  limit: number;
  offset: number;
}
