import { Class } from '../../domain/entities/Class';
import {
  IClassRepository,
  ClassFilters,
} from '../../domain/repositories/IClassRepository';
import {
  CreateClassDto,
  UpdateClassDto,
  ClassResponseDto,
  ClassFilterDto,
} from '../dtos/ClassDto';

/**
 * Class Application Service
 * Orchestrates business operations for Class entity
 */
export class ClassService {
  constructor(private readonly classRepository: IClassRepository) {}

  /**
   * Create a new class
   */
  async createClass(classData: CreateClassDto): Promise<ClassResponseDto> {
    // Validate course exists and is active
    const courseExists = await this.classRepository.courseExists(
      classData.courseId
    );
    if (!courseExists) {
      throw new Error('Khóa học không tồn tại');
    }

    const isCourseActive = await this.classRepository.isCourseActive(
      classData.courseId
    );
    if (!isCourseActive) {
      throw new Error('Không thể tạo lớp học cho khóa học đã bị deactivate');
    }

    // Create domain entity
    const classEntity = Class.create({
      classId: classData.classId,
      courseId: classData.courseId,
      academicYear: classData.academicYear,
      semester: classData.semester,
      instructor: classData.instructor,
      maxStudents: classData.maxStudents,
      schedule: classData.schedule,
      classroom: classData.classroom,
    });

    // Save to repository
    const savedClass = await this.classRepository.create(classEntity);

    return this.mapToResponseDto(savedClass);
  }

  /**
   * Get all classes with filters
   */
  async getClasses(filters?: ClassFilterDto): Promise<ClassResponseDto[]> {
    const repositoryFilters: ClassFilters = {};

    if (filters) {
      if (filters.courseId) repositoryFilters.courseId = filters.courseId;
      if (filters.academicYear)
        repositoryFilters.academicYear = filters.academicYear;
      if (filters.semester) repositoryFilters.semester = filters.semester;
      if (filters.instructor) repositoryFilters.instructor = filters.instructor;
      if (filters.classroom) repositoryFilters.classroom = filters.classroom;
      if (filters.minStudents || filters.maxStudents) {
        repositoryFilters.maxStudents = {
          min: filters.minStudents,
          max: filters.maxStudents,
        };
      }
    }

    const classes = await this.classRepository.findAll(repositoryFilters);
    return classes.map(this.mapToResponseDto);
  }

  /**
   * Get class by ID
   */
  async getClassById(id: string): Promise<ClassResponseDto | null> {
    const classEntity = await this.classRepository.findById(id);
    if (!classEntity) {
      return null;
    }

    return this.mapToResponseDto(classEntity);
  }

  /**
   * Update class
   */
  async updateClass(
    id: string,
    updateData: UpdateClassDto
  ): Promise<ClassResponseDto | null> {
    const existingClass = await this.classRepository.findById(id);
    if (!existingClass) {
      return null;
    }

    // Apply business rules for updates
    const updatedClass = this.applyUpdates(existingClass, updateData);

    // Additional validations
    if (updateData.maxStudents !== undefined) {
      const currentEnrollment = await this.classRepository.getEnrollmentCount(
        id
      );
      if (
        !updatedClass.canReduceMaxStudents(
          updateData.maxStudents,
          currentEnrollment
        )
      ) {
        throw new Error(
          'Không thể giảm số lượng sinh viên tối đa xuống dưới số sinh viên hiện tại'
        );
      }
    }

    const savedClass = await this.classRepository.update(id, updatedClass);
    if (!savedClass) {
      return null;
    }

    return this.mapToResponseDto(savedClass);
  }

  /**
   * Get enrollment count for a class
   */
  async getEnrollmentCount(classId: string): Promise<number> {
    const classExists = await this.classRepository.exists(classId);
    if (!classExists) {
      throw new Error('Lớp học không tồn tại');
    }

    return await this.classRepository.getEnrollmentCount(classId);
  }

  /**
   * Check if class has available slots
   */
  async hasAvailableSlots(classId: string): Promise<boolean> {
    const classEntity = await this.classRepository.findById(classId);
    if (!classEntity) {
      throw new Error('Lớp học không tồn tại');
    }

    return await this.classRepository.hasAvailableSlots(classId);
  }

  /**
   * Get classes by course ID
   */
  async getClassesByCourse(courseId: string): Promise<ClassResponseDto[]> {
    const classes = await this.classRepository.findByCourseId(courseId);
    return classes.map(this.mapToResponseDto);
  }

  /**
   * Get classes by academic year and semester
   */
  async getClassesByAcademicYearAndSemester(
    academicYear: string,
    semester: string
  ): Promise<ClassResponseDto[]> {
    const classes = await this.classRepository.findByAcademicYearAndSemester(
      academicYear,
      semester
    );
    return classes.map(this.mapToResponseDto);
  }

  /**
   * Search classes
   */
  async searchClasses(searchTerm: string): Promise<ClassResponseDto[]> {
    const classes = await this.classRepository.searchClasses(searchTerm);
    return classes.map(this.mapToResponseDto);
  }

  /**
   * Get classes with populated course data (for legacy API compatibility)
   */
  async getClassesWithPopulatedCourse(): Promise<any[]> {
    return await this.classRepository.findClassesWithPopulatedCourse();
  }

  // Private helper methods
  private applyUpdates(
    existingClass: Class,
    updateData: UpdateClassDto
  ): Class {
    // Create new instance with updated data
    const updatedProps = {
      id: existingClass.id,
      classId: existingClass.classId,
      courseId: existingClass.courseId,
      academicYear: existingClass.academicYear,
      semester: existingClass.semester,
      instructor: updateData.instructor ?? existingClass.instructor,
      maxStudents: updateData.maxStudents ?? existingClass.maxStudents,
      schedule: updateData.schedule ?? existingClass.schedule,
      classroom: updateData.classroom ?? existingClass.classroom,
      createdAt: existingClass.createdAt,
      updatedAt: new Date(),
    };

    const newClass = Class.create(updatedProps);

    // Apply business methods if specific fields are updated
    if (
      updateData.instructor &&
      updateData.instructor !== existingClass.instructor
    ) {
      newClass.updateInstructor(updateData.instructor);
    }
    if (
      updateData.maxStudents &&
      updateData.maxStudents !== existingClass.maxStudents
    ) {
      newClass.updateMaxStudents(updateData.maxStudents);
    }
    if (updateData.schedule && updateData.schedule !== existingClass.schedule) {
      newClass.updateSchedule(updateData.schedule);
    }
    if (
      updateData.classroom &&
      updateData.classroom !== existingClass.classroom
    ) {
      newClass.updateClassroom(updateData.classroom);
    }

    return newClass;
  }

  private mapToResponseDto(classEntity: Class): ClassResponseDto {
    return {
      id: classEntity.id!,
      classId: classEntity.classId,
      courseId: classEntity.courseId,
      academicYear: classEntity.academicYear,
      semester: classEntity.semester,
      instructor: classEntity.instructor,
      maxStudents: classEntity.maxStudents,
      schedule: classEntity.schedule,
      classroom: classEntity.classroom,
      createdAt: classEntity.createdAt!,
      updatedAt: classEntity.updatedAt!,
    };
  }
}
