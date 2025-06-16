import { Request, Response } from "express";
import classService from "../services/classService";
import logger from "../../../utils/logger";

class ClassController {
  /**
   * Tạo lớp học mới
   * @param req Request
   * @param res Response
   */
  async createClass(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("Creating class", {
        module: "ClassController",
        operation: "CREATE_CLASS",
        details: { classData: req.body },
      });

      const classData = await classService.createClass(req.body);

      logger.info("Class created successfully", {
        module: "ClassController",
        operation: "CREATE_CLASS",
        details: { classId: classData.classId },
      });

      // Log audit trail for creation
      logger.audit("CREATE", "class", classData.classId, null, classData);

      res.status(201).json({
        success: true,
        message: req.t('success:class_created'),
        data: classData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("Error creating class", {
        module: "ClassController",
        operation: "CREATE_CLASS",
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lấy danh sách lớp học
   * @param req Request
   * @param res Response
   */
  async getClasses(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;

      logger.debug("Getting classes", {
        module: "ClassController",
        operation: "GET_CLASSES",
        details: { filters },
      });

      const classes = await classService.getClasses(filters);

      logger.info("Classes retrieved successfully", {
        module: "ClassController",
        operation: "GET_CLASSES",
        details: { count: classes.length },
      });

      res.status(200).json({
        success: true,
        message: req.t('success:classes_retrieved'),
        data: classes,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("Error getting classes", {
        module: "ClassController",
        operation: "GET_CLASSES",
        details: {
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lấy chi tiết lớp học
   * @param req Request
   * @param res Response
   */
  async getClassById(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("Getting class by ID", {
        module: "ClassController",
        operation: "GET_CLASS_BY_ID",
        details: { classId: req.params.id },
      });

      const classData = await classService.getClassById(req.params.id);

      if (!classData) {
        logger.warn("Class not found", {
          module: "ClassController",
          operation: "GET_CLASS_BY_ID",
          details: { classId: req.params.id },
        });

        res.status(404).json({
          error: true,
          message: req.t('errors:class_not_found'),
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info("Class retrieved successfully", {
        module: "ClassController",
        operation: "GET_CLASS_BY_ID",
        details: { classId: classData.classId },
      });

      res.status(200).json({
        success: true,
        message: req.t('success:class_retrieved'),
        data: classData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("Error getting class by ID", {
        module: "ClassController",
        operation: "GET_CLASS_BY_ID",
        details: {
          classId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Cập nhật thông tin lớp học
   * @param req Request
   * @param res Response
   */
  async updateClass(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("Updating class", {
        module: "ClassController",
        operation: "UPDATE_CLASS",
        details: {
          classId: req.params.id,
          updateData: req.body,
        },
      });

      // Get class before update for audit
      const oldClass = await classService.getClassById(req.params.id);

      const classData = await classService.updateClass(req.params.id, req.body);

      if (!classData) {
        logger.warn("Class not found for update", {
          module: "ClassController",
          operation: "UPDATE_CLASS",
          details: { classId: req.params.id },
        });

        res.status(404).json({
          error: true,
          message: req.t('errors:class_not_found'),
          timestamp: new Date().toISOString()
        });
        return;
      }

      logger.info("Class updated successfully", {
        module: "ClassController",
        operation: "UPDATE_CLASS",
        details: { classId: classData.classId },
      });

      // Log audit trail for update
      logger.audit("UPDATE", "class", classData.classId, oldClass, classData);

      res.status(200).json({
        success: true,
        message: req.t('success:class_updated'),
        data: classData,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("Error updating class", {
        module: "ClassController",
        operation: "UPDATE_CLASS",
        details: {
          classId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(400).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Kiểm tra số lượng sinh viên đăng ký
   * @param req Request
   * @param res Response
   */
  async getEnrollmentCount(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("Getting enrollment count", {
        module: "ClassController",
        operation: "GET_ENROLLMENT_COUNT",
        details: { classId: req.params.id },
      });

      const count = await classService.getEnrollmentCount(req.params.id);

      logger.info("Enrollment count retrieved successfully", {
        module: "ClassController",
        operation: "GET_ENROLLMENT_COUNT",
        details: {
          classId: req.params.id,
          count,
        },
      });

      res.status(200).json({
        success: true,
        message: req.t('success:enrollment_count_retrieved'),
        data: { count },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("Error getting enrollment count", {
        module: "ClassController",
        operation: "GET_ENROLLMENT_COUNT",
        details: {
          classId: req.params.id,
          error: error.message,
          stack: error.stack,
        },
      });
      res.status(500).json({
        error: true,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new ClassController();
