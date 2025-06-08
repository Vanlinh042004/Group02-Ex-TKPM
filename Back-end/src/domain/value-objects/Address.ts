/**
 * Address Value Object
 * Represents a physical address with validation
 */
export interface AddressProps {
  streetAddress?: string;
  ward?: string;
  district?: string;
  city?: string;
  country: string;
}

export class Address {
  private readonly _streetAddress?: string;
  private readonly _ward?: string;
  private readonly _district?: string;
  private readonly _city?: string;
  private readonly _country: string;

  constructor(props: AddressProps) {
    this.validate(props);

    this._streetAddress = props.streetAddress?.trim();
    this._ward = props.ward?.trim();
    this._district = props.district?.trim();
    this._city = props.city?.trim();
    this._country = props.country.trim();
  }

  private validate(props: AddressProps): void {
    if (!props.country || props.country.trim() === '') {
      throw new Error('Country is required for address');
    }

    if (props.country.trim().length < 2) {
      throw new Error('Country must be at least 2 characters long');
    }

    // Validate optional fields if provided
    if (props.streetAddress && props.streetAddress.trim().length > 200) {
      throw new Error('Street address must not exceed 200 characters');
    }

    if (props.ward && props.ward.trim().length > 100) {
      throw new Error('Ward must not exceed 100 characters');
    }

    if (props.district && props.district.trim().length > 100) {
      throw new Error('District must not exceed 100 characters');
    }

    if (props.city && props.city.trim().length > 100) {
      throw new Error('City must not exceed 100 characters');
    }
  }

  // Getters
  get streetAddress(): string | undefined {
    return this._streetAddress;
  }

  get ward(): string | undefined {
    return this._ward;
  }

  get district(): string | undefined {
    return this._district;
  }

  get city(): string | undefined {
    return this._city;
  }

  get country(): string {
    return this._country;
  }

  /**
   * Get full address as a formatted string
   */
  get fullAddress(): string {
    const parts: string[] = [];

    if (this._streetAddress) parts.push(this._streetAddress);
    if (this._ward) parts.push(this._ward);
    if (this._district) parts.push(this._district);
    if (this._city) parts.push(this._city);
    parts.push(this._country);

    return parts.join(', ');
  }

  /**
   * Check if address is considered complete (has city)
   */
  get isComplete(): boolean {
    return Boolean(this._city && this._country);
  }

  /**
   * Value objects equality based on value, not reference
   */
  equals(other: Address): boolean {
    if (!other) return false;

    return (
      this._streetAddress === other._streetAddress &&
      this._ward === other._ward &&
      this._district === other._district &&
      this._city === other._city &&
      this._country === other._country
    );
  }

  /**
   * Create a copy of the address with updated properties
   */
  updateWith(updates: Partial<AddressProps>): Address {
    return new Address({
      streetAddress: updates.streetAddress ?? this._streetAddress,
      ward: updates.ward ?? this._ward,
      district: updates.district ?? this._district,
      city: updates.city ?? this._city,
      country: updates.country ?? this._country,
    });
  }

  /**
   * Convert to plain object for serialization
   */
  toPlainObject(): AddressProps {
    return {
      streetAddress: this._streetAddress,
      ward: this._ward,
      district: this._district,
      city: this._city,
      country: this._country,
    };
  }

  /**
   * Create Address from plain object
   */
  static fromPlainObject(data: AddressProps): Address {
    return new Address(data);
  }
}
