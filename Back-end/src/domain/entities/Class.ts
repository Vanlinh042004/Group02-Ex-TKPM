import { BaseEntity } from './base/BaseEntity';

/**
 * Class Props Interface
 */
export interface ClassProps {
  id?: string;
  classId: string;
  courseId: string; // Course reference
  academicYear: string;
  semester: string;
  instructor: string;
  maxStudents: number;
  schedule: string;
  classroom: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Class Domain Entity
 * Represents a class/course offering in a specific semester
 */
export class Class extends BaseEntity {
  private readonly _classId: string;
  private readonly _courseId: string;
  private readonly _academicYear: string;
  private readonly _semester: string;
  private _instructor: string;
  private _maxStudents: number;
  private _schedule: string;
  private _classroom: string;

  getEntityName(): string {
    return 'Class';
  }

  // Business constants
  private static readonly MIN_STUDENTS = 1;
  private static readonly MAX_STUDENTS = 200;
  private static readonly VALID_SEMESTERS = ['1', '2', '3', 'summer'];
  private static readonly ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{4}$/;

  constructor(props: ClassProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    this._classId = props.classId.trim();
    this._courseId = props.courseId.trim();
    this._academicYear = props.academicYear.trim();
    this._semester = props.semester.trim().toLowerCase();
    this._instructor = props.instructor.trim();
    this._maxStudents = props.maxStudents;
    this._schedule = props.schedule.trim();
    this._classroom = props.classroom.trim();

    this.validate();
  }

  // Getters
  get classId(): string {
    return this._classId;
  }

  get courseId(): string {
    return this._courseId;
  }

  get academicYear(): string {
    return this._academicYear;
  }

  get semester(): string {
    return this._semester;
  }

  get instructor(): string {
    return this._instructor;
  }

  get maxStudents(): number {
    return this._maxStudents;
  }

  get schedule(): string {
    return this._schedule;
  }

  get classroom(): string {
    return this._classroom;
  }

  // Validation methods
  private validateProps(props: ClassProps): void {
    if (!props.classId?.trim()) {
      throw this.createValidationError('Class ID is required');
    }
    if (!props.courseId?.trim()) {
      throw this.createValidationError('Course ID is required');
    }
    if (!props.academicYear?.trim()) {
      throw this.createValidationError('Academic year is required');
    }
    if (!props.semester?.trim()) {
      throw this.createValidationError('Semester is required');
    }
    if (!props.instructor?.trim()) {
      throw this.createValidationError('Instructor is required');
    }
    if (!props.schedule?.trim()) {
      throw this.createValidationError('Schedule is required');
    }
    if (!props.classroom?.trim()) {
      throw this.createValidationError('Classroom is required');
    }
    if (typeof props.maxStudents !== 'number' || props.maxStudents < 1) {
      throw this.createValidationError(
        'Max students must be a positive number'
      );
    }
  }

  protected validate(): void {
    this.validateClassId();
    this.validateAcademicYear();
    this.validateSemester();
    this.validateMaxStudents();
    this.validateInstructor();
    this.validateSchedule();
    this.validateClassroom();
  }

  private validateClassId(): void {
    if (this._classId.length < 3 || this._classId.length > 20) {
      throw this.createValidationError(
        'Class ID must be between 3 and 20 characters'
      );
    }

    if (!/^[A-Z0-9_-]+$/i.test(this._classId)) {
      throw this.createValidationError(
        'Class ID can only contain letters, numbers, hyphens, and underscores'
      );
    }
  }

  private validateAcademicYear(): void {
    if (!Class.ACADEMIC_YEAR_PATTERN.test(this._academicYear)) {
      throw this.createValidationError(
        'Academic year must be in format YYYY-YYYY (e.g., 2023-2024)'
      );
    }

    const [startYear, endYear] = this._academicYear.split('-').map(Number);
    if (endYear !== startYear + 1) {
      throw this.createValidationError(
        'Academic year end year must be start year + 1'
      );
    }

    const currentYear = new Date().getFullYear();
    if (startYear < currentYear - 5 || startYear > currentYear + 2) {
      throw this.createValidationError(
        'Academic year must be within reasonable range'
      );
    }
  }

  private validateSemester(): void {
    if (!Class.VALID_SEMESTERS.includes(this._semester)) {
      throw this.createValidationError(
        `Semester must be one of: ${Class.VALID_SEMESTERS.join(', ')}`
      );
    }
  }

