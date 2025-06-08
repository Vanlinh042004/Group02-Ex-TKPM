import { Faculty } from '../../domain/entities/Faculty';

export interface IFacultyRepository {
  save(faculty: Faculty): Promise<Faculty>;
  findByFacultyId(facultyId: string): Promise<Faculty | null>;
  findByName(name: string): Promise<Faculty | null>;
  findAll(): Promise<Faculty[]>;
  existsByFacultyId(facultyId: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  delete(facultyId: string): Promise<boolean>;
}
