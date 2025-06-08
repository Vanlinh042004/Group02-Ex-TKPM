import { Status } from '../../domain/entities/Status';
import { IStatusRepository } from '../../application/repositories/IStatusRepository';
import StatusModel from '../../components/status/models/Status';

export class MongoStatusRepository implements IStatusRepository {
  async save(status: Status): Promise<Status> {
    try {
      const statusData = status.toData();

      // Find by statusId first (our domain identifier)
      let existingDoc = await StatusModel.findOne({
        $or: [{ _id: statusData.statusId }, { name: statusData.name }],
      });

      if (existingDoc) {
        // Update existing document
        existingDoc.name = statusData.name;
        existingDoc.description = statusData.description;
        existingDoc.updatedAt = statusData.updatedAt;

        const saved = await existingDoc.save();
        return Status.fromLegacyData(saved.toObject());
      } else {
        // Create new document
        const newDoc = new StatusModel({
          name: statusData.name,
          description: statusData.description,
          createdAt: statusData.createdAt,
          updatedAt: statusData.updatedAt,
        });

        const saved = await newDoc.save();
        return Status.fromLegacyData(saved.toObject());
      }
    } catch (error: any) {
      throw new Error(`Failed to save status: ${error.message}`);
    }
  }

  async findByStatusId(statusId: string): Promise<Status | null> {
    try {
      // Try to find by MongoDB _id first, then by generated statusId pattern
      const doc = await StatusModel.findOne({
        $or: [
          { _id: statusId },
          { name: { $in: this.getStatusNameFromId(statusId) } },
        ],
      });

      return doc ? Status.fromLegacyData(doc.toObject()) : null;
    } catch (error: any) {
      throw new Error(`Failed to find status by statusId: ${error.message}`);
    }
  }

  async findByName(name: string): Promise<Status | null> {
    try {
      const doc = await StatusModel.findOne({ name: name.trim() });
      return doc ? Status.fromLegacyData(doc.toObject()) : null;
    } catch (error: any) {
      throw new Error(`Failed to find status by name: ${error.message}`);
    }
  }

  async findAll(): Promise<Status[]> {
    try {
      const docs = await StatusModel.find({}).sort({ name: 1 });
      return docs.map((doc) => Status.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find all statuses: ${error.message}`);
    }
  }

  async findAllActive(): Promise<Status[]> {
    try {
      const docs = await StatusModel.find({ name: 'Đang học' }).sort({
        name: 1,
      });
      return docs.map((doc) => Status.fromLegacyData(doc.toObject()));
    } catch (error: any) {
      throw new Error(`Failed to find active statuses: ${error.message}`);
    }
  }

  async existsByStatusId(statusId: string): Promise<boolean> {
    try {
      const count = await StatusModel.countDocuments({
        $or: [
          { _id: statusId },
          { name: { $in: this.getStatusNameFromId(statusId) } },
        ],
      });
      return count > 0;
    } catch (error: any) {
      throw new Error(
        `Failed to check status existence by statusId: ${error.message}`
      );
    }
  }

  async existsByName(name: string): Promise<boolean> {
    try {
      const count = await StatusModel.countDocuments({ name: name.trim() });
      return count > 0;
    } catch (error: any) {
      throw new Error(
        `Failed to check status existence by name: ${error.message}`
      );
    }
  }

  async delete(statusId: string): Promise<void> {
    try {
      const result = await StatusModel.deleteOne({
        $or: [
          { _id: statusId },
          { name: { $in: this.getStatusNameFromId(statusId) } },
        ],
      });

      if (result.deletedCount === 0) {
        throw new Error('Status not found');
      }
    } catch (error: any) {
      throw new Error(`Failed to delete status: ${error.message}`);
    }
  }

  private getStatusNameFromId(statusId: string): string[] {
    // Map statusId back to possible status names
    const statusMap: Record<string, string> = {
      ĐH: 'Đang học',
      ĐTN: 'Đã tốt nghiệp',
      ĐTH: 'Đã thôi học',
      BL: 'Bảo lưu',
      ĐC: 'Đình chỉ',
    };

    return statusMap[statusId] ? [statusMap[statusId]] : [];
  }
}
