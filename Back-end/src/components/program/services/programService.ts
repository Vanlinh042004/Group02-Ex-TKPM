import Program, { IProgram } from '../models/program';
import Faculty from '../../faculty/models/Faculty';
import mongoose from 'mongoose';

export interface ICreateProgramDTO {
    name: string;
    description?: string;
    duration: number; // Thời gian đào tạo (năm)
    faculty: mongoose.Types.ObjectId | string; // Reference to Faculty
    createdAt: Date;
    updatedAt: Date;
}

class ProgramService {
    async renameProgram(programId: string, newName: string): Promise<IProgram> {
        const program = await Program.findById(programId);
        if (!program) {
            throw new Error('Program not found');
        }
        program.name = newName;
        await program.save();
        
        return program;
    }

    async addProgram(data: ICreateProgramDTO): Promise<IProgram> {
        if (!data.name || !data.duration || !data.faculty) {
            throw new Error('Missing required fields');
        }
    
        if (data.duration <= 0) {
            throw new Error('Duration must be greater than 0');
        }
    
        let facultyId: mongoose.Types.ObjectId;
        // Nếu truyền vào là ID
        if (mongoose.Types.ObjectId.isValid(data.faculty)) {
            facultyId = new mongoose.Types.ObjectId(data.faculty);
        } 
        // Nếu truyền vào là tên khoa
        else {
            const faculty = await Faculty.findOne({ 
                name: { $regex: data.faculty.toString(), $options: 'i' } 
            });
    
            if (!faculty) {
                throw new Error('Faculty not found');
            }
    
            facultyId = new mongoose.Types.ObjectId(faculty._id.toString());
        }
    
        // Kiểm tra trùng tên chương trình
        const existingProgram = await Program.findOne({ name: data.name });
        if (existingProgram) {
            throw new Error('Program name already exists');
        }
    
        // Tạo dữ liệu chương trình
        const programData = {
            ...data,
            faculty: facultyId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    
        const newProgram = new Program(programData);
        await newProgram.save();
        return newProgram;
    }

     async getAllPrograms() {
        return await Program.find();
    }
}

export default new ProgramService();