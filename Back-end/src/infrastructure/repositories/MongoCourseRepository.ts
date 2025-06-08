import { Course } from '../../domain/entities/Course';
import { ICourseRepository } from '../../application/repositories/ICourseRepository';
import CourseModel from '../../components/course/models/Course';
import ClassModel from '../../components/class/models/Class';
import RegistrationModel from '../../components/registration/models/Registration';
import { Types } from 'mongoose';

export class MongoCourseRepository implements ICourseRepository {
  async save(course: Course): Promise<Course> {
    try {
      const courseData = course.toData();

      // Convert prerequisite courseIds to ObjectIds
      const prerequisiteObjectIds = await this.convertCourseIdsToObjectIds(
        courseData.prerequisites
      );

      // Find existing document by courseId
      let existingDoc = await CourseModel.findOne({
        courseId: courseData.courseId,
      });

      if (existingDoc) {
        // Update existing document
        existingDoc.name = courseData.name;
        existingDoc.credits = courseData.credits;
        existingDoc.faculty = courseData.facultyId as any;
        existingDoc.description = courseData.description;
        existingDoc.prerequisites = prerequisiteObjectIds as any;
        existingDoc.isActive = courseData.isActive;
        // Note: updatedAt is handled by timestamps: true in schema

        const saved = await existingDoc.save();
        return Course.fromLegacyData(saved.toObject());
      } else {
        // Create new document
        const newDoc = new CourseModel({
          courseId: courseData.courseId,
          name: courseData.name,
          credits: courseData.credits,
          faculty: courseData.facultyId as any,
          description: courseData.description,
          prerequisites: prerequisiteObjectIds as any,
          isActive: courseData.isActive,
          createdAt: courseData.createdAt,
        });

        const saved = await newDoc.save();
        return Course.fromLegacyData(saved.toObject());
      }
    } catch (error: any) {
      throw new Error(`Failed to save course: ${error.message}`);
    }
  }

  async findByCourseId(courseId: string): Promise<Course | null> {
    try {
      const doc = await CourseModel.findOne({
        courseId: courseId.toUpperCase(),
      });
      return doc ? Course.fromLegacyData(doc.toObject()) : null;
    } catch (error: any) {
      throw new Error(`Failed to find course by courseId: ${error.message}`);
    }
  }

  async findByName(name: string): Promise<Course | null> {
    try {
      const doc = await CourseModel.findOne({ name: name.trim() });
      return doc ? Course.fromLegacyData(doc.toObject()) : null;
    } catch (error: any) {
      throw new Error(`Failed to find course by name: ${error.message}`);
    }
  }

