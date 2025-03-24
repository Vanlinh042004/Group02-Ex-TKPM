import { post, get, remove, patch } from "../Utils/request";
export const getStudent = async () => {
  return get(`/student`);
};
export const getFaculty = async () => {
  return get(`/faculty/list`);
};
export const getProgram = async () => {
  return get(`/program/list`);
};
export const getStatus = async () => {
  return get(`/status/list`);
};
export const searchStudent = async (studentId, fullName, faculty) => {
  return get(
    `/student/search?studentId=${studentId}&fullName=${fullName}&faculty=${faculty}`
  );
};
export const addStudent = async (data) => {
  return post(`/student/add`, data);
};
export const deleteStudent = async (id) => {
  return remove(`/student/delete/${id}`);
};
export const importStudent = async (data, format) => {
  return post(`/student/import`, data, format);
};
export const updateStudent = async (id, data) => {
  return patch(`/student/update/${id}`, data);
};
export const addFaculty = async (data) => {
  return post(`/faculty/add`, data);
};
export const addProgram = async (data) => {
  return post(`/program/add`, data);
};
export const addStatus = async (data) => {
  return post(`/status/add`, data);
};
export const updateFaculty = async (id, data) => {
  return patch(`/faculty/update/${id}`, data);
};
export const updateProgram = async (id, data) => {
  return patch(`/program/update/${id}`, data);
};
export const updateStatus = async (id, data) => {
  return patch(`/status/update/${id}`, data);
};
