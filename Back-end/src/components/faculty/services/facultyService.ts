import Faculty, { IFaculty } from '../models/Faculty';
import generateId from '../../../utils/generateId';
import { fa } from '@faker-js/faker/.';

export interface ICreateFacultyDTO {
    facultyId: string;
    name: string;
}

class FacultyService {
    async renameFaculty(facultyId: string, newName: string): Promise<IFaculty> {
        if (!newName || !facultyId) {
            throw new Error('Missing required fields');
        }

        const faculty = await Faculty.findOne({ facultyId });
        if (!faculty) {
            throw new Error('Faculty not found lồn');
        }
        faculty.name = newName;

        const generatedId = generateId(newName);
        let facultyNewId = generatedId;
        let count = 0;
        // Check if facultyId already exists
        while (await Faculty.exists({ facultyId: facultyNewId })) {
            count++;
            facultyNewId = generatedId + '-' + count;
        }

        faculty.facultyId = facultyNewId;

        await faculty.save();
        
        return faculty;
    }

    async addFaculty(data: ICreateFacultyDTO): Promise<IFaculty> {
        if (!data.name) {
            throw new Error('Missing required fields');
        }

        const generatedId = generateId(data.name);
        let facultyNewId = generatedId;
        let count = 0;
        // Check if facultyId already exists
        while (await Faculty.exists({ facultyId: facultyNewId })) {
            count++;
            facultyNewId = generatedId + '-' + count;
        }

        const existingFaculty = await Faculty.findOne({ name: data.name });
        if (existingFaculty) {
            throw new Error('Faculty already exists');
        }

        const newFaculty = new Faculty({
            facultyId: facultyNewId,
            name: data.name
        });
        await newFaculty.save();
        return newFaculty;
    }

    async getAllFaculties(): Promise<IFaculty[]> {
        try {
            return await Faculty.find();
        }
        catch (error) {
            console.log('Error getting all faculties: ', error);
            throw error;
        }
    }
}

export default new FacultyService();