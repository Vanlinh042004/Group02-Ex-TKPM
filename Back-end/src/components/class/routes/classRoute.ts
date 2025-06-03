import express from "express";
import classController from "../controllers/classController";

const router = express.Router();

// Tạo lớp học mới
router.post("/", classController.createClass);

// Lấy tất cả lớp học
router.get("/", classController.getClasses);

// Lấy chi tiết lớp học
router.get("/:id", classController.getClassById);

// Cập nhật lớp học
router.put("/:id", classController.updateClass);

// Lấy số lượng sinh viên đăng ký
router.get("/:id/enrollment", classController.getEnrollmentCount);

export default router;
