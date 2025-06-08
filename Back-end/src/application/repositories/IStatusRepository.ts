import { Status } from '../../domain/entities/Status';

export interface IStatusRepository {
  save(status: Status): Promise<Status>;
  findByStatusId(statusId: string): Promise<Status | null>;
  findByName(name: string): Promise<Status | null>;
  findAll(): Promise<Status[]>;
  findAllActive(): Promise<Status[]>;
  existsByStatusId(statusId: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
  delete(statusId: string): Promise<void>;
}
