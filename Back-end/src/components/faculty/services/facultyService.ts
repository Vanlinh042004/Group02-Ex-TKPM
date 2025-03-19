import { I } from '@faker-js/faker/dist/airline-CBNP41sR';
import Faculty, { IFaculty } from '../models/Faculty';

export interface ICreateFacultyDTO {
    name: string;
    description: string;
    abbreviation: string;
}

class FacultyService {
    async renameFaculty(facultyId: string, newName: string): Promise<IFaculty> {
        const faculty = await Faculty.findById(facultyId);
        if (!faculty) {
            throw new Error('Faculty not found');
        }
        faculty.name = newName;
        await faculty.save();
        
        return faculty;
    }

    async addFaculty(data: ICreateFacultyDTO): Promise<IFaculty> {
        if (!data.name || !data.description || !data.abbreviation) {
            throw new Error('Missing required fields');
        }

        const existingFaculty = await Faculty.findOne({ name: data.name });
        if (existingFaculty) {
            throw new Error('Faculty already exists');
        }

        const newFaculty = new Faculty(data);
        await newFaculty.save();
        return newFaculty;
    }
}

export default new FacultyService();