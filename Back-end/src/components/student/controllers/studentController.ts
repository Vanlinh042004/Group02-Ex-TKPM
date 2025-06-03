import { Request, Response } from "express";
import StudentService, {
  ICreateStudentDTO,
  IUpdateStudentDTO,
  IStudentSearchTermsDTO,
} from "../services/studentService";
import logger from "../../../utils/logger";
import { da } from "@faker-js/faker/.";

class StudentController {
  /**
   * Thêm sinh viên mới
   * @param req Request
   * @param res Response
   */
  async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = req.body as ICreateStudentDTO;

      logger.debug("Adding new student", {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { studentData: student },
      });

      const result = await StudentService.addStudent(student);

      logger.info("Student added successfully", {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { studentId: student.studentId },
      });

      // Log audit trail for creation
      logger.audit("CREATE", "student", student.studentId, null, result);

      res
        .status(200)
        .json({ message: "Student added successfully", data: result });
    } catch (error: any) {
      logger.error("Failed to add student", {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { error: error.message, stack: error.stack },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Xóa sinh viên theo mã số
   * @param req Request
   * @param res Response
   */
  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId;

      logger.debug("Deleting student", {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: { studentId },
      });

      // Get student before deletion for audit
      const studentToDelete = await StudentService.searchStudent({ studentId });

      await StudentService.deleteStudent(studentId);

      logger.info("Student deleted successfully", {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: { studentId },
      });

      // Log audit trail for deletion
      logger.audit("DELETE", "student", studentId, studentToDelete, null);

      res.status(200).json({ message: "Student deleted successfully" });
    } catch (error: any) {
      logger.error("Failed to delete student", {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: {
          studentId: req.params.studentId,
          error: error.message,
          stack: error.stack,
        },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Cập nhật thông tin sinh viên
   * @param req Request
   * @param res Response
   */
  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.params.studentId;
      const updateData = req.body as IUpdateStudentDTO;

      logger.debug("Updating student", {
        module: "StudentController",
        operation: "UPDATE_STUDENT",
        details: {
          studentId,
          updateData,
        },
      });

      // Get student before update for audit
      const beforeUpdate = await StudentService.searchStudent({ studentId });

      const result = await StudentService.updateStudent(studentId, updateData);

      logger.info("Student updated successfully", {
        module: "StudentController",
        operation: "UPDATE_STUDENT",
        details: { studentId },
      });

      // Log audit trail for update
      logger.audit("UPDATE", "student", studentId, beforeUpdate, result);

      res
        .status(200)
        .json({ message: "Student updated successfully", data: result });
    } catch (error: any) {
      logger.error("Failed to update student", {
        module: "StudentController",
        operation: "UPDATE_STUDENT",
        details: {
          studentId: req.params.studentId,
          error: error.message,
          stack: error.stack,
        },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Tìm kiếm sinh viên
   * @param req Request
   * @param res Response
   */
  async searchStudent(req: Request, res: Response): Promise<void> {
    try {
      const searchParams: IStudentSearchTermsDTO = {
        studentId: req.query.studentId as string,
        fullName: req.query.fullName as string,
        faculty: req.query.faculty as string,
      };

      logger.debug("Searching students", {
        module: "StudentController",
        operation: "SEARCH_STUDENT",
        details: { searchParams },
      });

      const hasSearchParams = Object.values(searchParams).some(
        (param) => param !== undefined,
      );

      if (!hasSearchParams) {
        logger.warn("Search attempt with no parameters", {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
        });

        res
          .status(400)
          .json({ message: "At least one search parameter is required" });
        return;
      }

      const result = await StudentService.searchStudent(searchParams);

      // Trả về kết quả, nếu không tìm thấy sinh viên nào
      if (result.length === 0) {
        logger.info("No students found with search parameters", {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
          details: { searchParams },
        });

        res.status(404).json({ message: "No students found", data: [] });
      } else {
        logger.info("Students found successfully", {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
          details: { count: result.length, searchParams },
        });

        res.status(200).json(result);
      }
    } catch (error: any) {
      logger.error("Error searching students", {
        module: "StudentController",
        operation: "SEARCH_STUDENT",
        details: {
          searchParams: req.query,
          error: error.message,
          stack: error.stack,
        },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   * @param req Request
   * @param res Response
   */
  async getAllStudent(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("Retrieving all students", {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
      });

      const result = await StudentService.getAllStudent();

      logger.info("Successfully retrieved all students", {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
        details: { count: result.length },
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error("Failed to retrieve all students", {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
        details: { error: error.message, stack: error.stack },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Import dữ liệu sinh viên từ file
   * @param req Request
   * @param res Response
   */
  async importData(req: Request, res: Response): Promise<void> {
    try {
      console.log("body", req.body);
      const { format, data } = req.body;
      if (!data) {
        throw new Error("Dữ liệu không hợp lệ");
      }
      if (!Array.isArray(data)) {
        throw new Error(data.message);
      }

      logger.debug("Importing student data", {
        module: "StudentController",
        operation: "IMPORT_DATA",
        details: { format, recordCount: data.length },
      });

      const importedData = await StudentService.importData(format, data);

      logger.info("Data imported successfully", {
        module: "StudentController",
        operation: "IMPORT_DATA",
        details: {
          format,
          recordCount: importedData.length,
        },
      });

      // Log audit trail for bulk import
      logger.audit("IMPORT", "student", "BULK", null, {
        recordCount: importedData.length,
      });

      res
        .status(200)
        .json({ message: "Dữ liệu nhập thành công!", data: importedData });
    } catch (error: any) {
      logger.error("Failed to import data", {
        module: "StudentController",
        operation: "IMPORT_DATA",
        details: {
          format: req.body?.format,
          error: error.message,
          stack: error.stack,
        },
      });

      res.status(400).json({ message: error.message });
    }
  }

  /**
   * Export dữ liệu sinh viên ra file
   * @param req Request
   * @param res Response
   */
  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { format, filePath } = req.body;

      logger.debug("Exporting student data", {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: { format, filePath },
      });

      await StudentService.exportData(format, filePath);

      logger.info("Data exported successfully", {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: { format, filePath },
      });

      res.status(200).json({ message: "Data exported successfully" });
    } catch (error: any) {
      logger.error("Failed to export data", {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: {
          format: req.body?.format,
          filePath: req.body?.filePath,
          error: error.message,
          stack: error.stack,
        },
      });

      res.status(400).json({ message: error.message });
    }
  }
}

export default new StudentController();
