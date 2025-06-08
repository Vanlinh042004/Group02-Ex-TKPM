import { Model, FilterQuery } from 'mongoose';
import {
  Student as DomainStudent,
  StudentStatus as DomainStudentStatus,
} from '../../domain/entities/Student';
import {
  IStudentRepository,
  Student,
  StudentSearchCriteria,
  StudentStatistics,
  StudentStatus,
} from '../../domain/repositories/IStudentRepository';
import {
  ISearchableRepository,
  SearchOptions,
  QueryResult,
} from '../../domain/repositories/base/IRepository';
import { StudentMapper, IStudentDocument } from '../mappers/StudentMapper';

/**
 * MongoDB Student Repository Implementation
 * Implements IStudentRepository using MongoDB as the persistence layer
 */
export class MongoStudentRepository
  implements IStudentRepository, ISearchableRepository<Student, string>
{
  private model: Model<IStudentDocument>;

  constructor(studentModel: Model<IStudentDocument>) {
    this.model = studentModel;
  }

  // === Basic CRUD Operations ===

  async findById(id: string): Promise<Student | null> {
    try {
      const document = await this.model.findById(id).exec();
      return document ? this.mapDocumentToStudent(document) : null;
    } catch (error) {
      console.error('findById error:', error);
      return null;
    }
  }

  async findAll(limit?: number, offset?: number): Promise<Student[]> {
    try {
      const query = this.model.find();
      if (offset) query.skip(offset);
      if (limit) query.limit(limit);

      const documents = await query.exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findAll error:', error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      return await this.model.countDocuments().exec();
    } catch (error) {
      console.error('count error:', error);
      return 0;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const document = await this.model.findById(id).select('_id').exec();
      return !!document;
    } catch (error) {
      console.error('exists error:', error);
      return false;
    }
  }

  async save(entity: Student): Promise<Student> {
    try {
      if (entity.id) {
        return await this.update(entity);
      } else {
        return await this.create(entity);
      }
    } catch (error) {
      console.error('save error:', error);
      throw error;
    }
  }

  async create(entity: Student): Promise<Student> {
    try {
      const documentData = this.mapStudentToDocument(entity);
      const document = new this.model(documentData);
      const savedDocument = await document.save();
      return this.mapDocumentToStudent(savedDocument);
    } catch (error) {
      console.error('create error:', error);
      throw error;
    }
  }

  async update(entity: Student): Promise<Student> {
    try {
      if (!entity.id) {
        throw new Error('Entity must have an ID to be updated');
      }

      const documentData = this.mapStudentToDocument(entity);
      const updatedDocument = await this.model
        .findByIdAndUpdate(entity.id, documentData, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedDocument) {
        throw new Error(`Student with ID ${entity.id} not found for update`);
      }

      return this.mapDocumentToStudent(updatedDocument);
    } catch (error) {
      console.error('update error:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      console.error('delete error:', error);
      return false;
    }
  }

  async remove(entity: Student): Promise<boolean> {
    if (!entity.id) return false;
    return await this.delete(entity.id);
  }

  async saveMany(entities: Student[]): Promise<Student[]> {
    try {
      const documentDataArray = entities.map((entity) =>
        this.mapStudentToDocument(entity)
      );
      const documents = await this.model.insertMany(documentDataArray);
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('saveMany error:', error);
      throw error;
    }
  }

  async deleteMany(ids: string[]): Promise<number> {
    try {
      const result = await this.model.deleteMany({ _id: { $in: ids } }).exec();
      return result.deletedCount || 0;
    } catch (error) {
      console.error('deleteMany error:', error);
      return 0;
    }
  }

  // === IStudentRepository Specific Methods ===

  async findByStudentId(studentId: string): Promise<Student | null> {
    try {
      const document = await this.model.findOne({ studentId }).exec();
      return document ? this.mapDocumentToStudent(document) : null;
    } catch (error) {
      console.error('findByStudentId error:', error);
      return null;
    }
  }

  async findByEmail(email: string): Promise<Student | null> {
    try {
      const document = await this.model
        .findOne({ email: email.toLowerCase() })
        .exec();
      return document ? this.mapDocumentToStudent(document) : null;
    } catch (error) {
      console.error('findByEmail error:', error);
      return null;
    }
  }

  async isStudentIdTaken(studentId: string): Promise<boolean> {
    try {
      const document = await this.model
        .findOne({ studentId })
        .select('_id')
        .exec();
      return !!document;
    } catch (error) {
      console.error('isStudentIdTaken error:', error);
      return false;
    }
  }

  async isEmailTaken(
    email: string,
    excludeStudentId?: string
  ): Promise<boolean> {
    try {
      const query: any = { email: email.toLowerCase() };
      if (excludeStudentId) {
        query.studentId = { $ne: excludeStudentId };
      }
      const document = await this.model.findOne(query).select('_id').exec();
      return !!document;
    } catch (error) {
      console.error('isEmailTaken error:', error);
      return false;
    }
  }

  async searchStudents(
    criteria: StudentSearchCriteria,
    limit?: number,
    offset?: number
  ): Promise<QueryResult<Student>> {
    try {
      const query: FilterQuery<IStudentDocument> = {};

      if (criteria.studentId) {
        query.studentId = new RegExp(criteria.studentId, 'i');
      }
      if (criteria.firstName || criteria.lastName) {
        const nameRegex = new RegExp(
          criteria.firstName || criteria.lastName || '',
          'i'
        );
        query.fullName = nameRegex;
      }
      if (criteria.email) {
        query.email = new RegExp(criteria.email, 'i');
      }
      if (criteria.faculty) {
        query.faculty = criteria.faculty;
      }
      if (criteria.program) {
        query.program = criteria.program;
      }
      if (criteria.status) {
        query.status = this.mapStatusToString(criteria.status);
      }
      if (criteria.nationality) {
        query.nationality = criteria.nationality;
      }
      if (criteria.course) {
        query.course = criteria.course;
      }

      const [documents, total] = await Promise.all([
        this.model
          .find(query)
          .skip(offset || 0)
          .limit(limit || 20)
          .sort({ createdAt: -1 })
          .exec(),
        this.model.countDocuments(query).exec(),
      ]);

      return {
        data: documents.map((doc) => this.mapDocumentToStudent(doc)),
        total,
        limit: limit || 20,
        offset: offset || 0,
        hasMore: (offset || 0) + (limit || 20) < total,
      };
    } catch (error) {
      console.error('searchStudents error:', error);
      return {
        data: [],
        total: 0,
        limit: limit || 20,
        offset: offset || 0,
        hasMore: false,
      };
    }
  }

  async findByStatus(
    status: StudentStatus,
    limit?: number,
    offset?: number
  ): Promise<Student[]> {
    try {
      const statusString = this.mapStatusToString(status);
      const documents = await this.model
        .find({ status: statusString })
        .skip(offset || 0)
        .limit(limit || 20)
        .exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByStatus error:', error);
      return [];
    }
  }

  async findByFaculty(
    facultyId: string,
    limit?: number,
    offset?: number
  ): Promise<Student[]> {
    try {
      const documents = await this.model
        .find({ faculty: facultyId })
        .skip(offset || 0)
        .limit(limit || 20)
        .exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByFaculty error:', error);
      return [];
    }
  }

  async findByProgram(
    programId: string,
    limit?: number,
    offset?: number
  ): Promise<Student[]> {
    try {
      const documents = await this.model
        .find({ program: programId })
        .skip(offset || 0)
        .limit(limit || 20)
        .exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByProgram error:', error);
      return [];
    }
  }

  async findByClass(classId: string): Promise<Student[]> {
    try {
      const documents = await this.model.find({ classId }).exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByClass error:', error);
      return [];
    }
  }

  async findByEnrollmentYear(
    year: number,
    limit?: number,
    offset?: number
  ): Promise<Student[]> {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      const documents = await this.model
        .find({
          createdAt: { $gte: startDate, $lt: endDate },
        })
        .skip(offset || 0)
        .limit(limit || 20)
        .exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByEnrollmentYear error:', error);
      return [];
    }
  }

  // === Stub implementations for remaining methods ===

  async findEligibleForGraduation(facultyId?: string): Promise<Student[]> {
    return [];
  }

  async findOnAcademicProbation(threshold?: number): Promise<Student[]> {
    return [];
  }

  async findHighPerformers(threshold?: number): Promise<Student[]> {
    return [];
  }

  async findWithExpiringDocuments(daysAhead?: number): Promise<Student[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + (daysAhead || 30));

      const documents = await this.model
        .find({ 'identityDocument.expiryDate': { $lte: cutoffDate } })
        .exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findWithExpiringDocuments error:', error);
      return [];
    }
  }

  async bulkUpdateGPA(
    updates: Array<{ studentId: string; gpa: number }>
  ): Promise<number> {
    return 0; // GPA not in current schema
  }

  async bulkUpdateStatus(
    studentIds: string[],
    status: StudentStatus
  ): Promise<number> {
    try {
      const statusString = this.mapStatusToString(status);
      const result = await this.model
        .updateMany(
          { _id: { $in: studentIds } },
          { $set: { status: statusString, updatedAt: new Date() } }
        )
        .exec();
      return result.modifiedCount || 0;
    } catch (error) {
      console.error('bulkUpdateStatus error:', error);
      return 0;
    }
  }

  async assignToClass(studentIds: string[], classId: string): Promise<number> {
    try {
      const result = await this.model
        .updateMany(
          { _id: { $in: studentIds } },
          { $set: { classId, updatedAt: new Date() } }
        )
        .exec();
      return result.modifiedCount || 0;
    } catch (error) {
      console.error('assignToClass error:', error);
      return 0;
    }
  }

  async getStatistics(facultyId?: string): Promise<StudentStatistics> {
    const [total, byFaculty, byStatus] = await Promise.all([
      this.count(),
      this.countByFaculty(),
      this.countByStatus(),
    ]);

    return {
      total,
      byFaculty,
      byStatus,
      byProgram: {},
    };
  }

  async countByStatus(
    facultyId?: string
  ): Promise<Record<StudentStatus, number>> {
    try {
      const pipeline: any[] = [
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ];

      if (facultyId) {
        pipeline.unshift({ $match: { faculty: facultyId } });
      }

      const result = await this.model.aggregate(pipeline).exec();
      const counts = {
        [StudentStatus.ACTIVE]: 0,
        [StudentStatus.GRADUATED]: 0,
        [StudentStatus.DROPPED_OUT]: 0,
        [StudentStatus.SUSPENDED]: 0,
        [StudentStatus.ON_LEAVE]: 0,
      };

      result.forEach((item: any) => {
        const status = this.mapStringToStatus(item._id);
        if (status) {
          counts[status] = item.count;
        }
      });

      return counts;
    } catch (error) {
      console.error('countByStatus error:', error);
      return {
        [StudentStatus.ACTIVE]: 0,
        [StudentStatus.GRADUATED]: 0,
        [StudentStatus.DROPPED_OUT]: 0,
        [StudentStatus.SUSPENDED]: 0,
        [StudentStatus.ON_LEAVE]: 0,
      };
    }
  }

  async countByFaculty(): Promise<Record<string, number>> {
    try {
      const result = await this.model
        .aggregate([{ $group: { _id: '$faculty', count: { $sum: 1 } } }])
        .exec();

      const counts: Record<string, number> = {};
      result.forEach((item: any) => {
        counts[item._id] = item.count;
      });

      return counts;
    } catch (error) {
      console.error('countByFaculty error:', error);
      return {};
    }
  }

  async getAverageGPAByFaculty(): Promise<Record<string, number>> {
    return {}; // GPA not in current schema
  }

  async getEnrollmentTrends(years?: number): Promise<Record<number, number>> {
    const trends: Record<number, number> = {};
    const yearsBack = years || 5;
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < yearsBack; i++) {
      const year = currentYear - i;
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);

      try {
        const count = await this.model
          .countDocuments({
            createdAt: { $gte: startDate, $lt: endDate },
          })
          .exec();
        trends[year] = count;
      } catch (error) {
        trends[year] = 0;
      }
    }

    return trends;
  }

  async findSimilarStudents(
    studentId: string,
    limit?: number
  ): Promise<Student[]> {
    try {
      const student = await this.findByStudentId(studentId);
      if (!student) return [];

      const documents = await this.model
        .find({
          faculty: student.faculty,
          program: student.program,
          studentId: { $ne: studentId },
        })
        .limit(limit || 10)
        .exec();

      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findSimilarStudents error:', error);
      return [];
    }
  }

  async findAtRiskStudents(criteria?: {
    lowGpa?: number;
    missedSemesters?: number;
    noRecentActivity?: number;
  }): Promise<Student[]> {
    return [];
  }

  async exportStudents(
    criteria?: StudentSearchCriteria,
    format?: {
      includePersonalInfo?: boolean;
      includeAcademicInfo?: boolean;
      includeContactInfo?: boolean;
    }
  ): Promise<any[]> {
    const searchResult = await this.searchStudents(criteria || {});
    return searchResult.data.map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      email: format?.includeContactInfo ? student.email : undefined,
      phone: format?.includeContactInfo ? student.phone : undefined,
      faculty: format?.includeAcademicInfo ? student.faculty : undefined,
      program: format?.includeAcademicInfo ? student.program : undefined,
      status: student.status,
      createdAt: student.createdAt,
    }));
  }

  // === ISearchableRepository Methods ===

  async search(options: SearchOptions): Promise<QueryResult<Student>> {
    try {
      const query: FilterQuery<IStudentDocument> = {};

      if (options.query) {
        const searchRegex = new RegExp(options.query, 'i');
        query.$or = [
          { studentId: searchRegex },
          { fullName: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ];
      }

      const limit = options.pagination?.limit || 20;
      const offset = options.pagination?.offset || 0;

      const [documents, total] = await Promise.all([
        this.model
          .find(query)
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 })
          .exec(),
        this.model.countDocuments(query).exec(),
      ]);

      return {
        data: documents.map((doc) => this.mapDocumentToStudent(doc)),
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      };
    } catch (error) {
      console.error('search error:', error);
      return {
        data: [],
        total: 0,
        limit: options.pagination?.limit || 20,
        offset: options.pagination?.offset || 0,
        hasMore: false,
      };
    }
  }

  async findByField(field: string, value: any): Promise<Student[]> {
    try {
      const documents = await this.model.find({ [field]: value }).exec();
      return documents.map((doc) => this.mapDocumentToStudent(doc));
    } catch (error) {
      console.error('findByField error:', error);
      return [];
    }
  }

  async findOneByField(field: string, value: any): Promise<Student | null> {
    try {
      const document = await this.model.findOne({ [field]: value }).exec();
      return document ? this.mapDocumentToStudent(document) : null;
    } catch (error) {
      console.error('findOneByField error:', error);
      return null;
    }
  }

  // === Helper Methods ===

  private mapDocumentToStudent(document: any): Student {
    return {
      id: document._id?.toString(),
      studentId: document.studentId,
      fullName: document.fullName,
      dateOfBirth: document.dateOfBirth,
      gender: document.gender as 'Nam' | 'Nữ',
      nationality: document.nationality,
      faculty: document.faculty,
      course: document.course,
      program: document.program,
      email: document.email,
      phone: document.phone,
      phoneNumberConfig: document.phoneNumberConfig,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }

  private mapStudentToDocument(student: Student): Partial<IStudentDocument> {
    return {
      studentId: student.studentId,
      fullName: student.fullName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      nationality: student.nationality || 'Vietnam',
      faculty: student.faculty,
      course: student.course || 'Unknown',
      program: student.program,
      email: student.email,
      phone: student.phone,
      phoneNumberConfig: student.phoneNumberConfig || 'default',
      status: student.status || 'active',
      updatedAt: new Date(),
      ...(student.id ? {} : { createdAt: new Date() }),
    };
  }

  private mapStatusToString(status: StudentStatus): string {
    switch (status) {
      case StudentStatus.ACTIVE:
        return 'active';
      case StudentStatus.GRADUATED:
        return 'graduated';
      case StudentStatus.DROPPED_OUT:
        return 'dropped_out';
      case StudentStatus.SUSPENDED:
        return 'suspended';
      case StudentStatus.ON_LEAVE:
        return 'on_leave';
      default:
        return 'active';
    }
  }

  private mapStringToStatus(status: string): StudentStatus | null {
    switch (status.toLowerCase()) {
      case 'active':
        return StudentStatus.ACTIVE;
      case 'graduated':
        return StudentStatus.GRADUATED;
      case 'dropped_out':
        return StudentStatus.DROPPED_OUT;
      case 'suspended':
        return StudentStatus.SUSPENDED;
      case 'on_leave':
        return StudentStatus.ON_LEAVE;
      default:
        return null;
    }
  }
}
