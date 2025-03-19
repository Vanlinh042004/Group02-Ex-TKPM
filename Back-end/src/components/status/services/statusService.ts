import Status, { IStatus } from '../models/Status';

export interface ICreateStatusDTO {
  name: string;
  description?: string;
}

export interface IUpdateStatusDTO {
  name?: string;
  description?: string;
}

class StatusService {
  async addStatus(data: ICreateStatusDTO): Promise<IStatus> {
    try {
      if (!data.name) {
        throw new Error('Name is required');
      }

      const existingStatus = await Status.findOne({ name: data.name });
      if (existingStatus) {
        throw new Error('Student status already exists');
      }

      const newStatus = new Status({
        name: data.name,
        description: data.description,
        isActive: true
      });

      return await newStatus.save();
    } catch (error) {
      console.log('Error adding student status: ', error);
      throw error;
    }
  }

  async renameStatus(statusId: string, newName: string): Promise<IStatus> {
    try {
      if (!newName) {
        throw new Error('New name is required');
      }

      const existingStatus = await Status.findOne({ name: newName });
      if (existingStatus) {
        throw new Error('Student status with this name already exists');
      }

      const status = await Status.findById(statusId);
      if (!status) {
        throw new Error('Student status not found');
      }

      status.name = newName;
      return await status.save();
    } catch (error) {
      console.log('Error renaming student status: ', error);
      throw error;
    }
  }
}

export default new StatusService();