  private validateMaxStudents(): void {
    if (
      this._maxStudents < Class.MIN_STUDENTS ||
      this._maxStudents > Class.MAX_STUDENTS
    ) {
      throw this.createValidationError(
        `Max students must be between ${Class.MIN_STUDENTS} and ${Class.MAX_STUDENTS}`
      );
    }
  }

  private validateInstructor(): void {
    if (this._instructor.length < 2 || this._instructor.length > 100) {
      throw this.createValidationError(
        'Instructor name must be between 2 and 100 characters'
      );
    }
  }

  private validateSchedule(): void {
    if (this._schedule.length < 5 || this._schedule.length > 200) {
      throw this.createValidationError(
        'Schedule must be between 5 and 200 characters'
      );
    }
  }

  private validateClassroom(): void {
    if (this._classroom.length < 2 || this._classroom.length > 50) {
      throw this.createValidationError(
        'Classroom must be between 2 and 50 characters'
      );
    }
  }

  // Business methods
  updateInstructor(newInstructor: string): void {
    if (!newInstructor?.trim()) {
      throw this.createValidationError('Instructor is required');
    }

    const instructor = newInstructor.trim();
    if (instructor.length < 2 || instructor.length > 100) {
      throw this.createValidationError(
        'Instructor name must be between 2 and 100 characters'
      );
    }

    this._instructor = instructor;
  }

  updateMaxStudents(newMaxStudents: number): void {
    if (
      typeof newMaxStudents !== 'number' ||
      newMaxStudents < Class.MIN_STUDENTS
    ) {
      throw this.createValidationError(
        'Max students must be a positive number'
      );
    }

    if (newMaxStudents > Class.MAX_STUDENTS) {
      throw this.createValidationError(
        `Max students cannot exceed ${Class.MAX_STUDENTS}`
      );
    }

    this._maxStudents = newMaxStudents;
  }

  updateSchedule(newSchedule: string): void {
    if (!newSchedule?.trim()) {
      throw this.createValidationError('Schedule is required');
    }

    const schedule = newSchedule.trim();
    if (schedule.length < 5 || schedule.length > 200) {
      throw this.createValidationError(
        'Schedule must be between 5 and 200 characters'
      );
    }

    this._schedule = schedule;
  }

  updateClassroom(newClassroom: string): void {
    if (!newClassroom?.trim()) {
      throw this.createValidationError('Classroom is required');
    }

    const classroom = newClassroom.trim();
    if (classroom.length < 2 || classroom.length > 50) {
      throw this.createValidationError(
        'Classroom must be between 2 and 50 characters'
      );
    }

    this._classroom = classroom;
  }

  // Business rules
  canReduceMaxStudents(
    newMaxStudents: number,
    currentEnrollment: number
  ): boolean {
    return newMaxStudents >= currentEnrollment;
  }

  hasAvailableSlots(currentEnrollment: number): boolean {
    return currentEnrollment < this._maxStudents;
  }

  getAvailableSlots(currentEnrollment: number): number {
    return Math.max(0, this._maxStudents - currentEnrollment);
  }

  isFullyEnrolled(currentEnrollment: number): boolean {
    return currentEnrollment >= this._maxStudents;
  }

  // Static methods
  static create(props: ClassProps): Class {
    return new Class(props);
  }

  /**
   * Create Class from legacy data
   */
  static fromLegacyData(data: any): Class {
    // Handle populated course data vs ObjectId
    let courseId: string;
    if (
      data.course &&
      typeof data.course === 'object' &&
      data.course.courseId
    ) {
      // Populated course object
      courseId = data.course.courseId;
    } else {
      // ObjectId string or direct courseId
      courseId = data.course?.toString() || data.course;
    }

    return new Class({
      id: data._id?.toString(),
      classId: data.classId,
      courseId: courseId,
      academicYear: data.academicYear,
      semester: data.semester,
      instructor: data.instructor,
      maxStudents: data.maxStudents,
      schedule: data.schedule,
      classroom: data.classroom,
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  /**
   * Convert to plain object for API responses
   */
  toPlainObject(): any {
    return {
      id: this.id,
      classId: this._classId,
      courseId: this._courseId,
      academicYear: this._academicYear,
      semester: this._semester,
      instructor: this._instructor,
      maxStudents: this._maxStudents,
      schedule: this._schedule,
      classroom: this._classroom,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
