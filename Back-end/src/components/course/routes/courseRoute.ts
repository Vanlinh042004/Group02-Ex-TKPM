import express from "express";
import courseController from "../controllers/courseController";

const router = express.Router();

// Tạo khóa học mới
router.post("/", courseController.createCourse);

// Lấy tất cả khóa học
router.get("/", courseController.getCourses);

// Lấy chi tiết khóa học
router.get("/:id", courseController.getCourseById);

// Cập nhật khóa học
router.put("/:id", courseController.updateCourse);

// Xóa khóa học
router.delete("/:id", courseController.deleteCourse);

// Deactivate khóa học
router.put("/:id/deactivate", courseController.deactivateCourse);

export default router;
