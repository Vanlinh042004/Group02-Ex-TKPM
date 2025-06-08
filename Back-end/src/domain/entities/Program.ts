import { BaseEntity } from './base/BaseEntity';

export interface ProgramProps {
  id?: string;
  programId: string;
  name: string;
  duration: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Program Domain Entity
 * Represents an academic program (e.g., Regular, Advanced, High Quality, etc.)
 */
export class Program extends BaseEntity {
  private readonly _programId: string;
  private _name: string;
  private _duration: number;
  private _isActive: boolean;

  constructor(props: ProgramProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    this._programId = props.programId.trim();
    this._name = props.name.trim();
    this._duration = props.duration;
    this._isActive = props.isActive ?? true;

    this.validate();
  }

  private validateProps(props: ProgramProps): void {
    this.isRequired(props.programId, 'Program ID');
    this.isRequired(props.name, 'Program name');
    this.isRequired(props.duration, 'Program duration');

    // String length validations
    this.minLength(props.programId, 1, 'Program ID');
    this.maxLength(props.programId, 20, 'Program ID');
    this.minLength(props.name, 2, 'Program name');
    this.maxLength(props.name, 100, 'Program name');
  }

  protected validate(): void {
    this.validateProgramId();
    this.validateName();
    this.validateDuration();
  }

  private validateProgramId(): void {
    // Program ID should be alphanumeric and may contain hyphens
    const programIdPattern = /^[A-Za-z0-9\-]{1,20}$/;
    if (!programIdPattern.test(this._programId)) {
      throw this.createValidationError(
        'Program ID must contain only letters, numbers, and hyphens (1-20 characters)'
      );
    }
  }

  private validateName(): void {
    if (this._name.length === 0) {
      throw this.createValidationError('Program name cannot be empty');
    }
  }

  private validateDuration(): void {
    if (this._duration <= 0) {
      throw this.createValidationError(
        'Program duration must be greater than 0'
      );
    }

    if (this._duration > 10) {
      throw this.createValidationError(
        'Program duration cannot exceed 10 years'
      );
    }

    // Duration should be reasonable (0.5 year increments)
    const validDuration = this._duration * 2 === Math.floor(this._duration * 2);
    if (!validDuration) {
      throw this.createValidationError(
        'Program duration must be in 0.5 year increments'
      );
    }
  }

  protected getEntityName(): string {
    return 'Program';
  }

  // Getters
  get programId(): string {
    return this._programId;
  }

  get name(): string {
    return this._name;
  }

  get duration(): number {
    return this._duration;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  // Business Methods
  public rename(newName: string): Program {
    this.isRequired(newName, 'New name');
    this.minLength(newName, 2, 'New name');
    this.maxLength(newName, 100, 'New name');

    return new Program({
      id: this._id,
      programId: this._programId,
      name: newName.trim(),
      duration: this._duration,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  public updateDuration(newDuration: number): Program {
    this.isRequired(newDuration, 'New duration');

    if (newDuration <= 0) {
      throw this.createValidationError(
        'Program duration must be greater than 0'
      );
    }

    return new Program({
      id: this._id,
      programId: this._programId,
      name: this._name,
      duration: newDuration,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  public activate(): Program {
    return new Program({
      id: this._id,
      programId: this._programId,
      name: this._name,
      duration: this._duration,
      isActive: true,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  public deactivate(): Program {
    return new Program({
      id: this._id,
      programId: this._programId,
      name: this._name,
      duration: this._duration,
      isActive: false,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Validates if program can accept students
   */
  canAcceptStudents(): boolean {
    return this._isActive && this._duration > 0;
  }

  /**
   * Gets total duration in semesters (assuming 2 semesters per year)
   */
  getDurationInSemesters(): number {
    return Math.ceil(this._duration * 2);
  }

  /**
   * Converts entity to plain object for serialization
   */
  toPlainObject(): any {
    return {
      id: this._id,
      programId: this._programId,
      name: this._name,
      duration: this._duration,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Creates entity from plain object
   */
  static fromPlainObject(data: any): Program {
    return new Program({
      id: data.id,
      programId: data.programId,
      name: data.name,
      duration: data.duration,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Creates entity from legacy data (relaxed validation)
   */
  static fromLegacyData(data: {
    id?: string;
    programId: string;
    name: string;
    duration: number;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): Program {
    const program = Object.create(Program.prototype);

    program._id = data.id;
    program._programId = data.programId || '';
    program._name = data.name || '';
    program._duration = data.duration || 0;
    program._isActive = data.isActive ?? true;
    program._createdAt = data.createdAt || new Date();
    program._updatedAt = data.updatedAt || new Date();

    // Apply minimal validation for critical issues only
    if (!program._name || program._name.trim().length === 0) {
      throw program.createValidationError('Program name cannot be empty');
    }

    if (program._duration <= 0) {
      throw program.createValidationError(
        'Program duration must be greater than 0'
      );
    }

    return program;
  }

  /**
   * Create a new program
   */
  static create(
    props: Omit<ProgramProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Program {
    return new Program({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
