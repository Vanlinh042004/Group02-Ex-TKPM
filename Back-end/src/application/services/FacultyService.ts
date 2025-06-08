import { IFacultyRepository } from '../repositories/IFacultyRepository';
import { Faculty } from '../../domain/entities/Faculty';
import generateId from '../../utils/generateId';

export interface CreateFacultyDTO {
  name: string;
}

export interface RenameFacultyDTO {
  facultyId: string;
  newName: string;
}

export interface FacultyResponseDTO {
  id: string;
  facultyId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FacultyService {
  constructor(private readonly facultyRepository: IFacultyRepository) {}

  async createFaculty(dto: CreateFacultyDTO): Promise<FacultyResponseDTO> {
    if (!dto.name?.trim()) {
      throw new Error('Faculty name is required');
    }

    const name = dto.name.trim();

    // Check if faculty with same name already exists
    const existingFaculty = await this.facultyRepository.findByName(name);
    if (existingFaculty) {
      throw new Error('Faculty with this name already exists');
    }

    // Generate unique facultyId
    const baseFacultyId = generateId(name);
    let facultyId = baseFacultyId;
    let counter = 0;

    while (await this.facultyRepository.existsByFacultyId(facultyId)) {
      counter++;
      facultyId = `${baseFacultyId}-${counter}`;
    }

    // Create domain entity
    const faculty = Faculty.create({
      facultyId,
      name,
    });

    // Save to repository
    const savedFaculty = await this.facultyRepository.save(faculty);

    return this.mapToResponseDTO(savedFaculty);
  }

  async renameFaculty(dto: RenameFacultyDTO): Promise<FacultyResponseDTO> {
    if (!dto.facultyId?.trim()) {
      throw new Error('Faculty ID is required');
    }

    if (!dto.newName?.trim()) {
      throw new Error('New name is required');
    }

    // Find existing faculty
    const existingFaculty = await this.facultyRepository.findByFacultyId(
      dto.facultyId
    );
    if (!existingFaculty) {
      throw new Error('Faculty not found');
    }

    const newName = dto.newName.trim();

    // Check if another faculty with the new name already exists
    const facultyWithSameName = await this.facultyRepository.findByName(
      newName
    );
    if (
      facultyWithSameName &&
      facultyWithSameName.facultyId !== dto.facultyId
    ) {
      throw new Error('Another faculty with this name already exists');
    }

    // Rename faculty using domain method
    const renamedFaculty = existingFaculty.rename(newName);

    // Generate new facultyId based on new name
    const baseFacultyId = generateId(newName);
    let newFacultyId = baseFacultyId;
    let counter = 0;

    while (
      (await this.facultyRepository.existsByFacultyId(newFacultyId)) &&
      newFacultyId !== dto.facultyId
    ) {
      counter++;
      newFacultyId = `${baseFacultyId}-${counter}`;
    }

    // Update faculty with new ID and name
    const updatedFaculty = new Faculty({
      id: renamedFaculty.id,
      facultyId: newFacultyId,
      name: newName,
      createdAt: renamedFaculty.createdAt,
      updatedAt: new Date(),
    });

    // Save to repository
    const savedFaculty = await this.facultyRepository.save(updatedFaculty);

    return this.mapToResponseDTO(savedFaculty);
  }

  async getAllFaculties(): Promise<FacultyResponseDTO[]> {
    try {
      const faculties = await this.facultyRepository.findAll();
      return faculties.map((faculty) => this.mapToResponseDTO(faculty));
    } catch (error) {
      throw new Error(`Failed to get all faculties: ${error}`);
    }
  }

  async getFacultyById(facultyId: string): Promise<FacultyResponseDTO | null> {
    if (!facultyId?.trim()) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepository.findByFacultyId(facultyId);
    return faculty ? this.mapToResponseDTO(faculty) : null;
  }

  async deleteFaculty(facultyId: string): Promise<boolean> {
    if (!facultyId?.trim()) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepository.findByFacultyId(facultyId);
    if (!faculty) {
      throw new Error('Faculty not found');
    }

    return await this.facultyRepository.delete(facultyId);
  }

  private mapToResponseDTO(faculty: Faculty): FacultyResponseDTO {
    return {
      id: faculty.id || '',
      facultyId: faculty.facultyId,
      name: faculty.name,
      createdAt: faculty.createdAt,
      updatedAt: faculty.updatedAt,
    };
  }
}
