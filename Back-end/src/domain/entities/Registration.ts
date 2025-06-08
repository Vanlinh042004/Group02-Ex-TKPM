import { BaseEntity } from './base/BaseEntity';

/**
 * Registration Status Enum
 */
export enum RegistrationStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
}

/**
 * Grade Status Enum
 */
export enum GradeStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
}

/**
 * Registration Props Interface
 */
export interface RegistrationProps {
  id?: string;
  studentId: string;
  classId: string;
  registrationDate: Date;
  grade?: number;
  status: RegistrationStatus;
  cancellationDate?: Date;
  cancellationReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Registration Domain Entity
 * Rich domain model with enrollment and grade management business logic
 */
export class Registration extends BaseEntity {
  private readonly _studentId: string;
  private readonly _classId: string;
  private readonly _registrationDate: Date;
  private _grade?: number;
  private _status: RegistrationStatus;
  private _cancellationDate?: Date;
  private _cancellationReason?: string;

  // Business constants
  private static readonly MIN_GRADE = 0;
  private static readonly MAX_GRADE = 10;
  private static readonly PASSING_GRADE = 5;

  constructor(props: RegistrationProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    this._studentId = props.studentId.trim();
    this._classId = props.classId.trim();
    this._registrationDate = props.registrationDate;
    this._grade = props.grade;
    this._status = props.status;
    this._cancellationDate = props.cancellationDate;
    this._cancellationReason = props.cancellationReason?.trim();

    this.validate();
  }

  getEntityName(): string {
    return 'Registration';
  }

  // Getters
  get studentId(): string {
    return this._studentId;
  }

  get classId(): string {
    return this._classId;
  }

  get registrationDate(): Date {
    return this._registrationDate;
  }

  get grade(): number | undefined {
    return this._grade;
  }

  get status(): RegistrationStatus {
    return this._status;
  }

  get cancellationDate(): Date | undefined {
    return this._cancellationDate;
  }

  get cancellationReason(): string | undefined {
    return this._cancellationReason;
  }

  // Validation methods
  private validateProps(props: RegistrationProps): void {
    if (!props.studentId?.trim()) {
      throw this.createValidationError('Student ID is required');
    }
    if (!props.classId?.trim()) {
      throw this.createValidationError('Class ID is required');
    }
    if (!props.registrationDate) {
      throw this.createValidationError('Registration date is required');
    }
    if (!Object.values(RegistrationStatus).includes(props.status)) {
      throw this.createValidationError('Invalid registration status');
    }
  }

  protected validate(): void {
    this.validateRegistrationDate();
    this.validateGrade();
    this.validateStatusConsistency();
    this.validateCancellationData();
  }

  private validateRegistrationDate(): void {
    const now = new Date();
    if (this._registrationDate > now) {
      throw this.createValidationError(
        'Registration date cannot be in the future'
      );
    }

    // Business rule: Registration date cannot be older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (this._registrationDate < oneYearAgo) {
      throw this.createValidationError(
        'Registration date cannot be older than 1 year'
      );
    }
  }

  private validateGrade(): void {
    if (this._grade !== undefined) {
      if (
        this._grade < Registration.MIN_GRADE ||
        this._grade > Registration.MAX_GRADE
      ) {
        throw this.createValidationError(
          `Grade must be between ${Registration.MIN_GRADE} and ${Registration.MAX_GRADE}`
        );
      }

      // Business rule: Cannot assign grade to cancelled registration
      if (this._status === RegistrationStatus.CANCELLED) {
        throw this.createValidationError(
          'Cannot assign grade to cancelled registration'
        );
      }
    }
  }

  private validateStatusConsistency(): void {
    // Business rule: Active registration must have valid registration date
    if (this._status === RegistrationStatus.ACTIVE) {
      if (!this._registrationDate) {
        throw this.createValidationError(
          'Active registration must have registration date'
        );
      }
    }
  }

