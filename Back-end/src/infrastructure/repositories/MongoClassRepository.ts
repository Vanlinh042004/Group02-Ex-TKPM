import mongoose, { Types } from 'mongoose';
import { Class } from '../../domain/entities/Class';
import {
  IClassRepository,
  ClassFilters,
} from '../../domain/repositories/IClassRepository';
import ClassModel from '../../components/class/models/Class';
import CourseModel from '../../components/course/models/Course';
import RegistrationModel from '../../components/registration/models/Registration';

/**
 * MongoDB implementation of IClassRepository
 */
export class MongoClassRepository implements IClassRepository {
  async create(classEntity: Class): Promise<Class> {
    try {
      // Convert courseId to ObjectId
      const courseObjectId = await this.getCourseObjectId(classEntity.courseId);

      const classDoc = new ClassModel({
        classId: classEntity.classId,
        course: courseObjectId,
        academicYear: classEntity.academicYear,
        semester: classEntity.semester,
        instructor: classEntity.instructor,
        maxStudents: classEntity.maxStudents,
        schedule: classEntity.schedule,
        classroom: classEntity.classroom,
      });

      const savedDoc = await classDoc.save();
      return Class.fromLegacyData(savedDoc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to create class: ${error.message}`);
    }
  }

  async findById(id: string): Promise<Class | null> {
    try {
      // Check if id is ObjectId format (24 characters hex) or regular classId
      let doc;
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        doc = await ClassModel.findById(id);
      } else {
        // Try to find by classId if not ObjectId format
        doc = await ClassModel.findOne({ classId: id.toUpperCase() });
      }

      if (!doc) return null;

      return Class.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find class by ID: ${error.message}`);
    }
  }

