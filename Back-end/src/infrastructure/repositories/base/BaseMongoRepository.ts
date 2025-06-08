import {
  Document,
  Model,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from 'mongoose';
import {
  IRepository,
  SearchOptions,
  QueryResult,
} from '../../../domain/repositories/base/IRepository';

/**
 * Base MongoDB Repository
 * Provides common MongoDB operations for all repository implementations
 */
export abstract class BaseMongoRepository<TEntity, TDocument extends Document>
  implements IRepository<TEntity, string>
{
  constructor(protected readonly model: Model<TDocument>) {}

  /**
   * Abstract method to convert MongoDB document to domain entity
   * Each repository must implement this mapping logic
   */
  protected abstract toDomainEntity(document: TDocument): TEntity;

  /**
   * Abstract method to convert domain entity to MongoDB document data
   * Each repository must implement this mapping logic
   */
  protected abstract toDocumentData(entity: TEntity): Partial<TDocument>;

  /**
   * Convert MongoDB documents array to domain entities array
   */
  protected toDomainEntities(documents: TDocument[]): TEntity[] {
    return documents.map((doc) => this.toDomainEntity(doc));
  }

  // === Basic CRUD Operations ===

  async findById(id: string): Promise<TEntity | null> {
    try {
      const document = await this.model.findById(id).exec();
      return document ? this.toDomainEntity(document) : null;
    } catch (error) {
      this.handleError('findById', error, { id });
      return null;
    }
  }

  async findAll(limit?: number, offset?: number): Promise<TEntity[]> {
    try {
      const query = this.model.find();

      if (offset) {
        query.skip(offset);
      }

      if (limit) {
        query.limit(limit);
      }

      const documents = await query.exec();
      return this.toDomainEntities(documents);
    } catch (error) {
      this.handleError('findAll', error, { limit, offset });
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      return await this.model.countDocuments().exec();
    } catch (error) {
      this.handleError('count', error);
      return 0;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const document = await this.model.findById(id).select('_id').exec();
      return !!document;
    } catch (error) {
      this.handleError('exists', error, { id });
      return false;
    }
  }

  async save(entity: TEntity): Promise<TEntity> {
    try {
      const documentData = this.toDocumentData(entity);

      // If entity has an ID, update; otherwise, create
      if (this.hasId(entity)) {
        return await this.update(entity);
      } else {
        return await this.create(entity);
      }
    } catch (error) {
      this.handleError('save', error, { entity });
      throw error;
    }
  }

  async create(entity: TEntity): Promise<TEntity> {
    try {
      const documentData = this.toDocumentData(entity);
      const document = new this.model(documentData);
      const savedDocument = await document.save();
      return this.toDomainEntity(savedDocument as TDocument);
    } catch (error) {
      this.handleError('create', error, { entity });
      throw error;
    }
  }

  async update(entity: TEntity): Promise<TEntity> {
    try {
      const id = this.getEntityId(entity);
      if (!id) {
        throw new Error('Entity must have an ID to be updated');
      }

      const documentData = this.toDocumentData(entity);
      const updatedDocument = await this.model
        .findByIdAndUpdate(id, documentData as UpdateQuery<TDocument>, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedDocument) {
        throw new Error(`Entity with ID ${id} not found for update`);
      }

      return this.toDomainEntity(updatedDocument);
    } catch (error) {
      this.handleError('update', error, { entity });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      this.handleError('delete', error, { id });
      return false;
    }
  }

  async remove(entity: TEntity): Promise<boolean> {
    const id = this.getEntityId(entity);
    if (!id) {
      return false;
    }
    return await this.delete(id);
  }

  async saveMany(entities: TEntity[]): Promise<TEntity[]> {
    try {
      const documentDataArray = entities.map((entity) =>
        this.toDocumentData(entity)
      );
      const documents = await this.model.insertMany(documentDataArray);
      return this.toDomainEntities(documents as unknown as TDocument[]);
    } catch (error) {
      this.handleError('saveMany', error, { count: entities.length });
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<number> {
    try {
      const result = await this.model
        .deleteMany({
          _id: { $in: ids },
        } as FilterQuery<TDocument>)
        .exec();
      return result.deletedCount || 0;
    } catch (error) {
      this.handleError('deleteMany', error, { ids });
      return 0;
    }
  }

  // === Search Operations ===

  /**
   * Generic search with MongoDB query and options
   */
  protected async findByQuery(
    query: FilterQuery<TDocument>,
    options?: {
      limit?: number;
      offset?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
    }
  ): Promise<TEntity[]> {
    try {
      const mongoQuery = this.model.find(query);

      if (options?.offset) {
        mongoQuery.skip(options.offset);
      }

      if (options?.limit) {
        mongoQuery.limit(options.limit);
      }

      if (options?.sort) {
        mongoQuery.sort(options.sort);
      }

      if (options?.populate) {
        mongoQuery.populate(options.populate);
      }

      const documents = await mongoQuery.exec();
      return this.toDomainEntities(documents);
    } catch (error) {
      this.handleError('findByQuery', error, { query, options });
      return [];
    }
  }

  /**
   * Generic search with count for pagination
   */
  protected async searchWithCount(
    query: FilterQuery<TDocument>,
    options?: {
      limit?: number;
      offset?: number;
      sort?: Record<string, 1 | -1>;
      populate?: string | string[];
    }
  ): Promise<QueryResult<TEntity>> {
    try {
      const [documents, total] = await Promise.all([
        this.findByQuery(query, options),
        this.model.countDocuments(query).exec(),
      ]);

      const limit = options?.limit || 20;
      const offset = options?.offset || 0;

      return {
        data: documents,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      this.handleError('searchWithCount', error, { query, options });
      return {
        data: [],
        total: 0,
        limit: options?.limit || 20,
        offset: options?.offset || 0,
        hasMore: false,
      };
    }
  }

  /**
   * Find by specific field value
   */
  async findByField(field: string, value: any): Promise<TEntity[]> {
    const query = { [field]: value } as FilterQuery<TDocument>;
    return await this.findByQuery(query);
  }

  /**
   * Find single entity by field value
   */
  async findOneByField(field: string, value: any): Promise<TEntity | null> {
    try {
      const query = { [field]: value } as FilterQuery<TDocument>;
      const document = await this.model.findOne(query).exec();
      return document ? this.toDomainEntity(document) : null;
    } catch (error) {
      this.handleError('findOneByField', error, { field, value });
      return null;
    }
  }

  // === Helper Methods ===

  /**
   * Check if entity has an ID (for determining create vs update)
   */
  protected abstract hasId(entity: TEntity): boolean;

  /**
   * Get entity ID for operations that require it
   */
  protected abstract getEntityId(entity: TEntity): string | undefined;

  /**
   * Handle and log errors consistently
   */
  protected handleError(operation: string, error: any, context?: any): void {
    const errorMessage = `MongoDB ${this.constructor.name} ${operation} failed`;
    console.error(errorMessage, {
      error: error.message,
      stack: error.stack,
      context,
    });

    // In a real application, you might want to use a proper logging service
    // and potentially convert to domain-specific errors
  }

  /**
   * Build text search query for MongoDB
   */
  protected buildTextSearchQuery(
    searchText: string,
    fields: string[]
  ): FilterQuery<TDocument> {
    if (!searchText || !fields.length) {
      return {};
    }

    const searchRegex = new RegExp(searchText, 'i');
    const orConditions = fields.map((field) => ({
      [field]: searchRegex,
    }));

    return { $or: orConditions } as FilterQuery<TDocument>;
  }

  /**
   * Build date range query
   */
  protected buildDateRangeQuery(
    field: string,
    from?: Date,
    to?: Date
  ): FilterQuery<TDocument> {
    if (!from && !to) {
      return {};
    }

    const dateQuery: any = {};
    if (from) {
      dateQuery.$gte = from;
    }
    if (to) {
      dateQuery.$lte = to;
    }

    return { [field]: dateQuery } as FilterQuery<TDocument>;
  }

  /**
   * Build numeric range query
   */
  protected buildNumericRangeQuery(
    field: string,
    min?: number,
    max?: number
  ): FilterQuery<TDocument> {
    if (min === undefined && max === undefined) {
      return {};
    }

    const numericQuery: any = {};
    if (min !== undefined) {
      numericQuery.$gte = min;
    }
    if (max !== undefined) {
      numericQuery.$lte = max;
    }

    return { [field]: numericQuery } as FilterQuery<TDocument>;
  }
}
