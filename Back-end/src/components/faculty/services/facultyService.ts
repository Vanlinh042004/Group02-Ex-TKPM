import Faculty, { IFaculty } from "../models/Faculty";
import generateId from "../../../utils/generateId";
import i18next from "../../../config/i18n";

export interface ICreateFacultyDTO {
  facultyId: string;
  name: {
    [key: string]: string;
  };
}

class FacultyService {
  async renameFaculty(facultyId: string, newNames: { [key: string]: string }): Promise<IFaculty> {
    if (!newNames || !facultyId || Object.keys(newNames).length === 0) {
      throw new Error(i18next.t('errors:missing_required_fields'));
    }

    const faculty = await Faculty.findOne({ facultyId });
    if (!faculty) {
      throw new Error(i18next.t('errors:faculty_not_found'));
    }
    
    faculty.name = newNames;

    const firstLanguageName = newNames['vi'];
    const generatedId = generateId(firstLanguageName);
    let facultyNewId = generatedId;
    let count = 0;
    while (await Faculty.exists({ facultyId: facultyNewId })) {
      count++;
      facultyNewId = generatedId + "-" + count;
    }

    faculty.facultyId = facultyNewId;

    await faculty.save();
    return faculty;
  }

  async addFaculty(data: ICreateFacultyDTO): Promise<IFaculty> {
    if (!data.name || Object.keys(data.name).length === 0) {
      throw new Error(i18next.t('errors:missing_required_fields'));
    }

    const firstLanguageName = data.name['vi'];
    const generatedId = generateId(firstLanguageName);
    let facultyNewId = generatedId;
    let count = 0;

    while (await Faculty.exists({ facultyId: facultyNewId })) {
      count++;
      facultyNewId = generatedId + "-" + count;
    }

    const existingFaculty = await Faculty.findOne({
      $or: Object.entries(data.name).map(([lang, name]) => ({
        [`name.${lang}`]: name
      }))
    });
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
