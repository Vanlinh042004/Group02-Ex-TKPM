/**
 * DTO for creating a new class
 */
export interface CreateClassDto {
  classId: string;
  courseId: string;
  academicYear: string;
  semester: string;
  instructor: string;
  maxStudents: number;
  schedule: string;
  classroom: string;
}

/**
 * DTO for updating a class
 */
export interface UpdateClassDto {
  instructor?: string;
  maxStudents?: number;
  schedule?: string;
  classroom?: string;
}

/**
 * DTO for class filters
 */
export interface ClassFilterDto {
  courseId?: string;
  academicYear?: string;
  semester?: string;
  instructor?: string;
  classroom?: string;
  minStudents?: number;
  maxStudents?: number;
}

/**
 * DTO for class API responses
 */
export interface ClassResponseDto {
  id: string;
  classId: string;
  courseId: string;
  academicYear: string;
  semester: string;
  instructor: string;
  maxStudents: number;
  schedule: string;
  classroom: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for enrollment count response
 */
export interface EnrollmentCountDto {
  count: number;
}

/**
 * DTO for class search
 */
export interface ClassSearchDto {
  query: string;
  filters?: ClassFilterDto;
}
