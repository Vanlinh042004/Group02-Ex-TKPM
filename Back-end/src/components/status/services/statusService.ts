import Status, { IStatus } from "../models/Status";
import i18next from "../../../config/i18n";

export interface ICreateStatusDTO {
  name: {
    [key: string]: string;
  };
  description?: {
    [key: string]: string;
  };
}

export interface IUpdateStatusDTO {
  name?: {
    [key: string]: string;
  };
  description?: {
    [key: string]: string;
  };
}

class StatusService {
  async addStatus(data: ICreateStatusDTO): Promise<IStatus> {
    try {
      if (!data.name || Object.keys(data.name).length === 0) {
        throw new Error(
          i18next.t("errors:missing_required_field", { field: "name" })
        );
      }

      const existingStatus = await Status.findOne({
        $or: Object.entries(data.name).map(([lang, name]) => ({
          [`name.${lang}`]: name
        }))
      });
      if (existingStatus) {
        throw new Error(i18next.t("errors:status_already_exists"));
      }

      const newStatus = new Status({
        name: data.name,
        description: data.description,
        isActive: true,
      });

      return await newStatus.save();
    } catch (error) {
      console.log(i18next.t("common:logging.error_adding_status"), error);
      throw error;
    }
  }

  async renameStatus(statusId: string, newNames: { [key: string]: string }): Promise<IStatus> {
    try {
      if (!newNames || Object.keys(newNames).length === 0) {
        throw new Error(
          i18next.t("errors:missing_required_field", { field: "newNames" })
        );
      }

      const existingStatus = await Status.findOne({
        $or: Object.entries(newNames).map(([lang, name]) => ({
          [`name.${lang}`]: name
        }))
      });
      if (existingStatus) {
        throw new Error(i18next.t("errors:status_name_already_exists"));
      }

      const status = await Status.findById(statusId);
      if (!status) {
        throw new Error(i18next.t("errors:status_not_found"));
      }

      status.name = newNames;
      return await status.save();
    } catch (error) {
      console.log(i18next.t("common:logging.error_renaming_status"), error);
      throw error;
    }
  }

  async getAllStatus(): Promise<IStatus[]> {
    try {
      return await Status.find({});
    } catch (error) {
      console.log(
        i18next.t("common:logging.error_getting_all_statuses"),
        error
      );
      throw error;
    }
  }
}

export default new StatusService();
