import { BaseEntity } from './base/BaseEntity';

export interface FacultyProps {
  id?: string;
  facultyId: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Faculty Domain Entity
 * Represents an academic faculty/department
 */
export class Faculty extends BaseEntity {
  private readonly _facultyId: string;
  private _name: string;

  constructor(props: FacultyProps) {
    super(props.id, props.createdAt, props.updatedAt);

    this.validateProps(props);

    this._facultyId = props.facultyId.trim();
    this._name = props.name.trim();

    this.validate();
  }

  private validateProps(props: FacultyProps): void {
    this.isRequired(props.facultyId, 'Faculty ID');
    this.isRequired(props.name, 'Faculty name');

    // String length validations
    this.minLength(props.facultyId, 2, 'Faculty ID');
    this.maxLength(props.facultyId, 50, 'Faculty ID');
    this.minLength(props.name, 2, 'Faculty name');
    this.maxLength(props.name, 200, 'Faculty name');
  }

  protected validate(): void {
    this.validateFacultyId();
    this.validateName();
  }

  private validateFacultyId(): void {
    // Faculty ID should be alphanumeric and may contain hyphens, spaces, and Unicode chars
    // More flexible validation for existing data
    const facultyIdPattern =
      /^[\w\s\-\.àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]{2,100}$/i;
    if (!facultyIdPattern.test(this._facultyId)) {
      throw this.createValidationError(
        'Faculty ID must be 2-100 characters and contain valid characters'
      );
    }
  }

  private validateName(): void {
    // Name should not be empty after trimming
    if (this._name.length === 0) {
      throw this.createValidationError('Faculty name cannot be empty');
    }
  }

  protected getEntityName(): string {
    return 'Faculty';
  }

  // Getters
  get facultyId(): string {
    return this._facultyId;
  }

  get name(): string {
    return this._name;
  }

  // Business Methods
  public rename(newName: string): Faculty {
    this.isRequired(newName, 'New name');
    this.minLength(newName, 2, 'New name');
    this.maxLength(newName, 200, 'New name');

    return new Faculty({
      id: this._id,
      facultyId: this._facultyId,
      name: newName.trim(),
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Validates if faculty can accept students
   */
  canAcceptStudents(): boolean {
    return this._name.length > 0 && this._facultyId.length > 0;
  }

  /**
   * Creates a copy with updated properties
   */
  updateWith(updates: Partial<Pick<FacultyProps, 'name'>>): Faculty {
    return new Faculty({
      id: this._id,
      facultyId: this._facultyId,
      name: updates.name ?? this._name,
      createdAt: this._createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Converts entity to plain object for serialization
   */
  toPlainObject(): any {
    return {
      id: this._id,
      facultyId: this._facultyId,
      name: this._name,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  /**
   * Creates entity from plain object
   */
  static fromPlainObject(data: any): Faculty {
    return new Faculty({
      id: data.id,
      facultyId: data.facultyId,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  /**
   * Creates entity from legacy data (relaxed validation)
   * Used when loading existing data that may not meet current validation standards
   */
  static fromLegacyData(data: {
    id?: string;
    facultyId: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Faculty {
    // Create instance without going through strict constructor validation
    const faculty = Object.create(Faculty.prototype);

    // Set properties directly
    faculty._id = data.id;
    faculty._facultyId = data.facultyId || '';
    faculty._name = data.name || '';
    faculty._createdAt = data.createdAt || new Date();
    faculty._updatedAt = data.updatedAt || new Date();

    // Apply minimal validation for critical issues only
    if (!faculty._name || faculty._name.trim().length === 0) {
      throw faculty.createValidationError('Faculty name cannot be empty');
    }

    return faculty;
  }

  /**
   * Create a new faculty
   */
  static create(
    props: Omit<FacultyProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Faculty {
    return new Faculty({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
