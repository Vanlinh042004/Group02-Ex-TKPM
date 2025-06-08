import { Course } from '../../domain/entities/Course';

export interface ICourseRepository {
  save(course: Course): Promise<Course>;
  findByCourseId(courseId: string): Promise<Course | null>;
  findByName(name: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  findAllActive(): Promise<Course[]>;
  findByFaculty(facultyId: string): Promise<Course[]>;
  findByCredits(credits: number): Promise<Course[]>;
  findCoursesWithPrerequisite(prerequisiteId: string): Promise<Course[]>;
  existsByCourseId(courseId: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  delete(courseId: string): Promise<void>;

  // Prerequisites related queries
  findPrerequisiteCourses(courseId: string): Promise<Course[]>;
  hasActiveRegistrations(courseId: string): Promise<boolean>;
  hasActiveClasses(courseId: string): Promise<boolean>;

  // Search and filter methods
  searchByName(searchTerm: string): Promise<Course[]>;
  findByFilters(filters: {
    faculty?: string;
    credits?: number;
    isActive?: boolean;
    hasPrerequisites?: boolean;
  }): Promise<Course[]>;
}
