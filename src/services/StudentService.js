const Student = require('../models/Student');

class StudentService {
    async addStudent(student) {
        try {
            const { studentId, fullName, dateOfBirth, gender, faculty, course, program, address, email, phone, status } = student;
            
            if (!studentId || !fullName || !dateOfBirth || !gender || !faculty 
                || !course || !program || !address || !email || !phone || !status) {
                throw new Error('Missing required fields');
            }

            const existingStudent = await Student.findOne({ studentId });
            if (existingStudent) {
                throw new Error('Student already exists');
            }

            const newStudent = new Student({
                studentId,
                fullName,
                dateOfBirth,
                gender,
                faculty,
                course,
                program,
                address,
                email,
                phone,
                status,
            }); 

            return await newStudent.save();
        }
        catch (error) {
            console.log('Error adding student: ', error);
            throw error;
        }
    }

    async deleteStudent(studentId) {
        try {
            const result = await Student.findOneAndDelete({ studentId });
            
            if (!result) {
                throw new Error('Student not found');
            }
            
            return result;
        }
        catch (error) {
            console.log('Error deleting student: ', error);
            throw error;
        }

    }
}

module.exports = new StudentService();