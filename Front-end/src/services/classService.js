import { get, post, remove } from "../utils/request";

export const getClasses = async () => {
  return get(`/classes`);
};

export const addClass = async (classData) => {
  return post(`/classes`, classData);
};

export const deleteClass = async (classId) => {
  return remove(`/classes/${classId}`);
};

export const getClassById = async (classId) => {
  return get(`/classes/${classId}`);
};

export const getClassesByCourse = async (courseId) => {
  return get(`/classes/course/${courseId}`);
};
