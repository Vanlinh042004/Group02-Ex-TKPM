import { get } from "../Utils/request";
export const getClasses = async () => {
  return get(`/classes`);
};