  private validateCancellationData(): void {
    if (this._status === RegistrationStatus.CANCELLED) {
      if (!this._cancellationDate) {
        throw this.createValidationError(
          'Cancelled registration must have cancellation date'
        );
      }
      if (!this._cancellationReason?.trim()) {
        throw this.createValidationError(
          'Cancelled registration must have cancellation reason'
        );
      }
      if (this._cancellationDate < this._registrationDate) {
        throw this.createValidationError(
          'Cancellation date cannot be before registration date'
        );
      }
    } else {
      // Active registration should not have cancellation data
      if (this._cancellationDate || this._cancellationReason) {
        throw this.createValidationError(
          'Active registration cannot have cancellation data'
        );
      }
    }
  }

  // Business methods
  assignGrade(grade: number): void {
    if (this._status !== RegistrationStatus.ACTIVE) {
      throw this.createValidationError(
        'Can only assign grade to active registrations'
      );
    }

    if (grade < Registration.MIN_GRADE || grade > Registration.MAX_GRADE) {
      throw this.createValidationError(
        `Grade must be between ${Registration.MIN_GRADE} and ${Registration.MAX_GRADE}`
      );
    }

    this._grade = grade;
  }

  updateGrade(newGrade: number): void {
    if (this._grade === undefined) {
      throw this.createValidationError(
        'Cannot update grade that has not been assigned'
      );
    }

    this.assignGrade(newGrade);
  }

  cancel(reason: string): void {
    if (this._status === RegistrationStatus.CANCELLED) {
      throw this.createValidationError('Registration is already cancelled');
    }

    if (!reason?.trim()) {
      throw this.createValidationError('Cancellation reason is required');
    }

    this._status = RegistrationStatus.CANCELLED;
    this._cancellationDate = new Date();
    this._cancellationReason = reason.trim();

    // Business rule: Clear grade when cancelling
    this._grade = undefined;
  }

  reactivate(): void {
    if (this._status === RegistrationStatus.ACTIVE) {
      throw this.createValidationError('Registration is already active');
    }

    this._status = RegistrationStatus.ACTIVE;
    this._cancellationDate = undefined;
    this._cancellationReason = undefined;
  }

  // Business rule methods
  isActive(): boolean {
    return this._status === RegistrationStatus.ACTIVE;
  }

  isCancelled(): boolean {
    return this._status === RegistrationStatus.CANCELLED;
  }

  hasGrade(): boolean {
    return this._grade !== undefined;
  }

  isPassing(): boolean {
    return this.hasGrade() && this._grade! >= Registration.PASSING_GRADE;
  }

  isFailing(): boolean {
    return this.hasGrade() && this._grade! < Registration.PASSING_GRADE;
  }

  getGradeStatus(): GradeStatus {
    if (!this.hasGrade()) {
      return GradeStatus.PENDING;
    }
    return this.isPassing() ? GradeStatus.PASSED : GradeStatus.FAILED;
  }

  canBeModified(): boolean {
    return this.isActive();
  }

  canReceiveGrade(): boolean {
    return this.isActive();
  }

  // Static methods
  static create(props: RegistrationProps): Registration {
    return new Registration(props);
  }

  static createNew(studentId: string, classId: string): Registration {
    return new Registration({
      studentId,
      classId,
      registrationDate: new Date(),
      status: RegistrationStatus.ACTIVE,
    });
  }

  /**
   * Create Registration from legacy data
   */
  static fromLegacyData(data: any): Registration {
    return new Registration({
      id: data._id?.toString(),
      studentId: data.student?.toString() || data.student,
      classId: data.class?.toString() || data.class,
      registrationDate: data.registrationDate
        ? new Date(data.registrationDate)
        : new Date(),
      grade: data.grade,
      status:
        data.status === 'cancelled'
          ? RegistrationStatus.CANCELLED
          : RegistrationStatus.ACTIVE,
      cancellationDate: data.cancellationDate
        ? new Date(data.cancellationDate)
        : undefined,
      cancellationReason: data.cancellationReason,
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
      studentId: this._studentId,
      classId: this._classId,
      registrationDate: this._registrationDate,
      grade: this._grade,
      status: this._status,
      cancellationDate: this._cancellationDate,
      cancellationReason: this._cancellationReason,
      gradeStatus: this.getGradeStatus(),
      isPassing: this.isPassing(),
      canBeModified: this.canBeModified(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
