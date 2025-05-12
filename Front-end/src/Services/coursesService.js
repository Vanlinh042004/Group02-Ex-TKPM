import { post, get, remove, patch } from "../Utils/request";

// Lấy danh sách khóa học
export const getCourses = async () => {
  return get(`/courses`);
};

// Thêm khóa học mới
export const addCourse = async (courseData) => {
  return post(`/courses`, courseData);
};

// Xóa khóa học
export const deleteCourse = async (courseId) => {
  return remove(`/courses/${courseId}`);
};

// Deactivate khóa học
export const deactivateCourse = async (courseId) => {
  return patch(`/courses/deactivate/${courseId}`);
};

// Cập nhật khóa học
export const updateCourse = async (courseId, courseData) => {
  return patch(`/courses/${courseId}`, courseData);
};
