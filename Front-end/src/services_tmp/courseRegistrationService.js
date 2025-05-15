import { post, get, remove, patch } from "../utils_tmp/request";
export const getRegistration = async () => {
  return get(`/registrations`);
};
export const registerCourse = async (data) => {
  return post(`/registrations`, data);
};
export const cancelRegistration = (registrationId, reason) => {
  return patch(`/registrations/cancel/${registrationId}`, {
    reason: reason,
  });
};

export const getTranscript = async (studentId) => {
  return get(`/registrations/transcript/${studentId}`);
};
