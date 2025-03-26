import { get } from "../Utils/request";
export const getAllowedEmails = async () => {
  return get(`/email-domains`);
};
