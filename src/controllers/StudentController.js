const StudentService = require('../services/StudentService');

class StudentController {
    async addStudent(req, res) {
        try {
            const student = req.body;
            const result = await StudentService.addStudent(student);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async deleteStudent(req, res) {
        try {
            const studentId = req.params.studentId;
            const result = await StudentService.deleteStudent(studentId);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async updateStudent(req, res) {
        try {
            const studentId = req.params.studentId;
            const updateData = req.body;
            const result = await StudentService.updateStudent(studentId, updateData);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    async searchStudents(req, res) {
        try {
            const filter = req.query;
            const result = await StudentService.searchStudents(filter);
            return res.status(200).json(result);
        }
        catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new StudentController();