export interface StatusData {
  statusId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const validStatuses = [
  'Đang học',
  'Đã tốt nghiệp',
  'Đã thôi học',
  'Bảo lưu',
  'Đình chỉ',
];

export const statusTransitionRules: Record<string, string[]> = {
  'Đang học': [
    'Bảo lưu',
    'Đã tốt nghiệp',
    'Đình chỉ',
    'Đã thôi học',
    'Đang học',
  ],
  'Bảo lưu': ['Đang học', 'Đình chỉ', 'Đã thôi học', 'Bảo lưu'],
  'Đã tốt nghiệp': ['Đã tốt nghiệp'],
  'Đã thôi học': ['Đã thôi học'],
  'Đình chỉ': ['Đã thôi học', 'Đang học', 'Đình chỉ'],
};

export class Status {
  private constructor(
    private readonly _statusId: string,
    private _name: string,
    private _description: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(name: string, description: string = ''): Status {
    this.validateName(name);
    this.validateDescription(description);

    const now = new Date();
    const statusId = this.generateStatusId(name);

    return new Status(statusId, name.trim(), description.trim(), now, now);
  }

  static fromData(data: StatusData): Status {
    return new Status(
      data.statusId,
      data.name,
      data.description || '',
      data.createdAt,
      data.updatedAt
    );
  }

  static fromLegacyData(legacyData: any): Status {
    const statusId =
      legacyData._id?.toString() || this.generateStatusId(legacyData.name);

    return new Status(
      statusId,
      legacyData.name || '',
      legacyData.description || '',
      legacyData.createdAt || new Date(),
      legacyData.updatedAt || new Date()
    );
  }

  private static validateName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Status name is required');
    }

    if (name.trim().length < 2) {
      throw new Error('Status name must be at least 2 characters long');
    }

    if (name.trim().length > 50) {
      throw new Error('Status name must not exceed 50 characters');
    }

    if (!validStatuses.includes(name.trim())) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      );
    }
  }

  private static validateDescription(description: string): void {
    if (description && description.length > 500) {
      throw new Error('Status description must not exceed 500 characters');
    }
  }

  private static generateStatusId(name: string): string {
    return name
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('');
  }

  // Getters
  get statusId(): string {
    return this._statusId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  rename(newName: string): void {
    Status.validateName(newName);
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    Status.validateDescription(newDescription);
    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  canTransitionTo(targetStatus: string): boolean {
    const allowedTransitions = statusTransitionRules[this._name] || [];
    return allowedTransitions.includes(targetStatus);
  }

  isActive(): boolean {
    return this._name === 'Đang học';
  }

  isGraduated(): boolean {
    return this._name === 'Đã tốt nghiệp';
  }

  isDroppedOut(): boolean {
    return this._name === 'Đã thôi học';
  }

  isOnLeave(): boolean {
    return this._name === 'Bảo lưu';
  }

  isSuspended(): boolean {
    return this._name === 'Đình chỉ';
  }

  isFinal(): boolean {
    return this.isGraduated() || this.isDroppedOut();
  }

  toData(): StatusData {
    return {
      statusId: this._statusId,
      name: this._name,
      description: this._description,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
