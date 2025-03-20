import { post, get, remove } from "../Utils/request";
export const getStudent = async () => {
  return get(`/`);
};
export const searchStudent = async (studentId, fullName, faculty) => {
  return get(
    `/search?studentId=${studentId}&fullName=${fullName}&faculty=${faculty}`
  );
};
export const addStudent = async (data) => {
  return post(`/add`, data);
};
export const deleteStudent = async (id) => {
  return remove(`/delete/${id}`);
};
