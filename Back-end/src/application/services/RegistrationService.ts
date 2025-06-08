import {
  Registration,
  RegistrationStatus,
} from '../../domain/entities/Registration';
import { IRegistrationRepository } from '../../domain/repositories/IRegistrationRepository';
import { IStudentRepository } from '../../domain/repositories/IStudentRepository';
import { IClassRepository } from '../../domain/repositories/IClassRepository';
import { ICourseRepository } from '../repositories/ICourseRepository';
import {
  CreateRegistrationDto,
  UpdateRegistrationDto,
  AssignGradeDto,
  CancelRegistrationDto,
  RegistrationResponseDto,
  RegistrationFilterDto,
  TranscriptDto,
  RegistrationStatisticsDto,
  BulkUpdateStatusDto,
  SearchRegistrationsDto,
  SearchResultsDto,
  RegistrationWithPopulationDto,
} from '../dtos/RegistrationDto';

/**
 * Registration Application Service
 * Handles complex enrollment business logic, prerequisites validation,
 * grade management, and transcript generation
 */
export class RegistrationService {
  constructor(
    private registrationRepository: IRegistrationRepository,
    private studentRepository: IStudentRepository | null, // Optional for now
    private classRepository: IClassRepository,
    private courseRepository: ICourseRepository
  ) {}

  /**
   * Register student for a course (complex enrollment logic)
   */
  async registerCourse(
    dto: CreateRegistrationDto
  ): Promise<RegistrationResponseDto> {
    // 1. Basic validation - simplified for now
    if (!dto.studentId || !dto.classId) {
      throw new Error('Student ID and Class ID are required');
    }

    // TODO: Add student validation when Student repository is fully implemented

    // 2. Validate class exists
    const classEntity = await this.classRepository.findByClassId(dto.classId);
    if (!classEntity) {
      throw new Error('Class not found');
    }

    // 3. Validate course is active
    const course = await this.courseRepository.findByCourseId(
      classEntity.courseId
    );

    if (!course || !course.isActive) {
      throw new Error('Course is not active or does not exist');
    }

    // 4. Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const hasPrerequisites =
        await this.registrationRepository.hasStudentCompletedPrerequisites(
          dto.studentId,
          course.prerequisites
        );

      if (!hasPrerequisites) {
        throw new Error('Student has not completed prerequisite courses');
      }
    }

    // 5. Check class capacity
    const currentEnrollment =
      await this.registrationRepository.getActiveRegistrationCount(dto.classId);
    if (currentEnrollment >= classEntity.maxStudents) {
      throw new Error('Class is at maximum capacity');
    }

    // 6. Check duplicate registration
    const existingRegistration =
      await this.registrationRepository.isStudentRegisteredForClass(
        dto.studentId,
        dto.classId
      );

    if (existingRegistration) {
      throw new Error('Student is already registered for this class');
    }

    // 7. Create and save registration
    const registration = Registration.createNew(dto.studentId, dto.classId);
    const savedRegistration = await this.registrationRepository.create(
      registration
    );

