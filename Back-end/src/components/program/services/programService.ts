import Program, { IProgram } from '../models/Program';
import generateId from '../../../utils/generateId';
import { w } from '@faker-js/faker/dist/airline-CBNP41sR';
import { da } from '@faker-js/faker/.';

export interface ICreateProgramDTO {
    programId: string;
    name: string;
    duration: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

class ProgramService {
    async renameProgram(programId: string, newName: string): Promise<IProgram> {
        if (!newName || !programId) {
            throw new Error('Missing required fields');
        }

        const program = await Program.findOne({ programId });
        
        if (!program) {
            throw new Error('Program not found');
        }
        program.name = newName;

        const generatedId = generateId(newName);
        let programNewId = generatedId;
        let count = 0;
        // Check if facultyId already exists
        while (await Program.exists({ programId: programNewId })) {
            count++;
            programNewId = generatedId + '-' + count;
        }

        program.programId = programNewId;
        await program.save();
        
        return program;
    }

    async addProgram(data: ICreateProgramDTO): Promise<IProgram> {
        if (!data.name || !data.duration) {
            throw new Error('Missing required fields');
        }
    
        if (data.duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }

        // Generate programId
        const generatedId = generateId(data.name);
        let programNewId = generatedId;
        let count = 0;
        // Check if facultyId already exists
        while (await Program.exists({ programId: programNewId })) {
            count++;
            programNewId = generatedId + '-' + count;
        }
    
        // Kiểm tra trùng tên chương trình
        const existingProgram = await Program.findOne({ name: data.name });
        if (existingProgram) {
            throw new Error('Program name already exists');
        }

    
        const newProgram = new Program({
            programId: programNewId,
            name: data.name,
            duration: data.duration,
            isActive: data.isActive,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        });
        
        await newProgram.save();
        return newProgram;
    }

    async getAllPrograms(): Promise<IProgram[]> {
        try {
            return await Program.find({});
        }
        catch (error) {
            console.log('Error getting programs: ', error);
            throw error;
        }
    }
}

export default new ProgramService();