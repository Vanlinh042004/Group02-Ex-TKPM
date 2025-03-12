const StudentService = require('../services/studentService');

class StudentController {
  async addStudent(req, res) {
    try {
      const student = req.body;
      const result = await StudentService.addStudent(student);
      return res.status(200).json({ message: 'Student added successfully', data: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const studentId = req.params.studentId;
      const result = await StudentService.deleteStudent(studentId);
      return res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async updateStudent(req, res) {
    try {
      const studentId = req.params.studentId;
      const updateData = req.body;
      const result = await StudentService.updateStudent(studentId, updateData);
      return res.status(200).json({ message: 'Student updated successfully', data: result });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async searchStudent(req, res) {
    try {
      const searchTerm = req.query.searchTerm || req.params.studentId;
      const result = await StudentService.searchStudent(searchTerm);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAllStudent(req, res) {
    try {
      const result = await StudentService.getAllStudent();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new StudentController();
