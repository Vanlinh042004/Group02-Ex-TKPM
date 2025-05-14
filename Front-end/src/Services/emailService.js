import { get } from "../utils/request";
export const getAllowedEmails = async () => {
  return get(`/email-domains`);
};
