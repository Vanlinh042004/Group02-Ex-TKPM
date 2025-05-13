import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Lấy danh sách khóa học
export const getCourses = async () => {
    try {
        const response = await axios.get(`${API_URL}/courses`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Thêm khóa học mới
export const addCourse = async (courseData) => {
    try {
        const response = await axios.post(`${API_URL}/courses`, courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Xóa khóa học
export const deleteCourse = async (courseId) => {
    try {
        const response = await axios.delete(`${API_URL}/courses/${courseId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Deactivate khóa học
export const deactivateCourse = async (courseId) => {
    try {
        const response = await axios.put(`${API_URL}/courses/${courseId}/deactivate`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cập nhật khóa học
export const updateCourse = async (courseId, courseData) => {
    try {
        const response = await axios.put(`${API_URL}/courses/${courseId}`, courseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};  

