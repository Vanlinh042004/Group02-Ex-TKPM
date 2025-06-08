export interface CourseData {
  courseId: string;
  name: string;
  credits: number;
  facultyId: string;
  description?: string;
  prerequisites: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Course {
  private static readonly THIRTY_MINUTES_MS = 30 * 60 * 1000;
  private static readonly MIN_CREDITS = 1;
  private static readonly MAX_CREDITS = 6;

  private constructor(
    private readonly _courseId: string,
    private _name: string,
    private _credits: number,
    private readonly _facultyId: string,
    private _description: string,
    private _prerequisites: string[],
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date
  ) {}

  static create(
    courseId: string,
    name: string,
    credits: number,
    facultyId: string,
    description: string = '',
    prerequisites: string[] = []
  ): Course {
    this.validateCourseId(courseId);
    this.validateName(name);
    this.validateCredits(credits);
    this.validateFacultyId(facultyId);
    this.validateDescription(description);
    this.validatePrerequisites(prerequisites);

    const now = new Date();

    return new Course(
      courseId.trim().toUpperCase(),
      name.trim(),
      credits,
      facultyId,
      description.trim(),
      prerequisites,
      true,
      now,
      now
    );
  }

  static fromData(data: CourseData): Course {
    return new Course(
      data.courseId,
      data.name,
      data.credits,
      data.facultyId,
      data.description || '',
      data.prerequisites || [],
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }

  static fromLegacyData(legacyData: any): Course {
    const prerequisites = Array.isArray(legacyData.prerequisites)
      ? legacyData.prerequisites.map((p: any) => {
          // If prerequisite is populated with courseId, use it
          if (p.courseId) return p.courseId;
          // If it's an ObjectId, convert to string
          if (p._id) return p._id.toString();
          // If it's just a string, use as is
          return p.toString();
        })
      : [];

    return new Course(
      legacyData.courseId || '',
      legacyData.name || '',
      legacyData.credits || 2,
      legacyData.faculty?._id?.toString() ||
        legacyData.faculty?.toString() ||
        '',
      legacyData.description || '',
      prerequisites,
      legacyData.isActive !== undefined ? legacyData.isActive : true,
      legacyData.createdAt || new Date(),
      legacyData.updatedAt || new Date()
    );
  }

  private static validateCourseId(courseId: string): void {
    if (!courseId?.trim()) {
      throw new Error('Course ID is required');
    }

    if (courseId.trim().length < 2 || courseId.trim().length > 20) {
      throw new Error('Course ID must be between 2 and 20 characters');
    }

    if (!/^[A-Z0-9_-]+$/i.test(courseId.trim())) {
      throw new Error(
        'Course ID can only contain letters, numbers, underscores and hyphens'
      );
    }
  }

  private static validateName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Course name is required');
    }

    if (name.trim().length < 2) {
      throw new Error('Course name must be at least 2 characters long');
    }

    if (name.trim().length > 200) {
      throw new Error('Course name must not exceed 200 characters');
    }
  }

  private static validateCredits(credits: number): void {
    if (typeof credits !== 'number' || !Number.isInteger(credits)) {
      throw new Error('Credits must be a valid integer');
    }

    if (credits < this.MIN_CREDITS || credits > this.MAX_CREDITS) {
      throw new Error(
        `Credits must be between ${this.MIN_CREDITS} and ${this.MAX_CREDITS}`
      );
    }
  }

  private static validateFacultyId(facultyId: string): void {
    if (!facultyId?.trim()) {
      throw new Error('Faculty ID is required');
    }
  }

  private static validateDescription(description: string): void {
    if (description && description.length > 1000) {
      throw new Error('Course description must not exceed 1000 characters');
    }
  }

  private static validatePrerequisites(prerequisites: string[]): void {
    if (!Array.isArray(prerequisites)) {
      throw new Error('Prerequisites must be an array');
    }

    if (prerequisites.length > 10) {
      throw new Error('Course cannot have more than 10 prerequisites');
    }

    // Check for duplicates
    const uniquePrereqs = new Set(prerequisites);
    if (uniquePrereqs.size !== prerequisites.length) {
      throw new Error('Prerequisites cannot contain duplicates');
    }
  }

  // Getters
  get courseId(): string {
    return this._courseId;
  }

  get name(): string {
    return this._name;
  }

  get credits(): number {
    return this._credits;
  }

  get facultyId(): string {
    return this._facultyId;
  }

  get description(): string {
    return this._description;
  }

  get prerequisites(): string[] {
    return [...this._prerequisites];
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  updateName(newName: string): void {
    Course.validateName(newName);
    this._name = newName.trim();
    this._updatedAt = new Date();
  }

  updateCredits(newCredits: number): void {
    Course.validateCredits(newCredits);
    this._credits = newCredits;
    this._updatedAt = new Date();
  }

  updateDescription(newDescription: string): void {
    Course.validateDescription(newDescription);
    this._description = newDescription.trim();
    this._updatedAt = new Date();
  }

  addPrerequisite(prerequisiteId: string): void {
    if (this._prerequisites.includes(prerequisiteId)) {
      throw new Error('Prerequisite already exists');
    }

    if (prerequisiteId === this._courseId) {
      throw new Error('Course cannot be a prerequisite of itself');
    }

    const newPrerequisites = [...this._prerequisites, prerequisiteId];
    Course.validatePrerequisites(newPrerequisites);

    this._prerequisites = newPrerequisites;
    this._updatedAt = new Date();
  }

  removePrerequisite(prerequisiteId: string): void {
    const index = this._prerequisites.indexOf(prerequisiteId);
    if (index === -1) {
      throw new Error('Prerequisite not found');
    }

    this._prerequisites.splice(index, 1);
    this._updatedAt = new Date();
  }

  updatePrerequisites(newPrerequisites: string[]): void {
    Course.validatePrerequisites(newPrerequisites);

    // Check for self-reference
    if (newPrerequisites.includes(this._courseId)) {
      throw new Error('Course cannot be a prerequisite of itself');
    }

    this._prerequisites = [...newPrerequisites];
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  // Business rule: 30-minute deletion rule
  canBeDeleted(): boolean {
    const timeElapsed = Date.now() - this._createdAt.getTime();
    return timeElapsed <= Course.THIRTY_MINUTES_MS;
  }

  getTimeRemainingForDeletion(): number {
    const timeElapsed = Date.now() - this._createdAt.getTime();
    const remaining = Course.THIRTY_MINUTES_MS - timeElapsed;
    return Math.max(0, remaining);
  }

  // Validation helpers
  hasPrerequisite(prerequisiteId: string): boolean {
    return this._prerequisites.includes(prerequisiteId);
  }

  hasPrerequisites(): boolean {
    return this._prerequisites.length > 0;
  }

  isAdvancedCourse(): boolean {
    return this._credits >= 4;
  }

  // Check for circular dependency in prerequisites
  wouldCreateCircularDependency(
    potentialPrerequisite: string,
    allCourses: Course[]
  ): boolean {
    // This would be implemented with a graph traversal algorithm
    // For now, just check direct self-reference
    return potentialPrerequisite === this._courseId;
  }

  toData(): CourseData {
    return {
      courseId: this._courseId,
      name: this._name,
      credits: this._credits,
      facultyId: this._facultyId,
      description: this._description,
      prerequisites: [...this._prerequisites],
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
