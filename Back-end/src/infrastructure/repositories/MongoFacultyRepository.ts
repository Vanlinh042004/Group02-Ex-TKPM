import { IFacultyRepository } from '../../application/repositories/IFacultyRepository';
import { Faculty } from '../../domain/entities/Faculty';
import FacultyModel, {
  IFaculty,
} from '../../components/faculty/models/Faculty';

export class MongoFacultyRepository implements IFacultyRepository {
  async save(faculty: Faculty): Promise<Faculty> {
    try {
      const facultyData = {
        facultyId: faculty.facultyId,
        name: faculty.name,
      };

      // If faculty has ID, update existing
      if (faculty.id) {
        const existingFaculty = await FacultyModel.findById(faculty.id);
        if (existingFaculty) {
          existingFaculty.facultyId = facultyData.facultyId;
          existingFaculty.name = facultyData.name;
          const saved = await existingFaculty.save();
          return this.mapToDomain(saved);
        }
      }

      // Create new faculty
      const newFaculty = new FacultyModel(facultyData);
      const saved = await newFaculty.save();
      return this.mapToDomain(saved);
    } catch (error) {
      throw new Error(`Failed to save faculty: ${error}`);
    }
  }

  async findByFacultyId(facultyId: string): Promise<Faculty | null> {
    try {
      const faculty = await FacultyModel.findOne({ facultyId });
      return faculty ? this.mapToDomain(faculty) : null;
    } catch (error) {
      throw new Error(`Failed to find faculty by ID: ${error}`);
    }
  }

  async findByName(name: string): Promise<Faculty | null> {
    try {
      const faculty = await FacultyModel.findOne({ name });
      return faculty ? this.mapToDomain(faculty) : null;
    } catch (error) {
      throw new Error(`Failed to find faculty by name: ${error}`);
    }
  }

  async findAll(): Promise<Faculty[]> {
    try {
      const faculties = await FacultyModel.find();
      return faculties.map((faculty) => this.mapToDomain(faculty));
    } catch (error) {
      throw new Error(`Failed to get all faculties: ${error}`);
    }
  }

  async existsByFacultyId(facultyId: string): Promise<boolean> {
    try {
      const count = await FacultyModel.countDocuments({ facultyId });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check faculty ID existence: ${error}`);
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await FacultyModel.countDocuments({ name });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check faculty name existence: ${error}`);
    }
  }

  async delete(facultyId: string): Promise<boolean> {
    try {
      const result = await FacultyModel.deleteOne({ facultyId });
      return result.deletedCount === 1;
    } catch (error) {
      throw new Error(`Failed to delete faculty: ${error}`);
    }
  }

  private mapToDomain(facultyDoc: IFaculty): Faculty {
    // Use fromLegacyData to handle existing data that may not meet current validation
    return Faculty.fromLegacyData({
      id: facultyDoc._id?.toString(),
      facultyId: facultyDoc.facultyId,
      name: facultyDoc.name,
      createdAt: facultyDoc.createdAt,
      updatedAt: facultyDoc.updatedAt,
    });
  }
}