  async findByClassId(classId: string): Promise<Class | null> {
    try {
      const doc = await ClassModel.findOne({
        classId: classId.toUpperCase(),
      }).populate('course', 'courseId'); // Populate to get courseId string
      if (!doc) return null;

      return Class.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to find class by classId: ${error.message}`);
    }
  }

  async findAll(filters?: ClassFilters): Promise<Class[]> {
    try {
      const query: any = {};

      if (filters) {
        if (filters.courseId) {
          const courseObjectId = await this.getCourseObjectId(filters.courseId);
          query.course = courseObjectId;
        }
        if (filters.academicYear) {
          query.academicYear = filters.academicYear;
        }
        if (filters.semester) {
          query.semester = filters.semester;
        }
        if (filters.instructor) {
          query.instructor = { $regex: filters.instructor, $options: 'i' };
        }
        if (filters.classroom) {
          query.classroom = { $regex: filters.classroom, $options: 'i' };
        }
        if (filters.maxStudents) {
          const maxStudentsQuery: any = {};
          if (filters.maxStudents.min !== undefined) {
            maxStudentsQuery.$gte = filters.maxStudents.min;
          }
          if (filters.maxStudents.max !== undefined) {
            maxStudentsQuery.$lte = filters.maxStudents.max;
          }
          query.maxStudents = maxStudentsQuery;
        }
      }

      const docs = await ClassModel.find(query).sort({ classId: 1 });
      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find classes: ${error.message}`);
    }
  }

  async update(id: string, classEntity: Class): Promise<Class | null> {
    try {
      // Convert courseId to ObjectId
      const courseObjectId = await this.getCourseObjectId(classEntity.courseId);

      const updateData = {
        course: courseObjectId,
        academicYear: classEntity.academicYear,
        semester: classEntity.semester,
        instructor: classEntity.instructor,
        maxStudents: classEntity.maxStudents,
        schedule: classEntity.schedule,
        classroom: classEntity.classroom,
      };

      // Check if id is ObjectId format (24 characters hex) or regular classId
      let doc;
      if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
        doc = await ClassModel.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        // Try to find and update by classId if not ObjectId format
        doc = await ClassModel.findOneAndUpdate(
          { classId: id.toUpperCase() },
          updateData,
          { new: true }
        );
      }

      if (!doc) return null;

      return Class.fromLegacyData(doc.toObject());
    } catch (error: any) {
      throw new Error(`Failed to update class: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await ClassModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error: any) {
      throw new Error(`Failed to delete class: ${error.message}`);
    }
  }

  async findByCourseId(courseId: string): Promise<Class[]> {
    try {
      const courseObjectId = await this.getCourseObjectId(courseId);
      const docs = await ClassModel.find({ course: courseObjectId }).sort({
        classId: 1,
      });
      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find classes by course: ${error.message}`);
    }
  }

  async findByAcademicYearAndSemester(
    academicYear: string,
    semester: string
  ): Promise<Class[]> {
    try {
      const docs = await ClassModel.find({
        academicYear,
        semester,
      }).sort({ classId: 1 });
      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find classes by academic year and semester: ${error.message}`
      );
    }
  }

  async findByInstructor(instructor: string): Promise<Class[]> {
    try {
      const docs = await ClassModel.find({
        instructor: { $regex: instructor, $options: 'i' },
      }).sort({ classId: 1 });
      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find classes by instructor: ${error.message}`);
    }
  }

  async findByClassroom(classroom: string): Promise<Class[]> {
    try {
      const docs = await ClassModel.find({
        classroom: { $regex: classroom, $options: 'i' },
      }).sort({ classId: 1 });
      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find classes by classroom: ${error.message}`);
    }
  }

  async getEnrollmentCount(classId: string): Promise<number> {
    try {
      // Find class by ID or classId using the findClassDocument helper
      const classDoc = await this.findClassDocument(classId);
      if (!classDoc) {
        throw new Error('Class not found');
      }

      return await RegistrationModel.countDocuments({
        class: classDoc._id,
        status: 'active',
      });
    } catch (error: any) {
      throw new Error(`Failed to get enrollment count: ${error.message}`);
    }
  }

  async hasAvailableSlots(classId: string): Promise<boolean> {
    try {
      const classDoc = await this.findClassDocument(classId);
      if (!classDoc) {
        throw new Error('Class not found');
      }

      const currentEnrollment = await this.getEnrollmentCount(classId);
      return currentEnrollment < classDoc.maxStudents;
    } catch (error: any) {
      throw new Error(`Failed to check available slots: ${error.message}`);
    }
  }

  async searchClasses(searchTerm: string): Promise<Class[]> {
    try {
      const regex = { $regex: searchTerm, $options: 'i' };
      const docs = await ClassModel.find({
        $or: [
          { classId: regex },
          { instructor: regex },
          { classroom: regex },
          { academicYear: regex },
          { semester: regex },
        ],
      }).sort({ classId: 1 });

      return docs.map((doc) => Class.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to search classes: ${error.message}`);
    }
  }

  async findClassesWithPopulatedCourse(): Promise<any[]> {
    try {
      const docs = await ClassModel.find()
        .populate({
          path: 'course',
          populate: {
            path: 'faculty',
            select: 'name',
          },
        })
        .sort({ classId: 1 });

      return docs.map((doc) => doc.toObject());
    } catch (error: any) {
      throw new Error(
        `Failed to find classes with populated course: ${error.message}`
      );
    }
  }

  async exists(classId: string): Promise<boolean> {
    try {
      // Check if classId is ObjectId format (24 characters hex) or regular classId
      let query: any;
      if (mongoose.Types.ObjectId.isValid(classId) && classId.length === 24) {
        query = { _id: classId };
      } else {
        query = { classId: classId.toUpperCase() };
      }

      const count = await ClassModel.countDocuments(query);
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check class existence: ${error.message}`);
    }
  }

  async courseExists(courseId: string): Promise<boolean> {
    try {
      // Check if courseId is ObjectId format or regular courseId
      let query: any;
      if (mongoose.Types.ObjectId.isValid(courseId) && courseId.length === 24) {
        query = { _id: courseId };
      } else {
        query = { courseId: courseId.toUpperCase() };
      }

      const count = await CourseModel.countDocuments(query);
      return count > 0;
    } catch (error: any) {
      throw new Error(`Failed to check course existence: ${error.message}`);
    }
  }

  async isCourseActive(courseId: string): Promise<boolean> {
    try {
      // Find course by ID or courseId
      let course;
      if (mongoose.Types.ObjectId.isValid(courseId) && courseId.length === 24) {
        course = await CourseModel.findById(courseId);
      } else {
        course = await CourseModel.findOne({
          courseId: courseId.toUpperCase(),
        });
      }

      return course ? course.isActive === true : false;
    } catch (error: any) {
      throw new Error(`Failed to check course active status: ${error.message}`);
    }
  }

  // Helper methods
  private async getCourseObjectId(courseId: string): Promise<Types.ObjectId> {
    // If already ObjectId, return as is
    if (mongoose.Types.ObjectId.isValid(courseId) && courseId.length === 24) {
      return new Types.ObjectId(courseId);
    }

    // Find by courseId string
    const course = await CourseModel.findOne({
      courseId: courseId.toUpperCase(),
    });
    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    return course._id as Types.ObjectId;
  }

  private async findClassDocument(classId: string): Promise<any> {
    // Check if classId is ObjectId format or regular classId
    if (mongoose.Types.ObjectId.isValid(classId) && classId.length === 24) {
      return await ClassModel.findById(classId);
    } else {
      return await ClassModel.findOne({ classId: classId.toUpperCase() });
    }
  }
}
