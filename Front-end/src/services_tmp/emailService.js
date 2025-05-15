import { get } from "../utils_tmp/request";
export const getAllowedEmails = async () => {
  return get(`/email-domains`);
};
