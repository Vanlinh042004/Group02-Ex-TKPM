import mongoose, { Types } from 'mongoose';
import { Registration } from '../../domain/entities/Registration';
import {
  IRegistrationRepository,
  RegistrationSearchCriteria,
  RegistrationStatistics,
  TranscriptData,
  TranscriptCourse,
} from '../../domain/repositories/IRegistrationRepository';

// Import legacy models for data access
import RegistrationModel from '../../components/registration/models/Registration';
import StudentModel from '../../components/student/models/Student';
import ClassModel from '../../components/class/models/Class';
import CourseModel from '../../components/course/models/Course';

/**
 * MongoDB implementation of Registration Repository
 * Handles complex enrollment queries, prerequisite validation, and transcript generation
 */
export class MongoRegistrationRepository implements IRegistrationRepository {
  // Basic CRUD operations
  async create(registration: Registration): Promise<Registration> {
    try {
      // Convert studentId and classId to ObjectIds
      const studentObjectId = await this.getStudentObjectId(
        registration.studentId
      );
      const classObjectId = await this.getClassObjectId(registration.classId);

      const doc = new RegistrationModel({
        student: studentObjectId,
        class: classObjectId,
        registrationDate: registration.registrationDate,
        grade: registration.grade,
        status: registration.status,
        cancellationDate: registration.cancellationDate,
        cancellationReason: registration.cancellationReason,
      });

      const savedDoc = await doc.save();
      return Registration.fromLegacyData(savedDoc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to create registration: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Registration | null> {
    try {
      const doc = await RegistrationModel.findById(id);
      if (!doc) return null;

      return Registration.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find registration: ${error.message}`);
    }
  }

  async findAll(
    criteria?: RegistrationSearchCriteria
  ): Promise<Registration[]> {
    try {
      const query = await this.buildQuery(criteria);
      const docs = await RegistrationModel.find(query).sort({
        registrationDate: -1,
      });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find registrations: ${error.message}`);
    }
  }

  async update(
    id: string,
    registration: Registration
  ): Promise<Registration | null> {
    try {
      // Convert IDs to ObjectIds
      const studentObjectId = await this.getStudentObjectId(
        registration.studentId
      );
      const classObjectId = await this.getClassObjectId(registration.classId);

      const updateData = {
        student: studentObjectId,
        class: classObjectId,
        registrationDate: registration.registrationDate,
        grade: registration.grade,
        status: registration.status,
        cancellationDate: registration.cancellationDate,
        cancellationReason: registration.cancellationReason,
      };

      const doc = await RegistrationModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      if (!doc) return null;

      return Registration.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to update registration: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await RegistrationModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      throw new Error(`Failed to delete registration: ${error.message}`);
    }
  }

  // Business-specific queries
  async findByStudentId(studentId: string): Promise<Registration[]> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);
      const docs = await RegistrationModel.find({
        student: studentObjectId,
      }).sort({ registrationDate: -1 });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find registrations by student: ${error.message}`
      );
    }
  }

  async findByClassId(classId: string): Promise<Registration[]> {
    try {
      const classObjectId = await this.getClassObjectId(classId);
      const docs = await RegistrationModel.find({ class: classObjectId }).sort({
        registrationDate: -1,
      });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find registrations by class: ${error.message}`
      );
    }
  }

  async findByStatus(status: 'active' | 'cancelled'): Promise<Registration[]> {
    try {
      const docs = await RegistrationModel.find({ status }).sort({
        registrationDate: -1,
      });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find registrations by status: ${error.message}`
      );
    }
  }

  async findByGradeRange(
    minGrade: number,
    maxGrade: number
  ): Promise<Registration[]> {
    try {
      const docs = await RegistrationModel.find({
        grade: { $gte: minGrade, $lte: maxGrade },
      }).sort({ registrationDate: -1 });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find registrations by grade range: ${error.message}`
      );
    }
  }

  // Complex business queries
  async findActiveRegistrationsByStudent(
    studentId: string
  ): Promise<Registration[]> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);
      const docs = await RegistrationModel.find({
        student: studentObjectId,
        status: 'active',
      }).sort({ registrationDate: -1 });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find active registrations by student: ${error.message}`
      );
    }
  }

  async findActiveRegistrationsByClass(
    classId: string
  ): Promise<Registration[]> {
    try {
      const classObjectId = await this.getClassObjectId(classId);
      const docs = await RegistrationModel.find({
        class: classObjectId,
        status: 'active',
      }).sort({ registrationDate: -1 });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find active registrations by class: ${error.message}`
      );
    }
  }

  async findCompletedCoursesByStudent(
    studentId: string
  ): Promise<Registration[]> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);
      const docs = await RegistrationModel.find({
        student: studentObjectId,
        status: 'active',
        grade: { $exists: true, $gte: 5 }, // Passing grade
      }).sort({ registrationDate: -1 });

      return docs.map((doc) => Registration.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find completed courses by student: ${error.message}`
      );
    }
  }

  // Validation helpers
  async isStudentRegisteredForClass(
    studentId: string,
    classId: string
  ): Promise<boolean> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);
      const classObjectId = await this.getClassObjectId(classId);

      const count = await RegistrationModel.countDocuments({
        student: studentObjectId,
        class: classObjectId,
        status: 'active',
      });

      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check student registration: ${error.message}`);
    }
  }

  async getActiveRegistrationCount(classId: string): Promise<number> {
    try {
      const classObjectId = await this.getClassObjectId(classId);
      return await RegistrationModel.countDocuments({
        class: classObjectId,
        status: 'active',
      });
    } catch (error: any) {
      throw new Error(
        `Failed to get active registration count: ${error.message}`
      );
    }
  }

  async hasStudentCompletedPrerequisites(
    studentId: string,
    prerequisiteIds: string[]
  ): Promise<boolean> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);

      // Convert prerequisite course IDs to ObjectIds
      const prerequisiteObjectIds = await Promise.all(
        prerequisiteIds.map((id) => this.getCourseObjectId(id))
      );

      // Find completed courses (grade >= 5) by student
      const completedRegistrations = await RegistrationModel.find({
        student: studentObjectId,
        status: 'active',
        grade: { $exists: true, $gte: 5 },
      }).populate('class');

      // Extract completed course IDs
      const completedCourseIds = completedRegistrations
        .map((reg: any) => reg.class?.course?.toString())
        .filter(Boolean);

      // Check if all prerequisites are completed
      return prerequisiteObjectIds.every((prereqId) =>
        completedCourseIds.includes(prereqId.toString())
      );
    } catch (error: any) {
      throw new Error(`Failed to check prerequisites: ${error.message}`);
    }
  }

  // Statistics and reporting
  async getRegistrationStatistics(
    classId?: string
  ): Promise<RegistrationStatistics> {
    try {
      const matchStage: any = {};

      if (classId) {
        const classObjectId = await this.getClassObjectId(classId);
        matchStage.class = classObjectId;
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
            },
            cancelledCount: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
            },
            avgGrade: {
              $avg: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$grade', null] },
                      { $ne: ['$grade', undefined] },
                    ],
                  },
                  '$grade',
                  null,
                ],
              },
            },
            grades: {
              $push: {
                $cond: [
                  {
                    $and: [
                      { $ne: ['$grade', null] },
                      { $ne: ['$grade', undefined] },
                    ],
                  },
                  '$grade',
                  null,
                ],
              },
            },
          },
        },
      ];

      const result = await RegistrationModel.aggregate(pipeline);
      const stats = result[0] || {
        total: 0,
        activeCount: 0,
        cancelledCount: 0,
        avgGrade: null,
        grades: [],
      };

      // Calculate grade distribution
      const grades = stats.grades.filter((g: number) => g !== null);
      const gradeDistribution = {
        '9-10': grades.filter((g: number) => g >= 9).length,
        '7-8.99': grades.filter((g: number) => g >= 7 && g < 9).length,
        '5-6.99': grades.filter((g: number) => g >= 5 && g < 7).length,
        '0-4.99': grades.filter((g: number) => g < 5).length,
      };

      return {
        total: stats.total,
        byStatus: {
          active: stats.activeCount,
          cancelled: stats.cancelledCount,
        },
        averageGrade: stats.avgGrade,
        gradeDistribution,
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get registration statistics: ${error.message}`
      );
    }
  }

  // Transcript generation
  async generateTranscriptData(studentId: string): Promise<TranscriptData> {
    try {
      const studentObjectId = await this.getStudentObjectId(studentId);

      // Find student with populated data
      const student = await StudentModel.findOne({ studentId })
        .populate('faculty')
        .populate('program')
        .populate('phoneNumberConfig')
        .populate('status');

      if (!student) {
        throw new Error('Student not found');
      }

      // Find completed registrations with grades
      const registrations = await RegistrationModel.find({
        student: studentObjectId,
        status: 'active',
        grade: { $exists: true },
      }).populate({
        path: 'class',
        populate: {
          path: 'course',
        },
      });

      // Calculate GPA and build course list
      let totalWeightedPoints = 0;
      let totalCredits = 0;

      const courses: TranscriptCourse[] = registrations.map((reg: any) => {
        const course = reg.class.course;
        const grade = reg.grade || 0;
        const credits = course.credits;

        // Calculate weighted points for GPA
        totalWeightedPoints += grade * credits;
        totalCredits += credits;

        return {
          classId: reg.class.classId,
          courseId: course.courseId,
          courseName: course.name,
          credits: credits,
          grade: grade,
          status: grade >= 5 ? 'Passed' : 'Failed',
        };
      });

      const gpa =
        totalCredits > 0
          ? Number((totalWeightedPoints / totalCredits).toFixed(2))
          : 0;

      return {
        studentInfo: student.toObject(),
        courses,
        gpa,
        totalCredits,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate transcript data: ${error.message}`);
    }
  }

  // Legacy API compatibility
  async findAllWithPopulation(): Promise<any[]> {
    try {
      const docs = await RegistrationModel.find()
        .populate('student', 'studentId fullName email')
        .populate({
          path: 'class',
          populate: {
            path: 'course',
            select: 'courseId name credits',
          },
        })
        .sort({ registrationDate: -1 });

      return docs.map((doc) => doc.toObject());
    } catch (error: any) {
      throw new Error(
        `Failed to find registrations with population: ${error.message}`
      );
    }
  }

  async findStudentsInClassWithPopulation(classId: string): Promise<any[]> {
    try {
      const classObjectId = await this.getClassObjectId(classId);

      const docs = await RegistrationModel.find({
        class: classObjectId,
        status: 'active',
      })
        .populate({
          path: 'student',
          select: 'studentId fullName email',
        })
        .sort({ registrationDate: -1 });

      return docs.map((doc) => doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find students in class: ${error.message}`);
    }
  }

  // Batch operations
  async bulkUpdateStatus(
    registrationIds: string[],
    status: string
  ): Promise<number> {
    try {
      const updateData: any = { status };

      if (status === 'cancelled') {
        updateData.cancellationDate = new Date();
      }

      const result = await RegistrationModel.updateMany(
        { _id: { $in: registrationIds } },
        updateData
      );

      return result.modifiedCount;
    } catch (error: any) {
      throw new Error(`Failed to bulk update status: ${error.message}`);
    }
  }

  // Advanced search
  async searchRegistrations(
    criteria?: RegistrationSearchCriteria,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ results: Registration[]; total: number }> {
    try {
      const query = await this.buildQuery(criteria);

      const [docs, total] = await Promise.all([
        RegistrationModel.find(query)
          .sort({ registrationDate: -1 })
          .skip(offset)
          .limit(limit),
        RegistrationModel.countDocuments(query),
      ]);

      const results = docs.map((doc) =>
        Registration.fromLegacyData(doc.toObject())
      );

      return { results, total };
    } catch (error: any) {
      throw new Error(`Failed to search registrations: ${error.message}`);
    }
  }

  // Private helper methods
  private async buildQuery(
    criteria?: RegistrationSearchCriteria
  ): Promise<any> {
    const query: any = {};

    if (!criteria) return query;

    if (criteria.studentId) {
      const studentObjectId = await this.getStudentObjectId(criteria.studentId);
      query.student = studentObjectId;
    }

    if (criteria.classId) {
      const classObjectId = await this.getClassObjectId(criteria.classId);
      query.class = classObjectId;
    }

    if (criteria.status) {
      query.status = criteria.status;
    }

    if (criteria.gradeRange) {
      const gradeQuery: any = {};
      if (criteria.gradeRange.min !== undefined) {
        gradeQuery.$gte = criteria.gradeRange.min;
      }
      if (criteria.gradeRange.max !== undefined) {
        gradeQuery.$lte = criteria.gradeRange.max;
      }
      if (Object.keys(gradeQuery).length > 0) {
        query.grade = gradeQuery;
      }
    }

    if (criteria.registrationDateRange) {
      const dateQuery: any = {};
      if (criteria.registrationDateRange.from) {
        dateQuery.$gte = criteria.registrationDateRange.from;
      }
      if (criteria.registrationDateRange.to) {
        dateQuery.$lte = criteria.registrationDateRange.to;
      }
      if (Object.keys(dateQuery).length > 0) {
        query.registrationDate = dateQuery;
      }
    }

    return query;
  }

  private async getStudentObjectId(studentId: string): Promise<Types.ObjectId> {
    // Check if already ObjectId format
    if (mongoose.Types.ObjectId.isValid(studentId) && studentId.length === 24) {
      return new Types.ObjectId(studentId);
    }

    // Find by studentId
    const student = await StudentModel.findOne({ studentId });
    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    return student._id as Types.ObjectId;
  }

  private async getClassObjectId(classId: string): Promise<Types.ObjectId> {
    // Check if already ObjectId format
    if (mongoose.Types.ObjectId.isValid(classId) && classId.length === 24) {
      return new Types.ObjectId(classId);
    }

    // Find by classId
    const classDoc = await ClassModel.findOne({ classId });
    if (!classDoc) {
      throw new Error(`Class not found: ${classId}`);
    }

    return classDoc._id as Types.ObjectId;
  }

  private async getCourseObjectId(courseId: string): Promise<Types.ObjectId> {
    // Check if already ObjectId format
    if (mongoose.Types.ObjectId.isValid(courseId) && courseId.length === 24) {
      return new Types.ObjectId(courseId);
    }

    // Find by courseId
    const course = await CourseModel.findOne({ courseId });
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    return course._id as Types.ObjectId;
  }
}
