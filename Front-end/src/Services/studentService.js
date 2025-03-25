import { post, get, remove, patch } from "../Utils/request";
export const getStudent = async () => {
  return get(`/students`);
};
export const getFaculty = async () => {
  return get(`/faculties`);
};
export const getProgram = async () => {
  return get(`/programs`);
};
export const getStatus = async () => {
  return get(`/statuses`);
};
export const searchStudent = async (studentId, fullName, faculty) => {
  return get(
    `/students/search?studentId=${studentId}&fullName=${fullName}&faculty=${faculty}`
  );
};
export const addStudent = async (data) => {
  return post(`/students`, data);
};
export const deleteStudent = async (id) => {
  return remove(`/students/${id}`);
};
export const importStudent = async (data, format) => {
  return post(`/students/import`, data, format);
};
export const updateStudent = async (id, data) => {
  return patch(`/students/${id}`, data);
};
export const addFaculty = async (data) => {
  return post(`/faculties`, data);
};
export const addProgram = async (data) => {
  return post(`/programs`, data);
};
export const addStatus = async (data) => {
  return post(`/statuses`, data);
};
export const updateFaculty = async (id, data) => {
  return patch(`/faculties/${id}`, data);
};
export const updateProgram = async (id, data) => {
  return patch(`/programs/${id}`, data);
};
export const updateStatus = async (id, data) => {
  return patch(`/statuses/${id}`, data);
};
