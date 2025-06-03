import request from "supertest";
import express from "express";
import courseRouter from "../routes/courseRoute";

// Tạo app express test
const app = express();
app.use(express.json());
app.use("/api/courses", courseRouter);

// Mock toàn bộ service và controller nếu muốn test route độc lập DB
jest.mock("../controllers/courseController", () => ({
  createCourse: (req, res) =>
    res.status(201).json({ success: true, data: req.body }),
  getCourses: (req, res) =>
    res.status(200).json({
      success: true,
      data: [{ courseId: "CS101", name: "Intro", credits: 3 }],
    }),
  getCourseById: (req, res) =>
    res.status(200).json({
      success: true,
      data: { courseId: req.params.id, name: "Intro", credits: 3 },
    }),
  updateCourse: (req, res) =>
    res
      .status(200)
      .json({ success: true, data: { ...req.body, courseId: req.params.id } }),
  deleteCourse: (req, res) =>
    res.status(200).json({ success: true, message: "Xóa khóa học thành công" }),
  deactivateCourse: (req, res) =>
    res.status(200).json({
      success: true,
      data: { courseId: req.params.id, isActive: false },
      message: "Khóa học đã bị deactivate",
    }),
}));

describe("Course Route", () => {
  it("POST /api/courses - create course", async () => {
    const res = await request(app)
      .post("/api/courses")
      .send({ courseId: "CS102", name: "DSA", credits: 4 });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseId).toBe("CS102");
  });

  it("GET /api/courses - get all courses", async () => {
    const res = await request(app).get("/api/courses");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /api/courses/:id - get course by id", async () => {
    const res = await request(app).get("/api/courses/CS101");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseId).toBe("CS101");
  });

  it("PUT /api/courses/:id - update course", async () => {
    const res = await request(app)
      .put("/api/courses/CS101")
      .send({ name: "Intro Updated", credits: 4 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Intro Updated");
    expect(res.body.data.courseId).toBe("CS101");
  });

  it("DELETE /api/courses/:id - delete course", async () => {
    const res = await request(app).delete("/api/courses/CS101");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Xóa khóa học thành công");
  });

  it("PUT /api/courses/:id/deactivate - deactivate course", async () => {
    const res = await request(app).put("/api/courses/CS101/deactivate");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
    expect(res.body.message).toBe("Khóa học đã bị deactivate");
  });
});
