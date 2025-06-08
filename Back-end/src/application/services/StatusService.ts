import { Status } from '../../domain/entities/Status';
import { IStatusRepository } from '../repositories/IStatusRepository';

export interface CreateStatusDTO {
  name: string;
  description?: string;
}

export interface RenameStatusDTO {
  newName: string;
}

export interface StatusResponseDTO {
  statusId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class StatusService {
  constructor(private statusRepository: IStatusRepository) {}

  async createStatus(dto: CreateStatusDTO): Promise<StatusResponseDTO> {
    // Check if status already exists
    const existingStatus = await this.statusRepository.findByName(dto.name);
    if (existingStatus) {
      throw new Error('Status with this name already exists');
    }

    // Create new status entity
    const status = Status.create(dto.name, dto.description);

    // Save to repository
    const savedStatus = await this.statusRepository.save(status);

    return this.toResponseDTO(savedStatus);
  }

  async renameStatus(
    statusId: string,
    dto: RenameStatusDTO
  ): Promise<StatusResponseDTO> {
    // Find existing status
    const status = await this.statusRepository.findByStatusId(statusId);
    if (!status) {
      throw new Error('Status not found');
    }

    // Check if new name already exists
    if (dto.newName !== status.name) {
      const existingStatus = await this.statusRepository.findByName(
        dto.newName
      );
      if (existingStatus) {
        throw new Error('Status with this name already exists');
      }
    }

    // Rename using domain method
    status.rename(dto.newName);

    // Save changes
    const updatedStatus = await this.statusRepository.save(status);

    return this.toResponseDTO(updatedStatus);
  }

  async getAllStatuses(): Promise<StatusResponseDTO[]> {
    const statuses = await this.statusRepository.findAll();
    return statuses.map((status) => this.toResponseDTO(status));
  }

  async getStatusByName(name: string): Promise<StatusResponseDTO | null> {
    const status = await this.statusRepository.findByName(name);
    return status ? this.toResponseDTO(status) : null;
  }

  async getActiveStatuses(): Promise<StatusResponseDTO[]> {
    const statuses = await this.statusRepository.findAllActive();
    return statuses.map((status) => this.toResponseDTO(status));
  }

  async validateStatusTransition(
    fromStatusName: string,
    toStatusName: string
  ): Promise<boolean> {
    const fromStatus = await this.statusRepository.findByName(fromStatusName);
    if (!fromStatus) {
      throw new Error('Source status not found');
    }

    const toStatus = await this.statusRepository.findByName(toStatusName);
    if (!toStatus) {
      throw new Error('Target status not found');
    }

    return fromStatus.canTransitionTo(toStatusName);
  }

  private toResponseDTO(status: Status): StatusResponseDTO {
    return {
      statusId: status.statusId,
      name: status.name,
      description: status.description,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
    };
  }
}
