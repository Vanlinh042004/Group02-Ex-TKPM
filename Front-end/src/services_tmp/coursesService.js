import { post, get, remove, put } from "../utils_tmp/request";

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
  return put(`/courses/${courseId}/deactivate`);
};

// Cập nhật khóa học
export const updateCourse = async (courseId, courseData) => {
  return put(`/courses/${courseId}`, courseData);
};
