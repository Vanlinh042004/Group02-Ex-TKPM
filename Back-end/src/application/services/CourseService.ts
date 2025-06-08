import { Course } from '../../domain/entities/Course';
import { ICourseRepository } from '../repositories/ICourseRepository';

export interface CreateCourseDTO {
  courseId: string;
  name: string;
  credits: number;
  faculty: string; // Keep original field name for API compatibility
  description?: string;
  prerequisites?: string[];
}

export interface UpdateCourseDTO {
  name?: string;
  credits?: number;
  faculty?: string;
  description?: string;
  prerequisites?: string[];
  isActive?: boolean;
}

export interface CourseResponseDTO {
  _id?: string; // MongoDB _id for compatibility
  courseId: string;
  name: string;
  credits: number;
  faculty: string | any; // Can be populated with faculty object
  description?: string;
  prerequisites?: string[] | any[]; // Can be populated with course objects
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class CourseService {
  constructor(private courseRepository: ICourseRepository) {}

  async createCourse(dto: CreateCourseDTO): Promise<CourseResponseDTO> {
    // Validate that all prerequisite courses exist
    if (dto.prerequisites && dto.prerequisites.length > 0) {
      await this.validatePrerequisitesExist(dto.prerequisites);
    }

    // Check if course already exists
    const existingCourse = await this.courseRepository.findByCourseId(
      dto.courseId
    );
    if (existingCourse) {
      throw new Error('Course with this ID already exists');
    }

    // Check if name already exists
    const existingByName = await this.courseRepository.findByName(dto.name);
    if (existingByName) {
      throw new Error('Course with this name already exists');
    }

    // Create new course entity
    const course = Course.create(
      dto.courseId,
      dto.name,
      dto.credits,
      dto.faculty,
      dto.description,
      dto.prerequisites
    );

    // Save to repository
    const savedCourse = await this.courseRepository.save(course);

    return this.toResponseDTO(savedCourse);
  }

  async getCourses(filters: any = {}): Promise<CourseResponseDTO[]> {
    let courses: Course[];

    if (Object.keys(filters).length === 0) {
      courses = await this.courseRepository.findAll();
    } else {
      courses = await this.courseRepository.findByFilters({
        faculty: filters.faculty,
        credits: filters.credits ? parseInt(filters.credits) : undefined,
        isActive:
          filters.isActive !== undefined
            ? filters.isActive === 'true'
            : undefined,
        hasPrerequisites:
          filters.hasPrerequisites !== undefined
            ? filters.hasPrerequisites === 'true'
            : undefined,
      });
    }

    return courses.map((course) => this.toResponseDTO(course));
  }

  async getCourseById(courseId: string): Promise<CourseResponseDTO | null> {
    const course = await this.courseRepository.findByCourseId(courseId);
    return course ? this.toResponseDTO(course) : null;
  }

  async updateCourse(
    courseId: string,
    dto: UpdateCourseDTO
  ): Promise<CourseResponseDTO | null> {
    // Find existing course
    const course = await this.courseRepository.findByCourseId(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate credits change - cannot change if has active registrations
    if (dto.credits !== undefined && dto.credits !== course.credits) {
      const hasRegistrations =
        await this.courseRepository.hasActiveRegistrations(courseId);
      if (hasRegistrations) {
        throw new Error(
          'Cannot change credits because there are active student registrations'
        );
      }
      course.updateCredits(dto.credits);
    }

    // Update other fields
    if (dto.name !== undefined) {
      // Check if new name already exists
      if (dto.name !== course.name) {
        const existingByName = await this.courseRepository.findByName(dto.name);
        if (existingByName) {
          throw new Error('Course with this name already exists');
        }
      }
      course.updateName(dto.name);
    }

    if (dto.description !== undefined) {
      course.updateDescription(dto.description);
    }

    if (dto.prerequisites !== undefined) {
      await this.validatePrerequisitesExist(dto.prerequisites);
      course.updatePrerequisites(dto.prerequisites);
    }

    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        course.activate();
      } else {
        course.deactivate();
      }
    }

    // Save changes
    const updatedCourse = await this.courseRepository.save(course);
    return this.toResponseDTO(updatedCourse);
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    // Find course
    const course = await this.courseRepository.findByCourseId(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Check 30-minute deletion rule
    if (!course.canBeDeleted()) {
      const remainingTime = course.getTimeRemainingForDeletion();
      throw new Error('Cannot delete course after 30 minutes from creation');
    }

    // Check if course has active classes
    const hasClasses = await this.courseRepository.hasActiveClasses(courseId);
    if (hasClasses) {
      throw new Error('Cannot delete course because it has active classes');
    }

    // Delete course
    await this.courseRepository.delete(courseId);
    return true;
  }

  async deactivateCourse(courseId: string): Promise<CourseResponseDTO | null> {
    const course = await this.courseRepository.findByCourseId(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    course.deactivate();
    const updatedCourse = await this.courseRepository.save(course);

    return this.toResponseDTO(updatedCourse);
  }

  async isPrerequisiteForOtherCourses(courseId: string): Promise<boolean> {
    const dependentCourses =
      await this.courseRepository.findCoursesWithPrerequisite(courseId);
    return dependentCourses.length > 0;
  }

  async getCoursesWithPrerequisite(
    prerequisiteId: string
  ): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findCoursesWithPrerequisite(
      prerequisiteId
    );
    return courses.map((course) => this.toResponseDTO(course));
  }

  async searchCoursesByName(searchTerm: string): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.searchByName(searchTerm);
    return courses.map((course) => this.toResponseDTO(course));
  }

  async getCoursesByFaculty(facultyId: string): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findByFaculty(facultyId);
    return courses.map((course) => this.toResponseDTO(course));
  }

  async getCoursesByCredits(credits: number): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findByCredits(credits);
    return courses.map((course) => this.toResponseDTO(course));
  }

  async validateCourseCanBeDeleted(courseId: string): Promise<{
    canDelete: boolean;
    reason?: string;
    timeRemaining?: number;
  }> {
    const course = await this.courseRepository.findByCourseId(courseId);
    if (!course) {
      return { canDelete: false, reason: 'Course not found' };
    }

    if (!course.canBeDeleted()) {
      return {
        canDelete: false,
        reason: '30-minute deletion window has expired',
        timeRemaining: course.getTimeRemainingForDeletion(),
      };
    }

    const hasClasses = await this.courseRepository.hasActiveClasses(courseId);
    if (hasClasses) {
      return { canDelete: false, reason: 'Course has active classes' };
    }

    return { canDelete: true };
  }

  private async validatePrerequisitesExist(
    prerequisites: string[]
  ): Promise<void> {
    for (const prereqId of prerequisites) {
      const prereqCourse = await this.courseRepository.findByCourseId(prereqId);
      if (!prereqCourse) {
        throw new Error(
          `Prerequisite course with ID ${prereqId} does not exist`
        );
      }
    }
  }

  private toResponseDTO(course: Course): CourseResponseDTO {
    return {
      courseId: course.courseId,
      name: course.name,
      credits: course.credits,
      faculty: course.facultyId, // Keep original field name
      description: course.description,
      prerequisites: course.prerequisites,
      isActive: course.isActive,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
