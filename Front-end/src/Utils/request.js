import axios from "axios";
const API_DOMAIN = "http://localhost:5000/api";
export const get = async (url) => {
  const response = await axios.get(`${API_DOMAIN}${url}`);
  if (response.status !== 200) {
    throw new Error(response.data.message);
  }
  return response.data;
};
// export const post = async (url, data) => {
//   const response = await axios.post(`${API_DOMAIN}${url}`, data);
//   if (response.status !== 200) {
//     throw new Error(response.data.message);
//   }
//   return response.data;
// };
export const post = async (url, data, format = null) => {
  try {
    const payload = format ? { format, data } : data;
    const response = await axios.post(`${API_DOMAIN}${url}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Có lỗi xảy ra");
  }
};

export const remove = async (url) => {
  const response = await axios.delete(`${API_DOMAIN}${url}`);
  if (response.status !== 200) {
    throw new Error(response.data.message);
  }
  return response.data;
};
export const patch = async (url, data) => {
  const response = await axios.patch(`${API_DOMAIN}${url}`, data);
  if (response.status !== 200) {
    throw new Error(response.data.message);
  }
  return response.data;
};
