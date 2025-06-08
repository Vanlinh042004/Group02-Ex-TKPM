/**
 * Base Entity
 * Provides common functionality for all domain entities
 */
export abstract class BaseEntity {
  protected readonly _id?: string;
  protected readonly _createdAt: Date;
  protected readonly _updatedAt: Date;

  constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  /**
   * Get entity ID
   */
  get id(): string | undefined {
    return this._id;
  }

  /**
   * Get creation date
   */
  get createdAt(): Date {
    return this._createdAt;
  }

  /**
   * Get last update date
   */
  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * Check if entity has been persisted (has ID)
   */
  get isPersisted(): boolean {
    return this._id !== undefined && this._id !== '';
  }

  /**
   * Check if two entities are the same
   */
  equals(other: BaseEntity): boolean {
    if (!this._id || !other._id) {
      return false;
    }
    return this._id === other._id;
  }

  /**
   * Abstract method for validation
   * Each entity must implement its own validation logic
   */
  protected abstract validate(): void;

  /**
   * Abstract method to get entity name for error messages
   */
  protected abstract getEntityName(): string;

  /**
   * Create validation error with entity context
   */
  protected createValidationError(message: string): Error {
    return new Error(`${this.getEntityName()} validation error: ${message}`);
  }

  /**
   * Check if a value is not null, undefined, or empty string
   */
  protected isRequired(value: any, fieldName: string): void {
    if (value === null || value === undefined || value === '') {
      throw this.createValidationError(`${fieldName} is required`);
    }
  }

  /**
   * Check if a string meets minimum length requirement
   */
  protected minLength(value: string, minLen: number, fieldName: string): void {
    if (!value || value.length < minLen) {
      throw this.createValidationError(
        `${fieldName} must be at least ${minLen} characters long`
      );
    }
  }

  /**
   * Check if a string doesn't exceed maximum length
   */
  protected maxLength(value: string, maxLen: number, fieldName: string): void {
    if (value && value.length > maxLen) {
      throw this.createValidationError(
        `${fieldName} must not exceed ${maxLen} characters`
      );
    }
  }

  /**
   * Check if email format is valid
   */
  protected isValidEmail(email: string, fieldName: string = 'Email'): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw this.createValidationError(`${fieldName} format is invalid`);
    }
  }

  /**
   * Check if date is valid and not in the future (for birthdates, etc.)
   */
  protected isValidPastDate(date: Date, fieldName: string): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw this.createValidationError(`${fieldName} must be a valid date`);
    }
    if (date > new Date()) {
      throw this.createValidationError(`${fieldName} cannot be in the future`);
    }
  }

  /**
   * Check if value is in allowed list
   */
  protected isInAllowedValues<T>(
    value: T,
    allowedValues: T[],
    fieldName: string
  ): void {
    if (!allowedValues.includes(value)) {
      throw this.createValidationError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`
      );
    }
  }
}
