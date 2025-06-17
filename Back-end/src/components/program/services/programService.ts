import Program, { IProgram } from "../models/Program";
import generateId from "../../../utils/generateId";
import i18next from "../../../config/i18n";

export interface ICreateProgramDTO {
  programId: string;
  name: {
    [key: string]: string;
  };
  duration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class ProgramService {
  async renameProgram(programId: string, newNames: { [key: string]: string }): Promise<IProgram> {
    if (!newNames || !programId || Object.keys(newNames).length === 0) {
      throw new Error(i18next.t("errors:missing_required_fields"));
    }

    const program = await Program.findOne({ programId });

    if (!program) {
      throw new Error(i18next.t("errors:program_not_found"));
    }
    program.name = newNames;

    const firstLanguageName = newNames['vi'];
    const generatedId = generateId(firstLanguageName);
    let programNewId = generatedId;
    let count = 0;
    // Check if facultyId already exists
    while (await Program.exists({ programId: programNewId })) {
      count++;
      programNewId = generatedId + "-" + count;
    }

    program.programId = programNewId;
    await program.save();

    return program;
  }

  async addProgram(data: ICreateProgramDTO): Promise<IProgram> {
    if (!data.name || Object.keys(data.name).length === 0 || !data.duration) {
      throw new Error(i18next.t("errors:missing_required_fields"));
    }

    if (data.duration <= 0) {
      throw new Error(i18next.t("errors:duration_must_be_positive"));
    }

    const firstLanguageName = data.name['vi'];
    const generatedId = generateId(firstLanguageName);
    let programNewId = generatedId;
    let count = 0;
    // Check if facultyId already exists
    while (await Program.exists({ programId: programNewId })) {
      count++;
      programNewId = generatedId + "-" + count;
    }

    const existingProgram = await Program.findOne({
      $or: Object.entries(data.name).map(([lang, name]) => ({
        [`name.${lang}`]: name
      }))
    });
    if (existingProgram) {
      throw new Error(i18next.t("errors:program_name_exists"));
    }

    const newProgram = new Program({
      programId: programNewId,
      name: data.name,
      duration: data.duration,
      isActive: data.isActive,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });

    await newProgram.save();
    return newProgram;
  }

  async getAllPrograms(): Promise<IProgram[]> {
    try {
      return await Program.find({});
    } catch (error) {
      console.log(i18next.t("common:logging.error_getting_programs"), error);
      throw error;
    }
  }
}

export default new ProgramService();
