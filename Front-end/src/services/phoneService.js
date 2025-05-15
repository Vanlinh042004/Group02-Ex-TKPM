import { get } from "../utils/request";
export const getCountries = async () => {
  return get(`/phone-numbers`);
};
export const getCountryConfig = async (country) => {
  return get(`/phone-numbers/${country}`);
};
