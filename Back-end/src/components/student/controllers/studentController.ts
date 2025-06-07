import { Request, Response } from "express";
import StudentService, {
  ICreateStudentDTO,
  IUpdateStudentDTO,
  IStudentSearchTermsDTO,
} from "../services/studentService";
import logger from "../../../utils/logger";

class StudentController {
  /**
   * Thêm sinh viên mới
   * @param req Request
   * @param res Response
   */
  async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = req.body as ICreateStudentDTO;

      logger.debug(req.t('common:logging.debug_adding_student'), {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { studentData: student },
        
      });

      const result = await StudentService.addStudent(student);

      logger.info(req.t('common:logging.student_added_successfully'), {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { studentId: student.studentId },
        
      });

      // Log audit trail for creation
      logger.audit("CREATE", "student", student.studentId, null, result);

      res.status(201).json({ 
        success: true,
        message: req.t('success:student_added'), 
        data: result,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_add_student'), {
        module: "StudentController",
        operation: "ADD_STUDENT",
        details: { error: error.message, stack: error.stack },
        
      });

      res.status(400).json({ 
        error: true,
        message: error.message, // Error already translated in service
        
        timestamp: new Date().toISOString()
      });
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

      logger.debug(req.t('common:logging.debug_deleting_student'), {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: { studentId },
        
      });

      // Get student before deletion for audit
      const studentToDelete = await StudentService.searchStudent({ studentId });

      await StudentService.deleteStudent(studentId);

      logger.info(req.t('common:logging.student_deleted_successfully'), {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: { studentId },
        
      });

      // Log audit trail for deletion
      logger.audit("DELETE", "student", studentId, studentToDelete, null);

