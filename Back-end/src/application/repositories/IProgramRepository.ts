import { Program } from '../../domain/entities/Program';

export interface IProgramRepository {
  save(program: Program): Promise<Program>;
  findByProgramId(programId: string): Promise<Program | null>;
  findByName(name: string): Promise<Program | null>;
  findAll(): Promise<Program[]>;
  findAllActive(): Promise<Program[]>;
  existsByProgramId(programId: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  delete(programId: string): Promise<boolean>;
}
