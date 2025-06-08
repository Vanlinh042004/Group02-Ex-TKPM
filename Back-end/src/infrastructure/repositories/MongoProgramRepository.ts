import { IProgramRepository } from '../../application/repositories/IProgramRepository';
import { Program } from '../../domain/entities/Program';
import ProgramModel, {
  IProgram,
} from '../../components/program/models/program';

export class MongoProgramRepository implements IProgramRepository {
  async save(program: Program): Promise<Program> {
    try {
      const programData = {
        programId: program.programId,
        name: program.name,
        duration: program.duration,
        isActive: program.isActive,
      };

      // If program has ID, update existing
      if (program.id) {
        const existingProgram = await ProgramModel.findById(program.id);
        if (existingProgram) {
          existingProgram.programId = programData.programId;
          existingProgram.name = programData.name;
          existingProgram.duration = programData.duration;
          existingProgram.isActive = programData.isActive;
          const saved = await existingProgram.save();
          return this.mapToDomain(saved);
        }
      }

      // Create new program
      const newProgram = new ProgramModel(programData);
      const saved = await newProgram.save();
      return this.mapToDomain(saved);
    } catch (error) {
      throw new Error(`Failed to save program: ${error}`);
    }
  }

  async findByProgramId(programId: string): Promise<Program | null> {
    try {
      const program = await ProgramModel.findOne({ programId });
      return program ? this.mapToDomain(program) : null;
    } catch (error) {
      throw new Error(`Failed to find program by ID: ${error}`);
    }
  }

  async findByName(name: string): Promise<Program | null> {
    try {
      const program = await ProgramModel.findOne({ name });
      return program ? this.mapToDomain(program) : null;
    } catch (error) {
      throw new Error(`Failed to find program by name: ${error}`);
    }
  }

  async findAll(): Promise<Program[]> {
    try {
      const programs = await ProgramModel.find();
      return programs.map((program) => this.mapToDomain(program));
    } catch (error) {
      throw new Error(`Failed to get all programs: ${error}`);
    }
  }

  async findAllActive(): Promise<Program[]> {
    try {
      const programs = await ProgramModel.find({ isActive: true });
      return programs.map((program) => this.mapToDomain(program));
    } catch (error) {
      throw new Error(`Failed to get active programs: ${error}`);
    }
  }

  async existsByProgramId(programId: string): Promise<boolean> {
    try {
      const count = await ProgramModel.countDocuments({ programId });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check program ID existence: ${error}`);
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await ProgramModel.countDocuments({ name });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check program name existence: ${error}`);
    }
  }

  async delete(programId: string): Promise<boolean> {
    try {
      const result = await ProgramModel.deleteOne({ programId });
      return result.deletedCount === 1;
    } catch (error) {
      throw new Error(`Failed to delete program: ${error}`);
    }
  }

  private mapToDomain(programDoc: IProgram): Program {
    // Use fromLegacyData to handle existing data that may not meet current validation
    return Program.fromLegacyData({
      id: programDoc._id?.toString(),
      programId: programDoc.programId,
      name: programDoc.name,
      duration: programDoc.duration,
      isActive: programDoc.isActive,
      createdAt: programDoc.createdAt,
      updatedAt: programDoc.updatedAt,
    });
  }
}
