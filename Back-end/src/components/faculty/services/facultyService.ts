import Faculty, { IFaculty } from "../models/Faculty";
import generateId from "../../../utils/generateId";
import { fa } from "@faker-js/faker/.";
import i18next from "../../../config/i18n";

export interface ICreateFacultyDTO {
  facultyId: string;
  name: string;
}

class FacultyService {
  async renameFaculty(facultyId: string, newName: string): Promise<IFaculty> {
    if (!newName || !facultyId) {
      throw new Error(i18next.t('errors:missing_required_fields'));
    }

    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      throw new Error(i18next.t('errors:faculty_not_found'));
    }
    faculty.name = newName;

    const generatedId = generateId(newName);
    let facultyNewId = generatedId;
    let count = 0;
    // Check if facultyId already exists
    while (await Faculty.exists({ facultyId: facultyNewId })) {
      count++;
      facultyNewId = generatedId + "-" + count;
    }

    faculty.facultyId = facultyNewId;

    await faculty.save();

    return faculty;
  }

  async addFaculty(data: ICreateFacultyDTO): Promise<IFaculty> {
    if (!data.name) {
      throw new Error(i18next.t('errors:missing_required_fields'));
    }

    const generatedId = generateId(data.name);
    let facultyNewId = generatedId;
    let count = 0;
    // Check if facultyId already exists
    while (await Faculty.exists({ facultyId: facultyNewId })) {
      count++;
      facultyNewId = generatedId + "-" + count;
    }

    const existingFaculty = await Faculty.findOne({ name: data.name });
    if (existingFaculty) {
      throw new Error(i18next.t('errors:faculty_already_exists'));
    }

    const newFaculty = new Faculty({
      facultyId: facultyNewId,
      name: data.name,
    });
    await newFaculty.save();
    return newFaculty;
  }

  async getAllFaculties(): Promise<IFaculty[]> {
    try {
      return await Faculty.find();
    } catch (error) {
      console.log(i18next.t('common:logging.error_getting_faculties'), error);
      throw error;
    }
  }
}

export default new FacultyService();