      res.status(200).json({ 
        success: true,
        message: req.t('success:student_deleted'),
        studentId,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_delete_student'), {
        module: "StudentController",
        operation: "DELETE_STUDENT",
        details: {
          studentId: req.params.studentId,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(400).json({ 
        error: true,
        message: error.message,
        studentId: req.params.studentId,
        
        timestamp: new Date().toISOString()
      });
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

      logger.debug(req.t('common:logging.debug_updating_student'), {
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

      logger.info(req.t('common:logging.student_updated_successfully'), {
        module: "StudentController",
        operation: "UPDATE_STUDENT",
        details: { studentId },
        
      });

      // Log audit trail for update
      logger.audit("UPDATE", "student", studentId, beforeUpdate, result);

      res.status(200).json({ 
        success: true,
        message: req.t('success:student_updated'), 
        data: result,
        studentId,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_update_student'), {
        module: "StudentController",
        operation: "UPDATE_STUDENT",
        details: {
          studentId: req.params.studentId,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(400).json({ 
        error: true,
        message: error.message,
        studentId: req.params.studentId,
        
        timestamp: new Date().toISOString()
      });
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

      logger.debug(req.t('common:logging.debug_searching_students'), {
        module: "StudentController",
        operation: "SEARCH_STUDENT",
        details: { searchParams },
        
      });

      const hasSearchParams = Object.values(searchParams).some(
        (param) => param !== undefined,
      );

      if (!hasSearchParams) {
        logger.warn(req.t('common:logging.search_no_parameters'), {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
          
        });

        res.status(400).json({ 
          error: true,
          message: req.t('errors:search_parameters_required'),
          required: ['studentId', 'fullName', 'faculty'],
          
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await StudentService.searchStudent(searchParams);

      // Trả về kết quả, nếu không tìm thấy sinh viên nào
      if (result.length === 0) {
        logger.info(req.t('common:logging.no_students_found'), {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
          details: { searchParams },
          
        });

        res.status(404).json({ 
          success: false,
          message: req.t('errors:no_students_found'), 
          data: [],
          searchParams,
          
          timestamp: new Date().toISOString()
        });
      } else {
        logger.info(req.t('common:logging.students_found_successfully'), {
          module: "StudentController",
          operation: "SEARCH_STUDENT",
          details: { count: result.length, searchParams },
          
        });

        res.status(200).json({
          success: true,
          message: req.t('success:students_searched'),
          data: result,
          count: result.length,
          searchParams,
          
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      logger.error(req.t('common:logging.error_searching_students'), {
        module: "StudentController",
        operation: "SEARCH_STUDENT",
        details: {
          searchParams: req.query,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(500).json({ 
        error: true,
        message: error.message,
        searchParams: req.query,
        
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lấy danh sách tất cả sinh viên
   * @param req Request
   * @param res Response
   */
  async getAllStudent(req: Request, res: Response): Promise<void> {
    try {
      logger.debug(req.t('common:logging.debug_retrieving_all_students'), {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
        
      });

      const result = await StudentService.getAllStudent();

      logger.info(req.t('common:logging.successfully_retrieved_all_students'), {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
        details: { count: result.length },
        
      });

      res.status(200).json({
        success: true,
        message: req.t('success:students_retrieved'),
        data: result,
        count: result.length,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_retrieve_all_students'), {
        module: "StudentController",
        operation: "GET_ALL_STUDENTS",
        details: { error: error.message, stack: error.stack },
        
      });

      res.status(500).json({ 
        error: true,
        message: error.message,
        
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lấy sinh viên theo ID
   * @param req Request
   * @param res Response
   */
  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;

      logger.debug(req.t('common:logging.debug_retrieving_student'), {
        module: "StudentController",
        operation: "GET_STUDENT_BY_ID",
        details: { studentId },
        
      });

      const student = await StudentService.getStudentById(studentId);

      if (!student) {
        logger.info(req.t('common:logging.student_not_found'), {
          module: "StudentController",
          operation: "GET_STUDENT_BY_ID",
          details: { studentId },
          
        });

        res.status(404).json({
          error: true,
          message: req.t('errors:student_not_found'),
          studentId,
          
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info(req.t('common:logging.student_retrieved_successfully'), {
        module: "StudentController",
        operation: "GET_STUDENT_BY_ID",
        details: { studentId },
        
      });

      res.status(200).json({
        success: true,
        message: req.t('success:student_retrieved'),
        data: student,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.error_retrieving_student'), {
        module: "StudentController",
        operation: "GET_STUDENT_BY_ID",
        details: {
          studentId: req.params.studentId,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(500).json({
        error: true,
        message: error.message,
        studentId: req.params.studentId,
        
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Import dữ liệu sinh viên từ file
   * @param req Request
   * @param res Response
   */
  async importData(req: Request, res: Response): Promise<void> {
    try {
      const { format, data } = req.body;
      
      if (!data) {
        throw new Error(req.t('errors:invalid_data'));
      }
      
      if (!Array.isArray(data)) {
        throw new Error(data.message || req.t('errors:data_must_be_array'));
      }

      logger.debug(req.t('common:logging.debug_importing_data'), {
        module: "StudentController",
        operation: "IMPORT_DATA",
        details: { format, recordCount: data.length },
        
      });

      const importedData = await StudentService.importData(format, data);

      logger.info(req.t('common:logging.data_imported_successfully'), {
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

      res.status(200).json({ 
        success: true,
        message: req.t('success:data_imported'), 
        data: importedData,
        count: importedData.length,
        format,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_import_data'), {
        module: "StudentController",
        operation: "IMPORT_DATA",
        details: {
          format: req.body?.format,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(400).json({ 
        error: true,
        message: error.message,
        format: req.body?.format,
        
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Export dữ liệu sinh viên ra file
   * @param req Request
   * @param res Response
   */
  async exportData(req: Request, res: Response): Promise<void> {
    try {
      const { format } = req.query;
      
      if (!format) {
        res.status(400).json({
          error: true,
          message: req.t('errors:missing_required_field', { field: 'format' }),
          supportedFormats: ['csv', 'json'],
          example: '/api/students/export?format=csv',
          
          timestamp: new Date().toISOString()
        });
        return;
      }

      const filePath = `exports/students_${Date.now()}.${format}`;

      logger.debug(req.t('common:logging.debug_exporting_data'), {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: { format, filePath },
        
      });

      await StudentService.exportData(format as string, filePath);

      logger.info(req.t('common:logging.data_exported_successfully'), {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: { format, filePath },
        
      });

      res.status(200).json({ 
        success: true,
        message: req.t('success:data_exported'),
        filePath,
        format,
        downloadUrl: `/downloads/${filePath}`,
        
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error(req.t('common:logging.failed_to_export_data'), {
        module: "StudentController",
        operation: "EXPORT_DATA",
        details: {
          format: req.query?.format,
          error: error.message,
          stack: error.stack,
        },
        
      });

      res.status(400).json({ 
        error: true,
        message: error.message,
        format: req.query?.format,
        
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new StudentController();