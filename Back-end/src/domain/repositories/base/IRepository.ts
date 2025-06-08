/**
 * Base Repository Interface
 * Provides common CRUD operations for all domain repositories
 */
export interface IRepository<TEntity, TId = string> {
  /**
   * Find entity by ID
   * @param id - Entity identifier
   * @returns Promise of entity or null if not found
   */
  findById(id: TId): Promise<TEntity | null>;

  /**
   * Find all entities with optional pagination
   * @param limit - Maximum number of entities to return
   * @param offset - Number of entities to skip
   * @returns Promise of array of entities
   */
  findAll(limit?: number, offset?: number): Promise<TEntity[]>;

  /**
   * Count total number of entities
   * @returns Promise of total count
   */
  count(): Promise<number>;

  /**
   * Check if entity exists by ID
   * @param id - Entity identifier
   * @returns Promise of boolean indicating existence
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Save entity (create or update)
   * @param entity - Entity to save
   * @returns Promise of saved entity
   */
  save(entity: TEntity): Promise<TEntity>;

  /**
   * Create new entity
   * @param entity - Entity to create
   * @returns Promise of created entity
   */
  create(entity: TEntity): Promise<TEntity>;

  /**
   * Update existing entity
   * @param entity - Entity to update
   * @returns Promise of updated entity
   */
  update(entity: TEntity): Promise<TEntity>;

  /**
   * Delete entity by ID
   * @param id - Entity identifier
   * @returns Promise of boolean indicating success
   */
  delete(id: TId): Promise<boolean>;

  /**
   * Delete entity instance
   * @param entity - Entity to delete
   * @returns Promise of boolean indicating success
   */
  remove(entity: TEntity): Promise<boolean>;

  /**
   * Save multiple entities in batch
   * @param entities - Array of entities to save
   * @returns Promise of array of saved entities
   */
  saveMany(entities: TEntity[]): Promise<TEntity[]>;

  /**
   * Delete multiple entities by IDs
   * @param ids - Array of entity identifiers
   * @returns Promise of number of deleted entities
   */
  deleteMany(ids: TId[]): Promise<number>;
}

/**
 * Search and Filter Options
 */
export interface SearchOptions {
  /** Search query string */
  query?: string;
  /** Fields to search in */
  searchFields?: string[];
  /** Sort field and direction */
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  /** Pagination */
  pagination?: {
    limit: number;
    offset: number;
  };
}

/**
 * Query Result with Pagination Info
 */
export interface QueryResult<T> {
  /** Array of entities */
  data: T[];
  /** Total count of entities matching criteria */
  total: number;
  /** Current limit */
  limit: number;
  /** Current offset */
  offset: number;
  /** Whether there are more pages */
  hasMore: boolean;
}

/**
 * Extended Repository Interface with Search Capabilities
 */
export interface ISearchableRepository<TEntity, TId = string>
  extends IRepository<TEntity, TId> {
  /**
   * Search entities with options
   * @param options - Search and filter options
   * @returns Promise of query result with pagination
   */
  search(options: SearchOptions): Promise<QueryResult<TEntity>>;

  /**
   * Find entities by field value
   * @param field - Field name to search
   * @param value - Value to match
   * @returns Promise of array of matching entities
   */
  findByField(field: string, value: any): Promise<TEntity[]>;

  /**
   * Find single entity by field value
   * @param field - Field name to search
   * @param value - Value to match
   * @returns Promise of entity or null if not found
   */
  findOneByField(field: string, value: any): Promise<TEntity | null>;
}