  async findAll(): Promise<Course[]> {
    try {
      const docs = await CourseModel.find({}).sort({ courseId: 1 });
      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find all courses: ${error.message}`);
    }
  }

  async findAllActive(): Promise<Course[]> {
    try {
      const docs = await CourseModel.find({ isActive: true }).sort({
        courseId: 1,
      });
      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find active courses: ${error.message}`);
    }
  }

  async findByFaculty(facultyId: string): Promise<Course[]> {
    try {
      const docs = await CourseModel.find({ faculty: facultyId }).sort({
        courseId: 1,
      });
      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find courses by faculty: ${error.message}`);
    }
  }

  async findByCredits(credits: number): Promise<Course[]> {
    try {
      const docs = await CourseModel.find({ credits }).sort({ courseId: 1 });
      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find courses by credits: ${error.message}`);
    }
  }

  async findCoursesWithPrerequisite(prerequisiteId: string): Promise<Course[]> {
    try {
      // First find the prerequisite course to get its ObjectId
      const prerequisiteCourse = await CourseModel.findOne({
        courseId: prerequisiteId.toUpperCase(),
      });

      if (!prerequisiteCourse) {
        // Return empty array if prerequisite course doesn't exist
        return [];
      }

      // Now find courses that have this prerequisite
      const docs = await CourseModel.find({
        prerequisites: { $in: [prerequisiteCourse._id] },
      }).sort({ courseId: 1 });

      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(
        `Failed to find courses with prerequisite: ${error.message}`
      );
    }
  }

  async existsByCourseId(courseId: string): Promise<boolean> {
    try {
      const count = await CourseModel.countDocuments({
        courseId: courseId.toUpperCase(),
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(
        `Failed to check course existence by courseId: ${error.message}`
      );
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await CourseModel.countDocuments({ name: name.trim() });
      return count > 0;
    } catch (error: any) {
      throw new Error(
        `Failed to check course existence by name: ${error.message}`
      );
    }
  }

  async delete(courseId: string): Promise<void> {
    try {
      const result = await CourseModel.deleteOne({
        courseId: courseId.toUpperCase(),
      });

      if (result.deletedCount === 0) {
        throw new Error('Course not found');
      }
    } catch (error: any) {
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  async findPrerequisiteCourses(courseId: string): Promise<Course[]> {
    try {
      const courseDoc = await CourseModel.findOne({
        courseId: courseId.toUpperCase(),
      });
      if (!courseDoc || !courseDoc.prerequisites?.length) {
        return [];
      }

      const docs = await CourseModel.find({
        courseId: { $in: courseDoc.prerequisites },
      }).sort({ courseId: 1 });

      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find prerequisite courses: ${error.message}`);
    }
  }

  async hasActiveRegistrations(courseId: string): Promise<boolean> {
    try {
      // First find the course's _id
      const courseDoc = await CourseModel.findOne({
        courseId: courseId.toUpperCase(),
      });
      if (!courseDoc) {
        return false;
      }

      // Find classes for this course
      const classes = await ClassModel.find({ course: courseDoc._id });

      if (classes.length === 0) {
        return false;
      }

      // Check if any of these classes have active registrations
      const classIds = classes.map((cls) => cls._id);
      const registrationCount = await RegistrationModel.countDocuments({
        class: { $in: classIds },
        status: { $ne: 'Đã hủy' },
      });

      return registrationCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to check active registrations: ${error.message}`);
    }
  }

  async hasActiveClasses(courseId: string): Promise<boolean> {
    try {
      // First find the course's _id
      const courseDoc = await CourseModel.findOne({
        courseId: courseId.toUpperCase(),
      });
      if (!courseDoc) {
        return false;
      }

      const classCount = await ClassModel.countDocuments({
        course: courseDoc._id,
      });

      return classCount > 0;
    } catch (error: any) {
      throw new Error(`Failed to check active classes: ${error.message}`);
    }
  }

  async searchByName(searchTerm: string): Promise<Course[]> {
    try {
      const docs = await CourseModel.find({
        name: { $regex: searchTerm, $options: 'i' },
      }).sort({ courseId: 1 });

      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to search courses by name: ${error.message}`);
    }
  }

  async findByFilters(filters: {
    faculty?: string;
    credits?: number;
    isActive?: boolean;
    hasPrerequisites?: boolean;
  }): Promise<Course[]> {
    try {
      const query: any = {};

      if (filters.faculty) {
        query.faculty = filters.faculty;
      }

      if (filters.credits !== undefined) {
        query.credits = filters.credits;
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      if (filters.hasPrerequisites !== undefined) {
        if (filters.hasPrerequisites) {
          query.prerequisites = { $exists: true, $ne: [], $not: { $size: 0 } };
        } else {
          query.$or = [
            { prerequisites: { $exists: false } },
            { prerequisites: { $size: 0 } },
          ];
        }
      }

      const docs = await CourseModel.find(query).sort({ courseId: 1 });
      return docs.map((doc) => Course.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find courses by filters: ${error.message}`);
    }
  }

  // Helper method to convert courseIds to ObjectIds
  private async convertCourseIdsToObjectIds(
    courseIds: string[]
  ): Promise<Types.ObjectId[]> {
    if (!courseIds || courseIds.length === 0) {
      return [];
    }

    const objectIds: Types.ObjectId[] = [];

    for (const courseId of courseIds) {
      // Find the course document to get its ObjectId
      const courseDoc = await CourseModel.findOne({
        courseId: courseId.toUpperCase(),
      });
      if (courseDoc) {
        objectIds.push(courseDoc._id as Types.ObjectId);
      } else {
        throw new Error(`Prerequisite course with ID ${courseId} not found`);
      }
    }

    return objectIds;
  }
}
