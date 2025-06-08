/**
 * StudentModelAdapter
 *
 * Adapter để bridge existing Student Mongoose model với MongoStudentRepository
 * Giải quyết type mismatch giữa IStudent và IStudentDocument
 */

import { Model } from 'mongoose';
import { IStudent } from '../../components/student/models/Student';
import { IStudentDocument } from '../mappers/StudentMapper';

/**
 * Wrapper class để adapt existing Student model to work with MongoStudentRepository
 */
export class StudentModelAdapter {
  private model: Model<IStudent>;

  constructor(studentModel: Model<IStudent>) {
    this.model = studentModel;
  }

  /**
   * Get the wrapped model with proper typing
   */
  getModel(): any {
    return this.model;
  }

  /**
   * Create a document that conforms to IStudentDocument interface
   */
  async createDocument(data: Partial<IStudentDocument>): Promise<any> {
    // Convert IStudentDocument data to IStudent format
    const studentData = this.mapDocumentToModel(data);
    return this.model.create(studentData);
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<any> {
    return this.model
      .findById(id)
      .populate('faculty')
      .populate('program')
      .populate('status')
      .populate('phoneNumberConfig');
  }

  /**
   * Find document by studentId
   */
  async findByStudentId(studentId: string): Promise<any> {
    return this.model
      .findOne({ studentId })
      .populate('faculty')
      .populate('program')
      .populate('status')
      .populate('phoneNumberConfig');
  }

  /**
   * Map IStudentDocument interface to IStudent model structure
   */
  private mapDocumentToModel(
    docData: Partial<IStudentDocument>
  ): Partial<IStudent> {
    return {
      studentId: docData.studentId,
      fullName: docData.fullName,
      dateOfBirth: docData.dateOfBirth,
      gender: docData.gender as any,
      nationality: docData.nationality,
      faculty: docData.faculty as any, // ObjectId
      course: docData.course,
      program: docData.program as any, // ObjectId
      email: docData.email,
      phone: docData.phone,
      phoneNumberConfig: docData.phoneNumberConfig as any, // ObjectId
      status: docData.status as any, // ObjectId

      // Address mapping
      permanentAddress: docData.permanentAddress,
      temporaryAddress: docData.temporaryAddress,
      mailingAddress: docData.mailingAddress,

      // Identity document mapping (type safe conversion)
      identityDocument: docData.identityDocument as any,
    };
  }

  /**
   * Map IStudent model to IStudentDocument interface
   */
  mapModelToDocument(modelData: IStudent): IStudentDocument {
    return {
      _id: modelData._id,
      studentId: modelData.studentId,
      fullName: modelData.fullName,
      dateOfBirth: modelData.dateOfBirth,
      gender: modelData.gender.toString(),
      nationality: modelData.nationality,
      faculty: modelData.faculty.toString(),
      course: modelData.course,
      program: modelData.program.toString(),
      email: modelData.email,
      phone: modelData.phone,
      phoneNumberConfig: modelData.phoneNumberConfig.toString(),
      status: modelData.status.toString(),

      permanentAddress: modelData.permanentAddress,
      temporaryAddress: modelData.temporaryAddress,
      mailingAddress: modelData.mailingAddress,
      identityDocument: modelData.identityDocument,

      createdAt: modelData.createdAt || new Date(),
      updatedAt: modelData.updatedAt || new Date(),
    } as IStudentDocument;
  }
}