    return this.mapToResponseDto(savedRegistration);
  }

  /**
   * Cancel registration
   */
  async cancelRegistration(
    id: string,
    dto: CancelRegistrationDto
  ): Promise<RegistrationResponseDto> {
    const registration = await this.registrationRepository.findById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Use domain method to cancel
    registration.cancel(dto.reason);

    const updatedRegistration = await this.registrationRepository.update(
      id,
      registration
    );
    if (!updatedRegistration) {
      throw new Error('Failed to cancel registration');
    }

    return this.mapToResponseDto(updatedRegistration);
  }

  /**
   * Assign or update grade
   */
  async assignGrade(
    id: string,
    dto: AssignGradeDto
  ): Promise<RegistrationResponseDto> {
    const registration = await this.registrationRepository.findById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Use domain method to assign grade
    if (registration.hasGrade()) {
      registration.updateGrade(dto.grade);
    } else {
      registration.assignGrade(dto.grade);
    }

    const updatedRegistration = await this.registrationRepository.update(
      id,
      registration
    );
    if (!updatedRegistration) {
      throw new Error('Failed to assign grade');
    }

    return this.mapToResponseDto(updatedRegistration);
  }

  /**
   * Update registration
   */
  async updateRegistration(
    id: string,
    dto: UpdateRegistrationDto
  ): Promise<RegistrationResponseDto> {
    const registration = await this.registrationRepository.findById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    // Handle grade update
    if (dto.grade !== undefined) {
      if (registration.hasGrade()) {
        registration.updateGrade(dto.grade);
      } else {
        registration.assignGrade(dto.grade);
      }
    }

    // Handle status update
    if (dto.status && dto.status !== registration.status) {
      if (dto.status === RegistrationStatus.CANCELLED) {
        if (!dto.cancellationReason) {
          throw new Error('Cancellation reason is required');
        }
        registration.cancel(dto.cancellationReason);
      } else if (dto.status === RegistrationStatus.ACTIVE) {
        registration.reactivate();
      }
    }

    const updatedRegistration = await this.registrationRepository.update(
      id,
      registration
    );
    if (!updatedRegistration) {
      throw new Error('Failed to update registration');
    }

    return this.mapToResponseDto(updatedRegistration);
  }

  /**
   * Get all registrations with optional filters
   */
  async getAllRegistrations(
    filters?: RegistrationFilterDto
  ): Promise<RegistrationResponseDto[]> {
    const criteria = filters ? this.mapFiltersToCriteria(filters) : undefined;
    const registrations = await this.registrationRepository.findAll(criteria);

    return registrations.map((registration) =>
      this.mapToResponseDto(registration)
    );
  }

  /**
   * Get registration by ID
   */
  async getRegistrationById(id: string): Promise<RegistrationResponseDto> {
    const registration = await this.registrationRepository.findById(id);
    if (!registration) {
      throw new Error('Registration not found');
    }

    return this.mapToResponseDto(registration);
  }

  /**
   * Get registrations by student
   */
  async getRegistrationsByStudent(
    studentId: string
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepository.findByStudentId(
      studentId
    );
    return registrations.map((registration) =>
      this.mapToResponseDto(registration)
    );
  }

  /**
   * Get registrations by class
   */
  async getRegistrationsByClass(
    classId: string
  ): Promise<RegistrationResponseDto[]> {
    const registrations = await this.registrationRepository.findByClassId(
      classId
    );
    return registrations.map((registration) =>
      this.mapToResponseDto(registration)
    );
  }

  /**
   * Generate student transcript
   */
  async generateTranscript(studentId: string): Promise<TranscriptDto> {
    // Simplified validation for now
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    const transcriptData =
      await this.registrationRepository.generateTranscriptData(studentId);

    return {
      studentInfo: {
        studentId: transcriptData.studentInfo.studentId,
        fullName: transcriptData.studentInfo.fullName,
        email: transcriptData.studentInfo.email,
        faculty: transcriptData.studentInfo.faculty,
        program: transcriptData.studentInfo.program,
        phoneNumberConfig: transcriptData.studentInfo.phoneNumberConfig,
        status: transcriptData.studentInfo.status,
      },
      courses: transcriptData.courses.map((course) => ({
        classId: course.classId,
        courseId: course.courseId,
        courseName: course.courseName,
        credits: course.credits,
        grade: course.grade,
        status: course.status,
      })),
      gpa: transcriptData.gpa,
      totalCredits: transcriptData.totalCredits,
    };
  }

  /**
   * Get registration statistics
   */
  async getRegistrationStatistics(
    classId?: string
  ): Promise<RegistrationStatisticsDto> {
    const stats = await this.registrationRepository.getRegistrationStatistics(
      classId
    );

    return {
      total: stats.total,
      active: stats.byStatus.active || 0,
      cancelled: stats.byStatus.cancelled || 0,
      averageGrade: stats.averageGrade,
      gradeDistribution: {
        excellent: stats.gradeDistribution['9-10'] || 0,
        good: stats.gradeDistribution['7-8.99'] || 0,
        average: stats.gradeDistribution['5-6.99'] || 0,
        poor: stats.gradeDistribution['0-4.99'] || 0,
      },
    };
  }

  /**
   * Bulk update registration status
   */
  async bulkUpdateStatus(dto: BulkUpdateStatusDto): Promise<number> {
    if (dto.status === RegistrationStatus.CANCELLED && !dto.reason) {
      throw new Error('Cancellation reason is required for bulk cancellation');
    }

    return await this.registrationRepository.bulkUpdateStatus(
      dto.registrationIds,
      dto.status
    );
  }

  /**
   * Search registrations
   */
  async searchRegistrations(
    dto: SearchRegistrationsDto
  ): Promise<SearchResultsDto<RegistrationResponseDto>> {
    const criteria = dto.filters
      ? this.mapFiltersToCriteria(dto.filters)
      : undefined;
    const result = await this.registrationRepository.searchRegistrations(
      criteria,
      dto.limit,
      dto.offset
    );

    return {
      results: result.results.map((registration) =>
        this.mapToResponseDto(registration)
      ),
      total: result.total,
      limit: dto.limit || 20,
      offset: dto.offset || 0,
    };
  }

  // Legacy API compatibility methods
  /**
   * Get all registrations with population for legacy API
   */
  async getAllRegistrationsWithPopulation(): Promise<
    RegistrationWithPopulationDto[]
  > {
    return await this.registrationRepository.findAllWithPopulation();
  }

  /**
   * Get students in class with population for legacy API
   */
  async getStudentsInClassWithPopulation(
    classId: string
  ): Promise<RegistrationWithPopulationDto[]> {
    return await this.registrationRepository.findStudentsInClassWithPopulation(
      classId
    );
  }

  // Private helper methods
  private mapToResponseDto(
    registration: Registration
  ): RegistrationResponseDto {
    const plainObject = registration.toPlainObject();

    return {
      id: plainObject.id,
      studentId: plainObject.studentId,
      classId: plainObject.classId,
      registrationDate: plainObject.registrationDate,
      grade: plainObject.grade,
      status: plainObject.status,
      cancellationDate: plainObject.cancellationDate,
      cancellationReason: plainObject.cancellationReason,
      gradeStatus: plainObject.gradeStatus,
      isPassing: plainObject.isPassing,
      canBeModified: plainObject.canBeModified,
      createdAt: plainObject.createdAt,
      updatedAt: plainObject.updatedAt,
    };
  }

  private mapFiltersToCriteria(filters: RegistrationFilterDto): any {
    const criteria: any = {};

    if (filters.studentId) {
      criteria.studentId = filters.studentId;
    }
    if (filters.classId) {
      criteria.classId = filters.classId;
    }
    if (filters.status) {
      criteria.status = filters.status;
    }
    if (filters.minGrade !== undefined || filters.maxGrade !== undefined) {
      criteria.gradeRange = {
        min: filters.minGrade,
        max: filters.maxGrade,
      };
    }
    if (filters.registrationDateFrom || filters.registrationDateTo) {
      criteria.registrationDateRange = {
        from: filters.registrationDateFrom,
        to: filters.registrationDateTo,
      };
    }

    return criteria;
  }
}
