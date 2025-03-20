import { post, get, remove } from "../Utils/request";
export const getStudent = async () => {
  return get(`/`);
};
export const searchStudent = async (query) => {
  return get(`/search?searchTerm=${query}`);
};
export const addStudent = async (data) => {
  return post(`/add`, data);
};
export const deleteStudent = async (id) => {
  return remove(`/delete/${id}`);
};
