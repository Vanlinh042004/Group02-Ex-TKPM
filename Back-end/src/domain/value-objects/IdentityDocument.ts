/**
 * Identity Document Value Objects
 * Represents different types of identity documents with specific validation rules
 */

export enum IdentityDocumentType {
  CMND = 'CMND',
  CCCD = 'CCCD',
  PASSPORT = 'Hộ chiếu',
}

export interface IdentityDocumentProps {
  type: IdentityDocumentType;
  number: string;
  issueDate: Date;
  issuePlace: string;
  expiryDate: Date;
}

/**
 * Base Identity Document class
 */
export abstract class IdentityDocument {
  protected readonly _type: IdentityDocumentType;
  protected readonly _number: string;
  protected readonly _issueDate: Date;
  protected readonly _issuePlace: string;
  protected readonly _expiryDate: Date;

  constructor(props: IdentityDocumentProps) {
    this.validateBase(props);
    this.validateSpecific(props);

    this._type = props.type;
    this._number = props.number.trim();
    this._issueDate = props.issueDate;
    this._issuePlace = props.issuePlace.trim();
    this._expiryDate = props.expiryDate;
  }

  private validateBase(props: IdentityDocumentProps): void {
    if (!props.number || props.number.trim() === '') {
      throw new Error('Document number is required');
    }

    if (!props.issuePlace || props.issuePlace.trim() === '') {
      throw new Error('Issue place is required');
    }

    if (
      !(props.issueDate instanceof Date) ||
      isNaN(props.issueDate.getTime())
    ) {
      throw new Error('Issue date must be a valid date');
    }

    if (
      !(props.expiryDate instanceof Date) ||
      isNaN(props.expiryDate.getTime())
    ) {
      throw new Error('Expiry date must be a valid date');
    }

    if (props.issueDate > new Date()) {
      throw new Error('Issue date cannot be in the future');
    }

    if (props.expiryDate <= props.issueDate) {
      throw new Error('Expiry date must be after issue date');
    }
  }

  /**
   * Each document type has its own specific validation rules
   */
  protected abstract validateSpecific(props: IdentityDocumentProps): void;

  // Getters
  get type(): IdentityDocumentType {
    return this._type;
  }

  get number(): string {
    return this._number;
  }

  get issueDate(): Date {
    return this._issueDate;
  }

  get issuePlace(): string {
    return this._issuePlace;
  }

  get expiryDate(): Date {
    return this._expiryDate;
  }

  /**
   * Check if document is currently valid (not expired)
   */
  get isValid(): boolean {
    return this._expiryDate > new Date();
  }

  /**
   * Check if document will expire within given days
   */
  isExpiringWithin(days: number): boolean {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this._expiryDate <= futureDate;
  }

  /**
   * Get formatted document string
   */
  abstract getFormattedString(): string;

  /**
   * Convert to plain object
   */
  toPlainObject(): any {
    return {
      type: this._type,
      number: this._number,
      issueDate: this._issueDate,
      issuePlace: this._issuePlace,
      expiryDate: this._expiryDate,
    };
  }

  /**
   * Factory method to create appropriate document type
   */
  static create(props: IdentityDocumentProps & any): IdentityDocument {
    switch (props.type) {
      case IdentityDocumentType.CMND:
        return new CMND(props);
      case IdentityDocumentType.CCCD:
        return new CCCD(props);
      case IdentityDocumentType.PASSPORT:
        return new Passport(props);
      default:
        throw new Error(`Unsupported identity document type: ${props.type}`);
    }
  }
}

/**
 * CMND (Chứng minh nhân dân) - Old Vietnamese ID
 */
export class CMND extends IdentityDocument {
  constructor(props: IdentityDocumentProps) {
    super({ ...props, type: IdentityDocumentType.CMND });
  }

  protected validateSpecific(props: IdentityDocumentProps): void {
    // CMND should be 9 or 12 digits
    const numberPattern = /^\d{9}$|^\d{12}$/;
    if (!numberPattern.test(props.number.trim())) {
      throw new Error('CMND number must be 9 or 12 digits');
    }
  }

  getFormattedString(): string {
    return `CMND: ${this._number}`;
  }
}

/**
 * CCCD (Căn cước công dân) - New Vietnamese ID
 */
export interface CCCDProps extends IdentityDocumentProps {
  hasChip: boolean;
}

export class CCCD extends IdentityDocument {
  private readonly _hasChip: boolean;

  constructor(props: CCCDProps) {
    super({ ...props, type: IdentityDocumentType.CCCD });
    this._hasChip = props.hasChip;
  }

  protected validateSpecific(props: IdentityDocumentProps): void {
    // CCCD should be 12 digits
    const numberPattern = /^\d{12}$/;
    if (!numberPattern.test(props.number.trim())) {
      throw new Error('CCCD number must be 12 digits');
    }
  }

  get hasChip(): boolean {
    return this._hasChip;
  }

  getFormattedString(): string {
    return `CCCD${this._hasChip ? ' (có chip)' : ''}: ${this._number}`;
  }

  toPlainObject(): any {
    return {
      ...super.toPlainObject(),
      hasChip: this._hasChip,
    };
  }
}

/**
 * Passport
 */
export interface PassportProps extends IdentityDocumentProps {
  issuingCountry: string;
  notes?: string;
}

export class Passport extends IdentityDocument {
  private readonly _issuingCountry: string;
  private readonly _notes?: string;

  constructor(props: PassportProps) {
    super({ ...props, type: IdentityDocumentType.PASSPORT });

    if (!props.issuingCountry || props.issuingCountry.trim() === '') {
      throw new Error('Issuing country is required for passport');
    }

    this._issuingCountry = props.issuingCountry.trim();
    this._notes = props.notes?.trim();
  }

  protected validateSpecific(props: IdentityDocumentProps): void {
    // Passport number validation (letters and numbers, 6-9 characters)
    const numberPattern = /^[A-Z0-9]{6,9}$/;
    if (!numberPattern.test(props.number.trim().toUpperCase())) {
      throw new Error('Passport number must be 6-9 alphanumeric characters');
    }
  }

  get issuingCountry(): string {
    return this._issuingCountry;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  getFormattedString(): string {
    return `Passport (${this._issuingCountry}): ${this._number}`;
  }

  toPlainObject(): any {
    return {
      ...super.toPlainObject(),
      issuingCountry: this._issuingCountry,
      notes: this._notes,
    };
  }
}
