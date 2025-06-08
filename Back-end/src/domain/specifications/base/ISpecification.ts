/**
 * Specification Pattern Interface
 * Allows for composable query conditions and business rules
 */
export interface ISpecification<T> {
  /**
   * Check if entity satisfies the specification
   * @param entity - Entity to check
   * @returns True if entity satisfies the specification
   */
  isSatisfiedBy(entity: T): boolean;

  /**
   * Combine with another specification using AND logic
   * @param other - Other specification to combine with
   * @returns Combined specification
   */
  and(other: ISpecification<T>): ISpecification<T>;

  /**
   * Combine with another specification using OR logic
   * @param other - Other specification to combine with
   * @returns Combined specification
   */
  or(other: ISpecification<T>): ISpecification<T>;

  /**
   * Negate the specification
   * @returns Negated specification
   */
  not(): ISpecification<T>;
}

/**
 * Abstract base specification class
 */
export abstract class BaseSpecification<T> implements ISpecification<T> {
  abstract isSatisfiedBy(entity: T): boolean;

  and(other: ISpecification<T>): ISpecification<T> {
    return new AndSpecification(this, other);
  }

  or(other: ISpecification<T>): ISpecification<T> {
    return new OrSpecification(this, other);
  }

  not(): ISpecification<T> {
    return new NotSpecification(this);
  }
}

/**
 * AND specification - combines two specifications with AND logic
 */
export class AndSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) && this.right.isSatisfiedBy(entity);
  }
}

/**
 * OR specification - combines two specifications with OR logic
 */
export class OrSpecification<T> extends BaseSpecification<T> {
  constructor(
    private left: ISpecification<T>,
    private right: ISpecification<T>
  ) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return this.left.isSatisfiedBy(entity) || this.right.isSatisfiedBy(entity);
  }
}

/**
 * NOT specification - negates a specification
 */
export class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private specification: ISpecification<T>) {
    super();
  }

  isSatisfiedBy(entity: T): boolean {
    return !this.specification.isSatisfiedBy(entity);
  }
}

/**
 * Repository interface that supports specifications
 */
export interface ISpecificationRepository<TEntity, TId = string> {
  /**
   * Find entities that satisfy the specification
   * @param specification - Specification to apply
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise of array of entities
   */
  findBySpecification(
    specification: ISpecification<TEntity>,
    limit?: number,
    offset?: number
  ): Promise<TEntity[]>;

  /**
   * Count entities that satisfy the specification
   * @param specification - Specification to apply
   * @returns Promise of count
   */
  countBySpecification(specification: ISpecification<TEntity>): Promise<number>;

  /**
   * Check if any entity satisfies the specification
   * @param specification - Specification to apply
   * @returns Promise of boolean
   */
  existsBySpecification(
    specification: ISpecification<TEntity>
  ): Promise<boolean>;
}
