import { IProgramRepository } from '../repositories/IProgramRepository';
import { Program } from '../../domain/entities/Program';

// DTOs matching the original service interface
export interface CreateProgramDTO {
  name: string;
  duration: number;
  isActive?: boolean;
}

export interface RenameProgramDTO {
  programId: string;
  newName: string;
}

export interface ProgramResponseDTO {
  id?: string;
  programId: string;
  name: string;
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ProgramService {
  constructor(private readonly programRepository: IProgramRepository) {}

  async createProgram(
    createDTO: CreateProgramDTO
  ): Promise<ProgramResponseDTO> {
    try {
      // Validate required fields
      if (!createDTO.name) {
        throw new Error('Program name is required');
      }

      if (!createDTO.duration) {
        throw new Error('Program duration is required');
      }

      // Check if program name already exists
      const existingProgram = await this.programRepository.findByName(
        createDTO.name
      );
      if (existingProgram) {
        throw new Error('Program name already exists');
      }

      // Generate unique programId from name
      const programId = await this.generateUniqueProgramId(createDTO.name);

      // Create domain entity
      const program = Program.create({
        programId,
        name: createDTO.name,
        duration: createDTO.duration,
        isActive: createDTO.isActive ?? true,
      });

      // Save to repository
      const savedProgram = await this.programRepository.save(program);

      return this.mapToResponseDTO(savedProgram);
    } catch (error) {
      throw new Error(`Failed to create program: ${error}`);
    }
  }

  async renameProgram(
    renameDTO: RenameProgramDTO
  ): Promise<ProgramResponseDTO> {
    try {
      // Validate required fields
      if (!renameDTO.programId) {
        throw new Error('Program ID is required');
      }

      if (!renameDTO.newName) {
        throw new Error('New name is required');
      }

      // Find existing program
      const existingProgram = await this.programRepository.findByProgramId(
        renameDTO.programId
      );
      if (!existingProgram) {
        throw new Error('Program not found');
      }

      // Check if new name already exists (for other programs)
      const programWithSameName = await this.programRepository.findByName(
        renameDTO.newName
      );
      if (
        programWithSameName &&
        programWithSameName.programId !== renameDTO.programId
      ) {
        throw new Error('Program name already exists');
      }

      // Generate new programId from new name (following original logic)
      const newProgramId = await this.generateUniqueProgramId(
        renameDTO.newName
      );

      // Create updated program
      const updatedProgram = new Program({
        id: existingProgram.id,
        programId: newProgramId,
        name: renameDTO.newName,
        duration: existingProgram.duration,
        isActive: existingProgram.isActive,
        createdAt: existingProgram.createdAt,
        updatedAt: new Date(),
      });

      // Save updated program
      const savedProgram = await this.programRepository.save(updatedProgram);

      return this.mapToResponseDTO(savedProgram);
    } catch (error) {
      throw new Error(`Failed to rename program: ${error}`);
    }
  }

  async getAllPrograms(): Promise<ProgramResponseDTO[]> {
    try {
      const programs = await this.programRepository.findAll();
      return programs.map((program) => this.mapToResponseDTO(program));
    } catch (error) {
      throw new Error(`Failed to get all programs: ${error}`);
    }
  }

  async getProgramById(programId: string): Promise<ProgramResponseDTO | null> {
    try {
      const program = await this.programRepository.findByProgramId(programId);
      return program ? this.mapToResponseDTO(program) : null;
    } catch (error) {
      throw new Error(`Failed to get program by ID: ${error}`);
    }
  }

  async deleteProgramById(programId: string): Promise<boolean> {
    try {
      const existingProgram = await this.programRepository.findByProgramId(
        programId
      );
      if (!existingProgram) {
        throw new Error('Program not found');
      }

      return await this.programRepository.delete(programId);
    } catch (error) {
      throw new Error(`Failed to delete program: ${error}`);
    }
  }

  private async generateUniqueProgramId(name: string): Promise<string> {
    // Simple ID generation from name (similar to original generateId utility)
    const baseId = name
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase()) // Take first letter of each word
      .join('')
      .substring(0, 10); // Limit length

    let programId = baseId;
    let counter = 0;

    // Check for collisions and append counter if needed
    while (await this.programRepository.existsByProgramId(programId)) {
      counter++;
      programId = `${baseId}-${counter}`;
    }

    return programId;
  }

  private mapToResponseDTO(program: Program): ProgramResponseDTO {
    return {
      id: program.id,
      programId: program.programId,
      name: program.name,
      duration: program.duration,
      isActive: program.isActive,
      createdAt: program.createdAt!,
      updatedAt: program.updatedAt!,
    };
  }
}
